    /**
     * Высокоуровневая обёртка над низкоуровневым классом
     * @constructor
     * @extends {Animation}
     */
    function AnimationWrap () {
        Animation.call(this);
    }

    AnimationWrap.prototype = objectCreate(Animation.prototype);

    /**
     * Установит или получит текущий элемент для анимирования
     * @param {Object=} target
     * @return {Object|!AnimationWrap}
     */
    AnimationWrap.prototype.target = function (target) {
        if (goog.isObject(target)) {
            this.setTarget(target);
            return this;
        } else {
            return this.getTarget();
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'target', AnimationWrap.prototype.target);

    /**
     * @const
     * @type {string}
     */
    var PERCENT = '%';

    /**
     * Ключ - алиас к позиции, значение - прогресс в долях
     * @enum {number}
     */
    var keyAliases = {
        'from': 0,
        'half': 0.5,
        'to': 1
    };

    /**
     * Установка или получение значения свойства при переданном прогрессе
     * @param {string} propName
     * @param {(string|number|!Array.<number>)=} propValue Значение свойства. Для получения значения можно пропустить.
     * @param {(string|number)=} position Прогресс в строке или числе процентов. По умолчанию равен 100 (или "100%").
     * @return {null|number|!Array.<number>|!AnimationWrap}
     */
    AnimationWrap.prototype.propAt = function (propName, propValue, position) {
        var numericValue;
        var usedValue;
        var numericPosition = MAXIMAL_PROGRESS;
        if (goog.isDef(position)) {
            if (goog.isNumber(position)) {
                numericPosition = position;
            } else if (goog.isString(position)) {
                if (position in keyAliases) {
                    numericPosition = keyAliases[position];
                } else {
                    var matched = /** @type {string} */(position).match(cssNumericValueReg);
                    if (goog.isArray(matched) && (!matched[VALREG_DIMENSION] || matched[VALREG_DIMENSION] === PERCENT)) {
                        numericPosition = +matched[VALREG_VALUE];
                    }
                }
            }
            if (numericPosition > 1) {
                numericPosition /= 100;
            }
            if (numericPosition < MINIMAL_PROGRESS || numericPosition > MAXIMAL_PROGRESS) {
                numericPosition = MAXIMAL_PROGRESS;
            }
        }
        if (goog.isDef(propValue)) {

            if (goog.isArray(propValue)) {
                numericValue = propValue;
            } else if (goog.isNumber(propValue)) {
                numericValue = [ propValue ];
            } else {
                numericValue = toNumericValue(this.animationTarget, propName, propValue, getVendorPropName(propName));
            }

            this.setPropAt(propName, numericValue, numericPosition, goog.isString(propValue) ? propValue : '');

            // Для анимации необходимо минимум 2 значения
            if (  goog.isNull(this.getPropAt(propName, MINIMAL_PROGRESS)) ) {
                usedValue = getStyle(this.animationTarget, propName, true);
                numericValue = toNumericValue(this.animationTarget, propName, usedValue, getVendorPropName(propName));
                this.setPropAt(propName, numericValue, MINIMAL_PROGRESS, usedValue);
            }
            if ( goog.isNull(this.getPropAt(propName, MAXIMAL_PROGRESS)) ) {
                usedValue = getStyle(this.animationTarget, propName, true);
                numericValue = toNumericValue(this.animationTarget, propName, usedValue, getVendorPropName(propName));
                this.setPropAt(propName, numericValue, MAXIMAL_PROGRESS, usedValue);
            }
            if ( goog.isNull(this.getStartingValue(propName)) ) {
                usedValue = getStyle(this.animationTarget, propName, false);
                numericValue = toNumericValue(this.animationTarget, propName, usedValue, getVendorPropName(propName));
                this.setStartingValue(propName, numericValue, usedValue);
            }
            return this;
        } else {
            return this.getPropAt(propName, numericPosition);
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'propAt', AnimationWrap.prototype.propAt);

    /**
     * Алиасы к времени продолжительности.
     * Ключ - алиас, значение - время в миллисекундах
     * @enum {number}
     */
    var durationAliases = {
        'slow': 600,
        'fast': 200
    };

    /**
     * Установка или получение времени проигрывания анимации.
     * Отрицательные значения игнорируются.
     * Нулевое значение соответствует мгновенному проходу анимации, при этом
     * все механизмы работают так же, как и при положительной продолжительности.
     * @param {(string|number)=} duration Алиас, время в формате CSS или миллисекунды
     * @return {number|!AnimationWrap} время в миллисекундах или текущий экземпляр
     */
    AnimationWrap.prototype.duration = function (duration) {
        var numericDuration;
        if (goog.isDef(duration)) {
            if (goog.isNumber(duration)) {
                numericDuration = duration;
            } else if (goog.isString(duration)) {
                if (duration in durationAliases) {
                    numericDuration = durationAliases[duration];
                } else {
                    var matched = /** @type {string} */(duration).match(cssNumericValueReg);
                    numericDuration = matched[VALREG_VALUE] * (matched[VALREG_DIMENSION] === 's' ? 1e3:1);
                }
            }
            if (numericDuration >= 0) {
                this.setDuration(numericDuration);
            }
            return this;
        } else {
            return this.cycleDuration;
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'duration', AnimationWrap.prototype.duration);

    /**
     * Установка задержки старта.
     * Если значение положительное, старт анимации будет отложен на численное представление.
     * Если отрицательное, то при старте будет считаться, что прошло уже указанное по модулю время со старта.
     * @param {(number|string)=} delay Строка времени в формате CSS или число миллисекунд.
     * @return {number|!AnimationWrap}
     */
    AnimationWrap.prototype.delay = function (delay) {
        var numericDelay;
        if (goog.isDef(delay)) {
            if (goog.isNumber(delay)) {
                numericDelay = delay | 0;
            } else if (goog.isString(delay)) {
                var matched = /** @type {string} */(delay).match(cssNumericValueReg);
                numericDelay = matched[VALREG_VALUE] * (matched[VALREG_DIMENSION] === 's' ? 1e3:1);
            }
            if (isFinite(numericDelay)) {
                this.setDelay(/** @type {number} */(numericDelay));
            }
            return this;
        } else {
            return this.delayTime;
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'delay', AnimationWrap.prototype.delay);

    var ITERATIONCOUNT_INFINITE = 'infinite';

    /**
     * Установка числа проходов цикла анимации.
     * Значение "infinite" соответствует бесконечному числу повторений анимации.
     * Дробные значения соответствуют конечному значению прогресса по проходу.
     * Отрицательные значения игнорируются.
     * @param {(number|string)=} iterations
     * @return {number|!AnimationWrap}
     */
    AnimationWrap.prototype.iterationCount = function (iterations) {

        /** @type {number} */
        var numericIterations;

        if (goog.isDef(iterations)) {
            if (iterations === ITERATIONCOUNT_INFINITE) {
                numericIterations = Number.POSITIVE_INFINITY;
            } else {
                numericIterations = iterations * 1;
            }
            this.setIterations(numericIterations);
            return this;
        } else {
            return this.iterations;
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'iterationCount', AnimationWrap.prototype.iterationCount);

    /** @enum {number} */
    var directions = {
        'normal': 0,
        'reverse': DIRECTION_REVERSE,
        'alternate':  DIRECTION_ALTERNATE,
        'alternate-reverse':  DIRECTION_ALTERNATE & DIRECTION_REVERSE
    };

    /**
     * Установка или получение направления проигрывания анимации.
     * Значение "normal" соответствует возрастанию прогресса от 0 до 1 при каждом проходе. ( binary: 00 )
     * Значение "reverse" соответствует убыванию прогресса от 1 до 0 при каждом проходе.( binary: 01 )
     * Значение "alternate" соответствует направлению "normal" для нечётных проходов и "reverse" для чётных.( binary: 10 )
     * Значение "alternate-reverse" соответствует направлению "reverse" для нечётных проходов и "normal" для чётных.( binary: 11 )
     * Числовому значению соответствует побитовая маска.
     * @param {(string|number)=} direction
     * @return {string|!AnimationWrap}
     */
    AnimationWrap.prototype.direction = function (direction) {
        var binaryDirection = NOT_FOUND;
        var strDirection = '';
        if (goog.isDef(direction)) {
            if (goog.isNumber(direction)) {
                binaryDirection = direction;
            } else if (direction in directions) {
                binaryDirection = directions[direction];
            }
            if (binaryDirection !== NOT_FOUND) {
                this.setDirection(binaryDirection);
            }
            return this;
        } else {
            binaryDirection = this.getFillMode();
            for (var directionEnum in fillModes) {
                if (directions[directionEnum] === binaryDirection) {
                    strDirection = directionEnum;
                    break;
                }
            }
            return strDirection;
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'direction', AnimationWrap.prototype.direction);

    /** @enum {number} */
    var fillModes = {
        'none': 0,
        'forwards': FILLS_FORWARDS,
        'backwards':  FILLS_BACKWARDS,
        'both':  FILLS_FORWARDS & FILLS_BACKWARDS
    };

    /**
     * Установка или получение режима крайней отрисовки.
     * Значение "backwards" соответствует отрисовке значений
     * начального ключевого кадра сразу после старта (и перед самим анимированием). ( binary:  01 )
     * Значение "forwards" соответствует отрисовке значений
     * конечного ключевого кадра после окончания анимации. ( binary:  10 )
     * Значение "none" не соответствует ни одному из значений; ( binary:  00 )
     * Значение "both" соответствует и первому, и второму одновременно. ( binary:  11 )
     * @param {(string|number)=} fillMode
     * @return {string|!AnimationWrap}
     */
    AnimationWrap.prototype.fillMode = function (fillMode) {
        var binFillMode = NOT_FOUND;
        var strFillMode = '';
        if (goog.isDef(fillMode)) {
            if (goog.isNumber(fillMode)) {
                binFillMode = fillMode;
            } else if (fillMode in fillModes) {
                binFillMode = fillModes[fillMode];
            }
            if (binFillMode !== NOT_FOUND) {
                this.setFillMode(binFillMode);
            }
            return this;
        } else {
            binFillMode = this.getFillMode();
            for (var fillModeEnum in fillModes) {
                if (fillModes[fillModeEnum] === binFillMode) {
                    strFillMode = fillModeEnum;
                    break;
                }
            }
            return strFillMode;
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'fillMode', AnimationWrap.prototype.fillMode);

    /**
     * Установка или получение смягчения анимации.
     * (!) Абсциссы первой и второй точек для кубической кривой Безье должны принадлежать промежутку [0, 1].
     * (!) Число ступеней в Steps всегда целочисленное.
     * @param {(string|!Array.<number>|!Easing|!CubicBezier|!Steps)=} easing временная функция CSS, алиас смягчения или массив точек (2 - Steps, 4 - CubicBezier)
     * @return {!(CubicBezier|Steps|Easing|AnimationWrap)}
     */
    AnimationWrap.prototype.easing = function (easing) {
        var timingFunction;
        if (goog.isDef(easing)) {
            timingFunction = EasingRegistry.request(easing);
            if (!goog.isNull(timingFunction)) {
                this.setEasing(timingFunction);
            }
            return this;
        } else {
            return this.getEasing();
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'easing', AnimationWrap.prototype.easing);