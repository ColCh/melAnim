    /**********************************
     *      ОБЩИЕ ВВОДНЫЕ ПЕРЕМЕННЫЕ
     * ********************************/

    /** @const */
    var mel = "melAnimation";

    /** @type {number} */
    var counter = 0;

    /** @const */
    var rootElement = 'document' in goog.global ? document.documentElement:null;


    /**
     * Абстрактная рега для парсинга CSS функций (в том числе transform-функций)
     * @type {RegExp}
     * @const
     * @example
     *  skewX(3deg, 5deg) ---> [ "skewX(3deg, 5deg)", "skewX", "3deg, 5deg" ]
     *  steps(4, start) ---> [ "steps(4, start)", "steps", "3, start" ]
     *  rgb(1, 2, 3) ---> [ "rgb(1, 2, 3)", "rgb", "1, 2, 3" ]
     */
    var cssFunctionReg = new RegExp([
        "([\\w-]+?)",  // Сама функция
        "\\(",
            "([^)]*?)", // Аргументы к функции
        "\\)"
    ].join(""));

    /**
     * @const
     * @type {number}
     */
    var FUNCREG_SOURCE = 0;
    /**
     * @const
     * @type {number}
     */
    var FUNCREG_FUNC = 1;
    /**
     * @const
     * @type {number}
     */
    var FUNCREG_ARGS = 2;

    /**
     * Разделитель аргументов в функциях CSS
     * ( аргумент в String.split )
     * @const
     * @type {string}
     */
    var cssFuncArgsSeparator = ",";

    /**
     * Регвыр для выделения численного значения и размерности у значений CSS свойств
     * Вывод:
     *      [  0: SOURCE, 1: NUMERIC_VALUE, 2: PROPERTY_DIMENSION  ]
     * @type {RegExp}
     * @const
     * @example
     *      "2" ---> ["2", "2", ""]
     *      "2px" ---> ["2px", "2", "px"]
     */
    var cssNumericValueReg = new RegExp([
        "^",
            "(",
                "-?\\d*\\.?\\d+",   // Численное значение как пригодный аргумент в parseFloat
            ")",
            "(",
                ".*",               // Размерность свойства
            ")",
        "$"
    ].join(""));;

    /**
     * @const
     * @type {number}
     */
    var VALREG_SOURCE = 0;
    /**
     * @const
     * @type {number}
     */
    var VALREG_VALUE = 1;
    /**
     * @const
     * @type {number}
     */
    var VALREG_DIMENSION = 2;