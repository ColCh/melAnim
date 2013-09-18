    /**
     * Низкоуровневый конструктор анимаций
     * @constructor
     */
    function Animation () {
        this.animId = generateId();
        this.animatedProperties = new PropertyDescriptorCollection();
        var self = this;
        this.selfTick = function (delta) {
            self.tick(delta);
        };
    }

    /** @type {string} */
    Animation.prototype.animId = 'none';

    /** @type {!Element} */
    Animation.prototype.animationTarget;

    /**
     * Установка цели анимации.
     * Объект, на который направлены
     * - перевод строковых значений свойств в числовые
     * - перевод относительных значений свойств в абсолютные
     * - отрисовка значений свойств на каждом шаге
     * @param {(Element|Object)} target
     */
    Animation.prototype.setTarget = function (target) {
        this.animationTarget = target;
    };

    goog.exportProperty(Animation.prototype, 'setTarget', Animation.prototype.setTarget);

    /**
     * Вернёт текущую цель анимации
     * @return {(Element|Object)}
     */
    Animation.prototype.getTarget = function () {
        return this.animationTarget;
    };

    goog.exportProperty(Animation.prototype, 'getTarget', Animation.prototype.getTarget);

    /**
     * @type {!PropertyDescriptorCollection}
     */
    Animation.prototype.animatedProperties = null;

    /**
     * Установка значения свойства при прогрессе.
     * @param {string} propertyName имя свойства
     * @param {!Array.<number>} propertyValue числовое абсолютное значение свойства (массив с числами)
     * @param {number} progress прогресс прохода в долях
     * @param {string=} alternativeValue альтернативное значение. см Keyframe.alternativeValue
     */
    Animation.prototype.setPropAt = function (propertyName, propertyValue, progress, alternativeValue) {

        /** @type {!PropertyDescriptor} */
        var propertyDescriptor;

        var propertyDescriptorIndex = this.animatedProperties.indexOf(propertyName);

        if (propertyDescriptorIndex === NOT_FOUND) {
            propertyDescriptor = this.animatedProperties.add(propertyName);
        } else {
            propertyDescriptor = this.animatedProperties.item(propertyDescriptorIndex);
        }

        /** @type {!KeyframesCollection} */
        var propertyKeyframes = propertyDescriptor.getKeyframes();

        var keyframeIndex = propertyKeyframes.indexOf(progress);

        /**
         * @type {!Keyframe}
         */
        var keyframe;

        if (keyframeIndex !== NOT_FOUND) {
            keyframe = propertyKeyframes.item(keyframeIndex);
        } else {
            keyframe = propertyKeyframes.add(progress);
        }

        keyframe.setValue(propertyValue);
        keyframe.alternativeValue = goog.isString(alternativeValue) ? alternativeValue : '';

    };

    goog.exportProperty(Animation.prototype, 'setPropAt', Animation.prototype.setPropAt);

    /**
     * Получение значения свойства при прогресса
     * @param {string} propertyName имя свойства
     * @param {number} progress прогресс прохода в долях
     * @return {Array.<number>?}
     */
    Animation.prototype.getPropAt = function (propertyName, progress) {

        /** @type {!PropertyDescriptor} */
        var propertyDescriptor;

        var propertyDescriptorIndex = this.animatedProperties.indexOf(propertyName);

        if (propertyDescriptorIndex !== NOT_FOUND) {
            propertyDescriptor = this.animatedProperties.item(propertyDescriptorIndex);

            /** @type {!KeyframesCollection} */
            var propertyKeyframes = propertyDescriptor.getKeyframes();

            var keyframeIndex = propertyKeyframes.indexOf(progress);

            var keyframe;

            if (keyframeIndex !== NOT_FOUND) {
                keyframe = propertyKeyframes.item(keyframeIndex);

                return keyframe.getValue();
            }
        }

        return null;
    };

    goog.exportProperty(Animation.prototype, 'getPropAt', Animation.prototype.getPropAt);

    /**
     * Установка стартового значения свойства
     * Имеет смысл при 'fillMode' без 'forwards'
     * Аргументы такие же, как и у Animation.setPropAt.
     * @param {string} propertyName
     * @param {!Array.<number>} propertyValue
     * @param {string=} alternativeValue
     */
    Animation.prototype.setStartingValue = function (propertyName, propertyValue, alternativeValue) {
        /** @type {!PropertyDescriptor} */
        var propertyDescriptor;

        var propertyDescriptorIndex = this.animatedProperties.indexOf(propertyName);

        if (propertyDescriptorIndex === NOT_FOUND) {
            propertyDescriptor = this.animatedProperties.add(propertyName);
        } else {
            propertyDescriptor = this.animatedProperties.item(propertyDescriptorIndex);
        }

        /** @type {!Keyframe} */
        var startingValue = propertyDescriptor.startingValue;

        startingValue.setValue(propertyValue);
        startingValue.alternativeValue = goog.isString(alternativeValue) ? alternativeValue : '';

    };

    goog.exportProperty(Animation.prototype, 'setStartingValue', Animation.prototype.setStartingValue);

    /**
     * @param {string} propertyName
     */
    Animation.prototype.getStartingValue = function (propertyName) {

        /** @type {!PropertyDescriptor} */
        var propertyDescriptor;

        var propertyDescriptorIndex = this.animatedProperties.indexOf(propertyName);

        if (propertyDescriptorIndex !== NOT_FOUND) {
            propertyDescriptor = this.animatedProperties.item(propertyDescriptorIndex);

            /** @type {!Keyframe} */
            var startingValue = propertyDescriptor.startingValue;

            return startingValue.getValue();
        }

        return null;
    };

    goog.exportProperty(Animation.prototype, 'getStartingValue', Animation.prototype.getStartingValue);

    /**
     * @param {string} propName
     * @param {!Array.<number>|string|number|null} currentValue
     * @param {string=} vendorizedPropName
     */
    Animation.prototype.render = function (propName, currentValue, vendorizedPropName) {
        var stringValue = goog.isString(currentValue) ?  currentValue : toStringValue(this.animationTarget, propName, currentValue, vendorizedPropName);
        setStyle(this.animationTarget, propName, stringValue, vendorizedPropName);
    };

    /** @type {number} */
    Animation.prototype.delayTime = DEFAULT_DELAY;

    /***
     * Установка задержки между стартом и началом проигрывания.
     * @param {number} delay время в миллисекундах
     */
    Animation.prototype.setDelay = function (delay) {
        this.delayTime = delay;
    };

    goog.exportProperty(Animation.prototype, 'setDelay', Animation.prototype.setDelay);

    /** @type {number} */
    Animation.prototype.cycleDuration = DEFAULT_DURATION;

    /**
     * Установка продолжительности одного прохода
     * @param {number} duration время в миллисекундах
     */
    Animation.prototype.setDuration = function (duration) {
        this.cycleDuration = duration;
    };

    goog.exportProperty(Animation.prototype, 'setDuration', Animation.prototype.setDuration);

    /** @type {number} */
    Animation.prototype.iterations = DEFAULT_ITERATIONS;

    /** @type {number} */
    Animation.prototype.integralIterations = DEFAULT_INTEGRAL_ITERATIONS;

    /**
     * Установка числа проходов
     * @param {number} iterations
     */
    Animation.prototype.setIterations = function (iterations) {
        if (iterations === Number.POSITIVE_INFINITY) {
            this.iterations = this.integralIterations = Number.POSITIVE_INFINITY;
        } else {
            if (isFinite(iterations) && iterations >= 0) {
                this.iterations = iterations;
                this.integralIterations = Math.floor(iterations);
            }
        }
    };

    goog.exportProperty(Animation.prototype, 'setIterations', Animation.prototype.setIterations);

    /** @type {boolean} */
    Animation.prototype.isAlternated = DEFAULT_IS_ALTERNATED;

    /** @type {boolean} */
    Animation.prototype.isReversed = DEFAULT_IS_REVERSED;

    /**
     * Установка режима направления
     * @param {number} binaryDirection бинарные режим направления
     */
    Animation.prototype.setDirection = function (binaryDirection) {
        this.isAlternated = (binaryDirection & DIRECTION_ALTERNATE) !== 0;
        this.isReversed = (binaryDirection & DIRECTION_REVERSE) !== 0;
    };

    goog.exportProperty(Animation.prototype, 'setDirection', Animation.prototype.setDirection);

    /**
     * @return {number}
     */
    Animation.prototype.getDirection = function () {
        var binaryDirection = 0;
        if (this.isAlternated) {
            binaryDirection &= DIRECTION_ALTERNATE;
        }
        if (this.isReversed) {
            binaryDirection &= DIRECTION_REVERSE;
        }
        return binaryDirection;
    };

    goog.exportProperty(Animation.prototype, 'getDirection', Animation.prototype.getDirection);

    /**
     * @return {boolean}
     */
    Animation.prototype.needsReverse = function () {

        // Оптимизация битовой логикой не сработала
        // http://jsperf.com/bitwise-vs-boolean

        if (this.isAlternated) {
            if (this.isReversed) {
                return (this.currentIteration % 2) === 0;
            } else {
                return (this.currentIteration % 2) === 1;
            }
        } else if (this.isReversed) {
            return true;
        }

        return false;
    };


    /** @type {boolean} */
    Animation.prototype.fillsForwards = DEFAULT_FILLS_FORWARDS;

    /** @type {boolean} */
    Animation.prototype.fillsBackwards = DEFAULT_FILLS_BACKWARDS;

    /**
     * @param {number} binaryFillMode
     */
    Animation.prototype.setFillMode = function (binaryFillMode) {
        this.fillsForwards = (binaryFillMode & FILLS_FORWARDS) !== 0;
        this.fillsBackwards = (binaryFillMode & FILLS_BACKWARDS) !== 0;
    };

    goog.exportProperty(Animation.prototype, 'setFillMode', Animation.prototype.setFillMode);

    /**
     * @return {number}
     */
    Animation.prototype.getFillMode = function () {
        var binFillMode = 0;
        if (this.fillsForwards) {
            binFillMode |= FILLS_FORWARDS;
        }
        if (this.fillsBackwards) {
            binFillMode |= FILLS_BACKWARDS;
        }
        return binFillMode;
    };

    goog.exportProperty(Animation.prototype, 'getFillMode', Animation.prototype.getFillMode);

    /** @type {number} */
    Animation.prototype.elapsedTime = 0;

    /** @type {!(Easing|CubicBezier|Steps)} */
    Animation.prototype.smoothing = DEFAULT_EASING;

    /**
     * @param {!(Easing|CubicBezier|Steps)} easing
     */
    Animation.prototype.setEasing = function (easing) {
        this.smoothing = easing;
    };

    goog.exportProperty(Animation.prototype, 'setEasing', Animation.prototype.setEasing);

    /**
     * @return {!(CubicBezier|Steps|Easing)}
     */
    Animation.prototype.getEasing = function () {
        return this.smoothing;
    };

    goog.exportProperty(Animation.prototype, 'getEasing', Animation.prototype.getEasing);

    /** @type {number} */
    Animation.prototype.animationProgress = 0;

    /** @type {boolean} */
    Animation.prototype.isOnStartFired = false;

    /** @type {number} */
    Animation.prototype.fractionalTime = 0;

    /** @type {number} */
    Animation.prototype.previousIteration = 0;

    /** @type {number} */
    Animation.prototype.currentIteration = 0;

    /**
     * @return {number}
     */
    Animation.prototype.getFractionalTime = function () {
        return this.fractionalTime;
    };

    goog.exportProperty(Animation.prototype, 'getFractionalTime', Animation.prototype.getFractionalTime);

    /**
     * @param {number} deltaTime
     */
    Animation.prototype.tick = function (deltaTime) {

        var elapsedTime, currentIteration, iterationProgress;
        this.elapsedTime += deltaTime;
        elapsedTime = Math.max(this.elapsedTime - this.delayTime, MINIMAL_PROGRESS);
        this.animationProgress = elapsedTime / this.cycleDuration;
        currentIteration = Math.floor(this.animationProgress);

        if (currentIteration > 0) {
            this.previousIteration = this.currentIteration;
            this.currentIteration = currentIteration > this.integralIterations ? this.integralIterations : currentIteration;
            iterationProgress = this.animationProgress - currentIteration;
        } else {
            iterationProgress = this.animationProgress;
        }

        if (iterationProgress > MAXIMAL_PROGRESS) {
            iterationProgress = MAXIMAL_PROGRESS;
        }

        if (this.needsReverse()) {
            iterationProgress = MAXIMAL_PROGRESS - iterationProgress;
        }

        this.fractionalTime = iterationProgress;

        if (this.animationProgress < this.iterations) {

            this.update();

            if (this.delayTime > 0 && elapsedTime <= deltaTime && this.elapsedTime >= this.delayTime) {
                if (this.onstart !== goog.nullFunction) {
                    this.onstart();
                }
            } else if (this.onstep !== goog.nullFunction && this.fractionalTime !== 0) {
                this.onstep();
            }
        } else {
            this.stop();
            if (this.oncomplete !== goog.nullFunction) {
                this.oncomplete();
            }
        }
    };

    Animation.prototype.update = function () {

        var leftKeyframeIndex;
        var propertyKeyframes, propertyDescriptor;
        /**
         * Глобальное смягчение - значение временной функции рпи прогрессе АНИМАЦИИ.
         * Лениво инициализируется и используется, если локальный прогресс ключевых кадров
         * равен прогрессу анимации.
         * Этим экономятся вызовы функции смягчения.
         * @type {number|null}
         */
        var globalEasing = null;
        var localEasing, relativeFractionalTime;
        var leftKeyframe, rightKeyframe;
        var alternativeKeyframe;
        var blender = blend;

        for (var i = 0; i < this.animatedProperties.length; i++) {

            propertyDescriptor = this.animatedProperties.item(i);
            propertyKeyframes = propertyDescriptor.getKeyframes();

            leftKeyframeIndex = propertyKeyframes.indexOfLeft(this.fractionalTime);

            leftKeyframe = propertyKeyframes.item(leftKeyframeIndex);
            rightKeyframe = propertyKeyframes.item(leftKeyframeIndex + 1);

            // Прогресс относительно двух найденных ключевых кадров
            if (leftKeyframe.numericKey === MINIMAL_PROGRESS && rightKeyframe.numericKey === MAXIMAL_PROGRESS) {
                // Упрощённое нижележащее выражение при подстановке "0.0" и "1.0"
                relativeFractionalTime = this.fractionalTime;
            } else {
                relativeFractionalTime = (this.fractionalTime - leftKeyframe.numericKey) / (rightKeyframe.numericKey - leftKeyframe.numericKey);
            }

            if (relativeFractionalTime === MINIMAL_PROGRESS || relativeFractionalTime === MAXIMAL_PROGRESS) {
                // В начале и в конце (прогресс 0.0 и 1.0) прогресса относительно ключевых кадров
                // значение смягчения всегда равно прогрессу
                // Вычислять значение смягчения, промежуточное значение свойства и переводить его в строку не требуется.
                alternativeKeyframe = (relativeFractionalTime === MINIMAL_PROGRESS) ? leftKeyframe : rightKeyframe;
                if (alternativeKeyframe.alternativeValue.length) {
                    this.render(propertyDescriptor.propName, alternativeKeyframe.alternativeValue, propertyDescriptor.vendorizedPropName);
                } // else Альтернативное значение не задано. Будет происходить вычисление промежуточного и перевод его в строку.
            } else if (relativeFractionalTime === this.fractionalTime) {
                // Локальный прогресс ключевых кадров равен прогрессу анимации
                // Экономия вызова значения временной функции смягчения
                if (goog.isNull(globalEasing)) {
                    globalEasing = this.smoothing.compute(relativeFractionalTime)
                }
                localEasing = globalEasing;
            } else {
                //
                localEasing = this.smoothing.compute(relativeFractionalTime);
            }

            if (!alternativeKeyframe) {
                // Нет высчитанного строкового значения
                // Высчет промежуточного значения и перевод его в строку, а затем отрисовка полученного
                // Худший случай

                if ( COLOR_REG.test(propertyDescriptor.propName) ) {
                    blender = blendHooks['color'];
                } else if (propertyDescriptor.propName in blendHooks) {
                    blender = blendHooks[propertyDescriptor.propName];
                }

                if ( blender(leftKeyframe.propVal, rightKeyframe.propVal, localEasing, propertyDescriptor.currentValue, BLEND_DIGITS)) {
                    // Отрисовываем в том случае, если значение свойства изменено
                    this.render(propertyDescriptor.propName, propertyDescriptor.currentValue, propertyDescriptor.vendorizedPropName);
                } // else Отрисованное значение эквивалентно текущему промежуточному. Пропуск отрисовки

            }

        }
    };

    Animation.prototype.toString = function () {
        return this.animId;
    };

    /** @type {number} */
    Animation.prototype.tickerId;

    /** @type {CSSKeyframesRule} */
    Animation.prototype.keyframesRule;

    /**
     * Запускает проигрывание анимации
     */
    Animation.prototype.start = function () {

        if (this.usesCSS3) {

            debugger;

            this.keyframesRule = KeyframesRulesRegistry.request();
            this.keyframesRule.name = this.animId;

            for (var i = 0; i < this.animatedProperties.length; i++) {

                var propertyDescriptor = this.animatedProperties.item(i);
                var propertyKeyframes = propertyDescriptor.getKeyframes();

                for (var j = 0; j < propertyKeyframes.length; j++) {

                    var propertyKeyframe = propertyKeyframes.item(j);
                    var key = propertyKeyframe.numericKey * 1e2 + '%';

                    var cssKeyframe = this.keyframesRule.findRule(key);

                    if (!cssKeyframe) {
                        // у Chrome было неверное следование спецификации - неверное имя метода для добавления ключевых кадров.
                        var keyframesAppendRule = this.keyframesRule.appendRule || this.keyframesRule.insertRule;
                        keyframesAppendRule.call(this.keyframesRule, key + ' ' + '{' + ' ' + '}');
                        cssKeyframe = this.keyframesRule.findRule(key);
                    }

                    var stringValue;

                    if (propertyKeyframe.alternativeValue) {
                        stringValue = propertyKeyframe.alternativeValue;
                    } else {
                        stringValue = toStringValue(this.animationTarget, propertyDescriptor.propName, propertyKeyframe.getValue(), propertyDescriptor.vendorizedPropName);
                        propertyKeyframe.alternativeValue = stringValue;
                    }

                    cssKeyframe.style[ propertyDescriptor.vendorizedPropName ] = propertyKeyframe.alternativeValue;
                }
            }

            var singleAnimation = '';

            singleAnimation += this.animId;
            singleAnimation += ' ' + this.duration() + 'ms';
            singleAnimation += ' ' + this.getEasing();
            singleAnimation += ' ' + this.delay() + 'ms';
            singleAnimation += ' ' + this.iterationCount();
            singleAnimation += ' ' + this.direction();
            singleAnimation += ' ' + this.fillMode();

            setStyle(this.animationTarget, "animation", singleAnimation);

        } else {
            this.elapsedTime = 0;

            if (this.fillsBackwards) {
                this.update();
            }

            if (this.delayTime <= 0) {
                if (this.onstart !== goog.nullFunction) {
                    this.onstart();
                }
            }

            this.resume();
        }

    };

    goog.exportProperty(Animation.prototype, 'start', Animation.prototype.start);

    /**
     * Останавливает анимацию
     * */
    Animation.prototype.stop = function () {
        if (this.fillsForwards) {
            // Установка конечных значений для свойств.
            this.fractionalTime = 1;
            this.update();
        } else {
            // Возвращение анимированных свойств в доанимированное состояние
            for (var i = 0; i < this.animatedProperties.length; i++) {
                var propertyDescriptor = this.animatedProperties.item(i);
                var startingValue = propertyDescriptor.startingValue;
                if (startingValue.alternativeValue.length) {
                    this.render(propertyDescriptor.propName, startingValue.alternativeValue, propertyDescriptor.vendorizedPropName);
                } else {
                    this.render(propertyDescriptor.propName, startingValue.getValue(), propertyDescriptor.vendorizedPropName);
                }
            }
        }
        this.pause();
    };

    goog.exportProperty(Animation.prototype, 'stop', Animation.prototype.stop);

    /**
     * @type {function (number)}
     */
    Animation.prototype.selfTick;

    /**
     * Снимает анимацию с паузы
     * */
    Animation.prototype.resume = function () {
        this.tickerId = Ticker.on(this.selfTick);
    };

    goog.exportProperty(Animation.prototype, 'resume', Animation.prototype.resume);

    /**
     * Приостанавливает анимацию
     * */
    Animation.prototype.pause = function () {
        Ticker.off(this.tickerId);
    };

    goog.exportProperty(Animation.prototype, 'pause', Animation.prototype.pause);

    /** @type {boolean} */
    Animation.prototype.usesCSS3;

    /**
     * Форсирует анимации классический режим (JS-анимации)
     * @param {boolean} value
     */
    Animation.prototype.setClassicMode = function (value) {
        this.usesCSS3 = CSSANIMATIONS_SUPPORTED && !value;
    };

    goog.exportProperty(Animation.prototype, 'setClassicMode', Animation.prototype.setClassicMode);

    /** @type {!Function} */
    Animation.prototype.oncomplete = goog.nullFunction;

    /**
     * Установка обработчика завершения анимации
     * Функция исполнится, когда анимация завершится естественным ходом.
     * (без ручного вызова Animation.stop)
     * @param {!Function} callback
     */
    Animation.prototype.onComplete = function (callback) {
        this.oncomplete = callback;
    };

    goog.exportProperty(Animation.prototype, 'onComplete', Animation.prototype.onComplete);

    /** @type {!Function} */
    Animation.prototype.onstart = goog.nullFunction;

    /**
     * Установка обработчика старта анимации.
     * Исполнится, когда анимация начнёт проигрываться.
     * Может быть таймаут между стартом и началом проигрывания.
     * Этот таймаут устанавливается методом 'setDelay'
     * @param {!Function} callback
     */
    Animation.prototype.onStart = function (callback) {
        this.onstart = callback;
    };

    goog.exportProperty(Animation.prototype, 'onStart', Animation.prototype.onStart);

    /** @type {!Function} */
    Animation.prototype.onstep = goog.nullFunction;

    /**
     * Установка функции, исполняющейся при каждом шаге анимации.
     * Исполняется после обновления состояния анимации (метод 'update')
     * @param {!Function} callback
     */
    Animation.prototype.onStep = function (callback) {
        this.onstep = callback;
    };

    goog.exportProperty(Animation.prototype, 'onStep', Animation.prototype.onStep);

    /** @type {!Function} */
    Animation.prototype.oniteration = goog.nullFunction;

    /**
     * Установка обработчика завершения прохода.
     * Имеет смысл, если число проходов больше одного.
     * Число проходов устанавливается методом 'setIterations'
     * @param {!Function} callback
     */
    Animation.prototype.onIteration = function (callback) {
        this.oniteration = callback;
    };

    goog.exportProperty(Animation.prototype, 'onIteration', Animation.prototype.onIteration);