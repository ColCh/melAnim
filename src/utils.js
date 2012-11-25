    /**
     * Вернёт строковое представление типа аргумента.
     * При необходимости вернёт [[Class]] в нижнем регистре.
     *
     * @param {?} x
     * @return {string}
     */
    function type (x) {
        var type = typeof(x);
        if (type === "object") {
            type = Object.prototype.toString.call(x).slice(8, -1).toLowerCase();
        }
        return type;
    }

    /**
     * Проверит, является ли аргумент HTML элементом.
     *
     * @param {?} x
     * @return {boolean}
     */
    type.element = function (x) {
        return "nodeType" in x;
    };

    /**
     * Проверит, является ли аргумент функцией.
     *
     * @param {?} x
     * @return {boolean}
     */
    type.function = function (x) {
        return type(x) === "function";
    };

    /**
     * Проверит, является ли аргумент массивом
     * @param x
     * @return {boolean}
     */
    type.array = function (x) {
        return type(x) === "array";
    };

    /**
     *
     * @param {number} number
     * @param {number} fromRadix
     * @param {number} toRadix
     */
    function changeRadix (number, fromRadix, toRadix) {
        return parseInt(number, fromRadix).toString(toRadix);
    }

    changeRadix.binToDec = function (num) {
        return changeRadix(num, 2, 10);
    };

    /**
     * Сгенерирует уникальную строку.
     *
     * @return {string}
     */
    function generateId () {
        return toString(mel + animCount++);
    }

    /**
     * Применит Array.slice к аргументу
     * @param {Array|object} arrayLike
     * @return {Array}
     */
    function toArray (arrayLike) {
        return Array.prototype.slice.call(arrayLike, 0);
    }

    /**
     * Пройдётся по элементам массива или свойствам объекта.
     * Итерирование прервётся, если callback вернёт false.
     * @param {Array|Object} arg
     * @param {function} callback
     */
    function each (arg, callback) {

        var i, b;

        if (type.array(arg)) {

            i = 0;
            b = arg.length;

            while (i < b) {
                if (callback(arg[i], i, arg) === false) {
                    break;
                }
                i += 1;
            }

        } else {

            for (i in arg) if (arg.hasOwnProperty(i)) {
                if (callback(arg[i], i, arg) === false) {
                    break;
                }
            }

        }
    }

    /**
     * @param {*} x
     * @return {string}
     */
    function toString (x) {
        return x + "";
    }

    /**
     * Обработает строку времени вида %время%+%размерность%
     * @param {string|number} timeString
     * @return {number|undefined} обработанное время в миллисекундах или undefined в случае неудачи
     */
    function parseTimeString (timeString) {

        var matched = toString(timeString).match(timeStringReg);
        var numeric, coefficient;

        if (timeString) {
            numeric = parseFloat(matched[1]);
            coefficient = parseTimeString.modificators[ matched[2] ] || 1;
            return numeric * coefficient;
        }
    };

    /**
     * Размерности для parseTimeString
     * @type {Object}
     */
    parseTimeString.modificators = {
        "ms": 1,
        "s": 1e3
    };

    function camelCase (string) {
        return toString(string).replace(camelCase.reg, camelCase.callback);
    }

    /**
     * Применит toUpperCase ко второму аргументу.
     * @param {string} a Не используется
     * @param {string} letter
     * @return {string}
     */
    camelCase.callback = function (a, letter) {
        return letter.toUpperCase();
    };

    /**
     * Словит дефис и запомнит следующий за ним символ
     * @type {RegExp}
     */
    camelCase.reg = /-(.)/g;

    /**
     * Попытается вернуть верное имя свойства, подобрав при возможности вендорный префикс.
     * Возвращает undefined в случае неудачи.
     *
     * @param {string} property Имя свойства.
     * @param {boolean=|object=} target Где смотреть наличие свойств - в стилях при falsy (!), и в window при true, или в указанном объекте.
     *
     * @return {string?}
     * */
    function getVendorPropName (property, target) {

        var cache, result, camelCased;

        target = !target ? dummy : (target === true ? window:target);

        if (property in target) {
            return property;
        }

        cache = getVendorPropName.cache;

        if (cache[property] === undefined) {

            camelCased = camelCase(property);

            if (camelCased in target) {

                cache[property] = camelCased;

            } else {

                camelCased = camelCased.charAt(0).toUpperCase() + camelCased.slice(1);

                if (cache.prefix && cache.lowPrefix) {

                    if (cache.prefix + camelCased in target) {
                        cache[property] = cache.prefix + camelCased;
                    } else if (cache.lowPrefix + camelCased in target) {
                        cache[property] = cache.lowPrefix + camelCased;
                    }

                } else {

                    each(getVendorPropName.prefixes, function (prefix) {

                        var lowPrefix = prefix.toLowerCase();

                        if (prefix + camelCased in target) {
                            cache.prefix = prefix;
                            cache.lowPrefix = lowPrefix;
                            cache[property] = prefix + camelCased;
                        } else if (lowPrefix + property in target) {
                            cache.prefix = prefix;
                            cache.lowPrefix = lowPrefix;
                            cache[property] = lowPrefix + property;
                        }

                    });

                }
            }
        }

        return cache[property];
    }

    /**
     * Какие префиксы будет пробовать getVendorPropName
     * @type {Array}
     */
    getVendorPropName.prefixes = "ms O Moz webkit".split(" ");

    /**
     * Где getVendorPropName запоминает результаты вычислений имени свойства
     * @type {Object}
     */
    getVendorPropName.cache = {};



    function CubicBezier (p1x, p1y, p2x, p2y) {
        this.cx = 3.0 * p1x;
        this.bx = 3.0 * (p2x - p1x) - this.cx;
        this.ax = 1.0 - this.cx - this.bx;

        this.cy = 3.0 * p1y;
        this.by = 3.0 * (p2y - p1y) - this.cy;
        this.ay = 1.0 - this.cy - this.by;
    }
    CubicBezier.prototype.solveEpsilon = function (duration) {
        return 1.0 / (200.0 * duration);
    };
    CubicBezier.prototype.sampleCurveX = function (t) {
        return ((this.ax * t + this.bx) * t + this.cx) * t;
    };
    CubicBezier.prototype.sampleCurveY = function (t) {
        return ((this.ay * t + this.by) * t + this.cy) * t;
    };
    CubicBezier.prototype.sampleCurveDerivativeX = function (t) {
        return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
    };
    CubicBezier.prototype.solveCurveX = function (x, epsilon) {
        var t0, t1, t2, x2, d2, i;

        for (t2 = x, i = 0; i < 8; i++) {
            x2 = this.sampleCurveX(t2) - x;
            if (Math.abs(x2) < epsilon) {
                return t2;
            }
            d2 = this.sampleCurveDerivativeX(t2);
            if (Math.abs(d2) < 1e-6) {
                break;
            }
            t2 = t2 - x2 / d2;
        }

        t0 = 0.0;
        t1 = 1.0;
        t2 = x;

        if (t2 < t0)
            return t0;
        if (t2 > t1)
            return t1;

        while (t0 < t1) {
            x2 = this.sampleCurveX(t2);
            if (Math.abs(x2 - x) < epsilon)
                return t2;
            if (x > x2)
                t0 = t2;
            else
                t1 = t2;
            t2 = (t1 - t0) * .5 + t0;
        }

        return t2;
    };
    CubicBezier.prototype.solve = function (x, duration) {
        return this.sampleCurveY(this.solveCurveX(x, this.solveEpsilon(duration)));
    };
    CubicBezier.reg = /^cubic-bezier\((-?\d*\.?\d+), (-?\d*\.?\d+), (-?\d*\.?\d+), (-?\d*\.?\d+)\)$/;



    function Steps (numberOfSteps, stepAtStart) {
        this.numberOfSteps = numberOfSteps;
        this.stepAtStart = stepAtStart;
    }
    Steps.prototype.solve = function (x) {
        if (this.stepAtStart){
            return Math.min(1.0, Math.ceil(this.numberOfSteps * x) / this.numberOfSteps);
        }
        return Math.floor(this.numberOfSteps * x) / this.numberOfSteps;
    };
    Steps.reg = /^steps\((\d+)(?:, ((?:start)|(?:end)))?\)$/;



    function inherit (child, parent) {
        var F = function () {};
        F.prototype = parent.prototype;
        child.prototype = new F;
        child.prototype.constructor = child;
    }

    /**
     * Вернёт вычисленный стиль элемента
     * @param {Element} element
     * @return {CSSStyleDeclaration}
     */
    function getComputedStyle (element) {
        return window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
    }

    /**
     * Окружит строку подстрокой в начале и в конце
     * @param {string} str
     * @param {string} substring
     * @return {string}
     */
    function surround (str, substring) {
        return substring + str + substring;
    }

    /**
     * Добавит пробел в начале и в конце строки
     * @param {string} string
     * @return {string}
     */
    surround.bySpaces = function (string) {
        return surround(string, " ");
    };

    /**
     * Обрежет пробелы в начале строки и в конце
     * @param {string} string
     * @return {string}
     */
    function trim (string) {
        return string.replace(/^\s+|\s+$/g, "");
    }

    /**
     * Добавит правило с указанным селектором и указанным текстом правила.
     * @param selector
     * @param cssText
     * @return {CSSRule} Добавленное правило
     */
    function addRule (selector, cssText) {

        /** @type {CSSRuleList} */
        var rules = stylesheet.cssRules || stylesheet.rules;
        var index = rules.length;

        if (stylesheet.insertRule) {
            stylesheet.insertRule(selector + " " + "{" + cssText + "}", index);
        } else {
            stylesheet.addRule(selector, cssText, rules.length);
        }

        return rules[index];
    }

    /**
     * Добавит указанный класс элементу
     * @param {Element} elem
     * @param {string} value
     */
    function addClass (elem, value) {

        if (surround.bySpaces(elem.className).indexOf(surround.bySpaces(value)) === -1) {
            elem.className += " " + value;
        }

    }

    /**
     * Удалит указанный класс у элемента
     * @param {Element} elem
     * @param {string} value
     */
    function removeClass (elem, value) {
        elem.className = trim(surround.bySpaces(elem.className).replace(surround.bySpaces(value), ""));
    }