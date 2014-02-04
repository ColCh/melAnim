    /**
     * @return {number}
     */
    function uuid () {
        return counter++;
    }

    /**
     * @return {string}
     */
    function generateId () {
        return /** @type {string} */ (mel + uuid());
    }


    /**
     * Линейный поиск по массиву с функцией обратного вызова
     * @param {!Array} array
     * @param {function (*, number, Array): boolean} callback
     */
    function linearSearch (array, callback) {
        for (var i = 0; i < array.length; i++) {
            if (callback(array[i], i, array) === true) {
                return i;
            }
        }
        return NOT_FOUND;
    }

    /**
     * @const
     * @type {CSSStyleDeclaration}
     */
    var dummy = rootElement.style;

    /**
     * @type {Array.<string>}
     * @const
     */
    var vendorPrefixes = "Ms O Moz WebKit".split(" ");

    /** @type {string} */
    var prefix;
    /** @type {string} */
    var lowPrefix;

    /**
     * @param {string} propertyName
     * @param {boolean=} global
     * @return {string}
     */
    function getVendorPropName (propertyName, global) {
        var obj = global ? goog.global : dummy;
        if (propertyName in obj) {
            // 'width', 'left' ...
            return propertyName;
        }
        var camelCased = camelCase(propertyName);
        if (camelCased in obj) {
            // 'font-size', 'border-color' ...
            return camelCased;
        }
        // 'Transform', 'Animation' ...
        var capPropName = camelCased.charAt(0).toUpperCase() + camelCased.substr(1);
        if (!goog.isDef(prefix)) {
            for (var i = 0, m = vendorPrefixes.length; i < m; i++) {
                if (vendorPrefixes[i] + capPropName in obj || vendorPrefixes[i].toLowerCase() + capPropName in obj) {
                    prefix = vendorPrefixes[i];
                    lowPrefix = vendorPrefixes[i].toLowerCase();
                }
            }
        }
        if (goog.isDef(prefix)) {
            if (prefix + capPropName in obj) {
                // 'WebKitCSSMatrix' ...
                return prefix + capPropName;
            }
            if (lowPrefix + capPropName in obj) {
                // 'webkitAudioContext' ...
                return lowPrefix + capPropName;
            }
        }
        return '';
    }

    /**
     * @type {function (): number}
     * @const
     *  */
    var now = 'performance' in goog.global && 'now' in goog.global.performance ? function () { return goog.global.performance.timing.navigationStart + goog.global.performance.now(); } : 'now' in Date ? Date.now : function () { return +new Date(); };

    var rAF = goog.global[ getVendorPropName(REQUEST_ANIMATION_FRAME, true) ];
    var cancelRAF = goog.global[ getVendorPropName(CANCEL_REQUEST_ANIMATION_FRAME, true) ];

    var RAF_SUPPORTED = goog.isFunction(rAF);

    /**
     * @param {!Array} array
     * @param {!function (?, ?): number|undefined} compare_callback
     */
    function sortArray (array, compare_callback) {
        // Кажется, внутри браузера сортировка идёт с помощью Quick Sort.
        // http://jsperf.com/quicksort-vs-heapsort
        array.sort(compare_callback);
    }

    /**
     * @param {number} number
     * @param {number} digits
     */
    function round (number, digits) {
        if (digits === 0) {
            return Math.round(number);
        } else {
            return parseFloat( number.toFixed(digits) );
        }
    }

    /**
     * Функция для вычисления промежуточного значения
     * между двумя ключевыми кадрами и известном прогрессе между ними
     * Возвращаемая величина показывает, изменилось ли значение или нет
     * @param {!Array.<number>} from
     * @param {!Array.<number>} to
     * @param {number} progress
     * @param {!Array.<number>} currentValue
     * @param {number} roundDigits
     * @return {boolean}
     */
    function blend (from, to, progress, currentValue, roundDigits) {

        var valueIsChanged = false;

        for (var i = from.length; i--; ) {
            valueIsChanged = currentValue[i] !== (currentValue[i] = round( (to[i] - from[i]) * progress + from[i] , roundDigits)) || valueIsChanged;
        }

        return valueIsChanged;
    }


    /**
     * @param {string} string
     * @return {string}
     */
    function trim (string) {
        return string.replace(/^\s+|\s+$/g, "");
    }

    /**
     * @type {RegExp}
     * @const
     */
    var camelCaseReg = new RegExp([
        "-",
        "[",
            "a-z",  // строчные латинские буквы, следующие за знаком минуса
        "]"
    ].join(""), "g");

    /**
     * @param {string} string
     * @return {string}
     */
    function camelCase (string) {
        return string.replace(camelCaseReg, function (match) {
            return match.charAt(1).toUpperCase();
        });
    }

    /**
     * @param {string} string
     * @return {string}
     */
    function removeSpaces (string) {
        return string.replace(/\s+/g, "");
    }

    /** @constructor */
    var F = Function();

    /** @type {function (!Object): !Object} */
    var objectCreate = 'create' in Object ? Object.create : function (proto) { F.prototype = proto; return new F; };

    /**
     * @const
     * @type {boolean}
     */
    var USEDSTYLE_SUPPORTED = 'getComputedStyle' in goog.global;

    /**
     * @const
     * @type {boolean}
     */
    var CURRENTSTYLE_SUPPORTED = 'currentStyle' in rootElement;

    /**
     * @const
     * @type {boolean}
     */
    var CSSANIMATIONS_SUPPORTED = getVendorPropName('animation').length > 0;

    /**
     * @param {!HTMLElement} elem
     * @param {string} propName
     * @param {boolean} usedValue вернуть ли значение из вычисленного стиля
     * @return {string}
     */
    function getStyle (elem, propName, usedValue) {
        var propertyName = getVendorPropName(propName, false);
        if (!usedValue) {
            return elem.style[propertyName];
        }
        var style;
        if (USEDSTYLE_SUPPORTED) {
            style = goog.global.getComputedStyle(elem, null);
        } else if (CURRENTSTYLE_SUPPORTED) {
            style = elem.currentStyle;
        }
        return style[propertyName];
    }

    /**
     * @param {!HTMLElement} elem
     * @param {string} propName
     * @param {string} propValue
     * @param {string=} vendorizedPropName
     */
    function setStyle (elem, propName, propValue, vendorizedPropName) {
        vendorizedPropName = vendorizedPropName || getVendorPropName(propName);
        elem.style[vendorizedPropName] = propValue;
    }

    var tempElement = document.createElement('div');

    /**
     * @const
     * @type {RegExp}
     */
    var horizAxisReg = new RegExp([
        "(?:",
            ["left", "right", "width"].join("|"),
        ")"
    ].join(''), "i");

    /**
     * @const
     * @type {RegExp}
     */
    var COLOR_REG = new RegExp("color", "i");

    /**
     * @param {!HTMLElement} elem
     * @param {string} propertyName
     * @param {string} propertyValue
     * @param {string} vendorizedPropName
     * @return {!Array.<number>}
     */
    function toNumericValue (elem, propertyName, propertyValue, vendorizedPropName) {

        if (!propertyValue) {
            return [ ];
        }

        if (propertyName in toNumericValueHooks) {
            return /** @type !Array.<number> */ (toNumericValueHooks[propertyName](elem, propertyName,  propertyValue, vendorizedPropName));
        }

        if ( COLOR_REG.test(vendorizedPropName) ) {
            return /** @type !Array.<number> */ (toNumericValueHooks['color'](elem, propertyName,  propertyValue, vendorizedPropName));
        }

        var isHoriz = horizAxisReg.test(vendorizedPropName);

        if (!cssNumericValueReg.test(propertyValue)) {
            // NON-numeric, like "auto"
            propertyValue = elem[ isHoriz ? "offsetWidth" : "offsetHeight" ];
        }

        if (goog.isNumber(propertyValue)) {
            return [ propertyValue ];
        }

        var valueDescriptor = propertyValue.match(cssNumericValueReg);

        var value = valueDescriptor[ VALREG_VALUE ];
        var numericValue = parseFloat(value);
        var unit = valueDescriptor[ VALREG_DIMENSION ];

        if (unit === '' || unit === 'px') {
            return [ numericValue ];
        }

        if (unit === '%' && vendorizedPropName.indexOf('border') !== -1) {
            numericValue /= 100;
            numericValue *= isHoriz ? elem.clientWidth : elem.clientHeight;
            return [ numericValue ];
        }

        tempElement.style.cssText = "border-style:solid; border-width:0; line-height:0;";

        var ctx = elem;

        var isValueNegative = numericValue < 0;

        if (isValueNegative) {
            propertyValue = -numericValue + unit;
        }

        if (unit === '%' || !ctx.appendChild || /font-?size/i.test(vendorizedPropName)) {
            ctx = elem.parentNode || document.body;
            tempElement.style[ isHoriz ? "width" : "height" ] = propertyValue;
        } else {
            tempElement.style.position = 'absolute';
            tempElement.style[ isHoriz ? "borderLeftWidth" : "borderTopWidth" ] = propertyValue;
        }

        ctx.appendChild(tempElement);
        var normalized = tempElement[ isHoriz ? "offsetWidth" : "offsetHeight" ];
        ctx.removeChild(tempElement);

        if (isValueNegative) {
            normalized *= -1;
        }

        return [ normalized ];
    }

    /** @type {Object.<string, function (Object, string, string, string): !Array.<number>>} */
    var toNumericValueHooks = {};

    /** @type {Object.<string, function(Object, !Array.<number>): string>} */
    var toStringValueHooks = {};

    //TODO сжать список свойств, для которых не нужны пиксели. Google Closure Compiler этого не делает

    /** @type {Object.<CSSStyleDeclaration, boolean>} */
    var toStringValueNoPX = {
        "fill-opacity": true,
        "font-weight": true,
        "line-height": true,
        "opacity": true,
        "orphans": true,
        "widows": true,
        "z-index": true,
        "zoom": true
    };

    var blendHooks = {};

    /**
     * @const
     * @type {number}
     */
    var DEGS_IN_TURN = 360;

    /**
     * @const
     * @type {number}
     */
    var DEGS_IN_RAD = DEGS_IN_TURN / ( 2 * Math.PI );

    /**
     * @const
     * @type {number}
     */
    var DEGS_IN_GRAD = 1 / (400 / DEGS_IN_TURN);

    /**
     * @param {string} cssAngle
     * @return {number}
     */
    function toDeg (cssAngle) {
        var cssValue = cssAngle.match(cssNumericValueReg);
        var numeric = parseFloat(cssValue[VALREG_VALUE]);
        var unit = cssValue[VALREG_DIMENSION];
        if (unit in toDegModificators) {
            return toDegModificators[unit](numeric);
        }
        return numeric;
    }

    /**
     * @enum {function (number): number}
     * */
    var toDegModificators = {
        /* deg is undef */
        "grad": function (grads) {
            return grads * DEGS_IN_GRAD;
        },
        "rad": function (rads) {
            return rads * DEGS_IN_RAD;
        },
        "turn": function (turns) {
            return turns * DEGS_IN_TURN;
        }
    };

    /**
     * Каскадная таблица стилей
     * с ленивой инициализацией
     * @type {CSSStyleSheet|undefined}
     */
     var STYLESHEET;

    /**
     * @param {string} selector
     * @return {CSSRule} Добавленное правило
     */
    function addRule(selector) {

        if (!STYLESHEET) {
            var style = document.getElementsByTagName("head")[0].parentNode.appendChild(document.createElement("style"));
            STYLESHEET = style.sheet || style.styleSheet;
        }

        var stylesheet = /** @type {CSSStyleSheet} */ (STYLESHEET);

        var rules = stylesheet.cssRules || stylesheet.rules;
        var index = rules.length;

        if (stylesheet.insertRule) {
            stylesheet.insertRule(selector + " " + "{" + " " + "}", index);
        } else {
            stylesheet.addRule(selector, " ", rules.length);
        }

        return rules[index];
    }

    /**
     * Первичная функция-обработчик событий
     * т.к. обработчики установлены на все события, которые могут никогда и не исполниться
     * (например, у webkit никогда не будет события с вендорным префиксом "ms")
     * то лучше убрать остальные мусорные обработчики и оставить один,
     * что и делает данная функция
     * @param {(AnimationEvent|Event)} event
     */
    function exclusiveHandler (event) {
        var eventName = /** @type {string} */(event.type);
        var lowerCased = eventName.toLowerCase();
        var eventNames = [];

        // Определение типа поступившего события
        if (lowerCased.indexOf("start") !== NOT_FOUND) {
            eventNames = ANIMATION_START_EVENTNAMES;
        } else if (lowerCased.indexOf("iteration") !== NOT_FOUND) {
            eventNames = ANIMATION_ITERATION_EVENTNAMES;
        } else if (lowerCased.indexOf("end") !== NOT_FOUND) {
            eventNames = ANIMATION_END_EVENTNAMES;
        } // else unreachable code

        // снимаем все навешанные обработчики событий
        for (var i = 0; i < eventNames.length; i++) {
            rootElement.removeEventListener(eventNames[i], exclusiveHandler, ANIMATION_HANDLER_USES_CAPTURE);
        }

        // вешаем обратно обычный обработчик на точно определённое имя события
        setTimeout(function () {
            rootElement.addEventListener(eventName, animationHandlerDelegator, ANIMATION_HANDLER_USES_CAPTURE);
        }, 1);

        // вызываем тут же оригинальный обработчик
        animationHandlerDelegator(event);
    }

    if (CSSANIMATIONS_SUPPORTED) {
        // навешиваем обработчики на все имена событий анимаций
        // * бывают курьёзы, вроде FireFox - когда свойство "animation" с префиксом ("-moz-animation")
        // * а имя события - без префикса, ещё и в нижнем регистре ("animationend")
        var ANIMATION_ALL_EVENTNAMES = ANIMATION_END_EVENTNAMES.concat(ANIMATION_ITERATION_EVENTNAMES).concat(ANIMATION_START_EVENTNAMES);
        for (var i = 0; i < ANIMATION_ALL_EVENTNAMES.length; i++) {
            rootElement.addEventListener(ANIMATION_ALL_EVENTNAMES[i], exclusiveHandler, ANIMATION_HANDLER_USES_CAPTURE);
        }
    }

    /**
     * Объект с функциями-обработчиками всех событий анимаций
     * Ключ - имя события, значение - объект с именем анимации и функцей-обработчиком
     * @type {Object.<string, Object.<string, Function>>}
     */
    var delegatorCallbacks = {};

    //TODO сжать delegatorCallbacks. МБ вообще разбить на файлы - Google Closure Compiler инлайнит туда константы

    /**
     * Объект с обработчиками событий окончания анимаций
     * @type {Object.<string, Function>}
     */
    delegatorCallbacks[ ANIMATION_END_EVENTTYPE ] = {};

    /**
     * Объект с обработчиками событий конца итераций анимаций
     * @type {Object.<string, Function>}
     */
    delegatorCallbacks[ ANIMATION_ITERATION_EVENTTYPE ] = {};

    /**
     * Объект с обработчиками событий старта анимаций
     * @type {Object.<string, Function>}
     */
    delegatorCallbacks[ ANIMATION_START_EVENTTYPE ] = {};

    /**
     * Функция будет ловить все поступающих события конца анимации
     * @param {(AnimationEvent|Event)} event
     */
    var animationHandlerDelegator = function (event) {
        var animationName = event.animationName, eventType = '', handlersList;
        var eventName = event.type;
        var lowerCased = eventName.toLowerCase();

        if (lowerCased.indexOf("start") !== NOT_FOUND) {
            eventType = ANIMATION_START_EVENTTYPE;
        } else if (lowerCased.indexOf("iteration") !== NOT_FOUND) {
            eventType = ANIMATION_ITERATION_EVENTTYPE
        } else if (lowerCased.indexOf("end") !== NOT_FOUND) {
            eventType = ANIMATION_END_EVENTTYPE;
        } // else unreachable code

        if (eventType in delegatorCallbacks) {
            handlersList = delegatorCallbacks[eventType];
            if (animationName in handlersList) {
                handlersList[animationName](event);
            } // else незарегистрированная анимация. ничего не можем сделать.
        }
    };