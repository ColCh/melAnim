    /**
     * Конструктор ключевого кадра
     * @param {number} progress
     * @constructor
     */
    function Keyframe (progress) {
        this.numericKey = progress;
        this.propVal = [];
    }

    /**
     * @type {number}
     */
    Keyframe.prototype.numericKey = MAXIMAL_PROGRESS;

    /**
     * Численное значение свойства. Всегда абсолютно.
     * @type {Array.<number>}
     */
    Keyframe.prototype.propVal;

    /**
     * Строковое и вычисленное значение.
     * Тут может быть "50%" или "3em".
     * Будет ускорена отрисовка благодаря пропуску высчета
     * промежуточного значения
     * и перевода типа значения в строковый,
     * ЕСЛИ
     *     у ключевого кадра прогресс равен локальному (между двумя найденными).
     * ЛОКАЛЬНЫЙ прогресс высчитывается так:
     *     ( ПРОГРЕСС_АНИМАЦИИ - ПРОГРЕСС_ЛЕВОГО ) / ( ПРОГРЕСС_ПРАВОГО - ПРОГРЕСС_ЛЕВОГО ).
     * ЛЕВЫЙ и ПРАВЫЙ ключевые кадры - те, для которых выполняется следующее :
     *      ПРОГРЕСС_ЛЕВОГО < ПРОГРЕСС_АНИМАЦИИ <= ПРОГРЕСС_ПРАВОГО.
     *
     * @type {string}
     */
    Keyframe.prototype.alternativeValue = '';

    /**
     * Изменение значения ключевого кадра путём копирования.
     * @param {!Array.<number>} newValue
     */
    Keyframe.prototype.setValue = function (newValue) {
        this.propVal.length = newValue.length;
        for (var i = 0, m = newValue.length; i < m; i++) {
            this.propVal[i] = newValue[i];
        }
    };

    /**
     * Вернёт текущее значение
     * @return {null|Array.<number>}
     */
    Keyframe.prototype.getValue = function () {
        return this.propVal.length ? this.propVal : null;
    };

    /**
     *  Класс коллекции ключевых кадров
     *  @constructor
     *  @extends {Array}
     */
    function KeyframesCollection () {
    }

    goog.inherits(KeyframesCollection, Array);

    /**
     * @param {number} progress
     * @returns {Keyframe?}
     * @override
     */
    KeyframesCollection.prototype.indexOf = function (progress) {
        return linearSearch(this, function (keyframe, i, keyframes) {
            return keyframe.numericKey === progress;
        });
    };

    /**
     * @const
     * @param {!Keyframe} first
     * @param {!Keyframe} second
     * @param {number} index
     * @param {!KeyframesCollection} keyframes
     * @returns {*}
     */
    var compare_keyframes = function (first, second, index, keyframes) {
        if (first.numericKey === second.numericKey) {
            return SORT_EQUALS;
        }
        if (first.numericKey < second.numericKey) {
            return SORT_BIGGER;
        }
        return SORT_SMALLER;
    };

    /**
     * @param {number} progress
     * @return {!Keyframe}
     */
    KeyframesCollection.prototype.add = function (progress) {
        var keyframe = new Keyframe(progress);
        this.push(keyframe);
        sortArray(this, compare_keyframes);
        return keyframe;
    };

    /**
     * Кэшированный индекс найденного ЛЕВОГО ключевого кадра.
     * @type {number}
     */
    KeyframesCollection.prototype.cachedIndex = MINIMAL_PROGRESS;

    /**
     * Поиск индекса ЛЕВОГО ключевого кадра для определённого прогресса.
     * @param {number} progress
     */
    KeyframesCollection.prototype.indexOfLeft = function (progress) {
        var leftKeyframe, rightKeyframe;

        if (this.length < 2) {
            return NOT_FOUND;
        }

        leftKeyframe = this[ this.cachedIndex ];
        rightKeyframe = this[ this.cachedIndex + 1 ];

        if (leftKeyframe.numericKey > progress || progress >= rightKeyframe.numericKey) {
            do {

                if (!rightKeyframe || leftKeyframe.numericKey > progress) {
                    this.cachedIndex--;
                }
                if (rightKeyframe.numericKey < progress) {
                    this.cachedIndex++;
                }
                leftKeyframe = this[ this.cachedIndex ];
                rightKeyframe = this[ this.cachedIndex + 1 ];
            } while (leftKeyframe.numericKey > progress || rightKeyframe.numericKey < progress);
        }

        return this.cachedIndex;
    };

    /**
     * Вернёт ключевой кадр по индексу
     * @param {number} index
     */
    KeyframesCollection.prototype.item = function (index) {
        return this[index];
    };

    /**
     * Объект с описанием анимируемого свойства
     * @param {string} propertyName
     * @constructor
     */
    function PropertyDescriptor (propertyName) {
        this.propName = propertyName;
        this.vendorizedPropName = getVendorPropName(propertyName);
        this.currentValue = [];
        this.keyframes = new KeyframesCollection();
        this.startingValue = new Keyframe(null);
    }

    /**
     * Идентификатор свойства.
     * ("top", "transform")
     * @type {string}
     */
    PropertyDescriptor.prototype.propName = '';

    /**
     * Имя свойства для стиля
     * ("top", "webkitTransform")
     * @type {string}
     */
    PropertyDescriptor.prototype.vendorizedPropName = '';

    /**
     * Текущее значение свойства на моменте анимации.
     * @type {Array.<number>}
     */
    PropertyDescriptor.prototype.currentValue;

    /**
     * Значение свойства на момент старта анимации.
     * @type {!Keyframe}
     */
    PropertyDescriptor.prototype.startingValue;

    /**
     * Коллекция значений ключевых кадров для свойства
     * @type {!KeyframesCollection}
     */
    PropertyDescriptor.prototype.keyframes;

    /**
     * @return {!KeyframesCollection}
     */
    PropertyDescriptor.prototype.getKeyframes = function () {
        return this.keyframes;
    };

    /**
     * Коллекция анимируемых свойств
     * @constructor
     * @extends {Array}
     */
    function PropertyDescriptorCollection () {
    }

    goog.inherits(PropertyDescriptorCollection, Array);

    /**
     * Поиск дескриптора для опредлённого свойства
     * @param {string} propertyName
     * @return {number}
     * @override
     */
    PropertyDescriptorCollection.prototype.indexOf = function (propertyName) {
        return linearSearch(this, function (propertyDescriptor, i, data) {
            return propertyDescriptor.propName === propertyName;
        });
    };

    /**
     * Добавление нового свойства в коллекцию
     * @param {string} propertyName
     * @return {!PropertyDescriptor}
     */
    PropertyDescriptorCollection.prototype.add = function (propertyName) {
        var propertyDescriptor = new PropertyDescriptor(propertyName);
        this.push(propertyDescriptor);
        return propertyDescriptor;
    };

    /**
     * Вернёт дескриптор свойства по определённому индексу
     * @param {number} index
     * @return {!PropertyDescriptor}
     */
    PropertyDescriptorCollection.prototype.item = function (index) {
        return this[ index ];
    };

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

            if (goog.isNull(timingFunction)) {
                return null;
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
                } else if (cssFunctionReg.test(trimmed)) {
                    // Передана строка временной функции CSS
                    // строка аргументов к временной функции. разделены запятой
                    matched = trimmed.match(cssFunctionReg);
                    cssFunction = matched[FUNCREG_FUNC];
                    args = removeSpaces(matched[FUNCREG_ARGS]).split(cssFuncArgsSeparator);
                }
            } else if (goog.isArray(contain)) {
                args = /** @type {!Array} */ (contain);
            }

            argsLength = goog.isArray(args) ? args.length : 0;

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
        var isAmountEquals = this.stepsAmount === easing.stepsAmount;
        var isCountSourceEquals = this.countFromStart === easing.countFromStart;
        return isAmountEquals && isCountSourceEquals;
    };

    Steps.prototype.toString = function () {
        return 'steps' + "(" + this.stepsAmount + ", " + (this.countFromStart ? "start" : "end") + ")";
    };

    /**
     * То, что идёт после собаки ("@") в CSS-правилах
     * Как правило, в нему дописыватеся вендорный префикс, если у
     * свойства анимации тоже есть префикс.
     * @type {string}
     * @const
     */
    var KEYFRAME_PREFIX = (getVendorPropName("animation") === "animation" ? "" : "-" + lowPrefix + "-") + "keyframes";


    /**
     * @const
     */
    var KeyframesRulesRegistry = {
        /** @type {!Array.<!CSSKeyframesRule>} */
        rules: [],
        /** @param {!CSSKeyframesRule} keyframesRule */
        slay: function (keyframesRule) {
            keyframesRule.name = ANIMATION_NAME_NONE;
            var keyframes = keyframesRule.cssRules;
            var key;
            while ( keyframes.length ) {
                key = keyframes[0].keyText;
                keyframesRule.deleteRule(key);
            }
            this.rules.push(keyframesRule);
        },
        request: function () {
            if (this.rules.length === 0) {
                return addRule("@" + KEYFRAME_PREFIX + " " + ANIMATION_NAME_NONE);
            } else {
                return this.rules.pop();
            }
        }
    };