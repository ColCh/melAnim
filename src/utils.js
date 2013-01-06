/**
 * ����� ��������� ������������� ���� ���������.
 * ��� ������������� ����� [[Class]] � ������ ��������.
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
 * ��������, �������� �� �������� HTML ���������.
 *
 * @param {?} x
 * @return {boolean}
 */
type.element = function (x) {
    return "nodeType" in x;
};

/**
 * ��������, �������� �� �������� ��������.
 *
 * @param {Function=} x
 * @return {boolean}
 */
type.func = function (x) {
    return type(x) === "function";
};

/**
 * ��������, �������� �� �������� ��������
 * @param x
 * @return {boolean}
 */
type.array = function (x) {
    return type(x) === "array";
};

/**
 * ��������, �������� �� �������� ��������� undefined.
 * @param x
 * @return {boolean}
 */
type.undefined = function (x) {
    return type(x) === "undefined";
};

/**
 * ��������, �������� �� �������� ������
 * @param {*} x
 * @return {Boolean}
 */
type.number = function (x) {
    return type(x) === "number";
};

/**
 * ��������, �������� �� �������� ��������� ���������
 * @param x
 * @return {Boolean}
 */
type.string = function (x) {
    return type(x) === "string";
};

/**
 * ��������, �������� �� �������� ��������
 * @param {*} x
 * @return {Boolean}
 */
type.object = function (x) {
    return type(x) === "object";
};

/**
 * ��������, ����������� �� ����� ���������
 * @param {number} num
 * @param {number=} lowbound ������ �������
 * @param {number=} highbound ������� �������
 * @param {boolean} including ������� �� �������
 * @return {boolean}
 */
function inRange(num, lowbound, highbound, including) {
    return including ? (num >= lowbound && num <= highbound) : (num > lowbound && num < highbound);
}

/**
 * �������� parseInt, � ����� toString � ���������
 * @param {number} number
 * @param {number} fromRadix ������ �������� ��� parseInt
 * @param {number} toRadix �������� ��� toString
 */
function changeRadix(number, fromRadix, toRadix) {
    return parseInt(number, fromRadix).toString(toRadix);
}

changeRadix.binToDec = function (num) {
    return changeRadix(num, 2, 10);
};

/**
 * ����������� ���������� ������.
 * @return {string}
 */
function generateId() {
    return /** @type {string} */ mel + animCount++;
}

/**
 * ������ Object.keys
 * @param {Object} obj
 */
function getKeys(obj) {
    return map(obj, function (value, index) {
        return index;
    });
}

/**
 * ������ Object.create
 * @param {Object} parent
 * @return {Object}
 */
function createObject(parent) {
    var F = noop;
    F.prototype = parent;
    return new F;
}

/**
 * ������������ ������ ���������
 * @param {Array} collection
 * @constructor
 */
function Iterator(collection) {
    this.collection = collection;
    this.length = collection.length;
}

merge(Iterator.prototype, /** @lends Iterator.prototype */({

    /**
     * ������ �������� �������� � ���������
     */
    index:0,
    /**
     * ����������� ����� ���������
     */
    length:0,
    /**
     * ���������
     */
    collection:[],
    /**
     * ������������, ���� �������� ���
     * @see Iterator.next Iterator.previous
     */
    none:null,

    /**
     * ��������� ������� ������� ���������
     * @return {*}
     */
    current:function () {
        return this.collection[this.index];
    },
    /**
     * ��������� ��������� ������� ��������� ��� �������� ��-���������
     * @return {*}
     */
    next:function () {
        return this.index < this.length ? this.collection[this.index++] : this.none;
    },
    /**
     * ��������� ���������� ������� ��������� ��� �������� ��-���������
     * @return {*}
     */
    previous:function () {
        return this.index > 0 ? this.collection[this.index--] : this.none;
    }

}));

/**
 * ���������� ������� ������� ��������
 * @param {Array} array ������
 * @param {Function=} compare ������� ���������. ���� �� �������, ����� ������������, ��� �����
 * @param {number=} low ������ ������� (�� ����. ������ �������)
 * @param {number=} high ������� ������� (�� ����. ����� �������)
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
 * ������� �������� ����� �������� � �������
 * @param {Array} arr ������
 * @param {(Function|*)} val �������� (��� ������� ���������; ������ ������� 0 ��� ���������)
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
 * ����� 1, ���� ����� �������������
 * 0, ���� ��� ����� 0, �
 * -1, ���� ��� �������������
 * @param {number} number
 */
