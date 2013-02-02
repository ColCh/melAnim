/*! melAnim - v0.1.0 - 2013-02-02
* Copyright (c) 2013 ColCh; Licensed MIT */


	/*---------------------------------------*/

(function (window) {
	"use strict";


	/*---------------------------------------*/

    var

        /**
         * Префикс к разным строкам, которые не могут начинаться с числа
         * @type {string}
         * @const
         * */
        mel = "melAnimation",

        /**
         * Шорткат для document
         * @type {Document}
         * @const
         * */
        document = window.document,

        /**
         * Правильная undefined.
         * @type {undefined}
         * @const
         */
        undefined,

        /**
         * Разрешить ли вывод отладочных сообщений
         * @type {boolean}
         * @const
         */
        ENABLE_DEBUG = true,

        /**
         * Шорткат для объекта отладочного вывода
         * @inheritDoc
         */
        console = window.console,

        /**
         * Стиль, где можно смотреть CSS-свойства
         * @type {CSSStyleDeclaration}
         * @const
         */
        dummy = document.documentElement.style,

        /**
         * Вендорный префикс к текущему браузеру
         * @type {string}
         */
        prefix,

        /**
         * Вендорный префикс к текущему браузеру в нижнем регистре
         * @type {string}
         */
        lowPrefix,

        /**
         * Регвыр для выделения численного значения и размерности у значений CSS свойств
         * @type {RegExp}
         * @const
         */
        cssNumericValueReg = /(-?\d*\.?\d+)(.*)/,

        /**
         * Инкремент для генерации уникальной строки
         * @type {number}
         */
        animCount = 0,

        /**
         * Пустая функция
         * @const
         */
        noop = function () {},

        /**
         * Регвыр для временной функции CSS кубической кривой Безье
         * @type {RegExp}
         * @const
         */
        cubicBezierReg = /^cubic-bezier\(((?:\s*\d*\.?\d+\s*,\s*){3}\d*\.?\d+\s*)\)$/i,

        /**
         * Регвыр для временной функции CSS лестничной функции
         * @type {RegExp}
         * @const
         */
        stepsReg = /^steps\((\d+(?:,\s*(?:start|end))?)\)$/i,

        /**
         * Свой тег <style> для возможности CSS3 анимаций
         * Используется так же в анимации на JavaScript для ускорения.
         * @type {HTMLStyleElement}
         * @const
         */
        style = document.getElementsByTagName("head")[0].parentNode.appendChild(document.createElement("style")),

        /**
         * Каскадная таблица из тега <style>
         * @type {CSSStyleSheet}
         * @const
         */
        stylesheet = style.sheet || style.styleSheet;


	/*---------------------------------------*/

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
        return "nodeType" in x && x.nodeType === Node.ELEMENT_NODE;
    };

    /**
     * Проверит, является ли аргумент функцией.
     *
     * @param {*} x
     * @return {boolean}
     */
    typeOf.func = function (x) {
        return instanceOf(x, Function) || typeOf(x) === "function";
    };

    /**
     * Проверит, является ли аргумент массивом
     * @param x
     * @return {boolean}
     */
    typeOf.array = function (x) {
        return instanceOf(x, Array) || typeOf(x) === "array";
    };

    /**
     * Проверит, является ли значение аргумента undefined.
     * @param x
     * @return {boolean}
     */
    typeOf.undefined = function (x) {
        return x === undefined || typeOf(x) === "undefined";
    };

    /**
     * Проверит, является ли аргумент числом
     * @param {*} x
     * @return {Boolean}
     */
    typeOf.number = function (x) {
        return instanceOf(x, Number) || typeOf(x) === "number";
    };

    /**
     * Проверит, является ли аргумент строковым значением
     * @param x
     * @return {Boolean}
     */
    typeOf.string = function (x) {
        return instanceOf(x, String) || typeOf(x) === "string";
    };

    /**
     * Проверит, является ли аргумент объектом
     * @param {*} x
     * @return {Boolean}
     */
    typeOf.object = function (x) {
        return instanceOf(x, Object) || typeOf(x) === "object";
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
     * Аналог Object.keys
     * @param {Object} obj
     */
    function getKeys(obj) {
        return map(obj, function (value, index) {
            return index;
        });
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
     * Классический шаблон итератора
     * @param {Array} collection
     * @constructor
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
     * @param {Array} arr массив
     * @param {(Function|*)} val Значение (или функция сравнения; должна вернуть 0 при равенстве)
     */
    function LinearSearch(arr, val) {

        var callable = typeOf.func(val),
            index, i, m, curr,
            native = Array.prototype.indexOf,
            EQUALS = true, NOT_FOUND = -1;

        index = NOT_FOUND;

        if (!callable && native) {
            index = native.call(arr, val);
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
    function toString(x) {
        return x + "";
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
     * Найдёт корень уравнения вида f(x)=val с указанной точностью итерационным способом
     * Если не указать сжимающее отображение, то будет использован метод хорд
     * @param {Function} F уравнение
     * @param {number} Y значение уравнения в искомой точке
     * @param {number} X0 начальное приближение (или значение уравнения)
     * @param {number} X1 след. приближение
     * @param {number} epsilon минимальная разница между двумя приближениями (или 10^-6)
     * @param {Function} derivative производная функции F (для метода касательных)
     * @return {number} приближённое значение корня уравнения
     */
    function findEquationRoot(F, Y, X0, X1, epsilon, derivative) {

        var F1, F0, DELTA_X, DELTA_F, X0d;
        /**
         * Значение погрешности по умолчанию
         * @type {number}
         * @const
         */
        var DEFAULT_EPSILON = 1e-6;
        var i, stopCondition, contraction, cache;
        var savedX0, savedX1, deriv;

        epsilon = typeOf.number(epsilon) ? epsilon : DEFAULT_EPSILON;
        stopCondition = function (X0, X1) { return Math.abs(X0 - X1) <= epsilon; };

        // сохраним для метода хорд
        savedX0 = X0;
        savedX1 = X1;

        // для начала пробуем метод касательных (метод Ньютона), у которого
        // больше скорость сходимости, чем у метода хорд
        X0 = Y;
        // используем метод одной касательной
        X0d = derivative(X0);

        // ограничим количество итераций метода касательных
        i = 8;

        while (i-->0) {

            X1 = X0 - ( (F(X0) - Y ) / X0d );

            if (stopCondition(F(X1), Y)) {
                return X1;
            }

            X0 = X1;
        }

        // теперь пробуем метод хорд
        // без ограничений по количеству итераций
        X0 = savedX0;
        X1 = savedX1;

        while (!stopCondition(X0, X1)) {
            F1 = F(X1) - Y;
            F0 = F(X0) - Y;

            DELTA_X = X1 - X0;
            DELTA_F = F1 - F0;

            cache = X1;
            X1 = X1 - F1 * DELTA_X / DELTA_F;
            X0 = cache;
        }

        return X1;
    }

    /**
     * Представление кубической кривой Безье для смягчения анимации
     * Считается, что P0 = (0;0) и P3 = (1;1)
     * @param {number} p1x
     * @param {number} p1y
     * @param {number} p2x
     * @param {number} p2y
     * @constructor
     */
    function CubicBezier (p1x, p1y, p2x, p2y) {
        // Кривая записана в полиноминальной форме
        this.cx = 3.0 * p1x;
        this.bx = 3.0 * (p2x - p1x) - this.cx;
        this.ax = 1.0 - this.cx - this.bx;

        this.cy = 3.0 * p1y;
        this.by = 3.0 * (p2y - p1y) - this.cy;
        this.ay = 1.0 - this.cy - this.by;
    }

    /**
     * Вернёт значение кривой в координатах x,t при переданном t.
     * @param {number} t
     * @return {number}
     * @private
     */
    CubicBezier.prototype.B_absciss = function (t) {
        return ((this.ax * t + this.bx) * t + this.cx) * t;
    };

    /**
     * Вернёт значение производной в координатах x,t при переданном времени t.
     * @param {number} t
     * @return {number}
     * @private
     */
    CubicBezier.prototype.B_derivative_absciss = function (t) {
        return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
    };

    /**
     * Вернёт значение кривой в координатах y,t при переданном времени t.
     * @param {number} t
     * @return {number}
     * @private
     */
    CubicBezier.prototype.B_ordinate = function (t) {
        return ((this.ay * t + this.by) * t + this.cy) * t;
    };

    /**
     * Вычислит значение ординаты (Y) кубической кривой при известной абсциссе (X)
     * @param {number} x
     * @return {number}
     */
    CubicBezier.prototype.calc = function (x) {

        var B_bindedToX = bind(this.B_absciss, this);
        var derivative_X = bind(this.B_derivative_absciss, this);

        var t = findEquationRoot(B_bindedToX, x, 0, 1, 1e-5, derivative_X);

        var y = this.B_ordinate(t);

        return y;
    };

    /**
     * Ступенчатая функция, ограничивающая область выходных значений до определенного числа.
     * Ступени отсчитываются с конца, или с начала.
     * @param {number} stepsAmount Количество ступеней
     * @param {boolean} countFromStart Отсчитывать с начала (true) или с конца (false).
     * @constructor
     */
    function Steps(stepsAmount, countFromStart) {
        // количество ступеней - строго целочисленное
        this.stepsAmount = stepsAmount | 0;
        this.countFromStart = countFromStart;
    }

    /**
     * Количество ступеней
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
     * @param {number} x
     * @return {number}
     */
    Steps.prototype.calc = function (x) {
        if (this.countFromStart) {
            return min(1.0, ceil(this.stepsAmount * x) / this.stepsAmount);
        } else {
            return floor(this.stepsAmount * x) / this.stepsAmount;
        }
    };

    /**
     * Вернёт вычисленный стиль элемента
     * @param {Element} element
     * @return {CSSStyleDeclaration}
     */
    function getComputedStyle(element) {
        return window.getComputedStyle ? window.getComputedStyle(element, null) : element.currentStyle;
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
     * @param {Element} elem
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
                    stringValue = getComputedStyle(/** @type {HTMLElement} */(element))[vendorizedPropertyName];
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
    };

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
    }

    /**
     * Вычисление значения между двумя точками
     * для анимируемого свойства
     * @param {string} propertyName Имя свойства
     * @param {(Array|number)} from Значение меньшей точки
     * @param {(Array|number)} to Значение большей точки
     * @param {number} digits точность значения в количестве знакв после запятой
     * @param {number} timingFunctionValue Значение прогресса между ними
     * @return {number|Array} Вычисленное значение
     */
    function blend(propertyName, from, to, timingFunctionValue, digits) {

        /** @type {(Array|number)} */
        var value;

        if (propertyName in blend.hooks) {
            value = blend.hooks[propertyName](from, to, timingFunctionValue, digits);
        } else {
            value = /** @type {number} */ ((to - from) * timingFunctionValue + from);
            value = round(value, digits);
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

	/*---------------------------------------*/

var DIRECTION_NORMAL = "normal";
    /**
     * Обратное направление анимации:
     * каждую итерацию ключевые кадры проходятся начиная от последнего и кончая первым
     * @type {string}
     * @const
     */
    var DIRECTION_REVERSE = "reverse";
    /**
     * Альтернативное направление анимации:
     * при чётном номере текущей итерации ключевые кадра проходятся, как при обычном направлении,
     * а при нечётной итерации - проходятся в обратном направлении
     * @type {string}
     * @const
     */
    var DIRECTION_ALTERNATE = "alternate";
    /**
     * Обратное альтернативное направление анимации:
     * при чётном номере текущей итерации ключевые кадра проходятся, как при обратном направлении,
     * а при нечётной итерации - проходятся в обычном направлении
     * @type {string}
     * @const
     */
    var DIRECTION_ALTERNATE_REVERSE = "alternate-reverse";

    /**
     * Перенос свойств:
     * значения свойств не будут отрисовываться
     * перед началом анимации (при отложенном запуске)
     * и после анимации
     * @type {string}
     * @const
     */
    var FILLMODE_NONE = "none";
    /**
     * Перенос свойств:
     * значения свойств не будут отрисовываться
     * перед началом анимации (при отложенном запуске)
     * , но после её окончания будут
     * @type {string}
     * @const
     */
    var FILLMODE_FORWARDS = "forwards";
    /**
     * Перенос свойств:
     * значения свойств будут отрисовываться
     * перед началом анимации (при отложенном запуске)
     * , но после анимации не будут
     * @type {string}
     * @const
     */
    var FILLMODE_BACKWARDS = "backwards";
    /**
     * Перенос свойств:
     * значения свойств будут отрисовываться
     * перед началом анимации (при отложенном запуске)
     * и после её окончания
     * @type {string}
     * @const
     */
    var FILLMODE_BOTH = "both";

    /**
     * Состояние анимации: работает, т.е. элемент(-ы) анимируются
     * @type {string}
     * @const
     */
    var PLAYSTATE_RUNNING = "running";
    /**
     * Состояние анимации: приостановлена
     * @type {string}
     * @const
     */
    var PLAYSTATE_PAUSED = "paused";

    /**
     * Специальное значение для количества итераций - "безконечно"
     * @type {string}
     * @const
     */
    var ITERATIONCOUNT_INFINITE = "infinite";

    /**
     * Поддерживаются ли CSS3 анимации текущим браузером.
     * @type {boolean}
     * @const
     */
    var CSSANIMATIONS_SUPPORTED = !!getVendorPropName("animation");

    /**
     * Идеальное количество кадров для анимации на JavaScript.
     * @type {number}
     * @const
     */
    var FRAMES_PER_SECOND = 60;

    /**
     * Число-предел, ограничивающее обычные отметки времени от Date.now и новые высокочувствительные таймеры
     * @type {number}
     * @const
     */
    var HIGHRESOLUTION_TIMER_BOUND = 1e12;

	/*---------------------------------------*/

var aliases = {};

    /**
     * Алиасы для значений ключевых кадров
     * @enum {number}
     */
    var keyAliases = {
        "from": 0,
        "to": 100
    };

    /**
     * Алиасы для временных функций
     * @enum {Object}
     */
    var easingAliases = {};

    /**
     * Временные функции для CSS3 анимаций
     * @enum {Array}
     */
    var cubicBezierAliases = {

        // встроенные
        "linear": [0.0, 0.0, 1.0, 1.0],
        "ease": [0.25, 0.1, 0.25, 1.0],
        "easeIn": [0.42, 0, 1.0, 1.0],
        "easeOut": [0, 0, 0.58, 1.0],
        "easeInOut": [0.42, 0, 0.58, 1.0],
        "stepStart": [1, true],
        "stepEnd": [1, false],

        // дополненные
        "swing": [0.02, 0.01, 0.47, 1]//,

        /*
        // взято с
        // github.com/matthewlein/Ceaser
        "easeInCubic":[0.55, .055, .675, .19],
        "easeOutCubic":[0.215, 0.61, 0.355, 1],
        "easeInOutCubic":[0.645, 0.045, 0.355, 1],

        "easeInCirc":[0.6, 0.04, 0.98, 0.335],
        "easeOutCirc":[0.075, 0.82, 0.165, 1],
        "easeInOutCirc":[0.785, 0.135, 0.15, 0.86],

        "easeInExpo":[0.95, 0.05, 0.795, 0.035],
        "easeOutExpo":[0.19, 1, 0.22, 1],
        "easeInOutExpo":[1, 0, 0, 1],

        "easeInQuad":[0.55, 0.085, 0.68, 0.53],
        "easeOutQuad":[0.25, 0.46, 0.45, 0.94],
        "easeInOutQuad":[0.455, 0.03, 0.515, 0.955],

        "easeInQuart":[0.895, 0.03, 0.685, 0.22],
        "easeOutQuart":[0.165, 0.84, 0.44, 1],
        "easeInOutQuart":[0.77, 0, 0.175, 1],

        "easeInQuint":[0.755, 0.05, 0.855, 0.06],
        "easeOutQuint":[0.23, 1, 0.32, 1],
        "easeInOutQuint":[0.86, 0, 0.07, 1],

        "easeInSine":[0.47, 0, 0.745, 0.715],
        "easeOutSine":[0.39, 0.575, 0.565, 1],
        "easeInOutSine":[0.445, 0.05, 0.55, 0.95],

        "easeInBack":[0.6, -0.28, 0.735, 0.045],
        "easeOutBack":[0.175, 0.885, 0.32, 1.275],
        "easeInOutBack":[0.68, -0.55, 0.265, 1.55],

        // взято с
        // timotheegroleau.com/Flash/experiments/easing_function_generator.htm
        "easeInElastic": [0, -1, 3, -3],
        "easeOutElastic": [4, -2, 2, 1]//,
        // TODO
        //"easeInOutElastic": [],

        // TODO
        //"easeInBounce": [],
        //"easeOutBounce": [],
        //"easeInOutBounce": []*/
    };

    /**
     * Плиближения для кубических кривых
     * @enum {Function}
     */
    var cubicBezierApproximations = {

       "linear": function (x) { return x; },

        // взято с jQuery
        "swing": function (p) {
            return 0.5 - Math.cos( p * Math.PI ) / 2;
        }/*,

        // взято с
        // Query plugin from GSGD
        /*
        easeInCubic: function (x, t, b, c, d) {
            return c*(t/=d)*t*t + b;
        },
        easeOutCubic: function (x, t, b, c, d) {
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOutCubic: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        },

        easeInCirc: function (x, t, b, c, d) {
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },
        easeOutCirc: function (x, t, b, c, d) {
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        easeInOutCirc: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        },

        easeInExpo: function (x, t, b, c, d) {
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        easeOutExpo: function (x, t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        easeInOutExpo: function (x, t, b, c, d) {
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },

        easeInQuad: function (x, t, b, c, d) {
            return c*(t/=d)*t + b;
        },
        easeOutQuad: function (x, t, b, c, d) {
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOutQuad: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        },

        easeInQuart: function (x, t, b, c, d) {
            return c*(t/=d)*t*t*t + b;
        },
        easeOutQuart: function (x, t, b, c, d) {
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOutQuart: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        },

        easeInQuint: function (x, t, b, c, d) {
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOutQuint: function (x, t, b, c, d) {
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOutQuint: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        },

        easeInSine: function (x, t, b, c, d) {
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        easeOutSine: function (x, t, b, c, d) {
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        easeInOutSine: function (x, t, b, c, d) {
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        },

        easeInBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        },

        easeInElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        easeOutElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
        },
        easeInOutElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
        }

        /*
        easeInBounce: function (x, t, b, c, d) {
            return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
        },
        easeOutBounce: function (x, t, b, c, d) {
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        easeInOutBounce: function (x, t, b, c, d) {
            if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
            return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
        }
        */
    };


	/*---------------------------------------*/

    //TODO удалить, т.к. директивы определены в animate_wrap.js
    var DEFAULT_DURATION = "400ms";
    var DEFAULT_EASING = "ease";
    var DEFAULT_FILLMODE = "forwards";
    var DEFAULT_DELAY = 0;
    var DEFAULT_DIRECTION = "normal";
    var DEFAULT_ITERATIONCOUNT = 1;
    var DEFAULT_HANDLER = noop;
    var DEFAULT_PLAYINGSTATE = "paused";

    /**
     * Количество знаков после запятой для значений
     * @type {number}
     * @const
     */
    var DEFAULT_DIGITS_ROUND = 5;
    /**
     * Имя атрибута для связывания элемента и
     * данных, связанных с ним
     * @type {string}
     * @const
     */
    var DATA_ATTR_NAME = mel + "-data-id";
    /**
     * Специальное значение свойства, указывающее
     * на то, что нужно брать запомненное исходное
     * значение свойства для элемента
     * @type {null}
     * @const
     */
    var SPECIAL_VALUE = null;
    /**
     * Для перевода из проценты в доли
     * @type {number}
     * @const
     */
    var PERCENT_TO_FRACTION = 1 / 100;
    /**
     * Максимальный прогресс по проходу, в долях
     * @const
     * */
    var MAXIMAL_PROGRESS = 1.0;
    /**
     * Разрешено ли KeyframeAnimation.prototype.fetch использовать кеш для вычислений
     * @type {boolean}
     * @const
     */
    var FETCH_USE_CACHE = false;

    function easingSearchCallback (fractionalTime, firstKeyframe, index, keyframes) {
        var secondKeyframe = keyframes[ index + 1];
        // для навигации в бинарном поиске
        var MOVE_RIGHT = 1, MOVE_LEFT = -1, STOP = 0;

        if (!secondKeyframe) return MOVE_LEFT;
        if (firstKeyframe.key > fractionalTime) return MOVE_LEFT;
        if (secondKeyframe.key <= fractionalTime) return MOVE_RIGHT;

        return STOP;
    }

    /**
     * Конструктор ключевых кадров.
     * @constructor
     * @param {number} key
     * @param {Object=} properties
     * @param {Function=} easing
     */
    function Keyframe (key, properties, easing) {
        if (typeOf.number(key)) {
            this.key = /** @type {number} */ (key);
        }
        if (typeOf.object(properties)) {
            this.properties = /** @type {Object} */ (properties);
        } else {
            this.properties = new Object();
        }
        if (typeOf.func(easing)) {
            this.easing = /** @type {Function} */(easing);
        }
    }

    /**
     * Прогресс, к которому относится ключевой кадр (в долях)
     * @type {number}
     */
    Keyframe.prototype.key = 0.00;

    /**
     * Смягчение ключевого кадра
     * @type {(Function|CubicBezier|Steps)}
     */
    Keyframe.prototype.easing = noop;

    /**
     * Значения свойств для этого ключевого кадра.
     * @type {Object}
     */
    Keyframe.prototype.properties = new Object();

    /**
     * Конструктор анимаций с ключевыми кадрами на JavaScript.
     * @constructor
     */
    function KeyframeAnimation() {
        this.targets = new Array();
        this.startingValues = new Object();
        this.currentValues = new Object();
        this.cache = new Object();
        this.animationName = generateId();
        this.keyframes = new Array();
        this.specialEasing = new Object();
        this.iterations = 1;
        this.rulesList = new Object();
        this.animatedProperties = new Object();
        // начальный и конечный ключевые кадры
        // их свойства наследуют вычисленные
        this.addKeyframe(0.0, createObject(this.animatedProperties));
        this.addKeyframe(1.0, createObject(this.animatedProperties));
        this.timer = new ReflowLooper(this.tick, this);
        return this;
    }

    /*
    *   Наследуемые свойства.
    * */

    /**
     * Время отложенного запуска, в миллисекундах
     * Значение устанавливается методом
     * @see KeyframeAnimation.delay
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.delayTime = /** @type {number} */ (parseTimeString(DEFAULT_DELAY));

    /**
     * Режим заливки свойств, устанавливается методом
     * @see KeyframeAnimation.fillMode
     * @type {string}
     * @private
     */
    KeyframeAnimation.prototype.fillingMode = DEFAULT_FILLMODE;

    /**
     * Продолжительность одного прохода, в миллисекундах
     * Значение устанавливается методом.
     * @see KeyframeAnimation.duration
     * @private
     * @type {number}
     */
    KeyframeAnimation.prototype.animationTime = /** @type {number} */ (parseTimeString(DEFAULT_DURATION));

    /**
     * Число проходов;
     * Значение устанавливается методом iterationCount.
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.iterations = parseInt(DEFAULT_ITERATIONCOUNT, 10);

    /**
     * Челосисленное число проходов;
     * Значение устанавливается методом iterationCount.
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.integralIterations = floor(DEFAULT_ITERATIONCOUNT);

    /**
     * Направление анимации.
     * Значение устанавливается методом direction.
     * @type {string}
     * @private
     */
    KeyframeAnimation.prototype.animationDirection = DEFAULT_DIRECTION;

    /**
     * Смягчение всей анимации
     * @type {(Function|CubicBezier|Steps)}
     * @private
     */
    KeyframeAnimation.prototype.smoothing = cubicBezierApproximations[ DEFAULT_EASING ];

    /**
     * Обработчик завершения анимации
     * @private
     * @type {Function}
     */
    KeyframeAnimation.prototype.oncomplete = noop;

    /**
     * Обработчик завершения прохода
     * @type {Function}
     * @private
     */
    KeyframeAnimation.prototype.oniteration = noop;

     /**
     * Функция будет выполняться на каждом тике (tick) анимации
     * @private
     * @type {Function}
     */
    KeyframeAnimation.prototype.onstep = noop;

    /**
     * Количество знаков после запятой для прогресса и свойств.
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.digits = DEFAULT_DIGITS_ROUND;

    /*
    *   Индивидуальные свойства
    * */

    /**
     * Объект с временными данными.
     * @type {Object}
     * @private
     */
    KeyframeAnimation.prototype.cache = null;

    /**
     * Объект с текущими значениями свойств
     * @type {Object.<string, Object.<string, (number|Array)>>}
     * @private
     */
    KeyframeAnimation.prototype.currentValues = null;

    /**
     * Объект со стартовыми значениями свойств
     * @type {Object.<string, Object.<string, (number|Array)>>}
     * @private
     */
    KeyframeAnimation.prototype.startingValues = null;

    /**
     * Уникальная строка - имя анимации.
     * Создаётся автоматически.
     * @type {string}
     * @private
     */
    KeyframeAnimation.prototype.animationName = "";

    /**
     * Коллекция элементов, учавствующих в анимации.
     * Заполняется сеттером "element"
     * @private
     * @type {Array.<Element>}
     */
    KeyframeAnimation.prototype.targets = null;

    /**
     * Объект с CSS-правилами, в котором будут отрисовываться свойства.
     * Ключ - ID элемента, значение - CSS правило.
     * @type {Object.<string, CSSRule>}
     */
    KeyframeAnimation.prototype.rulesList = null;

    /**
     * Отсортированный по возрастанию свойства "key" массив ключевых кадров.
     * @private
     * @typedef Array.{{key: number, properties: Object.<string, number>, easing: Function}}
     */
    KeyframeAnimation.prototype.keyframes = null;

    /**
     * Словарь, содержащий все анимируемые свойства.
     * Заполняется из метода установки значений свойств по прогрессу (propAt)
     * Нужен для первого (0%) и последнего (100%) ключевых кадров.
     * @type {Object}
     * @private
     */
    KeyframeAnimation.prototype.animatedProperties = null;

    /**
     * Объект с особыми смягчениями для свойств
     * Ключ - имя свойства, Значение - функция смягчения
     * Значения устанавливаются методом easing
     * @type {Object.<string, (Function|CubicBezier|Steps)>}
     */
    KeyframeAnimation.prototype.specialEasing = null;

    /**
     * Временная метка старта
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.started = 0;

    /**
     * Номер текущей итерации
     * @type {number}
     * @private
     * */
    KeyframeAnimation.prototype.currentIteration = 0;

    /**
     * Прошедшее со старта время
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.elapsedTime = 0;

    /**
     * Текущий прогресс по проходу
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.fractionalTime = 0.0;

    /**
     * Прогресс относительно первой итерации
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.animationProgress = 0.0;

    /**
     * Таймер отрисовки
     * @type {ReflowLooper}
     * @private
     */
    KeyframeAnimation.prototype.timer = null;

    /*
    * Публичные методы
    * */

    /**
     * Добавит элемент(-ы) в коллекцию анимируемых.
     * @param {(HTMLElement|Array.<HTMLElement>)} elem Элемент
     */
    KeyframeAnimation.prototype.element = function (elem) {
        var id, elements;
        if (typeOf.element(elem)) {
            id = generateId();
            this.rulesList[id] = addRule("." + id);
            addClass(/** @type {HTMLElement} */(elem), id);
            elem.setAttribute(DATA_ATTR_NAME, id);
            this.cache[id] = new Object();
            this.startingValues[id] = new Object();
            this.currentValues[id] = new Object();
            this.targets.push(elem);
        } else {
            elements = slice(elem);
            each(elements, this.element, this);
        }
    };

    /**
     * Установка продолжительности прохода анимации.
     * Отрицательные значения считаются за нулевое.
     * Нулевое значение соответствует мгновенному проходу анимации, при этом
     * все события (конца прохода и конца анимации) возникают так же, как и при положительной продолжительности прохода
     * и режим заполнения (fillMode) работает так же, как и при положительной продолжительности прохода
     * @param {string} duration
     */
    KeyframeAnimation.prototype.duration = function (duration) {
        var numericDuration = parseTimeString(duration);
        if (typeOf.number(numericDuration)) {
            this.animationTime = /** @type {number} */ (numericDuration);
            this.digits = floor(lg(this.animationTime * FRAMES_PER_SECOND)) - 2.0;
            if (ENABLE_DEBUG) {
                console.log('duration: computed epsilon is "' + this.digits + '" digits');
            }
        } else if (ENABLE_DEBUG) {
            console.warn('duration: bad value "'+ duration +'"');
        }
    };

    /**
     * Установка обработчика завершения анимации
     * @param {Function} callback
     */
    KeyframeAnimation.prototype.onComplete = function (callback) {
        if (typeOf.func(callback)) {
            this.oncomplete = callback;
        } else if (ENABLE_DEBUG) {
            console.warn("onComplete: callback is not a function : %o", callback);
        }
    };

    /**
     * Установка смягчения анимации при прогрессе.
     * Возможно установить особое смягчение для свойства (на протяжении всей анимации).
     *
     * Установленное смягчение будет использовано,
     * если прогресс по проходу будет соответствовать неравенству:
     * ТЕКУЩИЙ_КЛЮЧЕВОЙ_КАДР <= ПРОГРЕСС_ПО_ПРОХОДУ < СЛЕДУЮЩИЙ_КЛЮЧЕВОЙ_КАДР
     * Метод устанавливает смягчение для "текущего" (см. неравенство) ключевого кадра.
     *
     * При установке смягчения для свойства параметр прогресса игнорируется.
     * (!) Абсциссы первой и второй точек для кубической кривой должны принадлежать промежутку [0, 1].
     * @param {(Function|string)} timingFunction временная функция CSS, JS функция или алиас смягчения
     * @param {(number|string)=} position прогресс по проходу в процентах (по умол. не зваисит от прогресса)
     * @param {string=} property для какого свойства устанавливается (по умол. для всех)
     * @see cubicBezierAliases
     * @see cubicBezierApproximations
     */
    KeyframeAnimation.prototype.easing = function (timingFunction, position, property) {

        /**
         * Временной кадр, если указываем смягчение для него
         * @type {{key: number, properties: Object, easing: Function}}
         * */
        var keyframe;
        /**
         * Функция смягчения
         * @type {(Function|CubicBezier|Steps)}
         */
        var easing;
        /**
         * Аргументы к временной функции
         * @type {Array}
         */
        var points;
        /**
         * для выделения алиасов
         * ease-in -> easeIn
         * @type {string}
         */
        var camelCased;
        /**
         * строка временной функции css без пробелов
         * @type {string}
         */
        var trimmed;
        /**
         * Количество ступеней лестничной функции
         * @type {number}
         */
        var stepsAmount;
        /**
         * Отсчитывать ли ступени лестничной функции от старта (или с конца)
         * @type {boolean}
         */
        var countFromStart;
        /**
         * Числовое представление прогресса
         * @type {number}
         */
        var key;

        if (typeOf.func(timingFunction)) {
            easing = /** @type {Function} */ (timingFunction);
        } else if (typeOf.string(timingFunction)) {
            // alias или CSS timing-function

            trimmed = trim(/** @type {string} */ (timingFunction) );
            camelCased = camelCase(trimmed);

            if (camelCased in cubicBezierApproximations) {
                // алиас функции приближения
                easing = cubicBezierApproximations[camelCased];
            } else if (camelCased in cubicBezierAliases) {
                // алиас к точкам
                points = cubicBezierAliases[camelCased];
            } else {
                // строка временной функции css
                if (cubicBezierReg.test(trimmed)) {
                    points = trimmed.match(cubicBezierReg)[1].split(",");
                } else if (stepsReg.test(trimmed)) {
                    points = trimmed.match(stepsReg)[1].split(",");
                }
            }

            if (points) {
                // переданы аргументы к временным функциям.
                if (points.length === 4) {
                    // 4 аргумента - это кубическая кривая Безье
                    points = map(points, parseFloat);
                    // абсциссы точек должны лежать в [0, 1]
                    if (inRange(points[0], 0, 1, true) && inRange(points[2], 0, 1, true)) {
                        easing = new CubicBezier(points[0], points[1], points[2], points[3]);
                    }
                } else if (points.length === 2) {
                    // 2 аргумента - лестничная функция
                    stepsAmount = parseInt(points[0], 10);
                    countFromStart = points[1] === "start";
                    if (typeOf.number(stepsAmount)) {
                        easing = new Steps(stepsAmount, countFromStart);
                    }
                }
            }

        }

        if (typeOf.func(easing) || instanceOf(easing, CubicBezier) || instanceOf(easing, Steps)) {
            if (typeOf.string(property)) {
                this.specialEasing[/** @type {string} */(property)] = easing;
            } else {
                if (typeOf.undefined(position)) {
                    this.smoothing = easing;
                } else {
                    key = normalizeKey(/** @type {(number|string)} */(position));
                    if (typeOf.number(key)) {
                        // указываем в процентах, используем в долях.
                        key *= PERCENT_TO_FRACTION;
                        keyframe = this.lookupKeyframe(key) || this.addKeyframe(key);
                        keyframe.easing = easing;
                    }
                }
            }
        } else if (ENABLE_DEBUG) {
            console.warn('easing: cannot form a function from arguments %o', timingFunction);
        }
    };

    /**
     * Установка направления анимации
     * Значение "normal" соответствует возрастанию прогресса от 0 до 1 при каждом проходе
     * Значение "reverse" соответствует убыванию прогресса от 1 до 0 при каждом проходе
     * Значение "alternate" соответствует направлению "normal" для нечётных проходов и "reverse" для чётных
     * Значение "alternate-reverse" соответствует направлению "reverse" для нечётных проходов и "normal" для чётных
     * @see DEFAULT_DIRECTION
     * @param {string} animationDirection
     */
    KeyframeAnimation.prototype.direction = function (animationDirection) {

        if (animationDirection === DIRECTION_NORMAL ||
            animationDirection === DIRECTION_REVERSE ||
            animationDirection === DIRECTION_ALTERNATE ||
            animationDirection === DIRECTION_ALTERNATE_REVERSE) {

            this.animationDirection = animationDirection;

        } else if (ENABLE_DEBUG) {
            console.warn('direction: invalid value "%s"', animationDirection);
        }
    };

    /**
     * Установка задержки старта
     * Если значение положительное, старт анимации будет отложен на численное представление.
     * Если отрицательное, то будет считаться, что прошло уже столько времени со старта.
     * @param {(number|string)} delay
     */
    KeyframeAnimation.prototype.delay = function (delay) {
        var numericDelay = parseTimeString(delay);
        if (typeOf.number(numericDelay)) {
            this.delayTime =/** @type {number} */ (numericDelay);
        } else if (ENABLE_DEBUG) {
            console.warn('delay: cannot parse value "%s"', delay);
        }
    };

    /**
     * Установка режима заполнения
     * Значение "backwards" соответствует отрисовке значений
     * начального ключевого кадра сразу после старта (и перед самим анимированием)
     * Значение "forwards" соответствует отрисовке значений
     * конечного ключевого кадра после окончания анимации.
     * Значение "none" не соответствует ни одному из значений;
     * Значение "both" соответствует и первому, и второму одновременно.
     * @param {string} fillMode
     * @see DEFAULT_FILLMODE
     */
    KeyframeAnimation.prototype.fillMode = function (fillMode) {

        if (fillMode === FILLMODE_FORWARDS ||
            fillMode === FILLMODE_BACKWARDS ||
            fillMode === FILLMODE_BOTH ||
            fillMode === FILLMODE_NONE) {

            this.fillingMode = fillMode;

        } else if (ENABLE_DEBUG) {
            console.warn('fillMode: invalid value "%s"', fillMode);
        }
    };

    /**
     * Установка количества проходов цикла анимации.
     * Значение "infinite" соответствует бесконечному числу повторений анимации.
     * Дробные значения соответствуют конечному значению прогресса по проходу.
     * Отрицательные числовые значения игнорируются.
     * @param {string} iterations
     * @see DEFAULT_ITERATIONCOUNT
     */
    KeyframeAnimation.prototype.iterationCount = function (iterations) {

        /**
         * Числовое представление
         * @type {number}
         */
        var numericIterations;

        // исключение составляет специальное значение
        if (iterations === ITERATIONCOUNT_INFINITE) {
            numericIterations = Number.POSITIVE_INFINITY;
        } else {
            numericIterations = parseFloat(iterations);
            if (!isFinite(numericIterations) || numericIterations < 0) {
                if (ENABLE_DEBUG) {
                    console.warn('iterationCount: passed iterations is not a number or is negative "%s"', iterations);
                }
                return;
            }
        }

        this.iterations = numericIterations;
        this.integralIterations = floor(numericIterations);
    };

    /**
     * Старт анимации
     */
    KeyframeAnimation.prototype.start = function () {

        if (this.delayTime > 0) {
            if (ENABLE_DEBUG) {
                console.log('start: ' + this.animationName + ' has positite delay "' + this.delayTime + '" ms');
            }
            setTimeout(bind(this.timer.start, this.timer), this.delayTime);
        } else {
            if (ENABLE_DEBUG) {
                console.log('start: ' + this.animationName + ' has non-positite delay "' + this.delayTime + '" so starting right now.');
            }
            this.timer.start();
        }

        // запоминаем текущие значения анимируемых свойств для каждого элемента
        each(this.targets, function (element) {

            var id = element.getAttribute(DATA_ATTR_NAME);
            var startingValues = this.startingValues[id];

            each(this.animatedProperties, function (special_value, propertyName) {
                var currentPropertyValue = css(element, propertyName);
                startingValues[propertyName] = normalize(element, propertyName, currentPropertyValue, false);
            }, this);

        }, this);

        this.started = now();
        this.tick(this.started);

        if (ENABLE_DEBUG) {
            console.log('start: animation "' + this.animationName + '" started');
        }
    };

    /**
     * Остановка анимации
     */
    KeyframeAnimation.prototype.stop = function () {

        var fillsForwards, endFractionalTime;

        this.timer.stop();

        fillsForwards = this.fillingMode === FILLMODE_FORWARDS ||this.fillingMode === FILLMODE_BOTH;

        if (fillsForwards) {
            endFractionalTime = this.needsReverse(this.iterations) ? 1.0 : 0.0;
            if (ENABLE_DEBUG) {
                console.log('stop: animation fills forwards and has direction "' + this.animationDirection + '" and iteration count "' + this.iterations + '" so fetching with keyframe "' + endFractionalTime + '"');
            }
            this.fetch(endFractionalTime);
            this.render(true);
        }
        // очистка css правил
        each(this.rulesList, function (rule) {
            rule.style.cssText = "";
        });
        if (ENABLE_DEBUG) {
            console.log('stop: CSSRules are cleared.');
        }
        if (ENABLE_DEBUG) {
            console.log('stop: animation "' + this.animationName + '" stopped');
        }

    };

     /**
     * Установка функции, которая будет выполняться на каждом шаге анимации
     * @param {Function} callback
     */
    KeyframeAnimation.prototype.step = function (callback) {
       if (typeOf.func(callback)) {
           this.onstep = callback;
       }
    };

    /**
     * Установка значения свойства при указанном прогрессе
     * Для установки смягчения используется метод easing
     * @param {string} name имя свойства
     * @param {string} value значение свойства
     * @param {(number|string)=} position строка прогресса в процентах (по умол. 100%)
     * @see KeyframeAnimation.easing
     */
    KeyframeAnimation.prototype.propAt = function (name, value, position) {

        var keyframe;
        var keyframes;
        /** @type {(number|string)} */
        var key;
        var startingKeyframe, endingKeyframe;

        keyframes = this.keyframes;

        key = typeOf.undefined(position) ? keyAliases["to"] : position;
        key = normalizeKey(key);
        // в долях
        key *= PERCENT_TO_FRACTION;

        if (!typeOf.number(key)) {
            if (ENABLE_DEBUG) {
                console.warn('propAt: passed keyframe key is invalid "%s"', position);
            }
            return;
        }

        keyframe = this.lookupKeyframe(key) || this.addKeyframe(key);
        this.animatedProperties[name] = SPECIAL_VALUE;
        keyframe.properties[name] = value;
    };

    /*
    *   Приватные методы.
    * */

    /**
     * Добавит ключевой кадр на указанном прогрессе по проходу в долях и вернёт его
     * @param {number} position
     * @param {Object=} properties
     * @param {Function=} easing
     * @private
     */
    KeyframeAnimation.prototype.addKeyframe = function (position, properties, easing) {

        var keyframe;
        var keyframes;

        if (typeOf.number(position)) {
            keyframe = new Keyframe(position, properties, easing);
            keyframes = this.keyframes;
            keyframes.push(keyframe);
            bubbleSort(/** @type {Array} */(keyframes), compareKeyframes);
        }

        return keyframe;
    };

    /**
     * Попытается найти в коллекции ключевой кадр
     * с указанным прогрессом по проходу (в долях)
     * @param {number} position
     * @return {Object}
     * @private
     */
    KeyframeAnimation.prototype.lookupKeyframe = function (position) {
        var keyframe, index;
        index = binarySearch(/** @type {Array} */(this.keyframes), position, function (key, keyframe) {
            return key - keyframe.key;
        });
        keyframe = this.keyframes[index];
        return keyframe;
    };

    /**
     * Высчитает значения свойств при указанном прогрессе про проходу
     * @param {number} fractionalTime прогресс по проходу ( [0, 1] )
     * @return {undefined}
     * @private
     */
    KeyframeAnimation.prototype.fetch = function (fractionalTime) {

        var keyframes, globalFetch, fetchedProperties, firstKeyframe, secondKeyframe, from, to, propertyName;
        var element;
        var offset, scale;
        var timingFunction, specialEasing, index, easing, epsilon;
        keyframes = this.keyframes;

        epsilon = Math.pow(10, - this.digits);
        /*
         * Поиск функции смягчения для текущего ключевого кадра
         */
        timingFunction = this.smoothing;

        index = binarySearch(/**@type {Array}*/(keyframes), fractionalTime, easingSearchCallback);

        if (index !== -1 && keyframes[index].easing !== noop) {
            timingFunction = keyframes[index].easing;
        }

        /**
         *  информация о вычисленных значениях
         *  для каждого элемента
         *  */
        each(this.targets, function (element) {

            var id, elementData, startingValues, currentValues;

            id = element.getAttribute(DATA_ATTR_NAME);
            elementData = this.cache[id];
            startingValues = this.startingValues[id];
            currentValues = this.currentValues[id];

            each(this.animatedProperties, function (_, propertyName) {

                var value, individualFractionalTime;

                /*
                 * Поиск двух ближайших ключевых кадров
                 * для которых задано значение свойства
                 */
                firstKeyframe = keyframes[0];
                secondKeyframe = keyframes[keyframes.length - 1];

                //TODO было бы неплохо заменить линейный поиск на бинарный
                each(keyframes, function (keyframe) {
                    // специальное значение для прекращения обхода
                    var STOP_ITERATION = false;
                    if (propertyName in keyframe.properties) {
                        if (fractionalTime < keyframe.key || (fractionalTime === 1.0 && keyframe.key === 1.0)) {
                            secondKeyframe = keyframe;
                            return STOP_ITERATION;
                        }
                        firstKeyframe = keyframe;
                    }
                    return !STOP_ITERATION;
                });

                offset = firstKeyframe.key;
                scale = 1.0 / (secondKeyframe.key - firstKeyframe.key);
                individualFractionalTime = (fractionalTime - offset) * scale;

                if (instanceOf(timingFunction, CubicBezier)) {
                    easing = /** @type {CubicBezier} */(timingFunction).calc(individualFractionalTime);
                } else if (instanceOf(timingFunction, Steps)) {
                    easing = /** @type {Steps} */(timingFunction).calc(individualFractionalTime);
                } else {
                    easing = timingFunction(individualFractionalTime);
                }
                easing = round(easing, this.digits);

                if (firstKeyframe.properties[propertyName] === SPECIAL_VALUE) {
                    from = startingValues[propertyName];
                } else {
                    from = firstKeyframe.properties[propertyName];
                    from = normalize(element, propertyName, from, false);
                }

                if (secondKeyframe.properties[propertyName] === SPECIAL_VALUE) {
                    to = startingValues[propertyName];
                } else {
                    to = secondKeyframe.properties[propertyName];
                    to = normalize(element, propertyName, to, false);
                }

                value = blend(propertyName, /** @type {(Array|number)} */ (from), /** @type {(Array|number)} */(to), easing, this.digits);

                currentValues[propertyName] = value;

            }, this); // end properties loop

        }, this); // end targets loop

        return globalFetch;
    };

    /**
     * Отрисует высчитанные значения свойств
     * @param {boolean} direct НЕ (!) использовать ли правило в таблице стилей для отрисовки одинаковых для элементов значений
     * @see KeyframeAnimation.fetch
     * @private
     */
    KeyframeAnimation.prototype.render = function (direct) {
        each(this.targets, function (element) {

            var id, elementData, startingValues, currentValues;
            var elementStyle;
            var rule, ruleStyle;
            var destinationStyle;

            id = element.getAttribute(DATA_ATTR_NAME);
            rule = this.rulesList[id];
            elementData = this.cache[id];
            currentValues = this.currentValues[id];

            elementStyle = element.style;
            ruleStyle = rule.style;

            destinationStyle = direct ? elementStyle : ruleStyle;

            each(currentValues, function (propertyValue, propertyName) {
                css(destinationStyle, propertyName, propertyValue);
            }, this);
        }, this);
    };

    /**
     * Тик анимации
     * просчитывание и отрисовка (fetch & render)
     * @param {number} timeStamp временная метка
     * @private
     */
    KeyframeAnimation.prototype.tick = function (timeStamp) {

        var iterationCount, animationProgress;
        var previousIteration, currentIteration;

        iterationCount = this.iterations;
        previousIteration = this.currentIteration;

        animationProgress = this.animationProgress = this.computeProgress(timeStamp);
        currentIteration = this.currentIteration = this.computeIteration(this.animationProgress);
        this.fractionalTime = this.computeFractionalTime(this.animationProgress, this.currentIteration);

        if (currentIteration !== previousIteration) {
            // Условие завершения итерации
            if (ENABLE_DEBUG) {
                console.log('tick: "' + this.animationName + '" - iteration "' + currentIteration + '" of total "' + iterationCount + '"');
            }
            this.oniteration();
        } else if (animationProgress >= iterationCount) {
            // Условие завершения анимации
            this.stop();
            this.oncomplete();
            // метод stop сам отрисует конечный кадр, т.к. он зависит от параметра fill-mode
            return;
        } else {
            this.onstep();
        }

        this.fetch(this.fractionalTime);
        this.render(false);
    };

    /***
     * Вычислит и вернёт прогресс анимации относительно первой итерации
     * @param {number} timeStamp временная метка
     * @return {number} прогресс анимации относительно первой итерации
     * @private
     */
    KeyframeAnimation.prototype.computeProgress = function (timeStamp) {

        var animationProgress;

        animationProgress = this.computeElapsedTime(timeStamp) / this.animationTime;
        animationProgress = round(animationProgress, this.digits);

        return animationProgress;
    };

    /**
     * Вычислит номер текущей итерации из прогресса.
     * @param {number} animationProgress прогресс относительно первого прохода
     * @return {number}
     * @private
     */
    KeyframeAnimation.prototype.computeIteration = function (animationProgress) {
        var currentIteration;
        currentIteration = floor(animationProgress);
        return min(currentIteration, this.integralIterations);
    };

    /***
     * Вычислит и вернёт прогресс анимации относительно текущей итерации
     * @param {number} animationProgress прогресс относительно первой итерации
     * @param {number} currentIteration номер итерации из прогресса
     * @return {number} прогресс анимации относительно текущей итерации
     * @private
     */
    KeyframeAnimation.prototype.computeFractionalTime = function (animationProgress, currentIteration) {

        var iterationProgress, iterationCount;

        iterationCount = this.iterations;

        iterationProgress = animationProgress - currentIteration;
        iterationProgress = min(iterationProgress, MAXIMAL_PROGRESS);

        if (this.needsReverse(currentIteration)) {
            iterationProgress = MAXIMAL_PROGRESS - iterationProgress;
        }

        return iterationProgress;
    };

    /**
     * Вычислит прошедшее со старта время до временной метки
     * @param {number} timeStamp временная метка
     * @return {number}
     * @private
     */
    KeyframeAnimation.prototype.computeElapsedTime = function (timeStamp) {
        var elapsedTime;

        if (timeStamp < HIGHRESOLUTION_TIMER_BOUND) {
            // высокоточный таймер
            timeStamp += navigStart;
        }

        elapsedTime = timeStamp - this.started;
        elapsedTime += -1 * this.delayTime;
        elapsedTime = max(elapsedTime, 0);
        return elapsedTime;
    };

    /**
     * Нужно ли обратить прогресс анимации, в зависимости от направления и номера текущей итерации
     * @param {number} iterationNumber
     * @return {boolean}
     * @private
     */
    KeyframeAnimation.prototype.needsReverse = function (iterationNumber) {

        var needsReverse, iterationIsOdd, direction;

        direction = this.animationDirection;
        iterationIsOdd = isOdd(iterationNumber);

        needsReverse = direction === DIRECTION_REVERSE;
        needsReverse = needsReverse || direction === DIRECTION_ALTERNATE && iterationIsOdd;
        needsReverse = needsReverse || direction === DIRECTION_ALTERNATE_REVERSE && !iterationIsOdd;

        return needsReverse;
    };

    /* Экспорты */
    KeyframeAnimation.prototype["element"] = KeyframeAnimation.prototype.element;
    KeyframeAnimation.prototype["delay"] = KeyframeAnimation.prototype.delay;
    KeyframeAnimation.prototype["duration"] = KeyframeAnimation.prototype.duration;
    KeyframeAnimation.prototype["direction"] = KeyframeAnimation.prototype.direction;
    KeyframeAnimation.prototype["easing"] = KeyframeAnimation.prototype.easing;
    KeyframeAnimation.prototype["fillMode"] = KeyframeAnimation.prototype.fillMode;
    KeyframeAnimation.prototype["iterationCount"] = KeyframeAnimation.prototype.iterationCount;
    KeyframeAnimation.prototype["onComplete"] = KeyframeAnimation.prototype.onComplete;
    KeyframeAnimation.prototype["propAt"] = KeyframeAnimation.prototype.propAt;
    KeyframeAnimation.prototype["start"] = KeyframeAnimation.prototype.start;
    KeyframeAnimation.prototype["stop"] = KeyframeAnimation.prototype.stop;

    /** @export */
    window["KeyframeAnimation"] = KeyframeAnimation;

	/*---------------------------------------*/


})(window);
