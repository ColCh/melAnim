    /**
     * Время анимации поумолчанию
     * @type {string}
     * @const
     */
    var DEFAULT_DURATION = "400ms";

    /**
     * Смягчение анимации по умолчанию
     * @type {string}
     * @const
     */
    var DEFAULT_EASING = "ease";

    /**
     * Режим заполнения свойств по умолчанию
     * @type {string}
     * @const
     */
    var DEFAULT_FILLMODE = "forwards";

    /**
     * Задежка перед началом после старта в мсек. по умолчанию
     * @type {string}
     * @const
     */
    var DEFAULT_DELAY = "0s";

    /**
     * "Направление" анимации по умолчанию
     * @type {string}
     * @const
     */
    var DEFAULT_DIRECTION = "normal";

    /**
     * Количество проходов анимации по умолчанию
     * @type {string}
     * @const
     */
    var DEFAULT_ITERATIONCOUNT = "1";

    /**
     * Обработчик событий по умолчанию (пустая функция)
     * @type {Function}
     * @const
     */
    var DEFAULT_HANDLER = noop;

    /**
     * Состояние проигрывания анимации при  её создании через конструктор
     * @type {string}
     * @const
     */
    var DEFAULT_PLAYINGSTATE = "paused";

    /*
     * Конструктор анимаций.
     * @constructor
     *
     * @param {(Element|Array.<Element>)} elements Элемент(ы) для анимирования.
     * @param {object} keyframes Свойства для анимирования.
     * @param {(string|Object)=} duration Длительность анимации или объект с продвинутыми настройками. По-умолчанию : "400ms".
     * @param {string=} easing Как будут прогрессировать значения свойств. По-умолчанию : "ease".
     * @param {function=} oncomplete Функция, которая исполнится после завершения анимации. По-умолчанию : "noop", т.е. пустая функция.
     */
    function Animation (elements, keyframes, duration, easing, oncomplete) {

        var
            /**
             * Используется ли классический режим (true), или режим css3 анимаций (false)
             * @type {boolean}
             */
            classicMode,

            /**
             * Направление анимации
             * @type {string}
             */
            direction,

            /**
             * Функция исполнится, когда анимация наснёт работать (после delay)
             * @type {Function}
             */
            onstart,

            /**
             * Исполнится, когда завершится очередной проход анимации
             * @type {Function}
             */
            oniteration,

            /**
             * Количество проходов (максимальный прогресс относительно первой итерации)
             * @type {number}
             */
            iterationCount,

            /**
             * Время отложенного запуска
             * @type {number}
             */
            delay,

            /**
             * Режим заполнения свойств
             * @type {string}
             */
            fillMode,

            /**
             * Состояние проигрывания анимации
             * @type {string}
             */
            state;

        // если передан объект с расширенными опциями; разворачиваем его.
        if (typeOf.object(duration) && arguments.length === 3) {

            classicMode = duration["classicMode"];

            onstart = duration["onstart"];
            oniteration = duration["oniteration"];
            oncomplete = duration["oncomplete"];

            easing = duration["easing"];

            duration = duration["duration"];
            direction = duration["direction"];
            iterationCount = duration["iterationCount"];
            delay = duration["delay"];
            fillMode = duration["fillMode"];

        }

        // пока не доделан
        classicMode = true;//classicMode || !CSSANIMATIONS_SUPPORTED;

        // создание анимации через конструктор предполагает ручной запуск
        state = DEFAULT_PLAYINGSTATE;
    };

    /**
     * Функция, позволяющая анимировать без муторного создания объектов в один вызов
     */
    function animate () {
        // TODO доделать функцию анимации
    }