function sign(number) {
    return number === 0 ? 0 : number > 0 ? 1 : -1;
}

/**
 * ������� ��� ��������� 2 �����.
 * @param {number} a
 * @param {number} b
 * @return {number}
 * @see Array.sort
 */
function compareNumbers(a, b) {
    return a - b;
}

/**
 * ������� 2 �������� ����� �� �� ������
 * @param {keyframe} a
 * @param {keyframe} b
 * @return {number} ����������� �����, ���� a < b, ������������� �����, ���� a > b, � 0, ���� ��� �����
 * @see compareNumbers
 */
function compareKeyframes(a, b) {
    return compareNumbers(a.key, b.key);
}

/**
 * �������� ��������� ������ ��� ����������
 * ������� �������� � ��������������� �������
 * @param {Array} array ��������������� ������
 * @param {*} value ������� ��������
 * @param {Function=} compare ������� ���������; ���� �� �������, ����� ������������, ��� �����
 * @param {number=} lowBound ������ ������� (�� ����. ������ �������)
 * @param {number=} upperBound ������� ������� (�� ����. ����� �������)
 * @return {number} ��������� ������ �������� ��� -1
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
 * ������ ������� ������� � �����������
 * @param {Function} func �������
 * @param {Array=} args ������ ����������
 * @param {Object=} ctx ��������
 * @return {*}
 */
function apply(func, args, ctx) {
    return type.func(func) && func.apply(ctx, args);
}

/**
 * ����� �������, ������� �������� ������ �������,
 * �� ��� ���, ���� ��� ����� ���������� �������� ��������
 * ��� ���������� ����������
 *
 * ������������ : f(x) && g(x) && ...
 *
 * @param {...Function} functions ������ �������
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
 * ��������� ���������� �������
 * ��������� ����� ����������, �������
 * ����������� �������� "_"; ��� �������
 * ����������� ��������� ����������
 * ����� �������.
 *
 * @param {Function} fn �������
 * @param {Array} args ���������
 * @param {Object=} ctx �������� ���������� �������
 * @return {Function} �������� ���������� �������
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
 * ����� �������, ������� �������� ������ ������� ������
 * ��������� ���������� ����������
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
 * ������� ������� ���������� � �������
 * @param {Function} fn
 * @param {Object=} ctx �������� ����������
 * @return {Function}
 */
function reverse(fn, ctx) {
    return function () {
        apply(fn, slice(arguments).reverse(), ctx);
    };
}

/**
 * ������ bind �� ES5.
 * @inheritDoc
 */
function bind(fn, ctx) {
    return function () {
        return fn.call(ctx);
    };
}

/**
 * �������� ��� ������ ��������� ��-���������
 * @type {undefined}
 * @private
 */
partial.defaultValue = undefined;

/**
 * ����������� �������� "�����", ����������� �� ��,
 * ��� �������� ��������
 * @type {Object}
 * @private
 * @see partial
 */
var _ = partial.hole = {};

/**
 * ����� �������, ������� ���������������
 * �������� ������ ������� � ���������
 *
 * ������������: f(g(x))
 *
 * @param {...Function} functions ������ �������
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
 * �������� Array.slice � ���������
 * @param {Object} arrayLike ����� ������, ������� �� ������
 * @param {number=} start ��������� ��������
 * @param {number=} end �������� ��������
 * @return {Array}
 */
function slice(arrayLike, start, end) {
    return Array.prototype.slice.call(arrayLike, type.number(start) ? start : 0, type.number(end) ? end : undefined);
}

/**
 * ������������ �������� � ������ ����
 * @param {*} arg
 * @return {Boolean}
 */
function toBool(arg) {
    return !!arg;
}

/**
 * �������� �� ��������� ������� ��� ��������� �������.
 * ������������ ��������, ���� callback ����� false.
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
 * �������� �� ��������� �������\�������,
 * �������� ������� � �������; ���� ���� ��
 * ���� ������� ��������� ������ ��������,
 * ������� �����������, � ������� ���������� false.
 * @param {array|object} arg
 * @param {function} callback
 * @return {boolean}
 */
function every(arg, callback) {
    return toBool(each(arg, partial(toBool)));
}

/**
 * �������� �� ��������� ������� \ ������� � ������ �����
 * �� ������������ �������� �������
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
 * ������� ������, ��� ������� ����� ���������� ���������, � ���������� - undefined
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
 * �������� �� �������/������� � ������� each � �������
 * �������� � �� �� ��������� �������
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
 * ����������� ������ � ������� �������
 * @param {string} str
 * @return {string}
 */
