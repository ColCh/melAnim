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
        return toBool("nodeType" in x && x.nodeType === Node.ELEMENT_NODE);
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
        var i, stopCondition, cache;
        var savedX0, savedX1;

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
     * @param {number} y
     * @return {number}
     */
    CubicBezier.prototype.calc = function (y) {

        var B_bindedToX = bind(this.B_absciss, this);
        var derivative_X = bind(this.B_derivative_absciss, this);

        var t = findEquationRoot(B_bindedToX, y, 0, 1, 1e-5, derivative_X);

        return this.B_ordinate(t);
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
                        stringValue = getComputedStyle(/** @type {HTMLElement} */(element))[vendorizedPropertyName];
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