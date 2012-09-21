    var requestAnimationFrame = window[getVendorPropName("requestAnimationFrame", true)] || function (callback) { setTimeout(callback, 1000 / 60); };
    
    var keyReg = /^\d{1,3}%$/;
    var durationReg = /^\d+(m?s?)$/;
    var cssValueReg = /(-?\d*\.?\d+)(.*)/;

    function ClassicAnimation (elements, properties, duration, easing, complete, fillMode, delay, iterationCount, direction, classicMode) {
        this.fillInstance.apply(this, arguments);
        
        this.elapsedTime = 0;
        
        this.keyframes = {};
        this.keys = [];
        this.currentValues = {};
        
        this.duration = this.parseTime(this.duration);
        this.delay = this.parseTime(this.delay);
        
        // TODO разные изинги.
        easing = easingAliases[this.easing];
        this.easing = new CubicBezier(easing[0], easing[1], easing[2], easing[3]);
        
        this.processProperties(properties);
    }
    
    inherit(ClassicAnimation, Animation);
  


    // обработка анимируемых свойств перед анимацией
    ClassicAnimation.prototype.processProperties = function (properties) {
        var propertyName, propKeyframes;
        
        for (propertyName in properties) {
            propKeyframes = properties[propertyName];
            this.addProperty(propertyName, propKeyframes);
        }

        this.sortKeys(0, this.keys.length - 1);
    };



    // добавит свойство property с параметрами анимации keyframes в анимацию
    ClassicAnimation.prototype.addProperty = function (property, keyframes) {
        var key, keyVal;
        
        // TODO относительное изменение
        // TODO передача конечного стиля
        
        for (key in keyframes) {
            
            keyVal = keyframes[key];
            // преобразование "to" в "100%".
            key = this.keyframeAliases[key] || key;
            
            key = parseInt(key.match(keyReg), 10);
            if (isNaN(key) || key < 0 || key > 100) continue;

            key /= 100;
            
            if (!this.keyframes[key]) {
                this.keyframes[key] = {};
                this.keys.push(key);
            }
            
            keyVal = keyVal.match(cssValueReg); 
            this.keyframes[key][property] = parseFloat(keyVal[1]);

        }

        // если не переданы начальные или конечные ключевые кадры, то используются значения из вычисленного стиля.
        if (!this.propertyHasKeyframesAt(property, 0) || !this.propertyHasKeyframesAt(property, 1)) {
            for (var i = this.elements.length; i; i--) {
                this.elements[i].computedPropValues[property] = this.css(this.elements[i].element, property);
            }
        }
        
    };


    
    // есть ли у свойства ключевой кадр.
    ClassicAnimation.prototype.propertyHasKeyframesAt = function (property, key) {
        return key in this.keyframes && property in this.keyframes[key];
    };



    // приведёт вид времени из анимационного к милисекундам.
    ClassicAnimation.prototype.parseTime = function (timeString) {
        return parseFloat(timeString) * (timeString.match(durationReg)[1] === "s" ? 1000 : 1);
    };



    // вернёт текущее значение временной функции анимации.
    ClassicAnimation.prototype.progress = function (scale, offset) {
        
        var duration = this.duration;
        
        if ( ! duration) {
            return 1.0;
        }
        
        if (this.iterationCount > 0) {
            duration *= this.iterationCount;
            if (this.elapsedTime >= duration) {
                return this.iterationCount % 2 ? 1.0 : 0.0;
            }
        }
        
        var fractionalTime = this.fractionalTime;
        var iteration = parseInt(fractionalTime, 10);
        
        fractionalTime -= iteration;
        
        if (this.direction === "alternate" && iteration & 1) {
            fractionalTime = 1 - fractionalTime;
        }
        
        if (scale !== undefined && scale != 1 || offset) {
            fractionalTime = (fractionalTime - offset) * scale;
        }
        
        return this.easing.solve(fractionalTime, this.easing.solveEpsilon(this.duration));
        
    };



    // общий метод для старта анимации
    ClassicAnimation.prototype.start = function () {
        this.tick();
        this.loop();
    };


    // отсортирует ключевые кадры по возрастанию 
    ClassicAnimation.prototype.sortKeys = function (low, high) {
        var bearing = this.keys[ low + high >> 1 ];
        var i = low, j = high;
        var temp;
        
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


    // вычислит значения свойст в текущий момент времени
    ClassicAnimation.prototype.fetchValues = function () {
        
        var keyframes = this.getCurrentKeys(this.fractionalTime);
        
        var offset = keyframes.prev.key;
        var scale = 1.0 / (keyframes.next.key - keyframes.prev.key);
        
        var progress = this.progress(scale, offset);
        
        var property;
        
        var currentValues = this.currentValues = {};
        
        for (property in keyframes.prev.keyframe) {
            keyframes = this.getCurrentKeyframes(this.fractionalTime, property);
            currentValues[property] = this.blend(keyframes.prev.keyframe[property], keyframes.next.keyframe[property], progress).toFixed(2);
        }
    };



    // вычислит значение по формуле
    ClassicAnimation.prototype.blend = function (from, to, progress) {
        return (to - from) * progress + from;
    };



    // отрисует текущие значения свойств на элементах.
    ClassicAnimation.prototype.renderValues = function () {
        
        var property, i, elements = this.elements;
        
        for (property in this.currentValues) {
            for (i = 0; i < elements.length; i++) {
                elements[i].style[property] = this.currentValues[property] + "px";
            }
        }
    };



    // обработка кадра в текущий момент времени.
    ClassicAnimation.prototype.tick = function () {
        this.refreshFractionalTime();
        this.fetchValues();
        this.renderValues();
    };

    // вернёт прогресс анимации.
    ClassicAnimation.prototype.refreshFractionalTime = function () {
        this.fractionalTime = this.elapsedTime / this.duration;
    };



    // вернёт два кейфрейма, значения которых будут использоваться на данном этапе.
    // опционально указывается свойство, для которого отбирать ключевые кадры.
    ClassicAnimation.prototype.getCurrentKeys = function (fractionalTime, property) {
        
        var nextIndex = - 1, prevIndex = - 1;
        
        // TODO бинарный поиск

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



    // общий метод для обработки кадра анимации
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
