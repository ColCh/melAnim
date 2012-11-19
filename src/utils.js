    function type (x) {
        var type = typeof(x);
        if (type === "object") {
            type = Object.prototype.toString.call(x).slice(8, -1).toLowerCase();
        }
        return type;
    }



    /**
     * Попытается вернуть верное имя свойтсва, подобрав при возможности вендорный префикс.
     * Возвращает null в случае неудачи.
     *
     * @param {string} property Имя свойства.
     * @param {boolean=} noCss Где смотреть наличие свойств - в стилях при false, и в window при true.
     * @param {Object=} target В каком объекте смотреть наличие свойства.
     *
     * @return {(string|null)} Имя существующего у объекта свойства или null.
     * */
    function getVendorPropName (property, noCss, target) {

        target = target || noCss ? window : dummy;

        // в каком объекте будем запоминать результаты вычислений.
        var cache = getVendorPropName;

        if (target[property] !== undefined) {
            return property;
        }

        if (cache[property] === undefined) {

            cache[property] = null;

            var camelcased = property.replace(/-(.)/g, function (a, letter) {
                return letter.toUpperCase();
            });

            if (camelcased in target) {

                cache[property] = camelcased;

            } else {

                camelcased = camelcased.charAt().toUpperCase() + camelcased.slice(1);

                if (prefix) {

                    if (target[prefix + camelcased] !== undefined) {
                        cache[property] = prefix + camelcased;
                    } else if (target[lowPrefix + camelcased] !== undefined) {
                        cache[property] = lowPrefix + camelcased;
                    }

                } else {

                    for ( var prefixes = "ms O Moz webkit".split(" "), i = prefixes.length; ! prefix && i--;) {
                        if (target[prefixes[i] + camelcased] !== undefined) {
                            prefix = prefixes[i];
                            lowPrefix = prefix.toLowerCase();
                            cache[property] = prefix + camelcased;
                        } else if (target[(lowPrefix = prefixes[i].toLowerCase()) + camelcased] !== undefined) {
                            prefix = prefixes[i];
                            cache[property] = lowPrefix + camelcased;
                        }
                    }

                }
            }
        }

        return cache[property];
    }



    function CubicBezier (p1x, p1y, p2x, p2y) {
        this.cx = 3.0 * p1x;
        this.bx = 3.0 * (p2x - p1x) - this.cx;
        this.ax = 1.0 - this.cx - this.bx;

        this.cy = 3.0 * p1y;
        this.by = 3.0 * (p2y - p1y) - this.cy;
        this.ay = 1.0 - this.cy - this.by;
    }
    CubicBezier.prototype.solveEpsilon = function (duration) {
        return 1.0 / (200.0 * duration);
    };
    CubicBezier.prototype.sampleCurveX = function (t) {
        return ((this.ax * t + this.bx) * t + this.cx) * t;
    };
    CubicBezier.prototype.sampleCurveY = function (t) {
        return ((this.ay * t + this.by) * t + this.cy) * t;
    };
    CubicBezier.prototype.sampleCurveDerivativeX = function (t) {
        return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
    };
    CubicBezier.prototype.solveCurveX = function (x, epsilon) {
        var t0, t1, t2, x2, d2, i;

        for (t2 = x, i = 0; i < 8; i++) {
            x2 = this.sampleCurveX(t2) - x;
            if (Math.abs(x2) < epsilon)
                return t2;
            d2 = this.sampleCurveDerivativeX(t2);
            if (Math.abs(d2) < 1e-6)
                break;
            t2 = t2 - x2 / d2;
        }

        t0 = 0.0;
        t1 = 1.0;
        t2 = x;

        if (t2 < t0)
            return t0;
        if (t2 > t1)
            return t1;

        while (t0 < t1) {
            x2 = this.sampleCurveX(t2);
            if (Math.abs(x2 - x) < epsilon)
                return t2;
            if (x > x2)
                t0 = t2;
            else
                t1 = t2;
            t2 = (t1 - t0) * .5 + t0;
        }

        return t2;
    };
    CubicBezier.prototype.solve = function (x, duration) {
        return this.sampleCurveY(this.solveCurveX(x, this.solveEpsilon(duration)));
    };
    CubicBezier.reg = /^cubic-bezier\((-?\d*\.?\d+), (-?\d*\.?\d+), (-?\d*\.?\d+), (-?\d*\.?\d+)\)$/;



    function Steps (numberOfSteps, stepAtStart) {
        this.numberOfSteps = numberOfSteps;
        this.stepAtStart = stepAtStart;
    }
    Steps.prototype.solve = function (x) {
        if (this.stepAtStart){
            return Math.min(1.0, Math.ceil(this.numberOfSteps * x) / this.numberOfSteps);
        }
        return Math.floor(this.numberOfSteps * x) / this.numberOfSteps;
    };
    Steps.reg = /^steps\((\d+)(?:, ((?:start)|(?:end)))?\)$/;



    function inherit (child, parent) {
        var F = function () {};
        F.prototype = parent.prototype;
        child.prototype = new F;
        child.prototype.constructor = child;
    }



    function getComputedStyle (element) {
        return window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
    }
