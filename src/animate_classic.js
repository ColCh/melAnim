    var requestAnimationFrame = window[getVendorPropName("requestAnimationFrame", true)] || function (callback) { setTimeout(callback, 1000 / 60); };
    
    var keyReg = /^\d{1,3}%$/;
    var durationReg = /^\d+(m?s?)$/;
    var cssValueReg = /(-?\d*\.?\d+)(.*)/;

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

        this.activeKey = 0;

        this.properties = [];

        this.currentValues = {};
        
        this.duration = this.parseTime(this.duration);

        this.delay = this.parseTime(this.delay);
        
        // TODO разные изинги.
        var easing = easingAliases[this.easing];

        this.easing = new CubicBezier(easing[0], easing[1], easing[2], easing[3]);
        
        this.easingEpsilon = this.easing.solveEpsilon(this.duration);

        this.elements = this.convertElementsToClasses(this.elements);

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
        var currentFractionalTime = this.getFractionalTime(this.activeKey);
        var fetchedValues = this.fetchValues(currentFractionalTime);
        this.renderValues(fetchedValues);
    };

    ClassicAnimation.prototype.start = function () {
        this.tick();
        this.loop();
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
            if (isNaN(key) || key < 0 || key > 100) continue;

            key /= 100;

            if (this.keyframes[key] === undefined) {
                this.keyframes[key] = {};
                this.keys.push(key);
            }

            keyVal = keyVal.match(cssValueReg);
            this.keyframes[key][property] = parseFloat(keyVal[1]);

        }

        this.properties.push(property);


        // если не переданы начальные или конечные ключевые кадры, то используются значения из вычисленного стиля.
        if (!this.propertyHasKeyframesAt(property, 0) || !this.propertyHasKeyframesAt(property, 1)) {
            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].computedPropValues[property] = this.css(this.elements[i].element, property);
            }
        }
    };

    
    
    ClassicAnimation.prototype.propertyHasKeyframesAt = function (property, key) {
        return key in this.keyframes && property in this.keyframes[key];
    };



    ClassicAnimation.prototype.getAnimationProgress = function (fractionalTime, scale, offset) {

        var duration = this.duration;
        
        if ( ! duration) {
            return 1.0;
        }
    
        duration *= this.iterationCount;
        if (this.elapsedTime >= duration) {
            return this.iterationCount % 2 ? 1.0 : 0.0;
        }
        
        var iteration = Math.floor(fractionalTime);
        
        fractionalTime -= iteration;
        
        if (this.direction === "alternate" && iteration & 1) {
            fractionalTime = 1 - fractionalTime;
        }
        
        if (scale !== 1 || offset) {
            fractionalTime = (fractionalTime - offset) * scale;
        }
                
        return this.easing.solve(fractionalTime, this.easingEpsilon);
        
    };



    ClassicAnimation.prototype.fetchValues = function (fractionalTime) {

        var keys = this.getCurrentKeys(fractionalTime);
        
        var fromKey = keys[0];
        var toKey = keys[1];

        var fromKeyframe = this.keyframes[fromKey];
        var toKeyframe = this.keyframes[toKey];

        if (this.activeKey < fromKey) {
            this.activeKey = fromKey;
        }

        var offset = this.activeKey;

        var timingFunctionValue = this.getAnimationProgress(fractionalTime, 1, offset);
                
        var property, b = this.properties.length;

        while (b--) {

            property = this.properties[b];

            if (property in fromKeyframe && property in toKeyframe && fromKeyframe[property] !== SPECIAL) {

                this.currentValues[property] = this.blend(fromKeyframe[property], toKeyframe[property], timingFunctionValue);

            } else {

                this.currentValues[property] = SPECIAL;

                if (keys[0] === 0 && fromKeyframe[property] === undefined) {
                    for (var i = 0; i < this.elements.length; i++) {
                        this.elements[i].currentValues[property] = this.blend(this.elements[i].computedPropValues[property], toKeyframe[property], timingFunctionValue);
                    }
                }  else if (keys[1] === 100 && toKeyframe[property] === undefined) {
                    for (var i = 0; i < this.elements.length; i++) {
                        this.elements[i].currentValues[property] = this.blend(fromKeyframe[property], this.elements[i].computedPropValues[property], timingFunctionValue);
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
   


    ClassicAnimation.prototype.getFractionalTime = function (offset) {
        var fractionalTime = this.elapsedTime / this.duration;
        if (fractionalTime > 1) {
            fractionalTime = 1;
        }
        return fractionalTime;
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
            
            if (property && this.keyframes[property] === undefined) {
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

            if (!self.started) {
                self.started = now;
            }

            self.elapsedTime = now - self.started;

            self.tick();

            if (self.elapsedTime < self.duration) {
                self.loop();
            } else {
                self.complete();
            }

        });
    };
