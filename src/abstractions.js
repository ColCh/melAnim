    /** @const */
    var Ticker = {
        /**
         * @type {!Array.<!Function>}
         */
        listeners: [],
        /**
         * @type {!Array.<!Function>}
         */
        listenersBuffer: [],
        /**
         * @param {!Function} callback
         * */
        on: function (callback) {

            Ticker.listeners.push(callback);

            if (!Ticker.isAwaken) {
                Ticker.awake();
            }

        },
        /**
         * @param {!Function} callback
         */
        off: function (callback) {
            var infoIndex = linearSearch(Ticker.listeners, function (clb) {
                return clb === callback;
            });
            if (infoIndex !== NOT_FOUND) {
                Ticker.listeners.splice(infoIndex, 1);
            }
        },

        useRAF: RAF_SUPPORTED,
        isAwaken: false,
        frequency: TICKER_BASE_INTERVAL,

        awake: function () {
            Ticker.lastReflow = Ticker.currentTimeStamp = now();
            Ticker.isAwaken = true;
            Ticker.intervalId = Ticker.useRAF ? rAF(Ticker.tick, rootElement) : setTimeout(Ticker.tick, Ticker.frequency);
        },
        sleep: function () {
            Ticker.isAwaken = false;
            Ticker.lastReflow = Ticker.currentTimeStamp = Ticker.delta = 0;
            (Ticker.useRAF ? cancelRAF : clearTimeout)(Ticker.intervalId);
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
            Ticker.fps = fps;
            Ticker.frequency = 1e3 / fps;
        },

        /**
         * @param {boolean} ignoreRAF
         */
        ignoreReflow: function (ignoreRAF) {
            Ticker.sleep();
            Ticker.useRAF = RAF_SUPPORTED && !Boolean(ignoreRAF);
            Ticker.awake();
        }
    };

    /**
     * Конструктор ключевого кадра
     * @param {number|null} progress
     * @constructor
     */
    function Keyframe (progress) {
        this.numericKey = progress;
        this.propVal = [ 0.0 ];
    }

    /**
     * @type {number|null}
     */
    Keyframe.prototype.numericKey = null;

    /**
     * Численное значение свойства. Всегда абсолютно.
     * @type {!Array.<number>}
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
        return linearSearch(this, function (keyframe) {
            return keyframe.numericKey === progress;
        });
    };

    /**
     * @const
     * @param {!Keyframe} first
     * @param {!Keyframe} second
     * @return {number}
     */
    var compare_keyframes = function (first, second) {
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
     * Вернёт ЛЕВЫЙ ключевой кадр по текущему индексу
     * @return {Keyframe}
     */
    KeyframesCollection.prototype.getLeft = function () {
        return this[ this.cachedIndex ];
    };

    /**
     * Вернёт ПРАВЫЙ ключевой кадр по текущему индексу
     * @return {Keyframe}
     */
    KeyframesCollection.prototype.getRight = function () {
        return this[ this.cachedIndex + 1 ];
    };

    /**
     * Обновит индекс ЛЕВОГО ключевого кадра для определённого прогресса.
     * @param {number} progress
     */
    KeyframesCollection.prototype.moveIndexTo = function (progress) {

        if (this[ this.cachedIndex ].numericKey > progress || progress >= this[ this.cachedIndex + 1 ].numericKey) {
            if (progress === MINIMAL_PROGRESS) {
                this.cachedIndex = 0;
            } else if (progress === MAXIMAL_PROGRESS) {
                this.cachedIndex = this.length - 1;
            }
            do {

                if (!this[ this.cachedIndex + 1 ] || this[ this.cachedIndex ].numericKey > progress) {
                    this.cachedIndex--;
                }
                if (this[ this.cachedIndex + 1 ].numericKey < progress) {
                    this.cachedIndex++;
                }

            } while (this[ this.cachedIndex ].numericKey > progress || this[ this.cachedIndex + 1 ].numericKey < progress);
        }

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
     * @param {!HTMLElement} elem
     * @param {!Array.<number>} numericValue
     * @return {string}
     */
    PropertyDescriptor.prototype.toStringValue = function (elem, numericValue) {

        if (numericValue.length === 1) {
            return numericValue[0] + ( this.propName in toStringValueNoPX ? '' : 'px' );
        } else {
            return '';
        }

    };

    /**
     * Текущее значение свойства на моменте анимации.
     * @type {!Array.<number>}
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
        return linearSearch(this, function (propertyDescriptor) {
            return propertyDescriptor.propName === propertyName;
        });
    };

    /**
     * Добавление нового свойства в коллекцию
     * @param {string} propertyName
     * @return {!PropertyDescriptor}
     */
    PropertyDescriptorCollection.prototype.add = function (propertyName) {
        return this[ this.length++ ] = new PropertyDescriptor(propertyName);
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

            // Help for Google Closure Compiler
            //noinspection UnnecessaryLocalVariableJS
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

            var index = linearSearch(self.easings, function (easing) {
                return easing.equals(timingFunction);
            });

            if (index === NOT_FOUND) {
                self.easings.push(timingFunction);
            } else {
                timingFunction = /** @type {!Easing} */ (self.easings[ index ]);
            }

            return /** @type {!Easing} */ (timingFunction);
        },
        /**
         * @param {!(string|Array)} contain
         * @return {?Easing}
         */
        build: function (contain) {
            var timingFunction = null;
            var stepsAmount, countFromStart;
            var camelCased, trimmed;
            var matched, args = [];
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
                    args = removeSpaces(matched[FUNCREG_ARGS]).split(cssFuncArgsSeparator);
                }
            } else if (goog.isArray(contain)) {
                args = /** @type {!Array} */ (contain);
            }

            if (args.length == 4) {
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
            } else if (args.length == 1 || args.length == 2) {

                stepsAmount = parseInt(args[0], 10);
                countFromStart = args[1] === 'start';

                if (goog.isNumber(stepsAmount)) {
                    timingFunction = new Steps(stepsAmount, countFromStart);
                }
            }

            return timingFunction;
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
        this.p1x = floor(p1x, CUBIC_BEZIER_POINTS_DIGITS);
        this.p1y = floor(p1y, CUBIC_BEZIER_POINTS_DIGITS);
        this.p2x = floor(p2x, CUBIC_BEZIER_POINTS_DIGITS);
        this.p2y = floor(p2y, CUBIC_BEZIER_POINTS_DIGITS);
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
     * @param {CubicBezier|Easing} easing
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
     * @param {Steps|Easing} easing
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
         * @param {CSSKeyframesRule} keyframesRule
         * @param {string} key
         * @return {CSSKeyframeRule}
         */
        var keyframesRule_findRule = function (keyframesRule, key) {
            if (keyframesRule.cssRules.length === 0) {
                return null;
            } else {
                return keyframesRule.findRule(key);
            }
        }

    }