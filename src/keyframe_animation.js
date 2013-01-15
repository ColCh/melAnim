    //TODO удалить, т.к. директивы определены в animate_wrap.js
    var DEFAULT_DURATION = "400ms";
    var DEFAULT_EASING = "ease";
    var DEFAULT_FILLMODE = "forwards";
    var DEFAULT_DELAY = 0;
    var DEFAULT_DIRECTION = "normal";
    var DEFAULT_ITERATIONCOUNT = 1;
    var DEFAULT_HANDLER = noop;
    var DEFAULT_PLAYINGSTATE = "paused";

    var DATA_ATTR_NAME = mel + "-data-id";
    var SPECIAL_VALUE = null;

    // TODO animation-fill-mode
    // TODO multiply elements
    // TODO REFACTORING

    /**
     * Конструктор анимаций с ключевыми кадрами
     * отличается от обычной тем, что
     * есть возможность установить значение
     * для свойства, или определённое смягчение
     * при указанном прогрессе анимации
     * @constructor
     */
    function KeyframeAnimation() {
        this.targets = [];
        this.cache = {};
        this.name = generateId();
        /** @type KeyframeAnimation.prototype.keyframes */
        this.keyframes = [];
        this.specialEasing = {};
        this.iterations = 1;
        this.rule = addRule("." + this.name, "");
        this.animatedProperties = {};
        // начальный и конечный ключевые кадры
        // их свойства наследуют вычисленные
        this.addKeyframe(0, createObject(this.animatedProperties));
        this.addKeyframe(1, createObject(this.animatedProperties));
        this.timer = new ReflowLooper(this.tick, this);
    }

    /**
     * Объект с временными данными, вроде кешей
     * или же запомненных индивидуальных значений свойств.
     * @type {Object}
     * @private
     */
    KeyframeAnimation.prototype.cache = undefined;

    /**
     * Имя анимации
     * @type {string}
     * @private
     */
    KeyframeAnimation.prototype.name = undefined;

    /**
     * Анимируемые элементы
     * @private
     * @type {Array.<Element>}
     */
    KeyframeAnimation.prototype.targets = undefined;

    /**
     * CSS-правило, в котором анимация будет отрисовываться
     * @type {CSSRule}
     */
    KeyframeAnimation.prototype.rule = undefined;

    /**
     * Отсортированный массив ключевых кадров
     * @private
     * @typedef Array.{{key: number, properties: Object.<string, number>, easing: Function}}
     */
    KeyframeAnimation.prototype.keyframes = undefined;

    /**
     * Значения вычисленного стиля.
     * Родитель значений свойств
     * для первого (0%) и последнего (100%) ключевых кадров
     * @type {Object}
     * @private
     */
    KeyframeAnimation.prototype.animatedProperties = undefined;

    /**
     * Число проходов (по умол. 1)
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.iterations = undefined;

    /**
     * Направление анимации
     * @type {string}
     * @private
     */
    KeyframeAnimation.prototype.animationDirection = undefined;

    /**
     * Объект с особыми смягчениями для свойств
     * Ключ - имя свойства, Значение - функция смягчения
     * @type {Object.<string, Function>}
     */
    KeyframeAnimation.prototype.specialEasing = undefined;

    /**
     * Продолжительность анимации
     * @private
     * @type {number}
     */
    KeyframeAnimation.prototype.animationTime = undefined;

    /**
     * Обработчик завершения анимации
     * @private
     * @type {Function}
     */
    KeyframeAnimation.prototype.oncomplete = undefined;

    /**
     * Обработчик завершения прохода
     * @type {Function}
     * @private
     */
    KeyframeAnimation.prototype.oniteration = undefined;

    /**
     * Временная метка старта
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.started = undefined;

    /**
     * Смягчение анимации
     * @type {Function}
     * @private
     */
    KeyframeAnimation.prototype.smoothing = undefined;

    /**
     * Таймер отрисовки
     * @type {ReflowLooper}
     * @private
     */
    KeyframeAnimation.prototype.timer = undefined;

    /**
     * Время отложенного запуска (временная строка)
     * @see parseTimeString
     * @private
     * @type {number}
     */
    KeyframeAnimation.prototype.delayTime = undefined;

    /**
     * Режим заливки свойств
     * @type {string}
     * @private
     */
    KeyframeAnimation.prototype["fillingMode"] = undefined;

    /**
     * Установит анимируемый элемент
     * @param {Element} elem Элемент
     */
    KeyframeAnimation.prototype["element"] = function (elem) {
        var id;
        if (type.element(elem)) {
            addClass(elem, this.name);
            id = generateId()
            elem.setAttribute(DATA_ATTR_NAME, id);
            this.cache[id] = {};
            this.targets.push(elem);
        } else {
            elem = slice(elem);
            each(elem, this.element, this);
        }
    };

    /**
     * Установка продолжительности анимации
     * @param duration
     */
    KeyframeAnimation.prototype["duration"] = function (duration) {
        this.animationTime = duration;
    };

    /**
     * Установка обработчика
     * завершения анимации
     * @param {Function} callback
     */
    KeyframeAnimation.prototype["onComplete"] = function (callback) {
        this.oncomplete = callback;
    };

    /**
     * Установка смягчения анимации при прогрессе (в долях)
     * возможно установить особое смягчение для свойства
     * При установке смягчения для свойства параметр прогресса игнорируется
     * @param {(Function|string)} timingFunction временная функция CSS, функция или алиас смягчения
     * @param {number=} position прогресс в долях (по умол. для всей анимации)
     * @param {string=} property для какого свойства устанавливается (по умол. для всех)
     * @see cubicBezierApproximations
     */
    KeyframeAnimation.prototype["easing"] = function (timingFunction, position, property) {
        var keyframe;
        var leftBracketIndex, rightBracketIndex, points, camelCased;
        var countFromStart, stepsAmount;

        if (type.string(timingFunction)) {
            // alias или CSS timing-function

            camelCased = camelCase(trim(timingFunction));
            if (camelCased in cubicBezierApproximations) {
                timingFunction = cubicBezierApproximations[camelCased];
            } else if (camelCased in cubicBezierAliases) {
                timingFunction = cubicBezierAliases[camelCased];
            }

            if (!type.func(timingFunction)) {
                if (type.array(timingFunction)) {
                    points = timingFunction;
                } else if (cubicBezierReg.test(timingFunction)) {
                    leftBracketIndex = timingFunction.indexOf("(");
                    rightBracketIndex = timingFunction.indexOf(")", leftBracketIndex);
                    points = timingFunction.slice(leftBracketIndex, rightBracketIndex);
                    points = map(points.split(","), parseFloat);
                } else if (stepsReg.test(timingFunction)) {
                    leftBracketIndex = timingFunction.indexOf("(");
                    rightBracketIndex = timingFunction.indexOf(")", leftBracketIndex);
                    points = timingFunction.slice(leftBracketIndex, rightBracketIndex);
                    points = points.split(",");
                }

                // 4 аргумента - это кубическая кривая Безье
                if (points.length === 4) {
                    // TODO проверка абсцисс
                    timingFunction = partial(cubicBezier, points);
                } else if (points.length === 2) {
                    // 2 аргумента - лестничная функция
                    stepsAmount = parseInt(points[0], 10);
                    countFromStart = points[1] === "start";
                    timingFunction = partial(steps, [stepsAmount, countFromStart]);
                }
            }
        }

        if (!type.func(timingFunction)) {
            return;
        }

        if (type.string(property)) {
            this.specialEasing[property] = timingFunction;
        } else {
            if (type.undefined(position)) {
                this.smoothing = timingFunction;
            } else {
                position = normalizeKey(position);
            }
            if (type.number(position)) {
                position /= 100;
                keyframe = this.lookupKeyframe(position) || this.addKeyframe(position);
                keyframe.easing = timingFunction;
            }
        }
    };

    /**
     * Установка направления анимации
     * Допустимые значения см. в документации к CSS3 анимациям
     * @param {string} animationDirection
     */
    KeyframeAnimation.prototype["direction"] = function (animationDirection) {
        this.animationDirection = animationDirection;
    };

    KeyframeAnimation.prototype["delay"] = function (delay) {
        delay = parseTimeString(delay);
        this.delayTime = delay;
    };

    KeyframeAnimation.prototype["fillMode"] = function (fillMode) {
        this.fillingMode = fillMode;
    };

    KeyframeAnimation.prototype["iterationCount"] = function (iterations) {
        this.iterations = iterations;
    };

    /**
     * Добавит ключевой кадр на указанном прогрессе
     * и вернёт его
     * @param {key} position
     * @param {Object=} properties
     * @param {Function=} easing
     * @private
     */
    KeyframeAnimation.prototype.addKeyframe = function (position, properties, easing) {

        var keyframe, keyframes;
        var key, properties, easing;

        position = normalizeKey(position);

        if (!type.number(position)) return;

        /** @typedef {number} */
        key = position;
        /** @typedef {Object.<string, number>} */
        properties = properties || {};
        /** @typedef {Function} */
        easing = easing || null;

        /** @typedef {{key: key, properties: properties, easing: easing}} */
        keyframe = {
            key:key,
            properties:properties,
            easing:easing
        };

        /** @type {Array.<keyframe>} */
        keyframes = this.keyframes;
        keyframes.push(keyframe);
        bubbleSort(keyframes, compareKeyframes);

        return keyframe;
    };

    /**
     * Попытается найти в коллекции
     * ключевой кадр с указанным прогрессом
     * @param {number} position
     * @return {Object}
     * @private
     */
    KeyframeAnimation.prototype.lookupKeyframe = function (position) {
        var keyframe, index;
        index = binarySearch(this.keyframes, position, function (key, keyframe) {
            return key - keyframe.key;
        });
        keyframe = this.keyframes[index];
        return keyframe;
    };

    /**
     * Старт анимации или её продолжение после паузы
     * @param {boolean=} keepOn Продолжить ли предыдущие значения (установка в FALSY запускает заново)
     */
    KeyframeAnimation.prototype["start"] = function (keepOn) {

        var prop, delay, numericDefaultDelay, fillsBackwards, fillMode;
        var i;

        numericDefaultDelay = parseTimeString(DEFAULT_DELAY);

        fillMode = this.fillingMode || DEFAULT_FILLMODE;
        fillsBackwards = fillMode === FILLMODE_BACKWARDS;
        fillsBackwards |= fillMode === FILLMODE_BOTH;


        if (!keepOn) {
            this.started = now();
        }

        delay = parseTimeString(this.delayTime);
        delay = type.number(delay) ? delay : numericDefaultDelay;

        setTimeout(bind(this.timer.start, this.timer), delay);

        // запоминаем текущие значения анимируемых свойств для каждого элемента
        each(this.targets, function (element) {
            var id = element.getAttribute(DATA_ATTR_NAME);
            var elementData = this.cache[id];
            each(this.animatedProperties, function (special_value, propertyName) {
                elementData[propertyName] = normalize(element, propertyName);
            }, this);
        }, this);

        if ((fillsBackwards && delay > 0) || delay <= 0) {
            this.render(this.fetch(0));
        }
    };

    /**
     * Остановка анимации
     */
    KeyframeAnimation.prototype["stop"] = function () {

        var fillsForwards, fillMode;

        this.timer.stop();

        fillMode = this.fillingMode || DEFAULT_FILLMODE;
        fillsForwards = fillMode === FILLMODE_FORWARDS;
        fillsForwards |= fillMode === FILLMODE_BOTH;

        if (fillsForwards) {
            this.render(this.fetch(1), true);
        }

        type.func(this.oncomplete) && this.oncomplete();

    };

    /**
     * Установка значения свойства при указанном прогрессе
     * Для установки смягчения см. метод easing
     * @param {string} name имя свойства
     * @param {string|number} value значение свойства
     * @param {(string|number)=} position позиция, в долях. (по умол. 1)
     * @see KeyframeAnimation.easing
     */
    KeyframeAnimation.prototype["propAt"] = function (name, value, position) {

        /**
         * Ключевой кадр, имеющий свои свойства и своё смягчение
         * @typedef {{key: number, properties: Object.<string, number>, easing: Function}}
         * */
        var keyframe, keyframes;
        var startingKeyframe, endingKeyframe;

        /**
         * @type {Array.<keyframe>}
         */
        keyframes = this.keyframes;

        if (type.undefined(position)) position = keyAliases["to"];
        position = normalizeKey(position);
        // в долях
        position /= 100;

        if (!type.number(position)) return;

        keyframe = this.lookupKeyframe(position) || this.addKeyframe(position);
        this.animatedProperties[name] = SPECIAL_VALUE;
        keyframe.properties[name] = value;
    };

    /**
     * Высчитает значения свойств при указанном прогрессе
     * @param {number} fractionalTime прогресс по итерации
     * @return {Object}
     * @private
     */
    KeyframeAnimation.prototype.fetch = function (fractionalTime) {

        var elementData;
        var id;
        var i, j;
        var keyframes, globalFetch, fetchedProperties, firstKeyframe, secondKeyframe, from, to, propertyName;
        var element;
        var fractionalTime, offset, scale;
        var timingFunction, index, easing;

        keyframes = this.keyframes;

        /*
         * Поиск функции смягчения для текущего ключевого кадра
         */
        timingFunction = this.smoothing;

        index = binarySearch(keyframes, fractionalTime, function (fractionalTime, firstKeyframe, index, keyframes) {
            var secondKeyframe = keyframes[ index + 1];
            // для навигации в бинарном поиске
            var MOVE_RIGHT = 1, MOVE_LEFT = -1, STOP = 0;

            if (!secondKeyframe) return MOVE_LEFT;
            if (firstKeyframe.key > fractionalTime) return MOVE_LEFT;
            if (secondKeyframe <= fractionalTime) return MOVE_RIGHT;

            return STOP;
        });
        timingFunction = keyframes[index].easing ? keyframes[index].easing : timingFunction;
        timingFunction = type.func(timingFunction) ? timingFunction : cubicBezierApproximations[ DEFAULT_EASING ];

        /**
         *  информация о вычисленных значениях
         *  для каждого элемента
         *  */
        globalFetch = [];

        for (j = 0; j < this.targets.length; j++) {

            element = this.targets[j];
            fetchedProperties = {};
            globalFetch.push(fetchedProperties);

            for (propertyName in this.animatedProperties) {

                /*
                 * Поиск двух ближайших ключевых кадров
                 * для которых задано значение свойства
                 */
                firstKeyframe = keyframes[0];
                secondKeyframe = keyframes[keyframes.length - 1];

                //TODO было бы неплохо заменить линейный поиск на бинарный
                for (i = 1; i < keyframes.length - 1; i++) {
                    if (propertyName in keyframes[i].properties) {
                        if (fractionalTime <= keyframes[i].key) {
                            secondKeyframe = keyframes[i];
                            break;
                        }
                        firstKeyframe = keyframes[i];
                    }
                }

                // смещение первого ключевого кадра относительно начала анимации
                offset = firstKeyframe.key;
                // масштаб для сплющивания прогресса
                scale = 1.0 / (secondKeyframe.key - firstKeyframe.key);

                easing = timingFunction((fractionalTime - offset) * scale);

                from = firstKeyframe.properties[propertyName];
                to = secondKeyframe.properties[propertyName];

                id = element.getAttribute(DATA_ATTR_NAME);
                elementData = this.cache[id];

                if (from === SPECIAL_VALUE) {
                    from = elementData[propertyName];
                }
                if (to === SPECIAL_VALUE) {
                    to = elementData[propertyName];
                }

                from = normalize(element, propertyName, from);
                to = normalize(element, propertyName, to);

                fetchedProperties[propertyName] = blend(propertyName, from, to, easing);

            }
        }

        return globalFetch;
    };

    /**
     * Отрисует высчитанные значения свойств
     * @param {Object} fetchedInfo
     * @param {boolean=} direct отрисовывать ли напрямую в стили элементов
     * @private
     */
    KeyframeAnimation.prototype.render = function (fetchedInfo, direct) {

        var buffer, property, propertyName, propertyValue, element;
        var i, fetchedProperties;
        var index, NOT_FOUND, colonIndex, semiIndex;

        NOT_FOUND = -1;

        for (i = 0; i < this.targets.length; i++) {

            element = this.targets[i];
            fetchedProperties = fetchedInfo[i];
            buffer = element.style.cssText + ';';

            for (property in fetchedProperties) {

                propertyName = getVendorPropName.cache[property] || getVendorPropName(property);
                propertyValue = normalize(element, property, fetchedProperties[property], true);

                index = buffer.indexOf(propertyName, 0);
                index = index === NOT_FOUND ? buffer.indexOf(property, 0) : index;

                if (index === NOT_FOUND) {
                    buffer += propertyName + ":" + propertyValue + ";";
                } else {
                    colonIndex = buffer.indexOf(":", index);
                    semiIndex = buffer.indexOf(";", colonIndex);
                    buffer = buffer.slice(0, colonIndex + 1) + propertyValue + buffer.slice(semiIndex);
                }
            }

            // TODO Rules vs style проверка производительности
            element.style.cssText = buffer;
        }
    };

    /**
     * Тик анимации
     * просчитывание и отрисовка
     * @param {number=} timeStamp временная метка (или текущее время)
     * @private
     */
    KeyframeAnimation.prototype.tick = function (timeStamp) {

        var duration, elapsedTime, progr, fractionalTime;
        var iterations, integralIterations, currentIteration, iterationIsOdd, MAX_PROGR;
        var fetchedProperties;
        var delay, numericDefaultDelay;

        MAX_PROGR = 1;
        numericDefaultDelay = parseTimeString(DEFAULT_DELAY);

        /*
         * Вычисление прогресса по итерации
         * */
        elapsedTime = timeStamp - this.started;


        delay = parseTimeString(this.delayTime);
        delay = type.number(delay) ? delay : numericDefaultDelay;

        elapsedTime += -1 * delay;

        if (elapsedTime < 0) elapsedTime = 0;

        duration = parseTimeString(this.animationTime);
        duration = type.number(duration) ? duration : parseTimeString(DEFAULT_DURATION);

        // прогресс относительно первой итерации
        progr = elapsedTime / duration;

        currentIteration = Math.floor(progr);

        iterations = this.iterations;

        // исключение составляет специальное значение
        if (iterations === ITERATIONCOUNT_INFINITE) {
            iterations = Number.POSITIVE_INFINITY;
        } else {
            iterations = parseFloat(iterations);
            if (!isFinite(iterations) || iterations < 0) {
                // установлено неприемлимое значение для кол-ва итераций
                // откатываемся к значению по умолчанию
                iterations = DEFAULT_ITERATIONCOUNT;
            }
        }

        integralIterations = Math.floor(iterations);

        // прогресс относительно текущего прохода
        fractionalTime = progr - Math.min(currentIteration, integralIterations);

        if (fractionalTime > MAX_PROGR) fractionalTime = MAX_PROGR;

        /*
         * Условие завершения итерации
         */
        if (fractionalTime === MAX_PROGR && currentIteration < iterations) {
            type.func(this.oniteration) && this.oniteration();
        }

        /*
         * Условие завершения анимации
         */
        if (progr > iterations) {
            this.stop();
        } else {
            // аналогично операции NUM % 2, т.е. является ли число нечётным
            iterationIsOdd = currentIteration & 1;

            if (needsReverse(this.animationDirection, currentIteration)) {
                fractionalTime = MAX_PROGR - fractionalTime;
            }

            fetchedProperties = this.fetch(fractionalTime);
            this.render(fetchedProperties);
        }
    };

    /** @export */
    window["KeyframeAnimation"] = KeyframeAnimation;
