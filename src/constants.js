    /**
     * Объект, содержащий константы
     * @enum {object}
     */
    var constants = {};

    /**
     * Возможные варианты направления анимации
     * @enum {number}
     */
    var directions = constants["directions"] = {};

    var DIRECTION_NORMAL = directions["normal"] = changeRadix.binToDec("00");
    var DIRECTION_REVERSE = directions["reverse"] = changeRadix.binToDec("01");
    var DIRECTION_ALTERNATE = directions["alternate"] = changeRadix.binToDec("10");
    var DIRECTION_ALTERNATE_REVERSE = directions["alternate-reverse"] = changeRadix.binToDec("11");

    /**
     * Возможные варианты отображения свойств перед стартом анимации и после её окончания
     * @enum {number}
     */
    var fillmodes = constants["fillModes"] = {};

    var FILLMODE_NONE = fillmodes["none"] = changeRadix.binToDec("00");
    var FILLMODE_FORWARDS = fillmodes["forwards"] = changeRadix.binToDec("01");
    var FILLMODE_BACKWARDS = fillmodes["backwards"] = changeRadix.binToDec("10");
    var FILLMODE_BOTH = fillmodes["both"] = changeRadix.binToDec("11");

    /**
     * Возможные варианты состояний анимации
     * @enum {number}
     */
    var playstates = constants["playStates"] = {};

    var PLAYSTATE_RUNNING = playstates["running"] = changeRadix.binToDec("0");
    var PLAYSTATE_PAUSED = playstates["paused"] = changeRadix.binToDec("1");

    var iterationCounts = constants["iterationCounts"] = {};

    var ITERATIONCOUNT_INFINITE = iterationCounts["infinite"] = Number.POSITIVE_INFINITY;

    /**
     * Поддерживаются ли CSS3 анимации текущим браузером.
     * @type {boolean}
     */
    var CSSANIMATIONS_SUPPORTED = !!getVendorPropName("animation");


    var DEFAULT_DURATION = "400ms";
    var DEFAULT_EASING = "ease";
    var DEFAULT_FILLMODE = FILLMODE_FORWARDS;
    var DEFAULT_DELAY = 0;
    var DEFAULT_DIRECTION = DIRECTION_NORMAL;
    var DEFAULT_ITERATIONCOUNT = 1;