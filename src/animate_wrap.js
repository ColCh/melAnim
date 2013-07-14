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
     * @export
     */
    AnimationWrap.prototype.target = function (target) {
        if (goog.isObject(target)) {
            this.setTarget(target);
            return this;
        } else {
            return this.getTarget();
        }
    };

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
     * @export
     * @param {string} propName
     * @param {(string|number|!Array.<number>)=} propValue Значение свойства. Для получения значения можно пропустить.
     * @param {(string|number)=} position Прогресс в строке или числе процентов. По умолчанию равен 100 (или "100%").
     * @return {null|number|!Array.<number>|!AnimationWrap}
     */
    AnimationWrap.prototype.propAt = function (propName, propValue, position) {
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
                        numericPosition = matched[VALREG_VALUE] * 1;
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
            var numericValue = toNumericValue(this.animationTarget, propName, propValue, getVendorPropName(propName));
            this.setPropAt(propName, numericValue, numericPosition, propValue);
            return this;
        } else {
            return this.getPropAt(propName, numericPosition);
        }
    };

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
     * @export
     * @param {(string|number)=} duration Алиас, время в формате CSS или миллисекунды
     * @return {number|!AnimationWrap} время в миллисекундах или текущий экземпляр
     */
    AnimationWrap.prototype.duration = function (duration) {
        var numericDuration;
        if (goog.isDef(duration)) {
            if (goog.isString(duration)) {
                if (duration in durationAliases) {
                    numericDuration = durationAliases[duration];
                } else {
                    var matched = /** @type {string} */(duration).match(cssNumericValueReg);
                    numericDuration = matched[VALREG_VALUE] * (matched[VALREG_DIMENSION] === 's' ? 1e3:1);
                }
                if (numericDuration >= 0) {
                    this.setDuration(numericDuration);
                }
            }
            return this;
        } else {
            return this.cycleDuration;
        }
    };

    /**
     * Установка задержки старта.
     * Если значение положительное, старт анимации будет отложен на численное представление.
     * Если отрицательное, то при старте будет считаться, что прошло уже указанное по модулю время со старта.
     * @export
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
                this.setDelay(numericDelay);
            }
            return this;
        } else {
            return this.delayTime;
        }
    };

    var ITERATIONCOUNT_INFINITE = 'infinite';

    /**
     * Установка числа проходов цикла анимации.
     * Значение "infinite" соответствует бесконечному числу повторений анимации.
     * Дробные значения соответствуют конечному значению прогресса по проходу.
     * Отрицательные значения игнорируются.
     * @export
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
     * @export
     * @param {(string|number)=} direction
     * @return {number|!AnimationWrap}
     */
    AnimationWrap.prototype.direction = function (direction) {
        var binaryDirection = NOT_FOUND;
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
            return this.getDirection();
        }
    };

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
     * @export
     * @param {(string|number)=} fillMode
     * @return {number|!AnimationWrap}
     */
    AnimationWrap.prototype.fillMode = function (fillMode) {
        var binFillMode = NOT_FOUND;
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
            return this.getFillMode();
        }
    };

    /**
     * Установка или получение смягчения анимации.
     * (!) Абсциссы первой и второй точек для кубической кривой Безье должны принадлежать промежутку [0, 1].
     * (!) Число ступеней в Steps всегда целочисленное.
     * @export
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