function toUpperCase(str) {
    return String.prototype.toUpperCase.call(toString(str));
}
/**
 * ����������� ������ � ������ �������
 * @param {string} str
 * @return {string}
 */
function toLowerCase(str) {
    return String.prototype.toLowerCase.call(toString(str));
}

/**
 * ���������� ������ ������� ���� %�����%+%�����������%
 * @param {string|number} timeString
 * @return {(number|undefined)} ������������ ����� � ������������� ��� undefined � ������ �������
 */
function parseTimeString(timeString) {

    var matched = toString(timeString).match(cssNumericValueReg);
    var numeric, coefficient;

    if (timeString) {
        numeric = parseFloat(matched[1]);
        coefficient = parseTimeString.modificators[ matched[2] ] || 1;
        return numeric * coefficient;
    }

    return undefined;
}
;

/**
 * ����������� ��� parseTimeString
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
 * �������� toUpperCase �� ������� ���������.
 * @param {string} a �� ������������
 * @param {string} letter
 * @return {string}
 */
camelCase.callback = function (a, letter) {
    return letter.toUpperCase();
};

/**
 * ������ ����� � �������� ��������� �� ��� ������
 * @type {RegExp}
 */
camelCase.reg = /-(.)/g;

/**
 * ���������� ������� ������ ��� ��������, �������� ��� ����������� ��������� �������.
 * ���������� undefined � ������ �������.
 *
 * @param {string} property ��� ��������.
 * @param {boolean=|object=} target ��� �������� ������� ������� - � ������ ��� falsy (!), � � window ��� true, ��� � ��������� �������.
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
 * ����� �������� ����� ��������� getVendorPropName
 * @type {Array}
 */
getVendorPropName.prefixes = "ms O Moz webkit".split(" ");

/**
 * ��� getVendorPropName ���������� ���������� ���������� ����� ��������
 * @type {Object}
 */
getVendorPropName.cache = {};

/**
 * ����� ���-�� ����������� � 1 ������ 1970 00:00:00 UTC
 * @return {number}
 */
var now = Date.now || function () {
    return +new Date;
};

/**
 * ������ ��� requestAnimationFrame.
 * @param {function(number)} callback
 * @return {number} ID ��������
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
 * ������ ��� cancelRequestAnimationFrame
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
 * ID �������� "�����������"
 * @type {number}
 * @private
 */
rAF_imitation.timerID = null;

/**
 * ��� ��������� ID ��������.
 * @type {Number}
 */
rAF_imitation.unique = 0;

/**
 * ������� ������������ � �� ����������
 * @type {Array.<{func: Function, id: number}>}
 * @const
 */
rAF_imitation.queue = [];

/**
 * ������ "���������" - ��������� �� ������������ � ���������� ��,
 * ������� ��� ������ �������� ��������� ����� "���������"
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
 * ����� ������ ���������  ���� f(x)=val � ��������� ���������
 * ������������ ����� ����
 * @param {function} equation ���������
 * @param {number=} epsilon ����������� ������� ����� ����� �������������
 * @param {number=} equationValue �������� ������� � ���� �����
 * @return {number} ����������� �������� ����� ���������
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
 * �������� ����������� ��-���������
 * @type {number}
 * @see findEquationRoot
 */
findEquationRoot.defaultEpsilon = 1e-6;

/**
 * ��������� �����������
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
 * ������������� ������� ��������� ������� transition-timing-function
 * ���������� ������ �����.
 *
 * @param {number} p1x
 * @param {number} p1y
 * @param {number} p2x
 * @param {number} p2y
 * @param {number} fractionalTime ����. ��� X.
 * @param {number=} epsilon �����������
 * @return {number} �������� �������� - easing - Y.
 */
function cubicBezier(p1x, p1y, p2x, p2y, fractionalTime, epsilon) {

    // ����� �������� X ��� ������������ �������.
    var B_bindedToX = function (t) {
        return cubicBezier.B(p1x, p2x, t);
    };

    // ������� ����� t, ��� ������� ���������� ������ ��������� �������� X.
    var bezierTime = findEquationRoot(B_bindedToX, epsilon, fractionalTime);

    // ��������� �� ����� ������� Y.
    var bezierFunctionValue = cubicBezier.B(p1y, p2y, bezierTime);

    return bezierFunctionValue;
}

