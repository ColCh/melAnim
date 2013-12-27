    /**
     * @const
     * @type {number}
     */
    var BLEND_DIGITS = 0;


    /**
     * @const
     * @type {number}
     */
    var TICKER_BASE_FPS = 60;


    /**
     * @const
     * @type {number}
     */
    var MINIMAL_PROGRESS = 0;

    /**
     * @const
     * @type {number}
     */
    var MAXIMAL_PROGRESS = 1.0;

    var PROGRESS_START = 'start';

    /**
     * @const
     * @type {number}
     */
    var NOT_FOUND = -1;


    /** @const */
    var SORT_BIGGER = -1;

    /** @const */
    var SORT_EQUALS = 0;

    /** @const */
    var SORT_SMALLER = 1;

    /**
     * @const
     * @type {number}
     */
    var BLEND_ROUND = Math.pow(10, BLEND_DIGITS);

    /**
     * @const
     * @type {number}
     */
    var TICKER_BASE_INTERVAL = 1e3 / TICKER_BASE_FPS;

    /**
     * @const
     * @type {string}
     */
    var ANIMATION_NAME_NONE = 'none';

    /**
     * Имя CSS-свойства для назначения \ получения имени анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_NAME = "animation-name";

    /**
     * Имя CSS-свойства для назначения \ получения статуса проигрывания анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_PLAY_STATE = "animation-play-state";

    /**
     * Имя CSS-свойства для назначения \ получения продолжительности анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_DURATION = "animation-duration";

    /**
     * Имя CSS-свойства для назначения \ получения временной функции смягчения анимации \ ключевого кадра.
     * @type {string}
     * @const
     */
    var ANIMATION_TIMING_FUNCTION = "animation-timing-function";

    /**
     * Имя CSS-свойства для назначения \ получения задержки старта анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_DELAY = "animation-delay";

    /**
     * Имя CSS-свойства для назначения \ получения количества проходов анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_ITERATION_COUNT = "animation-iteration-count";

    /**
     * Имя CSS-свойства для назначения \ получения направления прогрессирования анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_DIRECTION = "animation-direction";

    /**
     * Имя CSS-свойства для назначения \ получения режима заполнения анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_FILL_MODE = "animation-fill-mode";

    /**
     * @type {boolean}
     * @const
     */
    var ANIMATION_HANDLER_USES_CAPTURE = true;

    /**
     * Все известные имена событий конца анимаций
     * @type {Array}
     * @const
     */
    var ANIMATION_END_EVENTNAMES = ["animationend", "webkitAnimationEnd", "OAnimationEnd", "MSAnimationEnd"];

    /**
     * Специальное значение для идентификации события конца анимации
     * Используется в обработчике, который ловит все поступающие события анимаций
     * @type {string}
     * @const
     */
    var ANIMATION_END_EVENTTYPE = "animationend";

    /**
     * Все известные имена событий конца итераций анимаций
     * @type {Array}
     * @const
     */
    var ANIMATION_ITERATION_EVENTNAMES = ["animationiteration", "webkitAnimationIteration", "OAnimationIteration", "MSAnimationIteration"];

    /**
     * Специальное значение для идентификации события конца прохода
     * Используется в обработчике, который ловит все поступающие события анимаций
     * @type {string}
     * @const
     */
    var ANIMATION_ITERATION_EVENTTYPE = "animationiteration";

    /**
     * Все известные имена событий старта  анимаций
     * @type {Array}
     * @const
     */
    var ANIMATION_START_EVENTNAMES = ["animationiteration", "webkitAnimationStart", "OAnimationStart", "MSAnimationStart"];

    /**
     * Специальное значение для идентификации события старта анимации
     * Используется в обработчике, который ловит все поступающие события анимаций
     * @type {string}
     * @const
     */
    var ANIMATION_START_EVENTTYPE = "animationstart";

    /**
     * @type {string}
     * @const
     */
    var ANIMATION_PLAY_STATE_PAUSED = "paused";
    /**
     * @type {string}
     * @const
     */
    var ANIMATION_PLAY_STATE_RUNNING = "running";

    /**
     * Сколько чисел после запятой у точек в кубических кривых Безье.
     * @type {number}
     * @const
     */
    var CUBIC_BEZIER_POINTS_DIGITS = 3;