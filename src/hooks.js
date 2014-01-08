    /* ------------------   РАБОТА С ЦВЕТАМИ   --------------------- */
    toNumericValueHooks["color"] = function (elem, propertyName,  propertyValue, vendorizedPropName) {
        var red, green, blue;

        if (propertyValue in colorsAliases) {
            // Алиас
            return colorsAliases[ propertyValue ];
        } else if (propertyValue.indexOf("#") !== -1) {
            // HEX
            var hex = parseInt(propertyValue.slice(1), 16);
            red = hex >> 16 & 0xFF;
            green = hex >> 8 & 0xFF;
            blue = hex & 0xFF;
            return [ red, green, blue ];
        } else {
            // Цветовая CSS-функция
            // RGB, RGBa, HSL, HSLa ...
            var matched = propertyValue.match(cssFunctionReg);
            var func = matched[1];
            var args = removeSpaces(matched[2]).split(cssFuncArgsSeparator);

            for (var i = 0; i < args.length; i++) {
                matched = args[i].match(cssNumericValueReg);
                args[i] = [ parseFloat(matched[1]), matched[2] ];
            }

            if (func in colorFunctions) {
                return colorFunctions[func](args);
            }

            return [ 0, 0, 0 ];

        }
    };


    /** @type {function(number, number, number): number} */
    function hueToRGB (m1, m2, hue) {
        if (hue < 0) {
            hue = hue + 1;
        }
        if (hue > 1) {
            hue = hue - 1;
        }
        if (hue * 6 < 1) {
            return m1 + (m2 - m1) * hue * 6;
        }
        if (hue * 2 < 1) {
            return m2;
        }
        if (hue * 3 < 2) {
            return m1 + (m2 - m1) * (2/3 - hue) * 6;
        }
        return m1;
    }

    /** @enum {function (!Array.<number>): !Array.<number>} */
    var colorFunctions = {

        // http://www.w3.org/TR/2011/REC-css3-color-20110607/#hsl-color
        "hsl": function (args) {
            var hue = args[0][0];
            var saturation = args[1][0] / 100;
            var lightness = args[2][0] / 100;
            var m2 = (lightness <= 0.5) ? lightness * (saturation + 1) : (lightness + saturation - lightness * saturation);
            var m1 = lightness * 2 - m2;
            var red = round(hueToRGB(m1, m2, hue + 1/3) * 255, 0);
            var green = round(hueToRGB(m1, m2, hue) * 255, 0);
            var blue = round(hueToRGB(m1, m2, hue - 1/3) * 255, 0);
            return [ red, green, blue ];
        },

        "rgb": function (args) {

            var red, green, blue;

            for (var i = 0; i < args.length; i++) {
                // Цветовой канал передан в процентах
                if (args[i][1] === "%") {
                    //  переводим из проценты в доли
                    args[i][0] /= 100;
                    // умножаем на максимум
                    args[i][0] *= 255;
                }
                // проверяем интервал
                if (args[i][0] < 0) {
                    args[i][0] = 0;
                } else if (args[i][0] > 255) {
                    args[i][0] = 255;
                }
            }

            red = round(args[0][0], 0);
            green = round(args[1][0], 0);
            blue = round(args[2][0], 0);

            return [ red, green, blue ];
        },

        "hsla": function (args) {
            var rgb = colorFunctions["hsl"](args);
            var opacity = round(args[3][0], 1);
            var hsla = rgb.concat(opacity);
            return hsla;
        },

        "rgba": function (args) {
            var rgb = colorFunctions["rgb"](args);
            var opacity = round(args[3][0], 1);
            var rgba = rgb.concat(opacity);
            return rgba;
        }

    };


    toStringValueHooks["color"] = function (elem, propertyName, numericValue, vendorizedPropName) {
        var colorFunction = 'rgb';
        if (numericValue.length === 4) {
            // Последний элемент в массиве - альфа канал
            colorFunction += 'a';
        }
        return colorFunction + "(" + numericValue.join(', ') + ")";
    };

    blendHooks["color"] = function (from, to, easing, current, round) {

        // Цветовой канал лежит в интервале [ 0, 255 ]
        if (easing < MINIMAL_PROGRESS) {
            easing = MINIMAL_PROGRESS;
        } else if (easing > MAXIMAL_PROGRESS) {
            easing = MAXIMAL_PROGRESS;
        }

        return blend(from, to, easing, current, 1);

    };


    /* ------------------   РАБОТА С TRANSFORM   --------------------- */

    var cssTransformFuncReg = new RegExp([
        "\\s",    // пробел
        "(?!",   // за которым нет
            "[-\\.\\d]",  // CSS-значения
        ")"
    ].join(""));

    /** @const */
    var TRANSFORMDATA_ROTATE = 0;
    /** @const */
    var TRANSFORMDATA_SCALE_X = 1;
    /** @const */
    var TRANSFORMDATA_SCALE_Y = 2;
    /** @const */
    var TRANSFORMDATA_SKEW_X = 3;
    /** @const */
    var TRANSFORMDATA_SKEW_Y = 4;
    /** @const */
    var TRANSFORMDATA_TRANSLATE_X = 5;
    /** @const */
    var TRANSFORMDATA_TRANSLATE_Y = 6;

    /**
     * @enum {function (!Array, !Array.<Array>)}
     */
    var TransformSetters = {

        "scaleX": function (args, data) {
            data[TRANSFORMDATA_SCALE_X] = parseFloat(args[0]) * 100;
        },
        "scaleY": function (args, data) {
            data[TRANSFORMDATA_SCALE_Y] = parseFloat(args[0]) * 100;
        },
        "scale": function (args, data) {
            data[TRANSFORMDATA_SCALE_X] = parseFloat(args[0]) * 100;
            data[TRANSFORMDATA_SCALE_Y] = parseFloat(args[1]) * 100;
        },

        "rotate": function (args, data) {
            data[TRANSFORMDATA_ROTATE] = toDeg(args[0]);
        },

        "skewX": function (args, data) {
            data[TRANSFORMDATA_SKEW_X] = parseInt(args[0]);
        },
        "skewY": function (args, data) {
            data[TRANSFORMDATA_SKEW_Y] = parseInt(args[0]);
        },
        "skew": function (args, data) {
            data[TRANSFORMDATA_SKEW_X] = parseInt(args[0]);
            data[TRANSFORMDATA_SKEW_Y] = parseInt(args[1]);
        },

        "translateX": function (args, data) {
            data[TRANSFORMDATA_TRANSLATE_X] = parseFloat(args[0]);
        },
        "translateY": function (args, data) {
            data[TRANSFORMDATA_TRANSLATE_Y] = parseFloat(args[0]);
        },
        "translate": function (args, data) {
            data[TRANSFORMDATA_TRANSLATE_X] = parseFloat(args[0]);
            data[TRANSFORMDATA_TRANSLATE_Y] = parseFloat(args[1]);
        },


        "matrix": function (args, data) {

            //       0  1  2  3  4  5
            //matrix(a, b, c, d, e, f)   <--- 2D

            for (var i = 0; i < args.length; i++) {
                args[i] = parseFloat(args[i]);
            }

            // Проводим декомпозицию матрицы

            data[ TRANSFORMDATA_TRANSLATE_X ] = args[4];
            data[ TRANSFORMDATA_TRANSLATE_Y ] = args[5];

            var row_1_length = Math.sqrt(args[0] * args[0] + args[1] * args[1]);

            data[ TRANSFORMDATA_SCALE_X ] = row_1_length * 100;

            // Нормализируем первый столбец
            args[0] /= row_1_length;
            args[1] /= row_1_length;

            var dot_product_1 = args[0] * args[2] + args[1] * args[3];

            data[ TRANSFORMDATA_SKEW_X ] = toDegModificators["rad"]( dot_product_1 );

            // Combine
            args[2] -= dot_product_1 * args[0];
            args[3] -= dot_product_1 * args[1];

            var row_2_length = Math.sqrt(args[2] * args[2] + args[3] * args[3]);

            data[ TRANSFORMDATA_SCALE_Y ] = row_2_length * 100;

            // Нормализируем второй столбец
            args[2] /= row_2_length;
            args[3] /= row_2_length;


            var dot_product_2 = args[0] * args[4] + args[1] * args[5];

            data[ TRANSFORMDATA_SKEW_Y ] = toDegModificators["rad"]( dot_product_2 );

            // Combine
            args[4] -= dot_product_2 * args[0];
            args[5] -= dot_product_2 * args[1];

            var row_3_length = Math.sqrt(args[4] * args[4] + args[5] * args[5]);

            // Нормализируем третий столбец
            args[4] /= row_3_length;
            args[5] /= row_3_length;

            data[ TRANSFORMDATA_ROTATE ] = toDegModificators["rad"]( Math.atan2(args[1], args[0]) );

         }

    };

    toNumericValueHooks["transform"] = function (elem, propertyName,  propertyValue, vendorizedPropName) {

        // Декомпозированные данные трансформации
        var transformData = [ 0, 100, 100, 0, 0, 0, 0 ];

        if (propertyValue === "none" || propertyValue === "") {
            return transformData;
        }

        var matched;

        var transforms = propertyValue.split(cssTransformFuncReg);

        for (var i = 0; i < transforms.length; i++) {

            matched = transforms[i].match(cssFunctionReg);

            var func = matched[FUNCREG_FUNC];
            var args = removeSpaces(matched[FUNCREG_ARGS]).split(cssFuncArgsSeparator);

            TransformSetters[func](args, transformData);
        }

        return transformData;
    };

    toStringValueHooks["transform"] = function (elem, propertyName, numericValue, vendorizedPropName) {
        var currentTransforms = "";

        if ( numericValue[TRANSFORMDATA_ROTATE] % 360 !== 0 ) {
            currentTransforms += " " + "rotate(" + numericValue[TRANSFORMDATA_ROTATE] + "deg" + ")";
        }

        if (numericValue[TRANSFORMDATA_SKEW_X] !== 0 || numericValue[TRANSFORMDATA_SKEW_Y] !== 0 ) {
            currentTransforms += " " + "skew(" + numericValue[TRANSFORMDATA_SKEW_X] + "deg" + "," + numericValue[TRANSFORMDATA_SKEW_Y] + "deg" + ")";
        }

        if (numericValue[TRANSFORMDATA_TRANSLATE_X] !== 0 || numericValue[TRANSFORMDATA_TRANSLATE_Y] !== 0) {
            currentTransforms += " " + "translate(" + numericValue[TRANSFORMDATA_TRANSLATE_X] + "px" + "," + numericValue[TRANSFORMDATA_TRANSLATE_Y] + "px" + ")";
        }

        // Scale должна идти в конце трансформаций, иначе будет влиять на них. "scaleX(32) translateX(1px)" даст смещение в "32px"
        if (numericValue[TRANSFORMDATA_SCALE_X] !== 100 || numericValue[TRANSFORMDATA_SCALE_Y] !== 100) {
            currentTransforms += " " +  "scale(" + numericValue[TRANSFORMDATA_SCALE_X] / 100 + "," + numericValue[TRANSFORMDATA_SCALE_Y] / 100 + ")";
        }

        return currentTransforms;
    };


    /* ------------------   РАБОТА С SHADOW   --------------------- */
    var SHADOW_X = 0;
    var SHADOW_Y = 1;
    var SHADOW_BLUR = 2;
    var SHADOW_SPREAD = 3;
    var SHADOW_COLOR = 4;

    function Shadow () {
        // Initial данные тени - нет смещений, размытия, длины и чёрный цвет
        this.data = [ 0, 0, 0, 0, [0, 0, 0]];
    }

    Shadow.prototype.inset = false;
    Shadow.prototype.isNone = false;

    Shadow.prototype.parse = function (shadow) {

        if (shadow === "none") {
            this.isNone = true;
            return;
        }

        // все параметры тени, кроме цвета
        var props = shadow.match(/(?:inset\s)?(?:\s*-?\d*\.?\d+\w*\s*){2,4}/)[0];
        // Цвет в любом формате
        var color = shadow.replace(props, "");

        this.data[SHADOW_COLOR] = toNumericValueHooks["color"](null, "color", color, false);

        // Х, У, размытие и длина тени, разделённые пробелом
        props = props.split(" ");

        var settedData = 0;

        for (var i = 0; i < props.length; i++) {
            if (props[i] == "inset") {
                this.inset = true;
            } else if (cssNumericValueReg.test(props[i])) {
                // TODO EM, % и другие Length в Shadow.
                this.data[settedData++] = parseFloat(props[i]) * 10;
            }
        }

    };

    Shadow.prototype.toString = function () {
        var shadow = "";
        if (this.inset) {
            shadow += "inset" + " ";
        }
        for (var i = 0; i < 4; i++) {
            if (i > 1 || this.data[i] !== 0) {
                shadow += (this.data[i] / 10) + "px" + " ";
            }
        }
        shadow += toNumericValueHooks["color"](null, "color", this.data[SHADOW_COLOR], true);
        return shadow;
    };

    toNumericValueHooks["text-shadow"] = toNumericValueHooks["box-shadow"] = function ( propertyValue) {
        var shadow, shadowList;
        shadowList = propertyValue.split(/,\s*(?![^\)]+\))/);
        for (var i = 0; i < shadowList.length; i++) {
            shadow = new Shadow();
            shadow.parse(shadowList[i]);
            shadowList[i] = shadow;
        }
        return shadowList;
    };
    blendHooks["text-shadow"] = blendHooks["box-shadow"] = function (from, to, easing, current, id) {
        var changed = false;

        var shadowList = id in current ? current[id] : ( current[id] = [] );

        // Список теней в разный ключевых кадрах может быть
        // разным, поэтому берём максимум из обоих
        var m = from.length > to.length ? from.length : to.length;

        var shadow, fromShadow, toShadow;

        for (var k = 0; k < m; k++) {

            if (k in from) {
                fromShadow = from[k];
            } else {
                fromShadow = from[k] = new Shadow();
                fromShadow.isNone = true;
            }

            if (k in to) {
                toShadow = to[k];
            } else {
                toShadow = to[k] = new Shadow();
                toShadow.isNone = true;
            }

            // по спецификации можно интерполировать значения только
            // совпадающих по параметру inset теней
            if ( fromShadow.inset  !== toShadow.inset && !fromShadow.isNone && !toShadow.isNone) {
                continue;
            }

            if (k in shadowList) {
                shadow = shadowList[k];
            } else {
                shadow = shadowList[k] = new Shadow();
                shadow.inset = fromShadow.isNone ? toShadow.inset : toShadow.isNone ? fromShadow.inset : fromShadow.inset && toShadow.inset;
                changed = true;
            }

            // Интерполяция всех параметров. кроме цвета
            for (var i = 0; i < 4; i++) {
                if (blend(fromShadow.data[i], toShadow.data[i], easing, shadow.data, '' + i) && changed === false) {
                    changed = true;
                }
            }

            // Интерполяция цвета
            if (blendHooks["color"](fromShadow.data[SHADOW_COLOR], toShadow.data[SHADOW_COLOR], easing, shadow.data, '' + SHADOW_COLOR) && !changed) {
                changed = true;
            }

        }

        return changed;
    };

    /* ------------------   РАБОТА С OPACITY   --------------------- */
    var BLEND_OPACITY_ROUND = 2;
    blendHooks["opacity"] = function (from, to, easing, current, round) {
        return blend(from, to, easing, current, BLEND_OPACITY_ROUND);
    };