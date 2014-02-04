    /**
     * Низкоуровневый конструктор анимаций
     * @constructor
     */
    function Animation () {
        this.animatedProperties = new PropertyDescriptorCollection();
        var self = this;
        this.selfTick = function (delta) {
            self.tick(delta);
        };

        if (CSSANIMATIONS_SUPPORTED) {
            // Закрепление контекста у функций, порождающих события
            this.fireOnStart = function () {
                self._not_self_fireOnStart();
            };
            this.fireOnStep = function () {
                self._not_self_fireOnStep();
            };
            this.fireOnIteration = function () {
                self._not_self_fireOnIteration();
            };
            this.fireOnComplete = function () {
                self._not_self_fireOnComplete();
            };
            this.fireOnCompleteWithStop = function () {
                self._not_self_fireOnCompleteWithStop();
            };
        }

    }

    /** @type {string} */
    Animation.prototype.animId = 'none';

    /** @type {!HTMLElement} */
    Animation.prototype.animationTarget;

    /**
     * Установка цели анимации.
     * Объект, на который направлены
     * - перевод строковых значений свойств в числовые
     * - перевод относительных значений свойств в абсолютные
     * - отрисовка значений свойств на каждом шаге
     * @param {!HTMLElement} target
     */
    Animation.prototype.setTarget = function (target) {
        this.animationTarget = target;
    };

    goog.exportProperty(Animation.prototype, 'setTarget', Animation.prototype.setTarget);

    /**
     * Вернёт текущую цель анимации
     * @return {!HTMLElement}
     */
    Animation.prototype.getTarget = function () {
        return this.animationTarget;
    };

    goog.exportProperty(Animation.prototype, 'getTarget', Animation.prototype.getTarget);

    /**
     * @type {!PropertyDescriptorCollection}
     */
    Animation.prototype.animatedProperties;

    /**
     * Установка значения свойства при прогрессе.
     * @param {string} propertyName имя свойства
     * @param {!Array.<number>} propertyValue числовое абсолютное значение свойства (массив с числами)
     * @param {number} progress прогресс прохода в долях
     */
    Animation.prototype.setPropAt = function (propertyName, propertyValue, progress) {

        /** @type {!PropertyDescriptor} */
        var propertyDescriptor;

        var propertyDescriptorIndex = this.animatedProperties.indexOf(propertyName);

        if (propertyDescriptorIndex === NOT_FOUND) {
            propertyDescriptor = this.animatedProperties.add(propertyName);
        } else {
            propertyDescriptor = this.animatedProperties[ propertyDescriptorIndex ];
        }

        /** @type {!KeyframesCollection} */
        var propertyKeyframes = propertyDescriptor.keyframes;

        var keyframeIndex = propertyKeyframes.indexOf(progress);

        /**
         * @type {!Keyframe}
         */
        var keyframe;

        if (keyframeIndex !== NOT_FOUND) {
            keyframe = propertyKeyframes[ keyframeIndex ];
        } else {
            keyframe = propertyKeyframes.add(progress);
        }

        keyframe.setValue(propertyValue);

    };

    goog.exportProperty(Animation.prototype, 'setPropAt', Animation.prototype.setPropAt);

    /**
     * Получение значения свойства при прогрессе
     * @param {string} propertyName имя свойства
     * @param {number} progress прогресс прохода в долях
     * @return {Array.<number>?}
     */
    Animation.prototype.getPropAt = function (propertyName, progress) {

        /** @type {!PropertyDescriptor} */
        var propertyDescriptor;

        var propertyDescriptorIndex = this.animatedProperties.indexOf(propertyName);

        if (propertyDescriptorIndex !== NOT_FOUND) {
            propertyDescriptor = this.animatedProperties[ propertyDescriptorIndex ];

            /** @type {!KeyframesCollection} */
            var propertyKeyframes = propertyDescriptor.keyframes;

            var keyframeIndex = propertyKeyframes.indexOf(progress);

            var keyframe;

            if (keyframeIndex !== NOT_FOUND) {
                keyframe = propertyKeyframes[ keyframeIndex ];

                return keyframe.getValue();
            }
        }

        return null;
    };

    goog.exportProperty(Animation.prototype, 'getPropAt', Animation.prototype.getPropAt);

    /**
     * Установка стартового значения свойства
     * Имеет смысл при 'fillMode' без 'forwards'
     * Аргументы такие же, как и у Animation.setPropAt, без учета прогресса
     * Разница в том, что стартовое значение свойства не всегда
     * равно значению свойства на минимальном прогрессае
     * @param {string} propertyName
     * @param {!Array.<number>} propertyValue
     */
    Animation.prototype.setStartingValue = function (propertyName, propertyValue) {
        /** @type {!PropertyDescriptor} */
        var propertyDescriptor;

        var propertyDescriptorIndex = this.animatedProperties.indexOf(propertyName);

        if (propertyDescriptorIndex === NOT_FOUND) {
            propertyDescriptor = this.animatedProperties.add(propertyName);
        } else {
            propertyDescriptor = this.animatedProperties[ propertyDescriptorIndex ];
        }

        /** @type {!Keyframe} */
        var startingValue = propertyDescriptor.startingValue;

        startingValue.setValue(propertyValue);

    };

    goog.exportProperty(Animation.prototype, 'setStartingValue', Animation.prototype.setStartingValue);

    /**
     * Получение стартового значения свойства
     * @param {string} propertyName
     * @return {Array.<number>}
     */
    Animation.prototype.getStartingValue = function (propertyName) {

        /** @type {!PropertyDescriptor} */
        var propertyDescriptor;

        var propertyDescriptorIndex = this.animatedProperties.indexOf(propertyName);

        if (propertyDescriptorIndex !== NOT_FOUND) {
            propertyDescriptor = this.animatedProperties[ propertyDescriptorIndex ];

            /** @type {!Keyframe} */
            var startingValue = propertyDescriptor.startingValue;

            return startingValue.getValue();
        }

        return null;
    };

    goog.exportProperty(Animation.prototype, 'getStartingValue', Animation.prototype.getStartingValue);

    /**
     * Функция отрисовки на цели
     * Для отрисовки используется CSS
     * @param {!PropertyDescriptor} propertyDescriptor дескриптор свойства
     * @param {!Array.<number>} currentValue текущее значение свойства
     */
    Animation.prototype.render = function (propertyDescriptor, currentValue) {
        var stringValue = propertyDescriptor.toStringValue(this.animationTarget, currentValue);
        setStyle(this.animationTarget,propertyDescriptor.propName, stringValue, propertyDescriptor.vendorizedPropName);
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
     * @see {Animation.cycleDuration}
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
        if (iterations === POSITIVE_INFINITY) {
            this.iterations = this.integralIterations = POSITIVE_INFINITY;
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

        elapsedTime = this.elapsedTime - this.delayTime;

        if (elapsedTime < 0) {
            if (this.fillsBackwards) {
                elapsedTime = 0;
            } else {
                return;
            }
        }

        this.animationProgress = elapsedTime / this.cycleDuration;
        currentIteration = Math.floor(this.animationProgress);

        if (currentIteration > 0) {
            this.previousIteration = this.currentIteration;
            this.currentIteration = currentIteration > this.integralIterations ? this.integralIterations : currentIteration;
            iterationProgress = this.animationProgress - currentIteration;
        } else {
            iterationProgress = this.animationProgress;
        }

        if (this.needsReverse()) {
            iterationProgress = MAXIMAL_PROGRESS - iterationProgress;
        }

        this.fractionalTime = iterationProgress;

        if (this.animationProgress < this.iterations) {

            this.update();

            if (this.delayTime > 0 && elapsedTime <= deltaTime && this.elapsedTime >= this.delayTime) {
                this.fireOnStart();
            } else if (this.previousIteration !== this.currentIteration) {
                this.fireOnIteration();
            } if (this.fractionalTime !== 0) {
                this.fireOnStep();
            }
        } else {
            this.stop();
            this.fireOnComplete();
        }
    };

    /**
     * Вычислит и отрисует текущие значения свойств
     */
    Animation.prototype.update = function () {

        var propertyKeyframes, propertyDescriptor;
        var localEasing, relativeFractionalTime;
        var leftKeyframe, rightKeyframe;

        var isPropertyValueChanged;

        for (var i = this.animatedProperties.length; i--; ) {

            propertyDescriptor = this.animatedProperties[ i ];
            propertyKeyframes = propertyDescriptor.keyframes;

            propertyKeyframes.moveIndexTo(this.fractionalTime);

            leftKeyframe = propertyKeyframes.getLeft();
            rightKeyframe = propertyKeyframes.getRight();

            relativeFractionalTime = (this.fractionalTime - leftKeyframe.numericKey) / (rightKeyframe.numericKey - leftKeyframe.numericKey);

            localEasing = this.smoothing.compute(relativeFractionalTime);

            isPropertyValueChanged = propertyDescriptor.blender(leftKeyframe.propVal, rightKeyframe.propVal, localEasing, propertyDescriptor.currentValue, BLEND_DIGITS);

            if (isPropertyValueChanged) {
                this.render(propertyDescriptor, propertyDescriptor.currentValue);
            } // else Отрисованное значение эквивалентно текущему промежуточному. Пропуск отрисовки

        }
    };

    Animation.prototype.toString = function () {
        return this.animId;
    };

    /** @type {CSSKeyframesRule} */
    Animation.prototype.keyframesRule;

    /**
     * Запускает проигрывание анимации
     */
    Animation.prototype.start = function () {

        if (this.usesCSS3) {

            this.animId = generateId();

            // Обёртки над обработчиками событий CSS анимации
            if (CSSANIMATIONS_SUPPORTED) {
                delegatorCallbacks[ ANIMATION_START_EVENTTYPE ][ this.animId ] = this.fireOnStart;
                delegatorCallbacks[ ANIMATION_ITERATION_EVENTTYPE ][ this.animId ] = this.fireOnIteration;
                delegatorCallbacks[ ANIMATION_END_EVENTTYPE ][ this.animId ] = this.fireOnCompleteWithStop;
            }

            this.keyframesRule = KeyframesRulesRegistry.request();
            this.keyframesRule.name = this.animId;

            // Формирование тела правила "@keyframes"
            for (var i = 0; i < this.animatedProperties.length; i++) {

                var propertyDescriptor = this.animatedProperties[ i ];
                var propertyKeyframes = propertyDescriptor.keyframes;

                for (var j = 0; j < propertyKeyframes.length; j++) {

                    var propertyKeyframe = propertyKeyframes[ j ];

                    var key = propertyKeyframe.numericKey * 1e2;
                    var domStringKey = key_toDOMString(key);

                    var cssKeyframe = keyframesRule_findRule(this.keyframesRule, domStringKey);

                    if (!cssKeyframe) {
                        // у Chrome было неверное следование спецификации - неверное имя метода для добавления ключевых кадров.
                        keyframesRule_appendRule(this.keyframesRule, key);
                        cssKeyframe = keyframesRule_findRule(this.keyframesRule, domStringKey);
                    }

                    var stringValue;

                    stringValue = propertyDescriptor.toStringValue(this.animationTarget, propertyKeyframe.getValue());

                    cssKeyframe.style[ propertyDescriptor.vendorizedPropName ] = stringValue;
                }
            }

            // Формирование параметров текущей анимации
            var currentAnimationName = this.animId;
            var appliedAnimations = getStyle(this.animationTarget, ANIMATION, true) || getStyle(this.animationTarget, ANIMATION, false);
            var currentAnimationIndex = appliedAnimations.indexOf(currentAnimationName);
            var isAlreadyApplied = currentAnimationIndex !== NOT_FOUND;
            var newAppliedAnimations;

            /**
             * @const
             * @type {string}
             */
            var singleAnimation = [
                currentAnimationName,
                this.duration() + 'ms',
                this.getEasing().toString(),
                this.delay() + 'ms',
                this.iterationCount().toString(),
                this.direction(),
                this.fillMode()
            ].join(ANIMATION_PARAMETER_JOINER);

            if (isAlreadyApplied) {

                var animationsBefore = currentAnimationIndex === 0 ? '' : appliedAnimations.slice(0, currentAnimationIndex - ANIMATIONS_JOINER.length);
                var animationsAfter = animationsBefore.split(ANIMATIONS_SEPARATOR)[1] || ''; // 0 this animation

                newAppliedAnimations = animationsBefore;

                if (animationsAfter.length > 0) {
                    newAppliedAnimations += ANIMATIONS_JOINER + animationsAfter;
                }

                newAppliedAnimations += ANIMATIONS_JOINER + singleAnimation;

            } else {

                newAppliedAnimations = appliedAnimations.length === 0 ? appliedAnimations : (appliedAnimations + ANIMATIONS_JOINER);
                newAppliedAnimations += singleAnimation

            }

            setStyle(this.animationTarget, ANIMATION, newAppliedAnimations);

        } else {
            this.elapsedTime = 0;

            if (this.fillsBackwards) {
                this.update();
            }

            if (this.delayTime <= 0) {
                this.fireOnStart();
            }

            this.resume();

        }

    };

    goog.exportProperty(Animation.prototype, 'start', Animation.prototype.start);

    /**
     * Останавливает анимацию
     * */
    Animation.prototype.stop = function () {
        if (this.usesCSS3) {

            // Обёртки над обработчиками событий CSS анимации
            if (CSSANIMATIONS_SUPPORTED) {
                delete delegatorCallbacks[ ANIMATION_START_EVENTTYPE ][ this.animId ];
                delete delegatorCallbacks[ ANIMATION_ITERATION_EVENTTYPE ][ this.animId ];
                delete delegatorCallbacks[ ANIMATION_END_EVENTTYPE ][ this.animId ];
            }

            KeyframesRulesRegistry.slay(/** @type {!CSSKeyframesRule} */ (this.keyframesRule));
            this.keyframesRule = null;

            var currentAnimationName = this.animId;
            var appliedAnimations = getStyle(this.animationTarget, ANIMATION, true) || getStyle(this.animationTarget, ANIMATION, false);
            var currentAnimationIndex = appliedAnimations.indexOf(currentAnimationName);

            var animationsBefore = currentAnimationIndex === 0 ? '' : appliedAnimations.slice(0, currentAnimationIndex - ANIMATIONS_JOINER.length);
            var animationsAfter = animationsBefore.split(ANIMATIONS_SEPARATOR)[1] || ''; // 0 - this animation

            var newAppliedAnimations = animationsBefore;

            if (animationsAfter.length > 0) {
                newAppliedAnimations += ANIMATIONS_JOINER + animationsAfter;
            }

            setStyle(this.animationTarget, ANIMATION, newAppliedAnimations);

        }
        if (this.fillsForwards) {
            // Установка конечных значений для свойств.
            this.fractionalTime = 1.0;
            this.update();
        } else {
            // Возвращение анимированных свойств в доанимированное состояние
            for (var i = this.animatedProperties.length; i--; ) {
                var propertyDescriptor = this.animatedProperties[ i ];
                var startingValue = propertyDescriptor.startingValue;
                this.render(propertyDescriptor, startingValue.getValue());
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
        if (this.usesCSS3) {
            this.rewriteParameter(ANIMATION_PLAY_STATE, ANIMATION_PLAY_STATE_RUNNING);
        } else {
            Ticker.on(this.selfTick);
        }
    };

    goog.exportProperty(Animation.prototype, 'resume', Animation.prototype.resume);

    /**
     * Приостанавливает анимацию
     * */
    Animation.prototype.pause = function () {
        if (this.usesCSS3) {
            this.rewriteParameter(ANIMATION_PLAY_STATE, ANIMATION_PLAY_STATE_PAUSED);
        } else {
            Ticker.off(this.selfTick);
        }
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

    /**
     * @param {string} parameterName
     * @param {string} parameterValue
     */
    Animation.prototype.rewriteParameter = function (parameterName, parameterValue) {
        var paramsList = getStyle(this.animationTarget, parameterName, true).split(ANIMATIONS_SEPARATOR);
        var appliedAnimationNames = getStyle(this.animationTarget, ANIMATION_NAME, true).split(ANIMATIONS_SEPARATOR);
        var thisAnimationName = this.animId;
        var animationIndex = linearSearch(appliedAnimationNames, function (name) {
            return name === thisAnimationName;
        });
        paramsList[ animationIndex ] = parameterValue;
        setStyle(this.animationTarget, parameterName, paramsList.join(ANIMATIONS_JOINER));
    };

    /**
     * Обёртка над порождением события старта анимации
     * с закреплённым контекстом
     * @type {function ()}
     */
    Animation.prototype.fireOnStart;

    /**
     * Обёртка над порождением события старта анимации
     * без закреплённого контекста
     */
    Animation.prototype._not_self_fireOnStart = function () {
        if (this.onstart !== goog.nullFunction) {
            this.onstart.call(this);
        }
    };

    /**
     * Обёртка над порождением события завершения прохода анимации
     * с закреплённым контекстом
     * @type {function ()}
     */
    Animation.prototype.fireOnIteration;

    /**
     * Обёртка над порождением события завершения прохода анимации
     * без закреплённого контекста
     */
    Animation.prototype._not_self_fireOnIteration = function () {
        if (this.oniteration !== goog.nullFunction) {
            this.oniteration.call(this);
        }
    };

    /**
     * Обёртка над порождением события отрисовки кадра
     * с закреплённым контекстом
     * @type {function ()}
     */
    Animation.prototype.fireOnStep;

    /**
     * Обёртка над порождением события отрисовки кадра
     * без закреплённого контекста
     */
    Animation.prototype._not_self_fireOnStep = function () {
        if (this.onstep !== goog.nullFunction) {
            this.onstep.call(this);
        }
    };

    /**
     * Обёртка над порождением события завершения анимации
     * с закреплённым контекстом
     * @type {function ()}
     */
    Animation.prototype.fireOnComplete;

    /**
     * Обёртка над порождением события завершения анимации
     * без закреплённого контекста
     */
    Animation.prototype._not_self_fireOnComplete = function () {
        if (this.oncomplete !== goog.nullFunction) {
            this.oncomplete.call(this);
        }
    };

    /**
     * Обёртка над порождением события завершения анимации
     * с закреплённым контекстом
     * @type {function ()}
     */
    Animation.prototype.fireOnCompleteWithStop;

    /**
     * Обёртка над порождением события завершения анимации
     * без закреплённого контекста
     */
    Animation.prototype._not_self_fireOnCompleteWithStop = function () {
        this.stop();
        if (this.oncomplete !== goog.nullFunction) {
            this.oncomplete.call(this);
        }
    };