/**
 * �������� �������� ���������� ������ ����� ��� ���������� t
 * ���������, ��� P0 = (0;0) � P3 = (1;1)
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
 * �������� ��������� �������� ����������, ������ �� ������������ ��������
 * @param {number} duration
 * @return {number}
 */
cubicBezier.solveEpsilon = function (duration) {
    return 1.0 / (200.0 * duration);
};

/**
 * ����������� �������, �������������� ������� �������� �������� �� ������������� �����.
 * ������� ������������� � �����, ��� � ������.
 * @param {number} stepsAmount ���������� ��������
 * @param {boolean} countFromStart ����������� � ������ (true) ��� � ����� (false).
 * @param {number} fractionalTime
 */
function steps(stepsAmount, countFromStart, fractionalTime) {
    // ���� ����������� � ������, ������ ����������� �������
    return countFromStart ? 1.0 - steps(stepsAmount, countFromStart, 1.0 - fractionalTime) : Math.floor(stepsAmount * fractionalTime) / stepsAmount;
}

/**
 * ��������� ���� ������� ��� ������������ ������������.
 * @param {Object} child ��� ���������
 * @param {Object} parent ��� ���������
 */
function inherit(child, parent) {
    var F = noop;
    F.prototype = parent.prototype;
    child.prototype = new F;
    child.prototype.constructor = child;
}

/**
 * ��������� �������� ������ ������� � ������.
 * @param {Object|Function} target
 * @param {Object} source
 */
function merge(target, source) {
    each(source, function (propertyValue, property) {
        target[property] = propertyValue;
    });
}

/**
 * ����� ����������� ����� ��������
 * @param {Element} element
 * @return {CSSStyleDeclaration}
 */
function getComputedStyle(element) {
    return window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
}

/**
 * ������� ������ ���������� � ������ � � �����
 * @param {string} str
 * @param {string} substring
 * @return {string}
 */
function surround(str, substring) {
    return substring + str + substring;
}

/**
 * ������� ������ � ������ � � ����� ������
 * @param {string} string
 * @return {string}
 */
surround.bySpaces = function (string) {
    return surround(string, " ");
};

/**
 * ������� ������� � ������ ������ � � �����
 * @param {string} string
 * @return {string}
 */
function trim(string) {
    return string.replace(/^\s+|\s+$/g, "");
}

/**
 * ��������� ���� ����� ��� ������� � ����� ���
 * ��������� ������������� � ��������� ��� undefined.
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
 * ������� ������� � ��������� ���������� � ��������� ������� �������.
 * @param {string} selector
 * @param {string=} cssText
 * @return {CSSRule} ����������� �������
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
 * ������� ��������� ����� ��������
 * @param {Element} elem
 * @param {string} value
 */
function addClass(elem, value) {

    if (surround.bySpaces(elem.className).indexOf(surround.bySpaces(value)) === -1) {
        elem.className += " " + value;
    }

}

/**
 * ������ ��������� ����� � ��������
 * @param {Element} elem
 * @param {string} value
 */
function removeClass(elem, value) {
    elem.className = trim(surround.bySpaces(elem.className).replace(surround.bySpaces(value), ""));
}

/**
 * ��������� �������� ����� ��������, ���� ������� �������
 * �������� ��������, ��� ������������� ����������� �����.
 * @param {Element} element �������
 * @param {string} propertyName ��� ��������
 * @param {string=} propertyValue �������� ��������. ���� ���������� (undefined) - �������
 *
 * @return {string=}
 * */
