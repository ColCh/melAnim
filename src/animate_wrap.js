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
    
    window.Animation = Animation;
    
    /**
     * @constructor
     * 
     * @param {Element} elements
     * @param {Object} properties
     * @param {string} duration
     * @param {string} easing
     * @param {Function} complete
     * @param {string} fillMode
     * @param {string} delay
     * @param {number} iterationCount
     * @param {string} direction
     * @param {boolean} classicMode
     */
    function Animation (elements, properties, duration, easing, complete, fillMode, delay, iterationCount, direction, classicMode) {
        classicMode = classicMode || ! getVendorPropName("animation");
        var Constructor;
        if (classicMode) {
            Constructor = ClassicAnimation;
        }
        return new Constructor(elements, properties, duration, easing, complete, fillMode, delay, iterationCount, direction, classicMode);
    }
    
    Animation.prototype.fillInstance = function (elements, properties, duration, easing, complete, fillMode, delay, iterationCount, direction, classicMode) {
        this.id = mel + animCount++;

        elements = elements.nodeType === undefined ? Array.prototype.slice.call(elements) : [elements];
        
        this.elements = [];

        for(var i = 0; i < elements.length; i++) {
            this.elements.push({
                element: elements[i],
                computedPropValues: {}
            });
        }

        this.duration = durationReg.test(duration) ? duration : "400ms";
        this.easing = typeof easing === "string" ? (easingAliases[easing] || CubicBezier.reg.test(easing) || Steps.reg.test(easing) ? easing : easingAliases._default) : easingAliases._default;
        this.fillMode = fillMode;
        this.delay = durationReg.test(delay) ? delay : "0s";
        this.complete = typeof complete === "function" ? complete : noop;
        this.direction = directionsReg.test(direction) ? direction : "normal";
        this.iterationCount = iterationCount === "infinite" ? iterationCount : parseFloat(iterationCount) < 0 ? "1" : iterationCount;
        this.state = "paused";
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
