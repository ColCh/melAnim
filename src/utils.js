
    /**
     * Проверит, является ли объект x экземпляром constructor.
     * @param {*} x
     * @param {Object} constructor
     * @return {boolean}
     */
    function instanceOf (x, constructor) {
        return x instanceof constructor;
    }

    /**
     * Вернёт строковое представление типа аргумента.
     * При необходимости вернёт [[Class]] в нижнем регистре.
     *
     * @param {*} x
     * @return {string}
     */
    function typeOf(x) {
        var type = typeof(x);
        if (type === "object") {
            type = Object.prototype.toString.call(/** @type {Object} */ (x)).slice(8, -1).toLowerCase();
        }
        return type;
    }

    /**
     * Проверит, является ли аргумент HTML элементом.
     *
     * @param {*} x
     * @return {boolean}
     */
    typeOf.element = function (x) {
        return toBool(x && "nodeType" in x && x.nodeType === Node.ELEMENT_NODE);
    };

    /**
     * Проверит, является ли аргумент функцией.
     *
     * @param {*} x
     * @return {boolean}
     */
    typeOf.func = function (x) {
        return toBool(instanceOf(x, Function) || typeOf(x) === "function");
    };

    /**
     * Проверит, является ли аргумент массивом
     * @param x
     * @return {boolean}
     */
    typeOf.array = function (x) {
        return toBool(instanceOf(x, Array) || typeOf(x) === "array");
    };

    /**
     * Проверит, является ли значение аргумента undefined.
     * @param x
     * @return {boolean}
     */
    typeOf.undefined = function (x) {
        return toBool(x === undefined || typeOf(x) === "undefined");
    };

    /**
     * Проверит, является ли аргумент числом
     * @param {*} x
     * @return {boolean}
     */
    typeOf.number = function (x) {
        return toBool(instanceOf(x, Number) || typeOf(x) === "number");
    };

    /**
     * Проверит, является ли аргумент строковым значением
     * @param x
     * @return {boolean}
     */
    typeOf.string = function (x) {
        return toBool(instanceOf(x, String) || typeOf(x) === "string");
    };

    /**
     * Проверит, является ли аргумент объектом
     * @param {*} x
     * @return {boolean}
     */
    typeOf.object = function (x) {
        return toBool(instanceOf(x, Object) || typeOf(x) === "object");
    };

    /**
     * Шорткат для Math.floor
     * @inheritDoc
     */
    var floor = Math.floor;

    /**
     * Шорткат для Math.ceil
     * @inheritDoc
     */
    var ceil = Math.ceil;

    /**
     * Шорткат для Math.min
     * @inheritDoc
     */
    var min = Math.min;

    /**
     * Шорткат для Math.max
     * @inheritDoc
     */
    var max = Math.max;

    /**
     * Шорткат для Math.pow
     * @inheritDoc
     */
    var pow = Math.pow;

    /**
     * Вернёт true, если число нечётное; и false, если чётное.
     * @param number
     * @return {boolean}
     */
    function isOdd (number) {
        return (number & 1) === 1;
    }

    /**
     * Проверит, принадлежит ли число диапазону
     * @param {number} num
     * @param {number} lowbound нижняя граница
     * @param {number} highbound верхняя граница
     * @param {boolean=} including включая ли границы
     * @return {boolean}
     */
    function inRange(num, lowbound, highbound, including) {
        return including ? (num >= lowbound && num <= highbound) : (num > lowbound && num < highbound);
    }

    /**
     * Сгенерирует уникальную строку.
     * @return {string}
     */
    function generateId() {
        return /** @type {string} */ (mel) + animCount++;
    }

    /**
     * Аналог Object.create
     * @param {Object} parent
     * @return {Object}
     */
    function createObject(parent) {
        /** @constructor */
        var F = noop;
        F.prototype = parent;
        return new F;
    }

    /**
     * Удалит из массива элементэлемент с указанным индексом
     * @param {Array} array
     * @param {number} index
     */
    function removeAtIndex (array, index) {
        if (index in array) {
            array.splice(index, 1);
        }
    }

    /**
     * Классический шаблон итератора
     * @param {Array} collection
     * @constructor
     * @class
     */
    function Iterator(collection) {
        this.collection = collection;
        this.length = collection.length;
    }

    /**
     * Индекс текущего элемента в коллекции
     * @type {number}
     * @private
     */
    Iterator.prototype.index = -1;

    /**
     * Запомненная длина коллекции
     * @type {number}
     * @private
     */
    Iterator.prototype.length = -1;

    /**
     * Коллекция
     * @type {Array}
     * @private
     */
    Iterator.prototype.collection = null;

    /**
     * Возвратит текущий элемент коллекции
     * @return {*}
     */
    Iterator.prototype.current = function () {
        return this.collection[this.index];
    };

    /**
     * Возвратит следующий элемент коллекции или значение по-умолчанию
     * @return {*}
     */
    Iterator.prototype.next = function () {
        return this.index < this.length ? this.collection[this.index++] : undefined;
    };

    /**
     * Возвратит предыдущий элемент коллекции или значение по-умолчанию
     * @return {*}
     */
    Iterator.prototype.previous = function () {
        return this.index > 0 ? this.collection[this.index--] : undefined;
    };

    /**
     * Сортировка массива методом пузырька
     * @param {Array} array массив
     * @param {Function=} compare функция сравнения. если не указать, будут сравниваться, как числа
     * @param {number=} low нижняя граница (по умол. начало массива)
     * @param {number=} high верхняя граница (по умол. конец массива)
     */
    function bubbleSort(array, compare, low, high) {

        var i, j, cache;

        if (!typeOf.number(low)) low = 0;
        if (!typeOf.number(high)) high = array.length - 1;
        if (!typeOf.func(compare)) compare = compareNumbers;

        for (j = low; j < high; j += 1) {
            for (i = low; i < high - j; i += 1) {
                if (compare(array[i], array[i + 1], i, array) > 0) {
                    cache = array[i];
                    array[i] = array[i + 1];
                    array[i + 1] = cache;
                }
            }
        }
    }

    /**
     * Обычный линейный поиск значения в массиве
     * @param {(Array|CSSRuleList)} arr массив
     * @param {(Function|*)} val Значение (или функция сравнения; должна вернуть 0 при равенстве)
     * @return {number}
     */
    function LinearSearch(arr, val) {

        var callable = typeOf.func(val),
            index, i, m, curr,
            indexOf = Array.prototype.indexOf,
            EQUALS = true, NOT_FOUND = -1;

        index = NOT_FOUND;

        if (!callable && indexOf) {
            index = indexOf.call(arr, val);
        } else {
            for (i = 0, m = arr.length; i < m && index === NOT_FOUND; i++) {
                curr = arr[i];
                if (callable) {
                    if (/** @type {Function} */(val)(curr, i, arr) === EQUALS) index = i;
                } else {
                    if (val === curr) index = i;
                }
            }
        }

        return index;
    }

    /**
     * Функция для сравнения 2 чисел.
     * @param {number} a
     * @param {number} b
     * @return {number}
     * @see Array.sort
     */
    function compareNumbers(a, b) {
        return a - b;
    }

    /**
     * Сравнит 2 ключевых кадра по их ключам
     * @param {Keyframe} a
     * @param {Keyframe} b
     * @return {number} отрицальное число, если a < b, положительное число, если a > b, и 0, если они равны
     * @see compareNumbers
     */
    function compareKeyframes(a, b) {
        return compareNumbers(a.key, b.key);
    }

    /**
     * Алгоритм бинарного поиска для нахождения
     * искомой величины в отсортированном массиве
     * @param {Array} array отсортированный массив
     * @param {*} value искомая величина
     * @param {Function=} compare функция сравнения; если не указать, будут сравниваться, как числа
     * @param {number=} lowBound нижняя граница (по умол. начало массива)
     * @param {number=} upperBound верхняя граница (по умол. конец массива)
     * @return {number} найденный индекс величины или -1
     * @see Array.sort
     */
    function binarySearch(array, value, compare, lowBound, upperBound) {

        var mid, comp;

        if (!typeOf.number(lowBound)) lowBound = 0;
        if (!typeOf.number(upperBound)) upperBound = array.length - 1;

        compare = typeOf.func(compare) ? compare : compareNumbers;

        do {

            if (lowBound > upperBound || !array.length) {
                return -1;
            }

            mid = lowBound + upperBound >> 1;

            comp = compare(value, array[mid], mid, array);

            if (!comp) {
            // comp === 0
                return mid;
            } else if (comp < 0) {
            // comp === -1
                upperBound = mid - 1;
            } else {
            // comp === 1
                lowBound = mid + 1;
            }

        } while (true);

    }

    /**
     * Просто вызовет функцию с аргументами
     * @param {Function} func функция
     * @param {Array=} args массив аргументов
     * @param {Object=} ctx контекст
     * @return {*}
     */
    function apply(func, args, ctx) {
        return typeOf.func(func) && func.apply(ctx, args);
    }

    /**
     * Частичное применение функции с возможностью привязывания контекста.
     *
     * @param {Function} fn функция
     * @param {Array} args аргументы
     * @param {Object=} ctx контекст исполнения функции
     * @return {Function} частично применённая функция
     */
    function partial(fn, args, ctx) {
        return function () {
            return apply(fn, args.concat(slice(arguments)), ctx);
        };
    }

    /**
     * Привяжет функцию к контексту
     * @param {Function} fn
     * @param {Object} ctx
     */
    function bind(fn, ctx) {
        return function () {
            return fn.apply(ctx, arguments);
        };
    }

    /**
     * Применит Array.slice а аргументу
     * @param {Object} arrayLike Любой объект, похожий на массив
     * @param {number=} start Начальное смещение
     * @param {number=} end Конечное смещение
     * @return {Array}
     */
    function slice(arrayLike, start, end) {
        return Array.prototype.slice.call(arrayLike, start, end);
    }

    /**
     * Пройдётся по элементам массива или свойствам объекта.
     * Итерирование прервётся, если callback вернёт false.
     * @param {Array|Object} arg
     * @param {Function} callback
     * @param {Object=} context контекст исполнения callback'а
     */
    function each(arg, callback, context) {
        var i, b;
        context = context || window;
        if (typeOf.array(arg)) {
            i = 0;
            b = arg.length;
            while (i < b) if (i in arg) {
                if (callback.call(context, arg[i], i, arg) === false) {
                    break;
                }
                i += 1;
            }
        } else {
            for (i in arg) if (arg.hasOwnProperty(i)) {
                if (callback.call(context, arg[i], i, arg) === false) {
                    break;
                }
            }
        }
    }

    /**
     * Пройдётся по элементам массива \ объекта и соберёт новый
     * из возвращённых значений функции
     * @param {Array|Object} arg
     * @param {Function} callback
     * @param {Object=} ctx контекст callback'а
     * @return {Array}
     */
    function map(arg, callback, ctx) {
        var accum = [];
        each(arg, function (value, index, object) {
            accum.push(callback.call(ctx, value, index, object));
        });
        return accum;
    }

    /**
     * Приведёт аргумент к строковому типу
     * @param {*} x
     * @return {string}
     * @inheritDoc
     */
    function toString (x) {
        return x + "";
    }

    /**
     * Преобразует аргумент в булевому типу
     * @param {*} x
     * @return {boolean}
     */
    function toBool (x) {
        return !!x;
    }

    /**
     * Преобразует строку в верхний регистр
     * шорткат.
     * @param {string} str
     * @return {string}
     */
    function toUpperCase(str) {
        return String.prototype.toUpperCase.call(/** @type {String} */(str));
    }
    /**
     * Преобразует строку в нижний регистр.
     * шорткат.
     * @param {string} str
     * @return {string}
     */
    function toLowerCase(str) {
        return String.prototype.toLowerCase.call(/** @type {String} */(str));
    }

    /**
     * Размерности для parseTimeString
     * @type {Object}
     */
    var timeStringModificators = {
        "ms": 1,
        "s": 1e3
    };

    /**
     * Обработает строку времени вида %время%+%размерность%
     * @param {(string|number)} timeString
     * @return {(number|undefined)} обработанное время в миллисекундах или undefined в случае неудачи
     */
    function parseTimeString(timeString) {

        var matched = toString(timeString).match(cssNumericValueReg);
        var numeric, coefficient;

        if (matched) {
            numeric = parseFloat(matched[1]);
            coefficient = timeStringModificators[ matched[2] ] || 1;
            return numeric * coefficient;
        }

        return undefined;
    }

    /**
     * Заменит дефисы и следующие за ним символы
     * в верхний регистр
     *
     * Для перевода строк CSS-правил к DOM-стилю.
     * @param {string} string
     * @return {string}
     */
    function camelCase(string) {
        return toString(string).replace(/-[a-z]/g, function (match) {
            return match.charAt(1).toUpperCase();
        });
    }

    /**
     * Попытается вернуть верное имя свойства, подобрав при возможности вендорный префикс.
     * Возвращает undefined в случае неудачи.
     *
     * @param {string} property Имя свойства.
     * @param {(Object|boolean)=} target Где смотреть наличие свойств - в стилях при falsy (!), и в window при true, или в указанном объекте.
     *
     * @return {string?}
     * */
    function getVendorPropName(property, target) {
        var result, camelCased;

        target = !target ? dummy : (target === true ? window : target);

        if (property in gVPNCache) {
            result = gVPNCache[property];
        } else if (property in target) {
            result = property;
        } else {
            camelCased = camelCase(property);

            if (camelCased in target) {
                result = gVPNCache[property] = camelCased;
            } else {
                camelCased = camelCased.charAt(0).toUpperCase() + camelCased.slice(1);
                if (prefix && lowPrefix) {
                    if (prefix + camelCased in target) {
                        result = gVPNCache[property] = prefix + camelCased;
                    } else if (lowPrefix + camelCased in target) {
                        result = gVPNCache[property] = lowPrefix + camelCased;
                    }
                } else {
                    each(vendorPrefixes, function (probePrefix) {

                        var probeLowPrefix = toLowerCase(probePrefix), STOP = false;

                        if (probePrefix + camelCased in target) {
                            // вендорные префиксы определены в самом начале скрипта
                            prefix = probePrefix;
                            lowPrefix = probeLowPrefix;
                            result = gVPNCache[property] = probePrefix + camelCased;
                            return STOP;
                        } else if (probeLowPrefix + camelCased in target) {
                            prefix = probePrefix;
                            lowPrefix = probeLowPrefix;
                            result = gVPNCache[property] = probeLowPrefix + camelCased;
                            return STOP;
                        }

                        return !STOP;
                    });
                }
            }
        }
        return result;
    }

    /**
     * Какие префиксы будет пробовать getVendorPropName
     * @type {Array.<string>}
     */
    var vendorPrefixes = "ms O Moz webkit".split(" ");

    /**
     * Где getVendorPropName запоминает результаты вычислений имени свойства (кеш)
     * @type {Object}
     */
    var gVPNCache = {};

    /**
     * Вернёт кол-во миллисекунд с 1 Января 1970 00:00:00 UTC
     * @return {number}
     */
    var now = Date.now || function () {
        return +new Date;
    };

    /**
     * Объект window.peformance
     * @type {(undefined|Object)}
     */
    var performance = window[ getVendorPropName("performance", true) ];

    /**
     * Измерит и вернёт точное время, прошедшее с момента navigationStart.
     * (если поддерживается)
     * @type {(undefined|Function)}
     */
    var perfNow;

    /**
     * Время navigationStart
     * @type {(undefined|number)}
     */
    var navigStart;

    if (performance) {
        perfNow = performance[ getVendorPropName("now", performance) ];
        if (perfNow){
            perfNow = bind(perfNow, performance);
            navigStart = performance["timing"]["navigationStart"];
            now = function () {
                return perfNow() + navigStart;
            };
            if (ENABLE_DEBUG) {
                console.log("DOMHighResTimeStamp support detected");
            }
        } else if (ENABLE_DEBUG) {
            console.log('Found window.performance but no "now" method so DOMHighResTimeStamp isn\'t supported.');
        }
    } else if (ENABLE_DEBUG) {
        console.log("Cannot find window.performance so DOMHighResTimeStamp isn't supported to. Using Date.now as usual.");
    }

    /**
     * Замена для requestAnimationFrame.
     * @param {function(number)} callback
     * @return {number} ID таймаута
     */
    function rAF_imitation(callback) {
        var id = rAF_imitation.unique++;

        if (!rAF_imitation.timerID) rAF_imitation.timerID = setInterval(rAF_imitation.looper, 1e3 / FRAMES_PER_SECOND);
        rAF_imitation.queue[id] = callback;
        return id;
    }

    /**
     * Замена для cancelRequestAnimationFrame
     * @param {number} id
     */
    function rAF_imitation_dequeue(id) {
        var queue = rAF_imitation.queue;
        if (id in queue) {
            delete queue[id];
        }
    }

    /**
     * ID таймаута "перерисовки"
     * @type {?number}
     * @private
     */
    rAF_imitation.timerID = null;

    /**
     * Для генерации ID таймаута.
     * @type {number}
     */
    rAF_imitation.unique = 0;

    /**
     * Очередь обработчиков и их контекстов
     * @type {Object}
     * @const
     */
    rAF_imitation.queue = {};

    /**
     * Таймер "отрисовки" - пройдется по обработчикам и повызывает их,
     * передав как первый аргумент временную метку "отрисовки"
     * @private
     */
    rAF_imitation.looper = function () {
        var reflowTimeStamp = now();
        each(rAF_imitation.queue, function (callback, id, queue) {
            callback.call(window, reflowTimeStamp);
            delete queue[id];
        });
    };

    /**
     * Вернёт логарифм числа x по основанию 10 (десятичный логарифм)
     * @param {number} x
     * @return {number}
     * */
    function lg (x) {
        return Math.log(x) * Math.LOG10E;
    }

    /**
     * Округлит число до указанного знака
     * @param {number} x число
     * @param {number} digits количество знаков после запятой
     * @return {number}
     */
    function round (x, digits) {
        var factor = Math.pow(10, digits);
        return Math.round( x * factor ) / factor;
    }

    /**
     * Вернёт вычисленный стиль элемента
     * @param {Element} element
     * @return {CSSStyleDeclaration}
     */
    function getComputedStyle(element) {
        return window.getComputedStyle ? window["getComputedStyle"](element, null) : /** @type {CSSStyleDeclaration} */ (element.currentStyle);
    }

    /**
     * Окружит строку подстрокой в начале и в конце
     * @param {string} str
     * @param {string} substring
     * @return {string}
     */
    function surround(str, substring) {
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
    function trim(string) {
        return string.replace(/^\s+|\s+$/g, "");
    }

    /**
     * Пропустит ключ через все фильтры и вернёт его
     * численное представление в процентах или undefined.
     * @param {(string|number)} key
     * @return {number}
     */
    function normalizeKey(key) {
        var numericKey;
        if (typeOf.string(key)) {
            numericKey = key in keyAliases ? keyAliases[key] : parseInt(key, 10);
        }
        return inRange(numericKey, 0, 100, true) ? numericKey : undefined;
    }

    /**
     * Добавит правило с указанным селектором и указанным текстом правила.
     * @param {string} selector
     * @param {string=} cssText
     * @return {CSSRule} Добавленное правило
     */
    function addRule(selector, cssText) {

        /** @type {CSSRuleList} */
        var rules = stylesheet.cssRules || stylesheet.rules;
        var index = rules.length;

        cssText = cssText || " ";

        if (stylesheet.insertRule) {
            stylesheet.insertRule(selector + " " + "{" + cssText + "}", index);
        } else {
            stylesheet.addRule(selector, cssText, rules.length);
        }

        return rules[index];
    }

    /**
     * Удалит правило из таблицы стилей (если оно присутствует в ней)
     * @param {CSSRule} rule
     */
    function removeRule (rule) {
        var rules = stylesheet.cssRules || stylesheet.rules;
        var ruleIndex = LinearSearch(rules, rule);
        if (ENABLE_DEBUG) {
            console.assert(ruleIndex !== -1, 'removeRule: internal usage but undefined rule;')
        }
        // аргументы одинаковые - нет смысла делать ветвление
        var removeMethod = stylesheet.deleteRule || stylesheet.removeRule;
        removeMethod.call(stylesheet, ruleIndex);
    }

    /**
     * Добавит указанный класс элементу
     * @param {HTMLElement} elem
     * @param {string} value
     */
    function addClass(elem, value) {

        if (surround.bySpaces(elem.className).indexOf(surround.bySpaces(value)) === -1) {
            elem.className += " " + value;
        }

    }

    /**
     * Удалит указанный класс у элемента
     * @param {HTMLElement} elem
     * @param {string} value
     */
    function removeClass(elem, value) {
        elem.className = trim(surround.bySpaces(elem.className).replace(surround.bySpaces(value), ""));
    }

    /**
     * Установит значение стиля элементу, либо получит текущее
     * значение свойства, при необходимости конвертируя вывод.
     * @param {(HTMLElement|CSSStyleDeclaration)} element Элемент
     * @param {string} propertyName Имя свойства
     * @param {(Array|string|number)=} propertyValue Значение свойства.
     *
     * @return {string}
     * */
    function css(element, propertyName, propertyValue) {

        var getting = typeOf.undefined(propertyValue);
        var action = getting ? "get" : "set";
        var hookVal, vendorizedPropertyName;
        var stringValue;

        if (element) {
            vendorizedPropertyName = getVendorPropName(propertyName);

            if (propertyName in cssHooks && action in cssHooks[propertyName]) {
                hookVal = cssHooks[propertyName][action](element, vendorizedPropertyName, propertyValue);
            }

            if (getting) {

                if (typeOf.undefined(hookVal)) {
                    if (typeOf.element(element)) {
                        stringValue = /** @type {HTMLElement} */(element).style[vendorizedPropertyName] || getComputedStyle(/** @type {HTMLElement} */(element))[vendorizedPropertyName];
                    } else {
                        stringValue = /** @type {CSSStyleDeclaration} */ (element)[vendorizedPropertyName];
                    }
                } else {
                    stringValue = hookVal;
                }

            } else {

                if (typeOf.string(propertyValue)) {
                    stringValue = propertyValue;
                } else {
                    stringValue = normalize(/** @type {HTMLElement} */(element), propertyName, /** @type {(Array|number)} */(propertyValue), true);
                }

                if (typeOf.element(element)) {
                    /** @type {HTMLElement} */(element).style[vendorizedPropertyName] = stringValue;
                } else {
                    /** @type {CSSStyleDeclaration} */(element)[vendorizedPropertyName] = stringValue;
                }

            }
        }

        return stringValue;
    }

    /**
     * Хуки для получения\установки значения свойства.
     * @type {Object.<string, Object.<string, Function>>}
     */
    var cssHooks = {};

    /**
     * Преобразует строкое представление значения в численное или наоборот
     * @param {HTMLElement} element элемент (для относительных значений)
     * @param {string} propertyName имя свойства
     * @param {(string|Array|number)} propertyValue значение свойства
     * @param {boolean=} toString к строке (true) или к числовому значению (false)
     * @return {Array|number|undefined}
     */
    function normalize(element, propertyName, propertyValue, toString) {
        var normalized;
        var unit;
        var vendorizedPropertyName;

        vendorizedPropertyName = getVendorPropName(propertyName);

        if (propertyName in normalizeHooks) {
            normalized = normalizeHooks[propertyName](element, vendorizedPropertyName, propertyValue, toString);
        } else {
            if (toString) {
                if (typeOf.number(propertyValue) && !(propertyName in nopx)) {
                    normalized = propertyValue + "px";
                }
            } else {
                unit = propertyValue.match(cssNumericValueReg)[2];
                normalized = normalizeUnits[unit](element, vendorizedPropertyName, propertyValue);
            }
        }

        return normalized;
    }

    /**
     * Хуки для преобразования значения
     * Первый аргумент - элемент
     * Второй - имя свойства
     * Третий - значение
     * Червёртый - приводим к строке (true) или к числу (false)
     * @type {Object.<string, Function>}
     */
    var normalizeHooks = {};

    /**
     * Хуки для преобразования из исходных единиц измерения к абсолютным
     * @type {Object.<string, Function>}
     */
    var normalizeUnits = {
        // это и есть абсолютное значение
        "px":function (element, propName, propVal) {
            // просто возвращаем число без "px"
            return parseFloat(propVal);
        }
    };

    /**
     * Список свойств, к которым не надо добавлять "PX"
     * при переводе из числа в строку.
     * @enum {boolean}
     */
    var nopx = {
        "fill-opacity":true,
        "font-weight":true,
        "line-height":true,
        "opacity":true,
        "orphans":true,
        "widows":true,
        "z-index":true,
        "zoom":true
    };

    /**
     * Вычисление значения между двумя точками
     * для анимируемого свойства
     * @param {string} propertyName Имя свойства
     * @param {(Array|number)} from Значение меньшей точки
     * @param {(Array|number)} to Значение большей точки
     * @param {number} timingFunctionValue Значение прогресса между ними
     * @return {number|Array} Вычисленное значение
     */
    function blend(propertyName, from, to, timingFunctionValue) {

        /** @type {(Array|number)} */
        var value;

        if (propertyName in blend.hooks) {
            value = blend.hooks[propertyName](from, to, timingFunctionValue, ROUND_DIGITS_CSS);
        } else {
            value = /** @type {number} */ ((to - from) * timingFunctionValue + from);
            value = round(value, ROUND_DIGITS_CSS);
        }

        return value;
    }

    /**
     * Для вычисления значения экзотических свойств
     * transform или crop, к примеру
     * @type {Object}
     * @private
     */
    blend.hooks = {};

    /**
     * Исполнит функцию перед отрисовкой,
     * передав её текущую отметку времени
     * Оригинальная функция
     * @type {Function}
     */
    var rAF = window[getVendorPropName("requestAnimationFrame", window)];

    /**
     * Исполнит функцию перед отрисовкой, передав ей отметку времени
     * (обёртка)
     * @type {Function}
     */
    var requestAnimationFrame = rAF ? rAF : rAF_imitation;

    /**
     * Отменит исполнение функции перед отрисовкой
     * @type {Function}
     */
    var cancelRequestAnimationFrame = rAF ? window[getVendorPropName("cancelRequestAnimationFrame", window)] : rAF_imitation_dequeue;

    if (ENABLE_DEBUG) {
        if (rAF) {
            console.log("detected native requestAnimationFrame support");
        } else {
            console.log("requestAnimationFrame is not found. Using imitation.");
        }
    }

    /**
     * Таймер для анимации
     * @param {Function} callback
     * @param {Object=} context контекст исполнения функции
     * @constructor
     * @class
     */
    function ReflowLooper(callback, context) {

        if (typeOf.func(callback)) {
            this.callback = /** @type {Function} */(callback);
        }

        if (typeOf.object(context)) {
            this.context = /** @type {Object} */(context);
        }

        this.looper = bind(this.looper, this);
    }

    /**
     * Функция будет исполняться циклически по таймеру
     * @type {Function}
     * @private
     */
    ReflowLooper.prototype.callback = null;

    /**
     * Контекст функции
     * @type {Object}
     * @private
     */
    ReflowLooper.prototype.context = null;

    /**
     * ID таймаута
     * @type {number}
     * @private
     */
    ReflowLooper.prototype.timeoutID = -1;

    /**
     * Запуск таймера
     */
    ReflowLooper.prototype.start = function () {
        this.timeoutID = requestAnimationFrame(this.looper);
    };

    /**
     * Остановка таймера
     */
    ReflowLooper.prototype.stop = function () {
        cancelRequestAnimationFrame(this.timeoutID);
        delete this.timeoutID;
    };

    /**
     * Враппер вызова функции с контекстом
     * @private
     */
    ReflowLooper.prototype.looper = function (timeStamp) {
        this.timeoutID = requestAnimationFrame(this.looper);
        this.callback.call(this.context, timeStamp);
    };

    /**
     * Регистр анимаций для обеспечивания перезаписи свойств
     * понятие "перезапись анинимаций" взято из спецификации по CSS3 анимациям
     * @type {{data: Array, search: Function, add: Function, remove: Function}}
     */
    var overrideRegistry = {

        /**
         * Регистр для реализации перезаписи анимаций
         * Структура :
         *      [
         *          [ Animation1, Animation2 ]
         *          ...
         *      ]
         * Где у Animation1 и Animation2 одинаковые элементы для анимирования
         * @type {Array.<Array.<(CSSAnimation|ClassicAnimation)>>}
         * @private
         */
        data : [],

        /**
         * Поиск индекса группы анимаций
         * @param {(CSSAnimation|ClassicAnimation)} animation
         * @private
         * @return {number} индекс группы в overrideRegistry.data, или -1, если не найдена или регистр пуст
         */
        search: function (animation) {
            var element = animation.getElement();
            var groupIndex;

            groupIndex = -1;

            if (this.data.length) {
                groupIndex = LinearSearch(this.data, function (animationsGroup) {
                    // т.к. анимации сгруппированы по анимируемым элементам, то
                    // для поиска группы достаточно сравнить с первой попавшейся
                    return animationsGroup[0].getElement() === element;
                });
                if (ENABLE_DEBUG && groupIndex === -1) {
                    console.log('overrideRegistry.search: animation "' + animation.toString() + '" is not found in the override registry!');
                }
            } else if (ENABLE_DEBUG) {
                console.log('overrideRegistry.search:  override registry is empty');
            }

            return groupIndex;
        },

        /**
         * Добавление анимации в регистр
         * @param {(CSSAnimation|ClassicAnimation)} animation
         */
        add: function (animation) {
            var groupIndex, group;

            groupIndex = this.search(animation);

            if (groupIndex === -1) {
                group = [];
                this.data.push(group);
                if (ENABLE_DEBUG) {
                    console.log('overrideRegistry.add: created new animation group. groups length is "' + this.data.length + '"');
                }
            } else {
                group = this.data[groupIndex];
            }

            group.push(animation);

            if (ENABLE_DEBUG) {
                console.log('overrideRegistry.add: animation "' + animation.toString() + '" added to override registry');
            }
        },

        /**
         * Удаление анимации из регистра
         * @param {(CSSAnimation|ClassicAnimation)} animation
         */
        remove: function (animation) {
            var groupIndex, group, animationIndex;

            groupIndex = this.search(animation);

            if (groupIndex !== -1) {

                group = this.data[groupIndex];

                animationIndex = LinearSearch(group, function (anim) {
                    return anim === animation;
                });

                if (animationIndex !== -1) {

                    // просто удаляем её из списка перезаписей
                    group.splice(animationIndex, 1);

                    // пустая и ненужная группа
                    if (group.length === 0) {
                        this.data.splice(groupIndex, 1);
                    }

                    if (ENABLE_DEBUG) {
                        console.log('overrideRegistry.remove: animation "' + animation.toString() + '" is removed from override registry successfully.');
                    }

                } else if (ENABLE_DEBUG) {
                    // по идее, никогда не исполнился. но на всякий пожарный...
                    console.log('overrideRegistry.remove: animation "' + animation.toString() + '" is not found in the group!');
                }

            } else if (ENABLE_DEBUG) {
                // по идее, никогда не исполнился. но на всякий пожарный...
                console.log('overrideRegistry.remove:  animation is not found in the registry or registry is empty; nothing to remove');
            }

        },

        /**
         * Пересоздаст запись анимации в регистр
         * @param {(CSSAnimation|ClassicAnimation)} animation
         */
        update: function (animation) {
            this.remove(animation);
            this.add(animation);
        },

        /**
         * Проверит, перезаписано ли свойство для анимации
         * @param {(CSSAnimation|ClassicAnimation)} animation
         * @param {string} propertyName
         * @return {boolean}
         */
        isOverridden: function (animation, propertyName) {
            var groupIndex, group, isOverridden;
            var i;

            groupIndex = this.search(animation);
            isOverridden = false;

            if (groupIndex !== -1) {
                group = this.data[groupIndex];
                for (i = group.length - 1; i && !isOverridden; i -= 1) {
                    isOverridden = group[i].isPropSetted(propertyName) && group[i].toString() !== animation.toString();
                }
            } else if (ENABLE_DEBUG) {
                console.log('overrideRegistry.isOverridden: cannot check property override');
            }

            return isOverridden;
        }
    };

    /**
     * Конструктор ключевых кадров.
     * @constructor
     */
    function Keyframe () {

    }

    /**
     * Прогресс, к которому относится ключевой кадр (в процентах; целочисленное)
     * @type {number}
     */
    Keyframe.prototype.key = 0;

    /**
     * Значение свойства для этого ключевого кадра.
     * @type {*}
     */
    Keyframe.prototype.value = null;

    /**
     * Конструктор коллекции ключевых кадров
     * @constructor
     */
    function Keyframes () {
        this.keyframes = {};
    }

    /**
     * Массив ключевых кадров
     * @type {Object}
     * @private
     */
    Keyframes.prototype.keyframes = null;

    /**
     * Попытается найти в коллеции ключевых кадров для свойства нужный с указанной позицией
     * @param {string} propertyName
     * @param {number} position
     * @return {Keyframe?}
     */
    Keyframes.prototype.lookupKeyframe = function (propertyName, position) {
        var keyframes, keyframeIndex;

        if (propertyName in this.keyframes) {
            keyframes = this.keyframes[ propertyName ];
            keyframeIndex = binarySearch(keyframes, position, function (desiredKey, currentKeyframe) {
                return compareNumbers(desiredKey, currentKeyframe.key);
            });
            if (keyframeIndex !== -1) {
                return keyframes[keyframeIndex];
            }
        }

        return undefined;
    };

    /**
     * Добавит ключевой кадр для свойства на указанной позиции и вернёт его
     * @param {string} propertyName
     * @param {number} position
     * @return {Keyframe}
     */
    Keyframes.prototype.addKeyframe = function (propertyName, position) {
        var propertyKeyframes, keyframe;
        var startingKeyframe, endingKeyframe;

        if (!(propertyName in this.keyframes)) {
            this.keyframes[propertyName] = [  ];
            if (position !== keyAliases["from"]) {
                startingKeyframe = new Keyframe();
                startingKeyframe.key = keyAliases["from"];
                startingKeyframe.value = SPECIAL_VALUE;
                this.keyframes[propertyName].push(startingKeyframe);
            }
            if (position !== keyAliases["to"]) {
                endingKeyframe = new Keyframe();
                endingKeyframe.key = keyAliases["to"];
                endingKeyframe.value = SPECIAL_VALUE;
                this.keyframes[propertyName].push(endingKeyframe);
            }
        }

        propertyKeyframes = this.keyframes[propertyName];
        keyframe = new Keyframe();
        keyframe.key = position;
        propertyKeyframes.push(keyframe);
        bubbleSort(propertyKeyframes, function (current, next) {
            return current.key - next.key;
        });

        return keyframe;
    };

    /**
     * Найдёт ключевой кадр для свойства на указанной позиции,
     * или создаст его, если он не существует.
     * @param {string} propertyName
     * @param {number} position
     * @return {Keyframe}
     */
    Keyframes.prototype.findKeyframe = function (propertyName, position) {
        var keyframe = this.lookupKeyframe(propertyName, position);

        if (!keyframe) {
            keyframe = this.addKeyframe(propertyName, position);
        }

        return /** @type {Keyframe} */(keyframe);
    };

    /**
     * Установка значения свойства при указанном прогрессе
     * Для установки смягчения при прогрессе используется метод easing
     * @param {string} propertyName имя свойства
     * @param {string} propertyValue значение свойства
     * @param {(number|string)=} position численное представление позиции; в процентах.
     */
    Keyframes.prototype.propAt = function (propertyName, propertyValue, position) {
        var keyframe, key;

        if (typeOf.string(propertyName)) {
            if (typeOf.number(position)) {

                keyframe = this.findKeyframe(propertyName, position);
                keyframe.value = propertyValue;

            } else if (ENABLE_DEBUG) {
                console.log('Keyframes.propAt: passed keyframe key "' + position + '" is invalid');
            }
        } else if (ENABLE_DEBUG) {
            console.log('Keyframes.propAt: INVALID passed property name "' + propertyName + '"');
        }
    };

    /**
     * Имя свойства для смягчения
     * @type {string}
     */
    Keyframes.prototype.easingProperty = "timing-function";

    /**
     * Установка смягчения при прогрессе
     * @param timingFunction
     * @param position
     * @returns {*}
     */
    Keyframes.prototype.easing = function (timingFunction, position) {
        return this.propAt(this.easingProperty, timingFunction, position);
    };

    /**
     * Получение значения свойства при указанном прогрессе
     * @param {string} propertyName
     * @param {number} position прогресс в процентах
     */
    Keyframes.prototype.retrieveValue = function (propertyName, position) {
        var keyframes, keyframeIndex;
        var firstKeyframe, secondKeyframe;
        if (propertyName in this.keyframes) {
            keyframes = this.keyframes[propertyName];
            keyframeIndex = binarySearch(keyframes, position, function (desiredKey, currentKeyframe, index, keyframes) {
                var secondKeyframe = keyframes[ index + 1];
                // для навигации в бинарном поиске
                var MOVE_RIGHT = 1, MOVE_LEFT = -1, STOP = 0;

                if (!secondKeyframe) return MOVE_LEFT;
                if (currentKeyframe.key > desiredKey) return MOVE_LEFT;
                if (secondKeyframe.key < desiredKey) return MOVE_RIGHT;

                return STOP;
            });
            if (keyframeIndex !== -1) {
                firstKeyframe = keyframes[ keyframeIndex ];
                secondKeyframe = keyframes[ keyframeIndex + 1 ];
                return [ firstKeyframe, secondKeyframe ];
            }
        }
        return undefined;
    };

    /**
     * Получение смягчения при прогрессе
     * @param {number} position прогресс в процентах
     */
    Keyframes.prototype.retrieveEasing = function (position) {
        var keyframes = this.retrieveValue(this.easingProperty, position);
        var firstKeyframe;
        if (keyframes) {
            firstKeyframe = keyframes[0];
            if (firstKeyframe) {
                return firstKeyframe.value;
            }
        }
        return undefined;
    };

    /**
     * Проверка на то, установлено ли значение свойства при указанном прогрессе
     * @param {string} propertyName
     * @param {number=} position прогресс в процентах
     * @returns {boolean}
     */
    Keyframes.prototype.isSetted = function (propertyName, position) {
        var registered = propertyName in this.keyframes;

        if (typeOf.number(position) && registered) {
            return toBool(this.lookupKeyframe(propertyName, position));
        }

        return registered;
    };

    /**
     * Пройдётся по всем свойствам и ключевым кадрам
     * @param {function(string, *, number)} callback функция обратного вызова
     * @param {Object} context контекст исполнения
     */
    Keyframes.prototype.forEach = function (callback, context) {
        context = typeOf.object(context) ? context : this;
        each(this.keyframes, function (keyframes, propertyName) {
            each(keyframes, function (keyframe) {
                return callback.call(context, propertyName, keyframe.value, keyframe.key);
            }, this);
        }, this);
    };

    /**
     * Конструктор массива кеша для смягчения
     * @type {Function}
     * @constructor
     */
    var EasingCache = typeOf.undefined(window.Float64Array) ? Array:Float64Array;

    /**
     * Конструктор смягчений
     * Родительский класс для всех смягчений
     * @constructor
     */
    function Easing () {
        this.cache = new EasingCache(pow(10, ROUND_DIGITS_EASING) + 1);
        this.id = generateId();
    }

    /**
     * Кэш для вычисленных значений
     * @type {Array}
     * @private
     */
    Easing.prototype.cache = null;

    /**
     * Вычисление значения временной функции в момент времени t
     * Проксирует метод solve.
     * Все вычисления кешируются.
     */
    Easing.prototype.compute = function (fractionalTime) {
        var fraction;
        fractionalTime = round(fractionalTime, ROUND_DIGITS_EASING);
        fraction = floor(fractionalTime * pow(10, ROUND_DIGITS_EASING));
        if (fraction in this.cache && this.cache[ fraction ] !== 0) {
            return this.cache[ fraction ];
        } else {
            this.cache[ fraction ] = round(this.solve(fractionalTime), ROUND_DIGITS_EASING);
            return this.cache[ fraction ];
        }
    };

    /**
     * Сама функция вычисления значения временной функции.
     * @param t
     */
    Easing.prototype.solve = noop;

    /**
     * Идентификатор смягчения
     * Для кеширования
     * @type {string}
     */
    Easing.prototype.id = "";

    /**
     * Проверка временных функций на сходство
     * @param {Easing} easing
     * @return {boolean}
     */
    Easing.prototype.equals = function (easing) {
        return this.solve === easing.solve;
    };

    var EasingRegistry = {

        /**
         * Обработать временную функцию с содержанием : строка временной функции CSS или алиас.
         * @param {string} timingFunction
         * @return {Array} аргументы к временной функции
         */
        parse: function (timingFunction) {
            var trimmed, camelCased, reg, matched, args;
            var easing;

            args = [];

            if (ENABLE_DEBUG && !typeOf.string(timingFunction)) {
                console.log('easingRegistry.parse: passed timingFunction has different from "string" type "' + typeOf(timingFunction) + '"');
            }

            timingFunction = typeOf.string(timingFunction) ? timingFunction : toString(timingFunction);

            trimmed = trim(timingFunction);
            camelCased = camelCase(trimmed);

            if (camelCased in cubicBezierAliases) {
                args = cubicBezierAliases[ camelCased ];
            } else {
                // строка временной функции css
                if (cubicBezierReg.test(trimmed)) {
                    reg = cubicBezierReg;
                } else if (stepsReg.test(trimmed)) {
                    reg = stepsReg;
                }

                if (reg) {
                    // строка аргументов к временной функции. разделены запятой
                    matched = trimmed.match(reg)[1];
                    args = matched.split(TIMINGFUNCTION_SEPARATOR);
                } else if (ENABLE_DEBUG) {
                    console.log('easingRegistry.parse: can\'t parse passed timing function string "' + timingFunction + '"');
                }
            }

            return args;
        },

        /**
         * Создаст функцию смягчения с указанными аргументами
         * 4 аргумента - кубическая кривая Безье
         * 1 или 2 аргумента - лестничная функция
         * @param {Array} args
         */
        build: function (args) {
            var numericArgs, timingFunction;
            var stepsAmount, countFromStart;

            timingFunction = noop;

            switch (args.length) {
                case 4:
                    // CUBIC BEZIER
                    numericArgs = map(args, parseFloat);
                    // абсциссы точек должны лежать в [0, 1], ординаты не ограничены.
                    if (inRange(numericArgs[0], 0, 1, true) && inRange(numericArgs[2], 0, 1, true)) {
                        timingFunction = new CubicBezier(args[0], args[1], args[2], args[3]);
                    }
                    break;
                case 1:
                case 2:
                    // STEPS
                    // 2 аргумента - лестничная функция
                    // 1 аргумент - лестничная функция с пропущенным указателем на старт\конец
                    stepsAmount = parseInt(args[0], 10);
                    countFromStart = args[1] === STEPS_START;
                    if (typeOf.number(stepsAmount)) {
                        timingFunction = new Steps(stepsAmount, countFromStart);
                    }
                    break;
                default:
                    if (ENABLE_DEBUG) {
                        console.log('EasingRegistry.build: unknown arguments length "'+ args.length +'"');
                    }
            }

            return timingFunction;
        },

        /**
         * Запросить у регистра временную функцию
         * Аргумент - алиас/временная функция CSS/аргументы к временной функции CSS/JS функция
         * @type {(string|Array|Function)}
         * @return {Easing}
         */
        request: function (contain) {
            var args, timingFunction;

            if (instanceOf(contain, Easing)) {
                timingFunction = contain;
            } else if (typeOf.func(contain)) {
                timingFunction = new Easing();
                timingFunction.solve = timingFunction;
            } else {
                if (typeOf.string(contain)) {
                    args = this.parse(contain);
                }
                if (typeOf.array(args)) {
                    timingFunction = this.build(args);
                }
            }

            if (!this.contains(timingFunction)) {
                this.add(timingFunction);
            }

            return timingFunction;
        },

        /**
         * Сам регистр временных функций
         * @type {Object.<string, Easing>}
         * @private
         */
        data: {},

        /**
         * Добавление временной функции в регистр
         * @param {Easing} easing
         */
        add: function (easing) {
            if (!this.contains(easing)) {
                this.data[ easing.id ] = easing;
            }
            if (ENABLE_DEBUG) {
                console.log('EasingRegistry.add: adding new easing with id "' + easing.id + '" in the registry');
            }
        },

        /**
         * Удаление временной функции из регистра
         * @param {Easing} easing
         */
        remove: function (easing) {
            if (this.contains(easing)) {
                delete this.data[ easing.id ];
            }
            if (ENABLE_DEBUG) {
                console.log('EasingRegistry.remove: removing easing with id "' + easing.id + '" from the registry');
            }
        },

        /**
         * Проверка на существование записи о временной функции в регистре
         * @param {Easing} easing
         * @return {boolean}
         */
        contains: function (easing) {
            var contains;

            // смягчение было зарегистрировано в регистре
            contains = easing.id in this.data;

            if (!contains) {
                // проверяем по содержанию
                each(this.data, function (timingFunction) {
                    contains = easing.equals(timingFunction);
                    return !contains;
                });
            }

            return contains;
        }
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

        // родительский конструктор
        Easing.call(this);

        this.p1x = p1x;
        this.p1y = p1y;
        this.p2x = p2x;
        this.p2y = p2y;
    }

    CubicBezier.prototype = new Easing();

    /**
     * Вернёт значение кривой при переданном t и точках p1, p2.
     * @param {number} t
     * @param {number} p1
     * @param {number} p2
     * @return {number}
     * @private
     */
    CubicBezier.prototype.B = function (p1, p2, t) {
        // (3*t * (1 - t)^2) * P1  + (3*t^2 *  (1 - t) )* P2 + (t^3);

        var B1 = 3 * t * (1 - t) * (1 - t);
        var B2 = 3 * t * t * (1 - t);
        var B3 = t * t * t;

        return B1 * p1 + B2 * p2 + B3;
    };

    /**
     * Вернёт значение кривой в координатах x,t при переданном t.
     * @param {number} t
     * @return {number}
     * @private
     */
    CubicBezier.prototype.B_absciss = function (t) {
        return this.B(this.p1x, this.p2x, t);
    };

    /**
     * Вернёт значение производной первого порядка в координатах x,t при переданном времени t.
     * @param {number} t
     * @return {number}
     * @private
     */
    CubicBezier.prototype.B_derivative_I_absciss = function (t) {
        var B1d = 9 * t * t - 12 * t + 3;
        var B2d = 6 * t - 9 * t * t;
        var B3d = 3 * t * t;

        return B1d * this.p1x + B2d * this.p2x + B3d;
    };

    /**
     * Вернёт значение кривой в координатах y,t при переданном времени t.
     * @param {number} t
     * @return {number}
     * @private
     */
    CubicBezier.prototype.B_ordinate = function (t) {
        return this.B(this.p1y, this.p2y, t);
    };

    /**
     * Вычислит значение ординаты (Y) кубической кривой при известной абсциссе (X)
     * @override
     * @param {number} y
     * @return {number}
     */
    CubicBezier.prototype.solve = function (y) {

        // небольшой трюк - нет смысла считать значение в опорных точках.
        if (y === 0) {
            return 0;
        } else if (y === this.p1x) {
            return this.p1y;
        } else if (y === this.p2x) {
            return this.p2x;
        } else if (y === 1.0) {
            return 1.0;
        }

        var self = this;

        var t;

        var X0 = y, X1;
        var epsilon = pow(10, - ROUND_DIGITS_EASING);
        var i = 16; // вообще и пяти достаточно
        var F;

        // усовершенствованный метод Ньютона
        // обычно проходит в 1-2 итерации при точности 0.001
        while (i--) {
            F = this.B_absciss(X0) - y;
            X1 = X0 -  F / this.B_derivative_I_absciss( X0 - F / ( 2 * this.B_derivative_I_absciss(X0)) );
            if (Math.abs(this.B_absciss(X1) - y) <= epsilon) {
                break;
            }
            X0 = X1;
        }

        t = X1;

        return this.B_ordinate(t);
    };

    /**
     * Проверка двух кубических кривых на сходство
     * @param {CubicBezier} easing
     * @return {boolean}
     * @override
     */
    CubicBezier.prototype.equals = function (easing) {

        if (!instanceOf(easing, CubicBezier)) {
            return false;
        }

        var isFirstAbscissEquals = this.p1x === easing.p1x;
        var isFirstOrdinateEquals = this.p1y === easing.p1y;
        var isSecondAbscissEquals = this.p2x === easing.p2x;
        var isSecondOrdinateEquals = this.p2y === easing.p2y;

        return isFirstAbscissEquals && isFirstOrdinateEquals && isSecondAbscissEquals && isSecondOrdinateEquals;
    };

    /**
     * Ступенчатая функция, ограничивающая область выходных значений до определенного числа.
     * Ступени отсчитываются с конца, или с начала.
     * @param {number} stepsAmount Количество ступеней
     * @param {boolean} countFromStart Отсчитывать с начала (true) или с конца (false).
     * @constructor
     * @extends Easing
     */
    function Steps(stepsAmount, countFromStart) {

        Easing.call(this);

        // количество ступеней - строго целочисленное
        this.stepsAmount = stepsAmount | 0;
        this.countFromStart = countFromStart;
    }

    Steps.prototype = new Easing();

    /**
     * Число ступеней
     * @type {number}
     * @private
     */
    Steps.prototype.stepsAmount = 0;

    /**
     * Отсчитывать ли ступени с конца (false) или с начала (true)
     * @type {boolean}
     * @private
     */
    Steps.prototype.countFromStart = true;

    /**
     * Вернёт значение ординаты ступенчатой функции при известной абсциссе x.
     * @override
     * @param {number} x
     * @return {number}
     */
    Steps.prototype.solve = function (x) {
        if (this.countFromStart) {
            return min(1.0, ceil(this.stepsAmount * x) / this.stepsAmount);
        } else {
            return floor(this.stepsAmount * x) / this.stepsAmount;
        }
    };

    /**
     * Проверка двух лестничных функций на сходство
     * @param {Steps} easing
     * @return {boolean}
     * @override
     */
    Steps.prototype.equals = function (easing) {
        if (!instanceOf(easing, Steps)) {
            return false;
        }

        var isAmountEquals = this.stepsAmount === easing.stepsAmount;
        var isCountSourceEquals = this.countFromStart === easing.countFromStart;

        return isAmountEquals && isCountSourceEquals;
    };