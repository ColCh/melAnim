    /** @const */
    var Ticker = {
        /**
         * @type {Array.<!Function>}
         */
        listeners: [],
        /**
         * @type {Array.<!Function>}
         */
        listenersBuffer: [],
        /**
         * @param {!Function} callback
         * */
        on: function (callback) {

            this.listeners.push(callback);

            if (!this.isAwaken) {
                this.awake();
            }

        },
        /**
         * @param {!Function} callback
         */
        off: function (callback) {
            var infoIndex = linearSearch(this.listeners, function (clb) {
                "use strict";
                return clb === callback;
            });
            if (infoIndex !== NOT_FOUND) {
                this.listeners.splice(infoIndex, 1);
            }
        },

        useRAF: RAF_SUPPORTED,
        isAwaken: false,
        frequency: TICKER_BASE_INTERVAL,

        awake: function () {
            this.lastReflow = this.currentTimeStamp = now();
            this.isAwaken = true;
            this.intervalId = this.useRAF ? rAF(this.tick, rootElement) : setTimeout(this.tick, this.frequency);
        },
        sleep: function () {
            this.isAwaken = false;
            this.lastReflow = this.currentTimeStamp = this.delta = 0;
            (this.useRAF ? cancelRAF : clearTimeout)(this.intervalId);
        },

        /** @type {number} */
        currentTimeStamp: 0,
        /** @type {number} */
        lastReflow: 0,
        /** @type {number} */
        delta: 0,

        /** @this {Window} */
        tick: function () {

            Ticker.currentTimeStamp = now();

            Ticker.delta = Ticker.currentTimeStamp - Ticker.lastReflow;

            Ticker.awake();

            if (Ticker.delta) {

                var swap;

                swap = Ticker.listenersBuffer;
                Ticker.listenersBuffer = Ticker.listeners;
                Ticker.listeners = swap;

                var callback;

                while ( (callback = Ticker.listenersBuffer.pop()) ) {
                    Ticker.listeners.push(callback);
                    callback(Ticker.delta);
                }

                Ticker.lastReflow = Ticker.currentTimeStamp;
            }

            if (!Ticker.listeners.length) {
                Ticker.sleep();
            }
        },

        /** @type {number} */
        fps: TICKER_BASE_FPS,

        /**
         * @param {number} fps
         */
        setFPS: function (fps) {
            this.fps = fps;
            this.frequency = 1e3 / fps;
        },

        /**
         * @param {boolean} ignoreRAF
         */
        ignoreReflow: function (ignoreRAF) {
            this.sleep();
            this.useRAF = RAF_SUPPORTED && !Boolean(ignoreRAF);
            this.awake();
        }
    };

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
     * @return {!Array.<number>}
     */
    Keyframe.prototype.getValue = function () {
        return this.propVal;
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
     * @return {number}
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

        if ( COLOR_REG.test(propertyName) ) {
            this.blender = blendHooks['color'];
            this.toStringValue = toStringValueHooks['color'];
        } else {
            if (propertyName in blendHooks) {
                this.blender = blendHooks[propertyName];
            }
            if (propertyName in toStringValueHooks) {
                this.toStringValue = toStringValueHooks[propertyName];
            }
        }

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
     * Функция-интерполятор для данного свойства
     * @type {function(!Array.<number>, !Array.<number>, number, !Array.<number>, number): boolean}
     */
    PropertyDescriptor.prototype.blender = blend;

    /**
     * Функция для данного свойства, предназначенная для
     * перевода значения такое, которое можно отрисовать
     * (строка для CSS)
     * @type {function(!Element, !Array.<number>): string}
     */
    PropertyDescriptor.prototype.toStringValue = toStringValue;

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
        this.p1x = round(p1x, CUBIC_BEZIER_POINTS_DIGITS);
        this.p1y = round(p1y, CUBIC_BEZIER_POINTS_DIGITS);
        this.p2x = round(p2x, CUBIC_BEZIER_POINTS_DIGITS);
        this.p2y = round(p2y, CUBIC_BEZIER_POINTS_DIGITS);
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
        // 3 * t * (-1 + t)^2 * P1 + t^2 (-3 * (-1 + t) * P2 + t)

        var revt = -1 + t;
        return 3*t*revt*revt * p1 + t*t * (-3*revt * p2 + t);
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
        // 3*(t*(P2*(2 - 3*t) + t) + P1*(1-4*t+3*t^2))
        return 3*(t*(this.p2x*(2 - 3*t) + t) + this.p1x*(1-4*t+3*t*t));
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
            if (derivative === 0) {
                // Обычно производная равна нулю на границах ( 0 и 1 )
                break;
            }
            X0 = X1;
        } while ( i-- !== 0 && this.B_absciss(X1) > range);

        t = X0;

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
            return Math.ceil(this.stepsAmount * x) / this.stepsAmount;
        } else {
            return Math.floor(this.stepsAmount * x) / this.stepsAmount;
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
                key = key_toDOMString(parseInt(key, 10));
                keyframesRule.deleteRule(key);
            }
            KeyframesRulesRegistry.rules.push(keyframesRule);
        },
        request: function () {
            if (KeyframesRulesRegistry.rules.length === 0) {
                return addRule("@" + KEYFRAME_PREFIX + " " + ANIMATION_NAME_NONE);
            } else {
                return KeyframesRulesRegistry.rules.pop();
            }
        }
    };

    if (CSSANIMATIONS_SUPPORTED) {
        /**
         * Workaround для Chrome
         * Неверное имя метода
         * @param {!CSSKeyframesRule} keyframesRule
         * @param {number} key
         */
        var keyframesRule_appendRule = function (keyframesRule, key) {
            var keyframesAppendRule = keyframesRule.appendRule || keyframesRule.insertRule;
            keyframesAppendRule.call(keyframesRule, key + '%' + ' ' + '{' + ' ' + '}');
        };


        var keyframesRule = KeyframesRulesRegistry.request();
        keyframesRule_appendRule(keyframesRule, 100);

        /**
         * @type {boolean}
         * @const
         */
        var KEY_EXPECTS_FRACTION = goog.isDefAndNotNull(keyframesRule.findRule("1"));

        /**
         * Workaround для следования спецификации
         * http://www.w3.org/TR/css3-animations/#CSSKeyframesRule-findRule
         * IE : принимает строковое число в долях ("0")
         * Остальные: процентное число в строке + постфикс  '%' ("0%")
         * @param {number} key
         * @return {string}
         */
        var key_toDOMString = function (key) {
            if (KEY_EXPECTS_FRACTION) {
                // melAnim использует проценты
                return key * 1e-2 + "";
            } else {
                return key + "%";
            }
        };

        KeyframesRulesRegistry.slay(keyframesRule);
        keyframesRule = null;

        /**
         * Workaround для IE
         * Кидает ошибку при поиске в пустом правиле ключевых кадров
         * Обёртка для того, чтобы не использовать try catch.
         * @param {!CSSKeyframesRule} keyframesRule
         * @param {string} key
         * @return {CSSKeyframesRule}
         */
        var keyframesRule_findRule = function (keyframesRule, key) {
            if (keyframesRule.cssRules.length === 0) {
                return null;
            } else {
                return keyframesRule.findRule(key);
            }
        }

    }