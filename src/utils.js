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
     * Проверит, является ли значение аргумента undefined.
     * @param x
     * @return {boolean}
     */
    type.undefined = function (x) {
        return type(x) === "undefined";
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
     * Преобразует строку в верхний регистр
     * @param {string} str
     * @return {string}
     */
    function toUpperCase (str) {
        return String.prototype.toUpperCase.call(toString(str));
    }
    /**
     * Преобразует строку в нижний регистр
     * @param {string} str
     * @return {string}
     */
    function toLowerCase (str) {
        return String.prototype.toLowerCase.call(toString(str));
    }

    /**
     * Обработает строку времени вида %время%+%размерность%
     * @param {string|number} timeString
     * @return {number|undefined} обработанное время в миллисекундах или undefined в случае неудачи
     */
    function parseTimeString (timeString) {

        var matched = toString(timeString).match(cssNumericValueReg);
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

    /**
     * Найдёт корень уравнения  вида f(x)=val с указанной точностью
     * Используется метод хорд
     * @param {function} equation уравнение
     * @param {number=} epsilon минимальная разница между двумя приближениями
     * @param {number=} equationValue значение функции в этой точке
     * @return {number} приближённое значение корня уравнения
     */
    function findEquationRoot (equation, epsilon, equationValue) {
        var X0, X1, cache;

        equationValue = type(equationValue) === "undefined" ? 0:equationValue;
        epsilon = type(epsilon) === "undefined" ? findEquationRoot.defaultEpsilon:epsilon;

        X0 = 0.5 * equationValue;
        X1 = 1.5 * equationValue;

        while (Math.abs(X0 - X1) > epsilon) {
            cache = X1;
            X1 = findEquationRoot.contraction(equation, X0, X1, equationValue);
            X0 = cache;
        }

        return X1;
    }

    /**
     * Значение погрешности по-умолчанию
     * @type {number}
     * @see findEquationRoot
     */
    findEquationRoot.defaultEpsilon = 1e-6;

    /**
     * Сжимающее отображение
     * @param {function} equation
     * @param {number} prev
     * @param {number} curr
     * @param {number} equationValue
     * @return {number}
     * @see findEquationRoot
     */
    findEquationRoot.contraction = function (equation, prev, curr, equationValue) {

        var F_CURR = equation(curr) - equationValue;
        var F_PREV = equation(prev) - equationValue;

        var DELTA_CURR_PREV = curr - prev;
        var DELTA_F = F_CURR - F_PREV;

        return curr - F_CURR * DELTA_CURR_PREV / DELTA_F;
    };

    /**
     * Представление аналога временной функции transition-timing-function
     * Кубическая кривая Безье.
     *
     * @param {number} p1x
     * @param {number} p1y
     * @param {number} p2x
     * @param {number} p2y
     * @param {number} fractionalTime Вход. Это X.
     * @param {number=} epsilon Погрешность
     * @return {number} Выходное значение - easing - Y.
     */
    function cubicBezier (p1x, p1y, p2x, p2y, fractionalTime, epsilon) {

        // вернёт значение X при передаваемом времени.
        var B_bindedToX = function (t) { return cubicBezier.B(p1x, p2x, t); };

        // находим время t, при котором кубическая кривая принимает значение X.
        var bezierTime = findEquationRoot(B_bindedToX, epsilon, fractionalTime);

        // вычисляем по этому времени Y.
        var bezierFunctionValue = cubicBezier.B(p1y, p2y, bezierTime);

        return bezierFunctionValue;
    }

    /**
     * Вычислит значение кубической кривой Безье при переданном t
     * Считается, что P0 = (0;0) и P3 = (1;1)
     * @param {number} coord1
     * @param {number} coord2
     * @param {number} t
     * @return {number}
     */
    cubicBezier.B = function (coord1, coord2, t) {
        return cubicBezier.B1(t) * coord1 + cubicBezier.B2(t) * coord2 + cubicBezier.B3(t);
    };

    /**
     * @param {number} t
     * @return {number}
     */
    cubicBezier.B1 = function (t) {
        return 3 * t * (1 - t) * (1 - t);
    };

    /**
     * @param {number} t
     * @return {number}
     */
    cubicBezier.B2 = function (t) {
        return 3 * t * t * (1 - t);
    };

    /**
     * @param {number} t
     * @return {number}
     */
    cubicBezier.B3 = function (t) {
        return t * t * t;
    };

    /**
     * Вычислит требуемую точность вычислений, исходя из длительности анимации
     * @param {number} duration
     * @return {number}
     */
    cubicBezier.solveEpsilon = function (duration) {
        return 1.0 / (200.0 * duration);
    };

    /**
     * Ступенчатая функция, ограничивающая область выходных значений до определенного числа.
     * Ступени отсчитываются с конца, или с начала.
     * @param {number} stepsAmount Количество ступеней
     * @param {boolean} countFromStart Отсчитывать с начала (true) или с конца (false).
     * @param {number} fractionalTime
     */
    function steps (stepsAmount, countFromStart, fractionalTime) {
        // если отсчитываем с начала, просто реверсируем функцию
        return countFromStart ? 1.0 - steps(stepsAmount, countFromStart, 1.0 - fractionalTime) : Math.floor(stepsAmount * fractionalTime) / stepsAmount;
    }

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