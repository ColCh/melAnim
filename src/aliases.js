    /**
     * Объект, содержащий алиасы
     * @enum {object}
     */
    var aliases = {};

    /**
     * Алиасы для временных функций
     * @enum {object}
     */
    var easingAliases =  aliases["easing"] = {};

    var cubicBezierAliases = aliases["cubicBezier"] = {

        // встроенные
        "linear": [0.0, 0.0, 1.0, 1.0],
        "ease": [0.25, 0.1, 0.25, 1.0],
        "ease-in": [0.42, 0, 1.0, 1.0],
        "ease-out": [0, 0, 0.58, 1.0],
        "ease-in-out": [0.42, 0, 0.58, 1.0],
        "step-start": [1, true],
        "step-end": [1, false],

        // дополненные
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
        "easeInOutBack":[0.68, -0.55, 0.265, 1.55]
    };