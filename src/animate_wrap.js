    var animCount = 0;
    
    var durationReg = /^(\d+)(m?s?)$/;
    
    var directionsReg = new RegExp("^(?:(?:" + ["normal", "reverse", "alternate", "alternate-reverse"].join(")|(?:") + "))$");

    var easingAliases = {
        "ease": [0.25, 0.1, 0.25, 1.0],
        "linear": [0.0, 0.0, 1.0, 1.0],
        "ease-in": [0.42, 0, 1.0, 1.0],
        "ease-out": [0, 0, 0.58, 1.0],
        "ease-in-out": [0.42, 0, 0.58, 1.0],
        "step-start": [1, "start"],
        "step-end": [1, "end"],
        _default: "ease"
    };

    var fillModes = {
        "forwards": null
    };

    var cssAnimationsSupported = !! getVendorPropName("animation");
    
    window.Animation = Animation;
    
    /**
     * Конструктор анимаций.
     * @constructor
     * 
     * @param {(Element|Array.<Element>)} elements Элемент или коллекция элементов для анимирования.
     * @param {Object} properties Свойства для анимирования.
     * @param {string=} duration Длительность анимации. По-умолчанию : "400ms".
     * @param {string=} easing Как будут прогрессировать значения свойств. По-умолчанию : "linear".
     * @param {Function=} complete Функция, которая исполнится после завершения анимации. По-умолчанию : "noop".
     * @param {string=} fillMode Как поступать со значениями анимируемых свойств. По-умолчанию : "forwards".
     * @param {string=} delay Задержка перед стартом анимаци. По-умолчанию : "0s".
     * @param {number=} iterationCount Количество итераций анимации. По-умолчанию : "1".
     * @param {string=} direction Направление анимации. По-умолчанию : "normal".
     * @param {boolean=} classicMode Форcированный классический режим. По-умолчанию : "false".
     */
    function Animation (elements, properties, duration, easing, complete, fillMode, delay, iterationCount, direction, classicMode) {

        classicMode = classicMode || !cssAnimationsSupported;

        var self = new (classicMode ? ClassicAnimation:CssAnimation);

        // инициализация для всех видов анимаций :

        self.id = self.generateId();

        // в любом случае должны иметь массив.
        self.elements = self.isElement(elements) ? [elements] : Array.prototype.slice.call(elements);

        self.duration = self.isTimeStringValid(duration) ? duration : "400ms";

        // TODO
        self.easing = typeof easing === "string" ? (easingAliases[easing] || CubicBezier.reg.test(easing) || Steps.reg.test(easing) ? easing : easingAliases._default) : easingAliases._default;

        self.fillMode = fillMode in fillModes ? fillMode : "forwards";

        self.delay = self.isTimeStringValid(delay) ? delay : "0s";

        self.complete = typeof complete === "function" ? complete : noop;

        self.direction = directionsReg.test(direction) ? direction : "normal";

        self.iterationCount = iterationCount === "infinite" ? iterationCount : parseFloat(iterationCount) < 0 ? "1" : iterationCount;

        // инициализация определённого вида анимации.

        self.initialize();

        self.processProperties(properties);

        self.setState("initialized");

        return {

            "start": function () {
                self.start();
                self.setState("started");
            }

        };
    };



    Animation.prototype.setState = function (state) {
        // TODO Event Emitter.
        this.state = state;
    };



    Animation.prototype.isElement = function (argument) {
        return "nodeType" in argument;
    };


    Animation.prototype.isTimeStringValid = function (timeString) {
        return durationReg.test(timeString);
    };



    Animation.prototype.parseTime = function (timeString) {
        return parseFloat(timeString) * (timeString.match(durationReg)[1] === "s" ? 1000 : 1);
    };



    Animation.prototype.generateId = function () {
        return mel + animCount++;
    };



    Animation.prototype.setPlayingState = function (state) {
        if (state === "running" || state === "paused") {
            this.state = state;
        }
    };
    Animation.prototype.keyframeAliases = {
        "from": "0%",
        "to": "100%"
    };
    Animation.prototype.blendHooks = {};


    /**
     * @param {Element} element
     * @param {string} propertyName
     * @param {string=} propertyValue
     *
     * @return {string}
     * */
    Animation.prototype.css = function (element, propertyName, propertyValue) {
        var action = propertyValue === undefined ? "get":"set";

        if (this.cssHooks[propertyName] && this.cssHooks[propertyName][action]) {

            return this.cssHooks[propertyName][action](element, propertyName, propertyValue);

        } 

        propertyName = getVendorPropName(propertyName);

        if (propertyValue === undefined) {

            return parseFloat(getComputedStyle(element)[propertyName]);

        } 

        if (typeof propertyValue === "number") {
            propertyValue += "px";
        }

        element.style[propertyName] = propertyValue;
        
    };



    Animation.prototype.cssHooks = {};
