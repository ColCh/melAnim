    /**
     * Объект, содержащий алиасы
     * @enum {object}
     */
    var aliases = {};

    /**
     * Алиасы для значений ключевых кадров
     * @enum {number}
     */
    var keyAliases = aliases["keys"] = {
        "from": 0,
        "to": 100
    };

    /**
     * Алиасы для временных функций
     * @enum {object}
     */
    var easingAliases =  aliases["easing"] = {};

    /**
     * Временные функции для CSS3 анимаций
     * @enum {array}
     */
    var cubicBezierAliases = aliases["cubicBezier"] = {

        // встроенные
        "linear": [0.0, 0.0, 1.0, 1.0],
        "ease": [0.25, 0.1, 0.25, 1.0],
        "easeIn": [0.42, 0, 1.0, 1.0],
        "easeOut": [0, 0, 0.58, 1.0],
        "easeInOut": [0.42, 0, 0.58, 1.0],
        "stepStart": [1, true],
        "stepEnd": [1, false],

        // дополненные
        "swing": [0.02, 0.01, 0.47, 1],

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
        //"easeInOutBounce": []
    };

    /**
     * Плиближения для кубических кривых
     * @enum {function}
     */
    var cubicBezierApproximations = cubicBezierAliases["approximations"] = {

        linear: function (x) { return x; },

        // взято с jQuery
        swing: function (p) {
            return 0.5 - Math.cos( p * Math.PI ) / 2;
        },

        // взято с
        // Query plugin from GSGD
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
