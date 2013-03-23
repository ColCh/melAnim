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
     * Состояние проигрывания анимации при  её создании через конструктор
     * @type {string}
     * @const
     */
    var DEFAULT_PLAYINGSTATE = "paused";

    /*
     * Конструктор анимаций.
     * Формат передаци свойств:
     * keyframes = {
     *     %KEY% : {
     *         %PROPERTY_NAME% : %PROPERTY_VALUE%
     *     }
     * }
     *
     * @param {(Element|Array.<Element>)} element Элемент(ы) для анимирования.
     * @param {object} keyframes Свойства для анимирования.
     * @param {(string|Object)=} duration Длительность анимации или объект с продвинутыми настройками. По-умолчанию : "400ms".
     * @param {(string|Array|Function)=} easing Как будут прогрессировать значения свойств. По-умолчанию : "ease".
     * @param {function=} oncomplete Функция, которая исполнится после завершения анимации. По-умолчанию : "noop", т.е. пустая функция.
     * @return {(ClassicAnimation|CSSAnimation  )}
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
             * Функция, котоаря будет исполняться на каждом шаге анимации
             * @type {Function}
             */
            onstep,

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
             * Ссылка на конструктор классической или CSS анимации, в зависимости от флага classicMode
             * @type {Function}
             */
            construct,

            /**
             * Созданный экземпляр анимации
             * @type {(ClassicAnimation|CSSAnimation)}
             */
            self;

        var options;

        // если передан объект с расширенными опциями; разворачиваем его.
        if (typeOf.object(duration) && arguments.length === 3) {

            options = duration;

            classicMode = options["classicMode"];

            onstart = options["onstart"];
            oniteration = options["oniteration"];
            oncomplete = options["oncomplete"];
            onstep = options["onstep"];

            easing = options["easing"];

            duration = options["duration"];
            direction = options["direction"];
            iterationCount = options["iterationCount"];
            delay = options["delay"];
            fillMode = options["fillMode"];

        }

        classicMode = classicMode || typeOf.func(easing) || !CSSANIMATIONS_SUPPORTED;

        if (ENABLE_DEBUG) {
            console.log('Animation: created instance is "' + (classicMode ? "ClassicAnimation":"CSSAnimation") + '"');
        }

        construct = classicMode ? ClassicAnimation : CSSAnimation;

        self = new construct();

        typeOf.element(elements) ? self.setElement(elements) : each(elements, self.setElement, self);

        each(keyframes, function (properties, key) {
            each(properties, function (propertyName, propertyValue) {
                self.propAt(propertyName, propertyValue, key);
            });
        });

        self.onComplete(oncomplete);
        self.onIteration(oniteration);
        self.onStart(onstart);
        self.onStep(onstep);

        self.delay(delay);
        self.duration(duration);
        self.direction(direction);
        self.easing(easing);
        self.fillMode(fillMode);
        self.iterationCount(iterationCount);

        return self;
    }

    /**
     * "Одноразовая" функция, позволяющая анимировать без муторного создания объектов в один вызов
     * Формат записи свойств и вообще аргументов - как в jQuery (для удобства)
     * Отличается от конструктора тем, что автоматически запускает анимацию после создания экземпляра.
     * @param {(Array.<HTMLElement>|NodeList|HTMLElement)} elements Элемент(ы) для анимирования
     * @param {Object} properties Свойства для анимирования. Ключ имя свойства, значение - конечная величина свойства.
     * @param {(number|string)} duration Продолжительность в МС или в формате CSS Timestring
     * @param {(string|Function,Array)} easing Смягчение всей анимации (алиас, CSS Timefunction, аргументы к временной функции или сама функция)
     * @param {Function} complete Обработчик события завершения анимации
     * @return {(CSSAnimation|ClassicAnimation)}
     */
    function animate (elements, properties, duration, easing, complete) {

        var completeWrapper = function () {
            //TODO сделать то же, только без замыкания
            typeOf.func(complete) && complete.apply(null, arguments);
            self.destruct();
        };

        var options;

        if (typeOf.object(duration)) {
            options = createObject(/** @type {Object} */(duration));
        } else {
            options = {};
            options["duration"] = duration;
            options["easing"] = easing;
        }

        options["oncomplete"] = completeWrapper;

        var self = Animation(elements, undefined, options);

        each(properties, function (propertyValue, propertyName) {
            self.propAt(propertyName, propertyValue);
        });

        self.fillMode(FILLMODE_FORWARDS);
        self.start();

        return /** @type {(CSSAnimation|ClassicAnimation)} */ (self);
    }