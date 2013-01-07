    /**
     * Вернёт строковое представление типа аргумента.
     * При необходимости вернёт [[Class]] в нижнем регистре.
     *
     * @param {?} x
     * @return {string}
     */
    function type(x) {
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
     * @param {Function=} x
     * @return {boolean}
     */
    type.func = function (x) {
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
     * Проверит, является ли аргумент числом
     * @param {*} x
     * @return {Boolean}
     */
    type.number = function (x) {
        return type(x) === "number";
    };

    /**
     * Проверит, является ли аргумент строковым значением
     * @param x
     * @return {Boolean}
     */
    type.string = function (x) {
        return type(x) === "string";
    };

    /**
     * Проверит, является ли аргумент объектом
     * @param {*} x
     * @return {Boolean}
     */
    type.object = function (x) {
        return type(x) === "object";
    };

    /**
     * Проверит, принадлежит ли число диапазону
     * @param {number} num
     * @param {number=} lowbound нижняя граница
     * @param {number=} highbound верхняя граница
     * @param {boolean} including включая ли границы
     * @return {boolean}
     */
    function inRange(num, lowbound, highbound, including) {
        return including ? (num >= lowbound && num <= highbound) : (num > lowbound && num < highbound);
    }

    /**
     * Применит parseInt, а потом toString к аргументу
     * @param {number} number
     * @param {number} fromRadix второй аргумент для parseInt
     * @param {number} toRadix аргумент для toString
     */
    function changeRadix(number, fromRadix, toRadix) {
        return parseInt(number, fromRadix).toString(toRadix);
    }

    changeRadix.binToDec = function (num) {
        return changeRadix(num, 2, 10);
    };

    /**
     * Сгенерирует уникальную строку.
     * @return {string}
     */
    function generateId() {
        return /** @type {string} */ mel + animCount++;
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

    merge(Iterator.prototype, /** @lends Iterator.prototype */({

        /**
         * Индекс текущего элемента в коллекции
         */
        index:0,
        /**
         * Запомненная длина коллекции
         */
        length:0,
        /**
         * Коллекция
         */
        collection:[],
        /**
         * Возвращается, если значения нет
         * @see Iterator.next Iterator.previous
         */
        none:null,

        /**
         * Возвратит текущий элемент коллекции
         * @return {*}
         */
        current:function () {
            return this.collection[this.index];
        },
        /**
         * Возвратит следующий элемент коллекции или значение по-умолчанию
         * @return {*}
         */
        next:function () {
            return this.index < this.length ? this.collection[this.index++] : this.none;
        },
        /**
         * Возвратит предыдущий элемент коллекции или значение по-умолчанию
         * @return {*}
         */
        previous:function () {
            return this.index > 0 ? this.collection[this.index--] : this.none;
        }

    }));

    /**
     * Сортировка массива методом пузырька
     * @param {Array} array массив
     * @param {Function=} compare функция сравнения. если не указать, будут сравниваться, как числа
     * @param {number=} low нижняя граница (по умол. начало массива)
     * @param {number=} high верхняя граница (по умол. конец массива)
     */
    function bubbleSort(array, compare, low, high) {

        var i, j, cache;

        if (!type.number(low)) low = 0;
        if (!type.number(high)) high = array.length - 1;
        if (!type.func(compare)) compare = compareNumbers;

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

        var callable = type.func(val),
            index, i, m, curr,
            native = Array.prototype.indexOf,
            EQUALS = 0, NOT_FOUND = -1;

        index = NOT_FOUND;

        if (!callable && native) {
            index = native.call(arr, val);
        } else {
            for (i = 0, m = arr.length; i < m && index === NOT_FOUND; i++) {
                curr = arr[i];
                if (callable) {
                    if (val(curr, i, arr) === EQUALS) index = i;
                } else {
                    if (val === curr) index = i;
                }
            }
        }

        return index;
    }

    /**
     * Вернёт 1, если число положительное
     * 0, если оно равно 0, и
     * -1, если оно отрицательное
     * @param {number} number
     */
    function sign(number) {
        return number === 0 ? 0 : number > 0 ? 1 : -1;
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
     * @param {keyframe} a
     * @param {keyframe} b
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

        if (!type.number(lowBound)) lowBound = 0;
        if (!type.number(upperBound)) upperBound = array.length - 1;

        compare = type.func(compare) ? compare : compareNumbers;

        do {

            if (lowBound > upperBound || !array.length) {
                return -1;
            }

            mid = lowBound + upperBound >> 1;

            comp = compare(value, array[mid], mid, array);

            if (!comp) {
                return mid;
            } else if (comp < 0) {
                upperBound = mid - 1;
            } else {
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
        return type.func(func) && func.apply(ctx, args);
    }

    /**
     * Вернёт функцию, которая применит список функций,
     * до тех пор, пока они будут возвращать истинное значение
     * при переданных аргументах
     *
     * альтернатива : f(x) && g(x) && ...
     *
     * @param {...Function} functions список функций
     * @return {Function}
     */
    function and(functions) {

        functions = slice(arguments);

        return function (/* args */) {
            var args = arguments;
            return each(functions, function (func) {
                return toBool(apply(func, args));
            });
        };
    }

    /**
     * Частичное применение функции
     * Аргументы можно пропускать, передав
     * специальное значение "_"; при запуске
     * пропущенные аргументы заполнятся
     * слева направо.
     *
     * @param {Function} fn функция
     * @param {Array} args аргументы
     * @param {Object=} ctx контекст исполнения функции
     * @return {Function} частично применённая функция
     *
     * @example
     * var line = function (k, x, b) { return k * x + b; };
     * var id = partial(line, [ 1, _, 0 ]);
     * id(0);   // 0
     * id(2);   // 2
     * id(777); // 777
     */
    function partial(fn, args, ctx) {

        function isHole(x) {
            return x === partial.hole;
        }

        return function () {

            var fresh = new Iterator(arguments);
            fresh.none = partial.defaultValue;

            function filter(arg) {
                return isHole(arg) ? fresh.next() : arg;
            }

            return apply(fn, map(args, filter).concat(slice(fresh.collection, fresh.index)), ctx);
        };
    }

    /**
     * Вернёт функцию, которая передаст первой функции только
     * указанное количество аргументов
     * @param {Function} fn
     * @param {number} num
     * @return {Function}
     */
    function aritilize(fn, num) {
        return function () {
            return fn.apply(this, slice(arguments, 0, num));
        }
    }

    /**
     * Обратит порядок аргументов у функции
     * @param {Function} fn
     * @param {Object=} ctx Контекст исполнения
     * @return {Function}
     */
    function reverse(fn, ctx) {
        return function () {
            apply(fn, slice(arguments).reverse(), ctx);
        };
    }

    /**
     * Аналог bind из ES5.
     * @inheritDoc
     */
    function bind(fn, ctx) {
        return function () {
            return fn.call(ctx);
        };
    }

    /**
     * Значение для любого аргумента по-умолчанию
     * @type {undefined}
     * @private
     */
    partial.defaultValue = undefined;

    /**
     * Специальное значение "дырка", указывающее на то,
     * что аргумент пропущен
     * @type {Object}
     * @private
     * @see partial
     */
    var _ = partial.hole = {};

    /**
     * Вернёт функцию, которая последовательно
     * применит список функций к аргуметам
     *
     * Альтернатива: f(g(x))
     *
     * @param {...Function} functions список функций
     * @return {Function}
     */
    function compose(functions) {

        functions = slice(arguments);

        return function (/* args */) {
            var args = slice(arguments);
            each(functions, function (func) {
                args = [ apply(func, args) ];
            });
            return args;
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
        return Array.prototype.slice.call(arrayLike, type.number(start) ? start : 0, type.number(end) ? end : undefined);
    }

    /**
     * Конвертирует аргумент к булеву типу
     * @param {*} arg
     * @return {Boolean}
     */
    function toBool(arg) {
        return !!arg;
    }

    /**
     * Пройдётся по элементам массива или свойствам объекта.
     * Итерирование прервётся, если callback вернёт false.
     * @param {Array|Object} arg
     * @param {function} callback
     */
    function each(arg, callback) {
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
     * Пройдётся по элементам массива\объекта,
     * применит функцию к каждому; Если хотя бы
     * одна функция возвратит ложное значение,
     * перебор прерывается, и функция возвращает false.
     * @param {array|object} arg
     * @param {function} callback
     * @return {boolean}
     */
    function every(arg, callback) {
        return toBool(each(arg, partial(toBool)));
    }

    /**
     * Пройдётся по элементам массива \ объекта и соберёт новый
     * из возвращённых значений функции
     * @param {Array|Object} arg
     * @param {Function(?, number|string, Object|Array): ?} callback
     * @return {Array|Object}
     */
    function map(arg, callback) {
        var accum = [];

        each(arg, function (value, index, object) {
            accum.push(callback(value, index, object));
        });

        return accum;
    }

    /**
     * Создаст объект, где ключами будут переданные аргументы, а значениями - undefined
     * @type {function(...[?])}
     * @return {Object.<string, undefined>}
     */
    function generateDictionary(/* arguments */) {
        var obj = {};
        each(arguments, function (key) {
            obj[key] = undefined;
        });
        return obj;
    }

    /**
     * Пройдётся по объекту/массиву с помощью each и заменит
     * значения в нём на результат функции
     * @param {Array|Object} obj
     * @param {function} callback
     */
    function eachReplace(obj, callback) {
        each(obj, function (val, index, obj) {
            obj[index] = callback(val, index, obj);
        });
    }

    /**
     * @param {*} x
     * @return {string}
     */
    function toString(x) {
        return x + "";
    }

    /**
     * Преобразует строку в верхний регистр
     * @param {string} str
     * @return {string}
     */
    function toUpperCase(str) {
        return String.prototype.toUpperCase.call(toString(str));
    }
    /**
     * Преобразует строку в нижний регистр
     * @param {string} str
     * @return {string}
     */
    function toLowerCase(str) {
        return String.prototype.toLowerCase.call(toString(str));
    }

    /**
     * Обработает строку времени вида %время%+%размерность%
     * @param {string|number} timeString
     * @return {(number|undefined)} обработанное время в миллисекундах или undefined в случае неудачи
     */
    function parseTimeString(timeString) {

        var matched = toString(timeString).match(cssNumericValueReg);
        var numeric, coefficient;

        if (matched) {
            numeric = parseFloat(matched[1]);
            coefficient = parseTimeString.modificators[ matched[2] ] || 1;
            return numeric * coefficient;
        }

        return undefined;
    }

    /**
     * Размерности для parseTimeString
     * @type {Object}
     */
    parseTimeString.modificators = {
        "ms":1,
        "s":1e3
    };

    function camelCase(string) {
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
    function getVendorPropName(property, target) {
        var cache, result, camelCased;

        target = !target ? dummy : (target === true ? window : target);
        cache = getVendorPropName.cache;

        if (property in target) {
            return cache[property] = property;
        }

        if (cache[property] === undefined) {
            camelCased = camelCase(property);
            if (camelCased in target) {
                return cache[property] = camelCased;
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
                        } else if (lowPrefix + camelCased in target) {
                            cache.prefix = prefix;
                            cache.lowPrefix = lowPrefix;
                            cache[property] = lowPrefix + camelCased;
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
     * Вернёт кол-во миллисекунд с 1 Января 1970 00:00:00 UTC
     * @return {number}
     */
    var now = Date.now || function () {
        return +new Date;
    };

    /**
     * Замена для requestAnimationFrame.
     * @param {function(number)} callback
     * @return {number} ID таймаута
     */
    function rAF_imitation(callback) {

        var id = rAF_imitation.unique++,

            info = {
                id:id,
                func:callback
            };

        if (!rAF_imitation.timerID) rAF_imitation.timerID = setInterval(rAF_imitation.looper, 1e3 / FRAMES_PER_SECOND);

        rAF_imitation.queue.push(info);
        return id;
    }

    /**
     * Замена для cancelRequestAnimationFrame
     * @param {number} id
     */
    function rAF_imitation_dequeue(id) {

        var index, queue, eq;

        eq = function (/**@type {{id: number, func: Function}}*/val) {
            return val.id === id;
        };
        queue = rAF_imitation.queue;
        index = LinearSearch(/**@type {Array}*/(queue), eq);
        if (index !== -1) {
            // don't splice
            queue[index] = null;
        }
    }

    /**
     * ID таймаута "перерисовки"
     * @type {number}
     * @private
     */
    rAF_imitation.timerID = null;

    /**
     * Для генерации ID таймаута.
     * @type {Number}
     */
    rAF_imitation.unique = 0;

    /**
     * Очередь обработчиков и их контекстов
     * @type {Array.<{func: Function, id: number}>}
     * @const
     */
    rAF_imitation.queue = [];

    /**
     * Таймер "отрисовки" - пройдется по обработчикам и повызывает их,
     * передав как первый аргумент временную метку "отрисовки"
     * @private
     */
    rAF_imitation.looper = function () {
        var reflowTimeStamp = now(), queue = rAF_imitation.queue, info;
        while (queue.length) {
            info = queue.pop();
            info && info.func.call(window, reflowTimeStamp);
        }
    };

    /**
     * Найдёт корень уравнения  вида f(x)=val с указанной точностью
     * Используется метод хорд
     * @param {function} equation уравнение
     * @param {number=} epsilon минимальная разница между двумя приближениями
     * @param {number=} equationValue значение функции в этой точке
     * @return {number} приближённое значение корня уравнения
     */
    function findEquationRoot(equation, epsilon, equationValue) {
        var X0, X1, cache;

        equationValue = type(equationValue) === "undefined" ? 0 : equationValue;
        epsilon = type(epsilon) === "undefined" ? findEquationRoot.defaultEpsilon : epsilon;

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
    function cubicBezier(p1x, p1y, p2x, p2y, fractionalTime, epsilon) {

        // вернёт значение X при передаваемом времени.
        var B_bindedToX = function (t) {
            return cubicBezier.B(p1x, p2x, t);
        };

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
    function steps(stepsAmount, countFromStart, fractionalTime) {
        // если отсчитываем с начала, просто реверсируем функцию
        return countFromStart ? 1.0 - steps(stepsAmount, countFromStart, 1.0 - fractionalTime) : Math.floor(stepsAmount * fractionalTime) / stepsAmount;
    }

    /**
     * Известная всем функция для прототипного наследования.
     * @param {Object} child Кто наследует
     * @param {Object} parent Что наследует
     */
    function inherit(child, parent) {
        var F = noop;
        F.prototype = parent.prototype;
        child.prototype = new F;
        child.prototype.constructor = child;
    }

    /**
     * Скопирует свойства одного объекта в другой.
     * @param {Object|Function} target
     * @param {Object} source
     */
    function merge(target, source) {
        each(source, function (propertyValue, property) {
            target[property] = propertyValue;
        });
    }

    /**
     * Вернёт вычисленный стиль элемента
     * @param {Element} element
     * @return {CSSStyleDeclaration}
     */
    function getComputedStyle(element) {
        return window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
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
     * @param {string|number} key
     * @return {key}
     */
    function normalizeKey(key) {
        if (type.string(key)) {
            key = !type.undefined(keyAliases[key]) ? keyAliases[key] : key;
            key = parseInt(key, 10);
        }
        return inRange(key, 0, 100, true) ? key : undefined;
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
     * @param {Element} elem
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
     * @param {Element} element Элемент
     * @param {string} propertyName Имя свойства
     * @param {string=} propertyValue Значение свойства. Если пропустить (undefined) - функция
     *
     * @return {string=}
     * */
    function css(element, propertyName, propertyValue) {

        var getting = type.undefined(propertyValue);
        var action = getting ? "get" : "set";
        var hooks = css.hooks;
        var hookVal;
        var vendorizedPropertyName;

        // нечему устанавливать\неоткуда получать
        if (!element) return null;

        vendorizedPropertyName = getVendorPropName(propertyName);

        if (propertyName in hooks && action in hooks[propertyName]) {
            hookVal = hooks[propertyName][action](element, vendorizedPropertyName, propertyValue);
        }

        if (getting) {

            if (type.undefined(hookVal)) {
                //TODO нормализацию значений \ конвертацию.
                propertyValue = getComputedStyle(element)[vendorizedPropertyName];
            } else {
                propertyValue = hookVal;
            }

        } else {

            if (!type.string(propertyValue)) {
                propertyValue = normalize(element, propertyName, propertyValue, true);
            }

            if (type.element(element)) {
                element.style[vendorizedPropertyName] = propertyValue;
            } else {
                // CSSStyleDeclaration
                element[vendorizedPropertyName] = propertyValue;
            }

        }

        return propertyValue;
    }
    ;

    /**
     * Хуки для получения\установки значения свойства.
     * @type {Object.<string, Object.<string, function>>}
     */
    css.hooks = {};

    /**
     * Преобразует строкое представление значения в численное и наоборот
     * @param {Element} element элемент (для относительных значений)
     * @param {string} propertyName имя свойства
     * @param {string=} propertyValue значение свойства
     * @param {boolean=} toString к строке (true) или к числу (false)
     * @return {Array|number|undefined}
     */
    function normalize(element, propertyName, propertyValue, toString) {
        var hooks = normalize.hooks;
        var units = normalize.units;
        var normalized;
        var unit;
        var vendorizedPropertyName;

        vendorizedPropertyName = getVendorPropName(propertyName);

        if (type.undefined(propertyValue)) {
            propertyValue = css(element, propertyName);
        }

        if (hooks[propertyName]) {
            normalized = hooks[propertyName](element, vendorizedPropertyName, propertyValue, toString);
        }

        if (type.undefined(normalized)) {

            if (toString) {
                if (type.number(propertyValue) && !normalize.nopx[propertyName]) {
                    normalized = propertyValue + "px";
                }
            } else if (!type.number(propertyValue)) {
                unit = propertyValue.match(cssNumericValueReg)[2];

                if (units[unit]) {
                    normalized = units[unit](element, vendorizedPropertyName, propertyValue);
                }
            } else {
                normalized = propertyValue;
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
     * @type {Object.<string, function>}
     */
    normalize.hooks = {};

    /**
     * Хуки для преобразования из исходных единиц измерения к абсолютным
     * @type {Object.<string, function>}
     */
    normalize.units = {
        // это и есть абсолютное значение
        "px":function (element, propName, propVal) {
            // просто возвращаем число без "px"
            return parseFloat(propVal);
        }
    };

    /**
     * Список свойств, к которым не надо добавлять "PX"
     * при переводе из числа в строку.
     * @enum {undefined}
     */
    normalize.nopx = {
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
     * @param {number} from Имя меньшей точки
     * @param {number} to Имя большей точки
     * @param {number} timingFunctionValue Значение прогресса между ними
     * @return {number|Array} Вычисленное значение
     */
    function blend(propertyName, from, to, timingFunctionValue) {

        if (propertyName in blend.hooks) {
            return blend.hooks[propertyName](from, to, timingFunctionValue);
        }

        return (to - from) * timingFunctionValue + from;
    }

    /**
     * Для вычисления значения экзотических свойств
     * transform или crop, к примеру
     * @type {Object}
     * @private
     * @static
     */
    blend.hooks = {};

    /**
     * Исполнит функцию перед отрисовкой,
     * передав её текущую отметку времени
     * Оригинальная функция
     * @type {Function}
     * @param {Function}
        * @return {number} номер таймера
     */
    var rAF = window[getVendorPropName("requestAnimationFrame", window)];

    /**
     * Исполнит функцию перед отрисовкой, передав ей отметку времени
     * (обёртка)
     * @type {Function}
     * @param {Function} callback
     * @return {number} ID таймера для его отмены
     */
    var requestAnimationFrame = rAF ? rAF : rAF_imitation;

    /**
     * Отменит исполнение функции перед отрисовкой
     * @type {Function}
     * @param {number} id ID таймаута
     */
    var cancelRequestAnimationFrame = rAF ? window[getVendorPropName("cancelRequestAnimationFrame", window)] : rAF_imitation_dequeue;

    /**
     * Таймер для анимации
     * @param {Function} callback
     * @param {Object=} context контекст исполнения функции
     * @constructor
     */
    function ReflowLooper(callback, context) {
        this.callback = callback;
        this.context = context;
        this.looper = bind(this.looper, this);
    }

    merge(ReflowLooper.prototype, /** @lends ReflowLooper.prototype */ ({

        /**
         * Функция будет исполняться циклически по таймеру
         * @type {Function}
         * @private
         */
        callback:null,

        /**
         * Контекст функции
         * @type {Object}
         * @private
         */
        context:null,

        /**
         * ID таймаута
         * @type {number}
         * @private
         */
        timeoutID:null,

        /**
         * Запуск таймера
         */
        start:function () {
            this.timeoutID = requestAnimationFrame(this.looper);
        },

        /**
         * Остановка таймера
         */
        stop:function () {
            cancelRequestAnimationFrame(this.timeoutID);
            this.timeoutID = null;
        },

        /**
         * Враппер вызова функции с контекстом
         * @private
         */
        looper:function (timeStamp) {
            this.timeoutID = requestAnimationFrame(this.looper);
            timeStamp = timeStamp || now();
            this.callback.call(this.context, timeStamp);
        }

    }));

    /**
     * Нужно ли обратить прогресс анимации,
     * в зависимости от направления и номера текущей итерации
     * @param {string} direction
     * @param {number} iterationNumber
     * @return {Boolean}
     */
    function needsReverse(direction, iterationNumber) {

        var needsReverse, iterationIsOdd;

        // аналогично операции NUM % 2
        // т.е. является ли число нечётным
        iterationIsOdd = iterationNumber & 1;

        needsReverse = direction === DIRECTION_REVERSE;
        needsReverse |= direction === DIRECTION_ALTERNATE && iterationIsOdd;
        needsReverse |= direction === DIRECTION_ALTERNATE_REVERSE && !iterationIsOdd;

        return needsReverse;
    }