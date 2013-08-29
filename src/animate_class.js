    /**
     * Низкоуровневый конструктор анимаций
     * @constructor
     * @export
     */
    function Animation () {
        this.animId = generateId();
        this.keyframes = [];
    }

    /** @type {string} */
    Animation.prototype.animId = 'none';

    /** @type {(Element|Object)} */
    Animation.prototype.animationTarget = null;

    /**
     * @export
     * @param {(Element|Object)} target
     */
    Animation.prototype.setTarget = function (target) {
        this.animationTarget = target;
    };

    /**
     * @export
     * @return {(Element|Object)}
     */
    Animation.prototype.getTarget = function () {
        return this.animationTarget;
    };

    /**
     * @type {Array.<{
         *   propName: string,
         *   currentValue: !Array.<number>,
         *   startingValue: string,
         *   cachedIndex: number,
         *   keyframes: !Array.<{
         *       numericKey: number,
         *       propVal: !Array.<number>,
         *       isComputed: boolean
         *       }>
         *   }>}
     */
    Animation.prototype.keyframes = null;

    /**
     * @export
     * @param {string} propertyName
     * @param {!Array.<number>} propertyValue
     * @param {number} progress
     * @param {string=}
     */
    Animation.prototype.setPropAt = function (propertyName, propertyValue, progress, alternativeValue) {

        var index;

        index = linearSearch(/** @type {!Array} */(this.keyframes), function (propertyDescriptor, i, data) {
            return propertyDescriptor.propName === propertyName;
        });

        var propertyKeyframes;

        if (index === NOT_FOUND) {
            propertyKeyframes = {
                propName: propertyName,
                vendorizedPropName: getVendorPropName(propertyName),
                currentValue: [],
                startingValue: '',
                cachedIndex: 0,
                keyframes: []
            };
            this.keyframes.push(propertyKeyframes);
        } else {
            propertyKeyframes = this.keyframes[index];
        }

        index = linearSearch(propertyKeyframes.keyframes, function (keyframe, i, keyframes) {
            return keyframe.numericKey === progress;
        });

        var keyframe;

        var isComputed = goog.isDef(alternativeValue);

        if (index === NOT_FOUND) {
            keyframe = {
                numericKey: progress,
                propVal: propertyValue,
                isComputed: isComputed,
                alternativeValue: alternativeValue
            };
            propertyKeyframes.keyframes.push(keyframe);
            bubbleSort(propertyKeyframes.keyframes, function (first, second, index, keyframes) {
                if (first.numericKey === second.numericKey) {
                    return SORT_EQUALS;
                }
                if (first.numericKey < second.numericKey) {
                    return SORT_BIGGER;
                }
                return SORT_SMALLER;
            });
        } else {
            keyframe = propertyKeyframes.keyframes[index];
            keyframe.propVal = propertyValue.slice(0);
            keyframe.isComputed = isComputed;
            keyframe.alternativeValue = alternativeValue;
        }

    };

    /**
     * @export
     * @param {string} propertyName
     * @param {number} progress
     * @return {null|number|!Array.<number>}
     */
    Animation.prototype.getPropAt = function (propertyName, progress) {
        var index;

        index = linearSearch(/** @type {!Array} */(this.keyframes), function (propertyDescriptor, i, data) {
            return propertyDescriptor.propName === propertyName;
        });
        if (index !== NOT_FOUND) {
            var propertyDescriptor = this.keyframes[index];
            index = linearSearch(propertyDescriptor.keyframes, function (keyframe, i, keyframes) {
                return keyframe.numericKey === progress;
            });
            if (index !== NOT_FOUND) {
                var keyframe = propertyDescriptor.keyframes[index];
                return keyframe.propVal;
            }
        }

        return null;
    };

    /**
     * @param {string} propName
     * @param {!Array.<number>|string|number} currentValue
     * @param {string=} vendorizedPropName
     */
    Animation.prototype.render = function (propName, currentValue, vendorizedPropName) {
        var stringValue = goog.isString(currentValue) ?  currentValue : toStringValue(this.animationTarget, propName, currentValue, vendorizedPropName);
        setStyle(this.animationTarget, propName, stringValue, vendorizedPropName);
    };

    /**
     * @param {function (string, !Array.<number>)} newRenderer
     * @export
     */
    Animation.prototype.replaceRenderer = function (newRenderer) {
        this.render = newRenderer;
    };

    /** @type {number} */
    Animation.prototype.delayTime = DEFAULT_DELAY;

    /***
     * @export
     * @param {number} delay
     */
    Animation.prototype.setDelay = function (delay) {
        this.delayTime = delay;
    };

    /** @type {number} */
    Animation.prototype.cycleDuration = DEFAULT_DURATION;

    /**
     * @param {number} duration
     * @export
     */
    Animation.prototype.setDuration = function (duration) {
        this.cycleDuration = duration;
    };

    /** @type {number} */
    Animation.prototype.iterations = DEFAULT_ITERATIONS;

    /** @type {number} */
    Animation.prototype.integralIterations = DEFAULT_INTEGRAL_ITERATIONS;

    /**
     * @export
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

    /** @type {boolean} */
    Animation.prototype.isAlternated = DEFAULT_IS_ALTERNATED;

    /** @type {boolean} */
    Animation.prototype.isReversed = DEFAULT_IS_REVERSED;

    /**
     * @export
     * @param {number} binaryDirection
     */
    Animation.prototype.setDirection = function (binaryDirection) {
        this.isAlternated = (binaryDirection & DIRECTION_ALTERNATE) !== 0;
        this.isReversed = (binaryDirection & DIRECTION_REVERSE) !== 0;
    };

    /**
     * @export
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
     * @export
     * @param {number} binaryFillMode
     */
    Animation.prototype.setFillMode = function (binaryFillMode) {
        this.fillsForwards = (binaryFillMode & FILLS_FORWARDS) !== 0;
        this.fillsBackwards = (binaryFillMode & FILLS_BACKWARDS) !== 0;
    };

    /**
     * @export
     * @return {number}
     */
    Animation.prototype.getFillMode = function () {
        var binFillMode = 0;
        if (this.fillsForwards) {
            binFillMode &= FILLS_FORWARDS;
        }
        if (this.fillsBackwards) {
            binFillMode &= FILLS_BACKWARDS;
        }
        return binFillMode;
    };

    /** @type {number} */
    Animation.prototype.elapsedTime = 0;

    /** @type {!(Easing|CubicBezier|Steps)} */
    Animation.prototype.smoothing = DEFAULT_EASING;

    /**
     * @param {!(Easing|CubicBezier|Steps)} easing
     * @export
     */
    Animation.prototype.setEasing = function (easing) {
        this.smoothing = easing;
    };

    /**
     * @return {!(CubicBezier|Steps|Easing)}
     * @export
     */
    Animation.prototype.getEasing = function () {
        return this.smoothing;
    };

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
     * @export
     * @return {number}
     */
    Animation.prototype.getFractionalTime = function () {
        return this.fractionalTime;
    };

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

        var propertyKeyframes, propertyDescriptor;
        var properties = this.keyframes;
        var globalEasing = null;
        var localEasing, relativeFractionalTime;
        var leftKeyframe, rightKeyframe;

        for (var i = 0; i < properties.length; i++) {
            propertyDescriptor = properties[i];
            propertyKeyframes = propertyDescriptor.keyframes;

            leftKeyframe = propertyKeyframes[propertyDescriptor.cachedIndex];
            rightKeyframe = propertyKeyframes[propertyDescriptor.cachedIndex + 1];

            // Поиск двух ключевых кадров для текущего прогресса
            if (leftKeyframe.numericKey > this.fractionalTime || this.fractionalTime >= rightKeyframe.numericKey) {
                do {
                    if (!rightKeyframe || leftKeyframe.numericKey > this.fractionalTime) {
                        propertyDescriptor.cachedIndex--;
                    }
                    if (rightKeyframe.numericKey < this.fractionalTime) {
                        propertyDescriptor.cachedIndex++;
                    }
                    leftKeyframe = propertyKeyframes[propertyDescriptor.cachedIndex];
                    rightKeyframe = propertyKeyframes[propertyDescriptor.cachedIndex + 1];
                } while (leftKeyframe.numericKey > this.fractionalTime || rightKeyframe.numericKey < this.fractionalTime);
            }

            // Прогресс относительно двух ключевых кадров
            if (leftKeyframe.numericKey === MINIMAL_PROGRESS && rightKeyframe.numericKey === MAXIMAL_PROGRESS) {
                relativeFractionalTime = this.fractionalTime;
            } else {
                relativeFractionalTime = (this.fractionalTime - leftKeyframe.numericKey) / (rightKeyframe.numericKey - leftKeyframe.numericKey);
            }

            if (relativeFractionalTime === MINIMAL_PROGRESS || relativeFractionalTime === MAXIMAL_PROGRESS) {
                // В начале и в конце (прогресс 0.0 и 1.0) значение смягчения всегда равно прогрессу
                // Вычислять промежуточное значение не требуется.
                //localEasing = relativeFractionalTime;
                //leftKeyframe = rightKeyframe = relativeFractionalTime === MINIMAL_PROGRESS ? leftKeyframe : rightKeyframe;
                var alternativeKeyframe = relativeFractionalTime === MINIMAL_PROGRESS ? leftKeyframe : rightKeyframe;
                if (alternativeKeyframe.isComputed) {
                    this.render(propertyDescriptor.propName, leftKeyframe.alternativeValue, propertyDescriptor.vendorizedPropName);
                }
            } else if (relativeFractionalTime === this.fractionalTime) {
                if (goog.isNull(globalEasing)) {
                    globalEasing = this.smoothing.compute(relativeFractionalTime)
                }
                localEasing = globalEasing;
            } else {
                localEasing = this.smoothing.compute(relativeFractionalTime);
            }

            if ((!alternativeKeyframe || !alternativeKeyframe.isComputed) && blend(leftKeyframe.propVal, rightKeyframe.propVal, localEasing, propertyDescriptor.currentValue)) {
                // Отрисовываем в том случае, если значение свойства изменено
                this.render(propertyDescriptor.propName, propertyDescriptor.currentValue, propertyDescriptor.vendorizedPropName);
            }

        }
    };

    Animation.prototype.toString = function () {
        return this.animId;
    };

    /** @type {number} */
    Animation.prototype.tickerId;

    /** @export */
    Animation.prototype.start = function () {
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
    };

    /** @export */
    Animation.prototype.stop = function () {
        if (this.fillsForwards) {
            this.fractionalTime = 1;
            this.update();
        }
        this.pause();
    };

    /** @export */
    Animation.prototype.resume = function () {
        var self = this;
        this.tickerId = Ticker.on(function (delta) {
            self.tick(delta);
        });
    };

    /** @export */
    Animation.prototype.pause = function () {
        Ticker.off(this.tickerId);
    };

    /** @type {boolean} */
    Animation.prototype.usesCSS3;

    /**
     * @param {boolean} value
     * @export
     */
    Animation.prototype.setClassicMode = function (value) {
        this.usesCSS3 = !value;
    };

    /** @type {!Function} */
    Animation.prototype.oncomplete = goog.nullFunction;

    /**
     * @param {!Function} callback
     * @export
     */
    Animation.prototype.onComplete = function (callback) {
        this.oncomplete = callback;
    };

    /** @type {!Function} */
    Animation.prototype.onstart = goog.nullFunction;

    /**
     * @param {!Function} callback
     * @export
     */
    Animation.prototype.onStart = function (callback) {
        this.onstart = callback;
    };

    /** @type {!Function} */
    Animation.prototype.onstep = goog.nullFunction;

    /**
     * @param {!Function} callback
     * @export
     */
    Animation.prototype.onStep = function (callback) {
        this.onstep = callback;
    };

    /** @type {!Function} */
    Animation.prototype.oniteration = goog.nullFunction;

    /**
     * @param {!Function} callback
     * @export
     */
    Animation.prototype.onIteration = function (callback) {
        this.oniteration = callback;
    };
