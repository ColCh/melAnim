    var requestAnimationFrame = window[getVendorPropName("requestAnimationFrame", window)] || rAF_imitation;

    function animateClassic (id, elements, keyframes, duration, easing, fillMode, delay, direction, iterationCount, state, complete, start, iteration) {

        var startedTime, prevIteration = 0;

        //debugger;

        keyframes = normalizeKeyframes(keyframes);

        // обёртка даёт возможность менять смягчение после старта
        function timingFunction (fractionalTime) {
            if (typeOf.func(easing)) {
                return easing(fractionalTime);
            } else {
                // TODO остальные смягчения
                console.error("easing!")
            }
        }


        function onAnimationEnd () {}

        // тик по времени
        function tick (currentTime) {

            var totalDuration;
            var elapsedTime;
            var currentIteration;
            var progr;
            var iterationProgr;
            var needsReverse;
            var iterationIsOdd;
            var isOnEnd;
            var fillsForwards;


            elapsedTime = currentTime - startedTime - delay;

            if (elapsedTime < 0) {
                if (ENABLE_DEBUG) {
                    console.warn("Прошедшее со старта время меньше нуля");
                }
                elapsedTime = 0;
            }

            // относительно первого прохода.
            progr = elapsedTime / duration;

            // номер текущего прохода
            currentIteration = Math.floor(progr);

            // прогресс по текущему проходу
            iterationProgr = progr - Math.min(currentIteration, iterationCount - 1);

            console.log("%d -> progr: %d, iteration: %d, iterationProgr: %d", elapsedTime.toFixed(2), progr.toFixed(2), currentIteration, iterationProgr.toFixed(2));

            if (iterationProgr > 1) {
                iterationProgr = 1;
                if (ENABLE_DEBUG) {
                    console.warn("Прогресс прохода больше единицы");
                }
            }

            iterationIsOdd = currentIteration & 1;

            needsReverse = direction === DIRECTION_REVERSE;
            needsReverse |= direction === DIRECTION_ALTERNATE && iterationIsOdd;
            needsReverse |= direction === DIRECTION_ALTERNATE_REVERSE && !iterationIsOdd;

            if (needsReverse) {
                iterationProgr = 1 - iterationProgr;
            }

            each(keyframes.properties, function (propertyName) {

                var prevKeyframe, nextKeyframe;
                var timingFunctionValue, scale, offset;

                each(keyframes, function (currentKeyframe) {
                    if (propertyName in currentKeyframe.properties || currentKeyframe.key === 0 || currentKeyframe.key === 1) {
                        prevKeyframe = nextKeyframe;
                        nextKeyframe = currentKeyframe;
                        return !(nextKeyframe.key > iterationProgr);
                    }
                });

                offset = prevKeyframe.key;
                scale = 1.0 / (nextKeyframe.key - prevKeyframe.key);
                timingFunctionValue = timingFunction((iterationProgr - offset) * scale);

                blendAndRender(propertyName, prevKeyframe.properties[propertyName], nextKeyframe.properties[propertyName], timingFunctionValue);
            });

            isOnEnd = !(isFinite(iterationCount) && elapsedTime < duration * iterationCount);

            if (isOnEnd) {

                fillsForwards = fillMode === FILLMODE_FORWARDS || fillMode === FILLMODE_BOTH;

                if (fillsForwards) {
                    //null;
                }

                complete();

            } else {
                if (currentIteration !== prevIteration) {
                    iteration();
                    prevIteration = currentIteration;
                }
            }

            return !isOnEnd;
        }

        function blendAndRender (property, from, to, easing) {
            each(elements, function (element) {

                // преобразование к абсолютным значениям.
                var normalizedFrom = normalize(element, property, from);
                var normalizedTo = normalize(element, property, to);

                var blended = (normalizedTo - normalizedFrom) * easing + normalizedFrom;

                css(element, property, blended);
            });
        }

        /** @param {number=} now */
        function loop (now) {
            tick(now) && requestAnimationFrame(loop);
        }

        return {

            addElement: noop,
            addProperty: noop,

            start: function () {
                startedTime = now() - delay;

                var fillsBackwards = fillMode === FILLMODE_BACKWARDS || fillMode === FILLMODE_BOTH;
                var startIsDelayed = delay > 0;

                if ( !(startIsDelayed && !fillsBackwards)  ) {
                    tick(startedTime);
                }

                requestAnimationFrame(loop);
            },

            pause: noop,
            resume: noop,

            setDuration: noop,
            setDelay: noop,
            setEasing: noop,
            setFillMode: noop,
            setDirection: noop,
            setIterationCount: noop

        };
    }

    /**
     * Проверка ключевых кадров
     * @param {Object} keyframes
     * @return {Object}
     */
    function normalizeKeyframes (keyframes) {

        var // массив ключевых кадров.
            keyframesList = [],
            // список анимируемых свойств.
            animatableProperties = {};

        var sortedKeys = getKeys(keyframes).sort(function (firstKey, secondKey) { return normalizeKey(firstKey) - normalizeKey(secondKey); });

        each(sortedKeys, function (key) {

            var properties = keyframes[key];

            var keyframe = {};

            var props = keyframe.properties = {};

            key = normalizeKey(key);

            if (isFinite(key)) {

                key /= 100; // в долях.

                each(properties, function (value, name) {
                    // просто копируем
                    props[name] = value;
                    // собираем список анимируемых во всех
                    // ключевых кадрах свойств
                    // даёт возможность указывать непересекающиеся значения.
                    animatableProperties[name] = null;
                });

                keyframe.key = key;

                // т.к. ключи отсортированы, то мы уже
                // проходим ключевые кадры по возрастанию
                keyframesList.push(keyframe);

            } else if (ENABLE_DEBUG) {
                console.warn("Пропускается ключ %d", key);
            }

        });

        // проходить его будем каждый кадр
        animatableProperties = map(animatableProperties, function (ignored, propertyName) { return propertyName; });

        keyframesList.properties = animatableProperties;

        return keyframesList;
    }


    animateClassic.prototype.start = function () {
        this.elapsedTime -= this.delay;
        this.loop();

        if (this.delay <= 0 || (this.fillsBackwards && this.delay > 0)) {
            this.setState("waitingtobackwardsfill");
        } else {
            this.setState("waitingtostart");
        }
    };

    animateClassic.prototype.animationEnded = function () {
        this.info("Анимация %o закончена", this);

        if (!this.fillsForwards) {

            var i, elemClass, property;

            for (i = 0; i < this.elements.length; i++) {

                elemClass = this.elements[i];

                for (property in elemClass.computedPropValues) {
                    this.css(elemClass.element, property, elemClass.computedPropValues[property]);
                }

            }
        }

        this.setState("complete");
        this.oncomplete();
    };


    /* НИЗКОУРОВНЕВЫЕ МЕТОДЫ */

    animateClassic.prototype.convertElementsToClasses = function (elements) {

        var elementClassesArray = [];

        for(var i = 0; i < elements.length; i++) {
            elementClassesArray.push({
                element: elements[i],
                computedPropValues: {},
                currentValues: {}
            });
        }

        return elementClassesArray;
    };



    var relativeValueReg = /^([+\-])=/;

    // TODO остальные относительные изменения.
    var relativeOperations = {

        "+": function (beginValue, relativeValue) {

        }

    };



    animateClassic.prototype.addProperty = function (property, keyframes) {
        var key, keyVal;

        if (typeof keyframes === "string") {
            if (relativeValueReg.test(keyframes)) {
                this.error("Относительное изменение не поддерживается");
                return; // TODO!!!!
                // передано относительное изменение

                var sign = keyframes.match(relativeValueReg)[1];

                var computedValue = this.css();

                var relativeValue = parseFloat(keyframes);

                keyframes = {
                }
            } else {
                // передано конечное значение
                keyframes = { "100%": keyframes };
            }
        }

        for (key in keyframes) {

            keyVal = keyframes[key];
            key = this.keyframeAliases[key] || key;
            key = key.match(keyReg);
            key = parseInt(key, 10);
            if (isNaN(key) || key < 0 || key > 100) {
                this.warn("Ключ %d не соответствует стандарту", key);
                continue;
            }

            key /= 100;

            if (this.keyframes[key] === undefined) {
                this.keyframes[key] = {};
                this.keys.push(key);
            }

            keyVal = keyVal.match(cssValueReg);
            this.keyframes[key][property] = parseFloat(keyVal[1]);

        }

        this.properties.push(property);

        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].computedPropValues[property] = this.css(this.elements[i].element, property);
        }

    };



    animateClassic.prototype.getFractionalTime = function () {

        var fractionalTime = this.duration ? this.elapsedTime / this.duration : 1.0;

        if (fractionalTime < 0) {
            fractionalTime = 0;
        }

        // текущая итерация
        // 1.3 -> 1
        var integralTime = Math.floor(fractionalTime);
        // кол-во итераций вообще
        // 1.7 -> 1
        var integralIterations = Math.floor(this.iterationCount);
        // является ли кол-во итераций дробным числом
        var iterationsHasFractional = this.iterationCount - integralIterations;

        if (this.iterationCount !== "infinite" && !iterationsHasFractional){
            console.log(integralTime, integralIterations);
            integralTime = Math.min(integralTime, integralIterations - 1);
        }

        // прогресс без учета итерации
        fractionalTime -= integralTime;

        if (fractionalTime > 1) {
            fractionalTime = 1;
        }

        if ((this.direction == "alternate" && integralTime & 1)
            || (this.direction == "alternate-reverse" && !integralTime & 1)
            || this.direction == "reverse") {
            fractionalTime = 1 - fractionalTime;
        }

        return fractionalTime;
    };


    animateClassic.prototype.getAnimationProgress = function (scale, offset) {

        if (!this.duration) {
            this.info("У анимации %o нулевая продолжительность цикла", this);
            return 1.0;
        }

        var elapsedTime = this.elapsedTime;

        if (this.iterationCount > 0 && elapsedTime >= this.totalDuration) {
            // 2.78 -> 2.0
            var integralIterationCount = Math.floor(this.iterationCount);
            // 0.78
            var iterationCountHasFractional = this.iterationCount - integralIterationCount;
            return integralIterationCount % 2 || iterationCountHasFractional ? 1.0 : 0.0;
        }

        var fractionalTime = this.fractionalTime;

        if (scale !== 1 || offset) {
            fractionalTime = (fractionalTime - offset) * scale;
        }

        if (this.easing instanceof CubicBezier || this.easing instanceof  Steps) {
            return this.easing.solve(fractionalTime, this.duration);
        } else if (typeof this.easing === "function") {
            return this.easing(fractionalTime, this.duration);
        } else {
            return fractionalTime;
        }
    };



    animateClassic.prototype.fetchValues = function () {

        var keys;

        var fromKey;
        var toKey;

        var fromKeyframe;
        var toKeyframe;

        var offset, scale;

        var timingFunctionValue;

        var fractionalTime = this.fractionalTime;

        var property, i, b;

        for(i = 0, b = this.properties.length; i < b; i++) {

            property = this.properties[i];

            keys = this.getCurrentKeys(fractionalTime, property);

            fromKey = keys[0];
            toKey = keys[1];

            fromKeyframe = this.keyframes[fromKey];
            toKeyframe = this.keyframes[toKey];

            offset = fromKey;
            scale = 1.0 / (toKey - fromKey);

            timingFunctionValue = this.getAnimationProgress(scale, offset);

            if (property in fromKeyframe && property in toKeyframe && fromKeyframe[property] !== SPECIAL) {

                this.currentValues[property] = this.blend(fromKeyframe[property], toKeyframe[property], timingFunctionValue);

            } else {

                this.currentValues[property] = SPECIAL;

                if (keys[0] === 0 && fromKeyframe[property] === undefined) {
                    for (var j = 0; j < this.elements.length; j++) {
                        this.elements[j].currentValues[property] = this.blend(this.elements[j].computedPropValues[property], toKeyframe[property], timingFunctionValue);
                    }
                }  else if (keys[1] === 100 && toKeyframe[property] === undefined) {
                    for (var j = 0; j < this.elements.length; j++) {
                        this.elements[j].currentValues[property] = this.blend(fromKeyframe[property], this.elements[j].computedPropValues[property], timingFunctionValue);
                    }
                }

            }
        }

    };



    animateClassic.prototype.renderValues = function () {
        var propertyName, propertyValue, i, isSpecial;

        for (propertyName in this.currentValues) {

            propertyValue = this.currentValues[propertyName];
            isSpecial = propertyValue === SPECIAL;

            for (i = 0; i < this.elements.length; i++) {

                if (isSpecial) {
                    propertyValue = this.elements[i].currentValues[propertyName];
                }

                this.css(this.elements[i].element, propertyName, propertyValue);
            }
        }
    };



    animateClassic.prototype.blend = function (from, to, progress) {
        return (to - from) * progress + from;
    };



    animateClassic.prototype.sortKeys = function (low, high) {
        var bearing = this.keys[ low + high >> 1 ];
        var i, j;
        var temp;

        if (low === undefined && high  === undefined) {
            low = 0;
            high = this.keys.length - 1;
        }

        i = low;
        j = high;

        do {
            while(this.keys[i] < bearing) ++i;
            while(this.keys[j] > bearing) --j;
            if (i <= j) {
                temp = this.keys[i];
                this.keys[i] = this.keys[j];
                this.keys[j] = temp;
                i++; j--;
            }
        } while (i <= j);

        if (low < j) this.sortKeys(low, j);
        if (i < high) this.sortKeys(i, high);
    };



    animateClassic.prototype.getCurrentKeys = function (fractionalTime, property) {

        var nextIndex = -1, prevIndex = -1;

        for ( var i = 0, b = this.keys.length, key; i < b; i++) {
            key = this.keys[i];

            if (property && this.keyframes[key][property] === undefined) {
                continue;
            }

            if (fractionalTime < key) {
                nextIndex = i;
                break;
            }

            prevIndex = i;

        }

        if (prevIndex === - 1) {
            prevIndex = 0;
        }

        if (nextIndex === - 1) {
            nextIndex = this.keys.length - 1;
        }

        var prevKey = this.keys[prevIndex];
        var nextKey = this.keys[nextIndex];

        return [ prevKey, nextKey ];
    };



    animateClassic.prototype.loop = function () {
        var self = this;

        requestAnimationFrame(function (now) {

            self.elapsedTime += now - (self.previousFetch || now);
            self.previousFetch = now;

            if (self.state ===  "waitingtobackwardsfill") {
                self.info("У анимации %o значения заполнены из нулевого кадра", self);
                self.fractionalTime = 0;
                self.tick();
                self.setState("waitingtostart");
            }

            if (self.elapsedTime >= 0 && self.state === "waitingtostart") {
                self.onstart();
                self.info("Анимация %o стартовала", self);
                self.setState("looping");
            }

            if (self.state === "looping") {
                self.assert(self.elapsedTime >= 0, "Анимирование с отрицательным временем со старта");
                self.fractionalTime = self.getFractionalTime();
                self.tick();

                if (self.elapsedTime < self.totalDuration) {
                    if (self.fractionalTime === 1) {
                        self.info("%o : итерация %i из %i", self, Math.floor(self.totalDuration / self.elapsedTime), self.iterationCount);
                        self.oniteration();
                    }
                }

            }

            if (self.elapsedTime < self.totalDuration) {
                self.loop();
            } else {
                self.animationEnded();
            }
        });
    };
