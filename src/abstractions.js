    /** @const */
    var EasingRegistry = {
        /**
         * @type {!Array.<Easing>}
         */
        easings: [],
        /**
         * @param {*} req
         * @return {?Easing}
         */
        request: function (req) {
            var timingFunction;

            var self = EasingRegistry;

            if (req instanceof Easing) {
                // Передан уже созданный экземпляр обёртки
                timingFunction = /** @type {Easing} */ (req);
            } else if (goog.isFunction(req)) {
                // Передана кастомная JS-функция
                timingFunction = new Easing();
                /** @override */
                timingFunction.compute = /** @type {function (number): number} */ (req);
            } else {
                // Переданы аргументы к функции CSS в виде массива\строки или алиас к функции JS\CSS
                timingFunction = self.build( /** @type {(string|!Array)} */ (req) );
            }

            var index = linearSearch(self.easings, function (easing, i, easingsArray) {
                return easing.equals(timingFunction);
            });

            if (index === NOT_FOUND) {
                self.easings.push(timingFunction);
            }

            return /** @type {!Easing} */ (timingFunction);
        },
        /**
         * @param {!(string|Array)} contain
         * @return {?Easing}
         */
        build: function (contain) {
            var numericArgs, timingFunction;
            var stepsAmount, countFromStart;
            var camelCased, trimmed;
            var matched, cssFunction, args;
            var argsLength;

            if (goog.isString(contain)) {
                trimmed = trim(contain);
                camelCased = camelCase(trimmed);
                if (camelCased in cssEasingAliases) {
                    // Передан алиас к аргументам смягчения CSS
                    args = cssEasingAliases[ camelCased ];
                } else {
                    // Передана строка временной функции CSS
                    // строка аргументов к временной функции. разделены запятой
                    matched = trimmed.match(cssFunctionReg);
                    cssFunction = matched[FUNCREG_FUNC];
                    args = removeSpaces(matched[FUNCREG_ARGS]).split(cssFuncArgsSeparator);
                }
            } else if (goog.isArray(contain)) {
                args = /** @type {!Array} */ (contain);
            }

            argsLength = args.length;

            if (argsLength == 4) {
                // заинлайненный цикл
                args[0] = +args[0]; args[1] = +args[1]; args[2] = +args[2]; args[3] = +args[3];
                // ограничение абсцисс точек по промежутку [0;1]
                if (args[0] >= MINIMAL_PROGRESS && args[0] <= MAXIMAL_PROGRESS && args[2] >= MINIMAL_PROGRESS && args[2] <= MAXIMAL_PROGRESS) {
                    timingFunction = new CubicBezier(args[0], args[1], args[2], args[3]);
                    if (camelCased in cubicBezierApproximations) {
                        // JS-функция приближения к кубической кривой
                        timingFunction.compute = cubicBezierApproximations[ camelCased ];
                    }
                }
            } else if (argsLength == 1 || argsLength == 2) {
                stepsAmount = parseInt(args[0], 10);
                countFromStart = args[1] === 'start';
                if (goog.isNumber(stepsAmount)) {
                    timingFunction = new Steps(stepsAmount, countFromStart);
                }
            }

            return goog.isDef(timingFunction) ? timingFunction : null;
        }
    };

    /**
     * Общий конструктор для смягчений
     * @constructor
     */
    function Easing () {
        this.easingId = uuid();
    }

    /** @type {number} */
    Easing.prototype.easingId = uuid();


    /** @type {function (number): number} */
    Easing.prototype.compute = function (x) {
        return x;
    };

    /**
     * @param {!Easing} easing
     * @return {boolean}
     */
    Easing.prototype.equals = function (easing) {
        return this.compute === easing.compute;
    };

    /**
     * @override
     * @return {string}
     */
    Easing.prototype.toString = function () {
        return '' + this.easingId;
    };

    /**
     * Представление кубической кривой Безье для смягчения анимации
     * Считается, что P0 = (0;0) и P3 = (1;1)
     * @param {number} p1x
     * @param {number} p1y
     * @param {number} p2x
     * @param {number} p2y
     * @constructor
     * @extends Easing
     */
    function CubicBezier (p1x, p1y, p2x, p2y) {
        this.p1x = p1x;
        this.p1y = p1y;
        this.p2x = p2x;
        this.p2y = p2y;
    }

    goog.inherits(CubicBezier, Easing);

    /**
     * @param {number} t
     * @param {number} p1
     * @param {number} p2
     * @return {number}
     */
    CubicBezier.prototype.B = function (p1, p2, t) {
        // (3*t * (1 - t)^2) * P1  + (3*t^2 *  (1 - t) )* P2 + (t^3);
        // --------->
        // 3*t * (1 - t) * (  (1 - t) * P1  +  3*t * P2 ) + t^3

        var t3 = 3 * t;
        var revt = 1 - t;
        return t3 * revt * (revt * p1 + t3 * p2) + t * t * t;
    };

    /**
     * @param {number} t
     * @return {number}
     */
    CubicBezier.prototype.B_absciss = function (t) {
        return this.B(this.p1x, this.p2x, t);
    };

    /**
     * @param {number} t
     * @return {number}
     */
    CubicBezier.prototype.B_derivative_I_absciss = function (t) {
        // ( 9 * t^2 - 12*t+ 3 ) * P1 + ( 6*t  -  9 * t^2 ) * P2  +  3 * t^2
        // ----->
        // 3 * (  (t*(3*t - 4) + 1) * P1  +  t * (  ( 2 - 3*t ) * P2 + t  )  )
         var B1d = t * (3 * t - 4)  + 1;
         var B2d = 2 - 3 * t;
         return 3 * ( B1d * this.p1x + t * ( B2d * this.p2x + t ) );
    };

    /**
     * @param {number} t
     * @return {number}
     */
    CubicBezier.prototype.B_ordinate = function (t) {
        return this.B(this.p1y, this.p2y, t);
    };

    /**
     * @const
     * @type {number}
     */
    var BEZIER_EPSILON = 0.0055;

    /**
     * @override
     * @param {number} y
     * @return {number}
     */
    CubicBezier.prototype.compute = function (y) {

        var t;

        var X0 = y, X1;
        var F;
        var i = 3;
        var derivative;
        var range = BEZIER_EPSILON + y;

        // усовершенствованный метод Ньютона
        // обычно проходит в 1-2 итерации при точности 0.001
        do {
            derivative = this.B_derivative_I_absciss(X0);
            F =  this.B_absciss(X0) - y;
            X1 = X0 - F / this.B_derivative_I_absciss( X0 - F / ( 2 * derivative ) );
            X0 = X1;
        } while ( i-- !== 0 && derivative !== 0 && this.B_absciss(X1) > range);

        t = X1;

        return this.B_ordinate(t);
    };

    /**
     * @param {!(CubicBezier|Easing)} easing
     * @return {boolean}
     * @override
     */
    CubicBezier.prototype.equals = function (easing) {
        var isFirstAbscissEquals = this.p1x === easing.p1x;
        var isFirstOrdinateEquals = this.p1y === easing.p1y;
        var isSecondAbscissEquals = this.p2x === easing.p2x;
        var isSecondOrdinateEquals = this.p2y === easing.p2y;
        return isFirstAbscissEquals && isFirstOrdinateEquals && isSecondAbscissEquals && isSecondOrdinateEquals;
    };

    CubicBezier.prototype.toString = function () {
        return "cubic-bezier" + "(" + this.p1x + ', ' + this.p1y + ', ' + this.p2x + ', ' + this.p2y + ")";
    };

    /**
     * Ступенчатая функция, ограничивающая область выходных значений до определенного числа.
     * Целочисленное количество ступеней отсчитывается с конца, или с начала.
     * @param {number} stepsAmount
     * @param {boolean} countFromStart
     * @constructor
     * @extends Easing
     */
    function Steps(stepsAmount, countFromStart) {
        this.stepsAmount = stepsAmount;
        this.countFromStart = countFromStart;
    }

    goog.inherits(Steps, Easing);

    /** @type {number} */
    Steps.prototype.stepsAmount = 0;

    /** @type {boolean} */
    Steps.prototype.countFromStart = true;

    /**
     * @override
     * @param {number} x
     * @return {number}
     */
    Steps.prototype.compute = function (x) {
        if (this.countFromStart) {
            return Math.min(Math.ceil(this.stepsAmount * x) / this.stepsAmount, MAXIMAL_PROGRESS);
        } else {
            return (Math.floor(this.stepsAmount * x) ) / this.stepsAmount;
        }
    };

    /**
     * @param {!(Steps|Easing)} easing
     * @return {boolean}
     * @override
     */
    Steps.prototype.equals = function (easing) {
        /** @type {!Steps} */(easing);
        var isAmountEquals = this.stepsAmount === easing.stepsAmount;
        var isCountSourceEquals = this.countFromStart === easing.countFromStart;
        return isAmountEquals && isCountSourceEquals;
    };

    Steps.prototype.toString = function () {
        return 'steps' + "(" + this.stepsAmount + ", " + (this.countFromStart ? "start" : "end") + ")";
    };