function css(element, propertyName, propertyValue) {

    var getting = type.undefined(propertyValue);
    var action = getting ? "get" : "set";
    var hooks = css.hooks;
    var hookVal;
    var vendorizedPropertyName;

    // ������ �������������\�������� ��������
    if (!element) return null;

    vendorizedPropertyName = getVendorPropName(propertyName);

    if (propertyName in hooks && action in hooks[propertyName]) {
        hookVal = hooks[propertyName][action](element, vendorizedPropertyName, propertyValue);
    }

    if (getting) {

        if (type.undefined(hookVal)) {
            //TODO ������������ �������� \ �����������.
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
 * ���� ��� ���������\��������� �������� ��������.
 * @type {Object.<string, Object.<string, function>>}
 */
css.hooks = {};

/**
 * ����������� ������� ������������� �������� � ��������� � ��������
 * @param {Element} element ������� (��� ������������� ��������)
 * @param {string} propertyName ��� ��������
 * @param {string=} propertyValue �������� ��������
 * @param {boolean=} toString � ������ (true) ��� � ����� (false)
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
 * ���� ��� �������������� ��������
 * ������ �������� - �������
 * ������ - ��� ��������
 * ������ - ��������
 * �������� - �������� � ������ (true) ��� � ����� (false)
 * @type {Object.<string, function>}
 */
normalize.hooks = {};

/**
 * ���� ��� �������������� �� �������� ������ ��������� � ����������
 * @type {Object.<string, function>}
 */
normalize.units = {
    // ��� � ���� ���������� ��������
    "px":function (element, propName, propVal) {
        // ������ ���������� ����� ��� "px"
        return parseFloat(propVal);
    }
};

/**
 * ������ �������, � ������� �� ���� ��������� "PX"
 * ��� �������� �� ����� � ������.
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
 * ���������� �������� ����� ����� �������
 * ��� ������������ ��������
 * @param {string} propertyName ��� ��������
 * @param {number} from ��� ������� �����
 * @param {number} to ��� ������� �����
 * @param {number} timingFunctionValue �������� ��������� ����� ����
 * @return {number|Array} ����������� ��������
 */
function blend(propertyName, from, to, timingFunctionValue) {

    if (propertyName in blend.hooks) {
        return blend.hooks[propertyName](from, to, timingFunctionValue);
    }

    return (to - from) * timingFunctionValue + from;
}

/**
 * ��� ���������� �������� ������������ �������
 * transform ��� crop, � �������
 * @type {Object}
 * @private
 * @static
 */
blend.hooks = {};

/**
 * �������� ������� ����� ����������,
 * ������� � ������� ������� �������
 * ������������ �������
 * @type {Function}
 * @param {Function}
    * @return {number} ����� �������
 */
var rAF = window[getVendorPropName("requestAnimationFrame", window)];

/**
 * �������� ������� ����� ����������, ������� �� ������� �������
 * (������)
 * @type {Function}
 * @param {Function} callback
 * @return {number} ID ������� ��� ��� ������
 */
var requestAnimationFrame = rAF ? rAF : rAF_imitation;

/**
 * ������� ���������� ������� ����� ����������
 * @type {Function}
 * @param {number} id ID ��������
 */
var cancelRequestAnimationFrame = rAF ? window[getVendorPropName("cancelRequestAnimationFrame", window)] : rAF_imitation_dequeue;

/**
 * ������ ��� ��������
 * @param {Function} callback
 * @param {Object=} context �������� ���������� �������
 * @constructor
 */
function ReflowLooper(callback, context) {
    this.callback = callback;
    this.context = context;
    this.looper = bind(this.looper, this);
}

merge(ReflowLooper.prototype, /** @lends ReflowLooper.prototype */ ({

    /**
     * ������� ����� ����������� ���������� �� �������
     * @type {Function}
     * @private
     */
    callback:null,

    /**
     * �������� �������
     * @type {Object}
     * @private
     */
    context:null,

    /**
     * ID ��������
     * @type {number}
     * @private
     */
    timeoutID:null,

    /**
     * ������ �������
     */
    start:function () {
        this.timeoutID = requestAnimationFrame(this.looper);
    },

    /**
     * ��������� �������
     */
    stop:function () {
        cancelRequestAnimationFrame(this.timeoutID);
        this.timeoutID = null;
    },

    /**
     * ������� ������ ������� � ����������
     * @private
     */
    looper:function (timeStamp) {
        this.timeoutID = requestAnimationFrame(this.looper);
        timeStamp = timeStamp || now();
        this.callback.call(this.context, timeStamp);
    }

}));

/**
 * ����� �� �������� �������� ��������,
 * � ����������� �� ����������� � ������ ������� ��������
 * @param {string} direction
 * @param {number} iterationNumber
 * @return {Boolean}
 */
function needsReverse(direction, iterationNumber) {

    var needsReverse, iterationIsOdd;

    // ���������� �������� NUM % 2
    // �.�. �������� �� ����� ��������
    iterationIsOdd = iterationNumber & 1;

    needsReverse = direction === DIRECTION_REVERSE;
    needsReverse |= direction === DIRECTION_ALTERNATE && iterationIsOdd;
    needsReverse |= direction === DIRECTION_ALTERNATE_REVERSE && !iterationIsOdd;

    return needsReverse;
}