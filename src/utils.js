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
     * @const
     * @type {number}
     */
    var NOT_FOUND = -1;

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
     * @type {function (): number}
     * @const
     *  */
    var now = 'performance' in goog.global && 'now' in goog.global.performance ? function () { return goog.global.performance.timing.navigationStart + goog.global.performance.now(); } : 'now' in Date ? Date.now : function () { return +new Date(); };

    /** @const */
    var Ticker = {
        /** @type {Array.<{
        *   clb: !Function,
        *   timeoutId: number
        * }>}
         */
        listeners: [],
        /**
         * @param {!Function} callback
         * @return {number}
         * */
        on: function (callback) {
            var id = uuid();
            var descriptor = {
                clb: callback,
                timeoutId: id
            };
            this.listeners.push(descriptor);
            if (!this.isAwaken) {
                this.awake();
            }
            return id;
        },
        /**
         * @param {number} id
         */
        off: function (id) {
            var index = linearSearch(this.listeners, function (descriptor, i, listeners) {
                return descriptor.timeoutId === id;
            });
            this.listeners.splice(index, 1);
            if (this.listeners.length === 0 && this.isAwaken) {
                this.sleep();
            }
        },

        useRAF: false,
        isAwaken: false,
        frequency: 1e3 / 60,

        awake: function () {
            if (!this.isAwaken) {
                this.lastReflow = this.currentTimeStamp = now();
                this.isAwaken = true;
            }
            this.intervalId = this.useRAF ? requestAnimationFrame(this.tick, rootElement) : setTimeout(this.tick, this.frequency);
        },
        sleep: function () {
            if (this.isAwaken) {
                this.isAwaken = false;
                this.lastReflow = this.currentTimeStamp = this.delta = 0;
            }
            (this.useRAF ? cancelRequestAnimationFrame : clearTimeout)(this.intervalId);
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

            for (var i = 0, m = Ticker.listeners.length; i < m; i++) {
                Ticker.listeners[i].clb(Ticker.delta);
            }

            Ticker.lastReflow = Ticker.currentTimeStamp;

            if (Ticker.listeners.length) {
                Ticker.awake();
            }
        },

        /** @type {number} */
        fps: 60,

        /**
         * @param {number} fps
         */
        setFPS: function (fps) {
            this.frequency = 1e3 / fps;
        }
    };

    goog.exportProperty(Ticker, "attach", Ticker.on);
    goog.exportProperty(Ticker, "detach", Ticker.off);
    goog.exportProperty(Ticker, "setFPS", Ticker.setFPS);

    /** @const */
    var SORT_BIGGER = -1;
    /** @const */
    var SORT_EQUALS = 0;
    /** @const */
    var SORT_SMALLER = 1;

    /**
     * @param {!Array} array
     * @param {!function (*, *, number, Array): number} compare
     */
    function bubbleSort(array, compare) {

        var cache;

        for (var j = 0; j < array.length - 1; j += 1) {
            for (var i = 0; i < array.length - 1 - j; i += 1) {
                if (compare(array[i], array[i + 1], i, array) === SORT_SMALLER) {
                    cache = array[i];
                    array[i] = array[i + 1];
                    array[i + 1] = cache;
                }
            }
        }
    }

    /**
     * @param {!Array.<number>} from
     * @param {!Array.<number>} to
     * @param {number} progress
     * @param {!Array.<number>} currentValue
     * @return {boolean}
     */
    function blend (from, to, progress, currentValue) {

        var valueIsChanged = false;
        for (var i = 0, m = from.length; i < m; i++) {
            valueIsChanged = (currentValue[i] !== (currentValue[i] = ( (to[i] - from[i]) * progress + from[i] ) | 0 )) || valueIsChanged;
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
     * @type {!CSSStyleDeclaration}
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
     * @const
     * @type {boolean}
     */
    var USEDSTYLE_SUPPORTED = 'getComputedStyle' in goog.global;

    /**
     * @param {!Element} elem
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
        }
    }

    /**
     * @param {!Element} elem
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
     * @param {!Element} element
     * @param {string} propertyName
     * @param {string} propertyValue
     * @param {string} vendorizedPropName
     * @return {!Array.<number>}
     */
    function toNumericValue (elem, propertyName, propertyValue, vendorizedPropName) {

        if (goog.isNumber(propertyValue)) {
            return [ propertyValue ];
        }

        if (vendorizedPropName.indexOf('color') !== NOT_FOUND) {
            return toNumericValueHooks['color'](elem, propertyName,  propertyValue, vendorizedPropName);
        }

        var valueDescriptor = propertyValue.match(cssNumericValueReg);

        var value = valueDescriptor[ VALREG_VALUE ];
        var numericValue = parseFloat(value);
        var unit = valueDescriptor[ VALREG_DIMENSION ];
        var isHoriz;

        if (unit === '' || unit === 'px') {
            return [ numericValue ];
        }

        isHoriz = horizAxisReg.test(vendorizedPropName);

        if (unit === '%' && vendorizedPropName.indexOf('border') !== -1) {
            numericValue /= 100;
            numericValue *= isHoriz ? elem.clientWidth : elem.clientHeight;
            return [ numericValue ];
        }

        tempElement.style.cssText = "border-style:solid; border-width:0; position:absolute; line-height:0;";

        var ctx = elem;

        if (unit === '%' || !ctx.appendChild) {
            ctx = elem.parentNode || document.body;
            tempElement.style[ isHoriz ? "width" : "height" ] = propertyValue;
        } else {
            tempElement.style[ isHoriz ? "borderLeftWidth" : "borderTopWidth" ] = propertyValue;
        }

        ctx.appendChild(tempElement);
        var normalized = tempElement[ isHoriz ? "offsetWidth" : "offsetHeight" ];
        ctx.removeChild(tempElement);

        return [ normalized ];
    }

    /** @type {Object.<CSSStyleDeclaration, function (!Element, string, string, string): !Array.<number>>} */
    var toNumericValueHooks = {};

    /**
     * @param {!Element} element
     * @param {string} propertyName
     * @param {!Array.<number>} numericValue
     * @param {string} vendorizedPropName
     * @return {string}
     */
    function toStringValue (elem, propertyName, numericValue, vendorizedPropName) {
        if (propertyName in toStringValueHooks) {
            return toStringValueHooks[propertyName](elem, propertyName, numericValue, vendorizedPropName);
        }
        return numericValue + ( propertyName in toStringValueNoPX ? '' : 'px' );
    }

    /** @type {Object.<CSSStyleDeclaration, function (!Element, string, !Array.<number>, string): string>} */
    var toStringValueHooks = {};

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