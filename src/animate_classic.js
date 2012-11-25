    var requestAnimationFrame = window[getVendorPropName("requestAnimationFrame", true)] || function (callback) { setTimeout(callback, 1000 / 60); };

    var SPECIAL = "special";

    /**
     * @constructor
     * @this {ClassicAnimation}
     *
     * @extends Animation
     * @see Animation
     * */
    function ClassicAnimation () {}



    inherit(ClassicAnimation, Animation);



    ClassicAnimation.prototype.initialize = function () {

        this.elapsedTime = 0;
        
        this.keyframes = { 0: {}, 1: {} };

        this.keys = [ 0, 1 ];

        this.properties = [];

        this.currentValues = {};

        this.iterationCount = this.iterationCount === "infinite" ? Number.POSITIVE_INFINITY : parseFloat(this.iterationCount);
        
        this.duration = this.parseTime(this.duration);

        this.delay = this.parseTime(this.delay);


        var easing = this.easing, points;

        if (easing in easingAliases) {
            points = easingAliases[easing];

            if (points.length === 4) {
                easing = new CubicBezier(points[0], points[1], points[2], points[3]);
            } else if (points.length === 2 || points.length === 1) {
                easing = new Steps(points[0], points[1] === "start");
            } else {
                this.error("Точки %o не соответствуют ни одной из встроенных easing", easing);
            }

        } else if (CubicBezier.reg.test(easing)) {
            points = easing.match(CubicBezier.reg);
            points = points.slice(1);
            easing = new CubicBezier(points[0], points[1], points[2], points[3]);
        } else if (Steps.reg.test(easing)) {
            points = easing.match(Steps.reg);
            points = points.slice(1);
            easing = new Steps(parseFloat(points[0]), points[1] === "start");
        }

        this.easing = easing;

        this.elements = this.convertElementsToClasses(this.elements);

        this.fillsBackwards = this.fillMode === "both" || this.fillMode === "backwards";
        this.fillsForwards = this.fillMode === "both" || this.fillMode === "forwards";

        this.previousFetch = 0;

        this.totalDuration = this.duration * this.iterationCount;

        this.fractionalTime = 0;

    }

    /* ВЫСОКОУРОВНЕВЫЕ МЕТОДЫ */
    
    
    // обработка анимируемых свойств перед анимацией
    ClassicAnimation.prototype.processProperties = function (properties) {
        var propertyName, propKeyframes;
        
        for (propertyName in properties) {
            propKeyframes = properties[propertyName];
            this.addProperty(propertyName, propKeyframes);
        }

        this.sortKeys();
    };
    
    
    ClassicAnimation.prototype.tick = function () {
        this.fetchValues();
        this.renderValues();
    };

    ClassicAnimation.prototype.start = function () {
        this.elapsedTime -= this.delay;
        this.loop();

        if (this.delay <= 0 || (this.fillsBackwards && this.delay > 0)) {
            this.setState("waitingtobackwardsfill");
        } else {
            this.setState("waitingtostart");
        }
    };

    ClassicAnimation.prototype.animationEnded = function () {
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

    ClassicAnimation.prototype.convertElementsToClasses = function (elements) {

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



    ClassicAnimation.prototype.addProperty = function (property, keyframes) {
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



    ClassicAnimation.prototype.getFractionalTime = function () {

        var fractionalTime = this.duration ? this.elapsedTime / this.duration : 1.0;

        if (fractionalTime < 0) {
            fractionalTime = 0;
        }

        var integralTime = Math.floor(fractionalTime);
        var integralIterations = Math.floor(this.iterationCount);
        var iterationsHasFractional = this.iterationCount - integralIterations;

        if (this.iterationCount !== "infinite" && !iterationsHasFractional){
            console.log(integralTime, integralIterations);
            integralTime = Math.min(integralTime, integralIterations - 1);
        }

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


    ClassicAnimation.prototype.getAnimationProgress = function (scale, offset) {
        
        if (!this.duration) {
            this.info("У анимации %o нулевая продолжительность цикла", this);
            return 1.0;
        }

        var elapsedTime = this.elapsedTime;

        if (this.iterationCount > 0 && elapsedTime >= this.totalDuration) {
            var integralIterationCount = Math.floor(this.iterationCount);
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



    ClassicAnimation.prototype.fetchValues = function () {

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



    ClassicAnimation.prototype.renderValues = function () {
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



    ClassicAnimation.prototype.blend = function (from, to, progress) {
        return (to - from) * progress + from;
    };



    ClassicAnimation.prototype.sortKeys = function (low, high) {
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



    ClassicAnimation.prototype.getCurrentKeys = function (fractionalTime, property) {
        
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



    ClassicAnimation.prototype.loop = function () {
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
