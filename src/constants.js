    /**
     * Объект, содержащий константы
     * @enum {object}
     */
    var constants = {};

    var DIRECTION_NORMAL = "normal";
    var DIRECTION_REVERSE = "reverse";
    var DIRECTION_ALTERNATE = "alternate";
    var DIRECTION_ALTERNATE_REVERSE = "alternate-reverse";

    /**
     * Возможные варианты направления анимации
     * @enum {number}
     */
    var directions = constants["directions"] = generateDictionary(DIRECTION_NORMAL, DIRECTION_REVERSE, DIRECTION_ALTERNATE, DIRECTION_ALTERNATE_REVERSE);



    var FILLMODE_NONE = "none";
    var FILLMODE_FORWARDS = "forwards";
    var FILLMODE_BACKWARDS = "backwards";
    var FILLMODE_BOTH = "both";

    /**
     * Возможные варианты отображения свойств перед стартом анимации и после её окончания
     * @enum {number}
     */
    var fillmodes = constants["fillModes"] = generateDictionary(FILLMODE_NONE, FILLMODE_BACKWARDS, FILLMODE_FORWARDS, FILLMODE_BOTH);



    var PLAYSTATE_RUNNING = "running";
    var PLAYSTATE_PAUSED = "paused";

    /**
     * Возможные варианты состояний анимации
     * @enum {number}
     */
    var playstates = constants["playStates"] = generateDictionary(PLAYSTATE_PAUSED, PLAYSTATE_RUNNING);



    var iterationCounts = constants["iterationCounts"] = {};

    var ITERATIONCOUNT_INFINITE = iterationCounts["infinite"] = Number.POSITIVE_INFINITY;

    /**
     * Поддерживаются ли CSS3 анимации текущим браузером.
     * @type {boolean}
     */
    var CSSANIMATIONS_SUPPORTED = !!getVendorPropName("animation");