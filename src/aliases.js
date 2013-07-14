    /**
     * Ключ - CamelCased строка, значение - аргументы к CSS функции
     * @enum {Array.<number>}
     * */
    var cssEasingAliases = {
        "easeInCubic":[ 0.55, 0.055, 0.675, 0.19 ]
    };

    /**
     * Ключ - CamelCased строка, значение - мат. приближение для кубической кривой
     * @enum {function (number): number}
     *  */
    var cubicBezierApproximations = {
        "easeInCubic": function (x) {
            return x * x * x;
        }
    };

    /** @enum {!Array.<number>} */
    var colorsAliases = {
        black: [0, 0, 0],
        blue: [0, 0, 255],
        white: [255, 255, 255],
        yellow: [255,255 ,0],
        orange: [255,165, 0],
        gray: [128,128, 128],
        green: [0, 128, 0],
        red: [255, 0, 0],
        transparent: [255, 255, 255]
    }