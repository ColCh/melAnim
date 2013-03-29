    /****************************************************
     *                  КОНСТАНТЫ
     * Здесь собраны все константы, которые используются
     * во всём скрипте
     * ***************************************************/

    /**
     * Обычное направление анимации:
     * каждую итерацию ключевые кадры проходятся начиная от первого и кончая последним
     * @type {string}
     * @const
     */
    var DIRECTION_NORMAL = "normal";

    /**
     * Обратное направление анимации:
     * каждую итерацию ключевые кадры проходятся начиная от последнего и кончая первым
     * @type {string}
     * @const
     */
    var DIRECTION_REVERSE = "reverse";

    /**
     * Альтернативное направление анимации:
     * при чётном номере текущей итерации ключевые кадра проходятся, как при обычном направлении,
     * а при нечётной итерации - проходятся в обратном направлении
     * @type {string}
     * @const
     */
    var DIRECTION_ALTERNATE = "alternate";

    /**
     * Обратное альтернативное направление анимации:
     * при чётном номере текущей итерации ключевые кадра проходятся, как при обратном направлении,
     * а при нечётной итерации - проходятся в обычном направлении
     * @type {string}
     * @const
     */
    var DIRECTION_ALTERNATE_REVERSE = "alternate-reverse";

    /**
     * Перенос свойств:
     * значения свойств не будут отрисовываться
     * перед началом анимации (при отложенном запуске)
     * и после анимации
     * @type {string}
     * @const
     */
    var FILLMODE_NONE = "none";

    /**
     * Перенос свойств:
     * значения свойств не будут отрисовываться
     * перед началом анимации (при отложенном запуске)
     * , но после её окончания будут
     * @type {string}
     * @const
     */
    var FILLMODE_FORWARDS = "forwards";

    /**
     * Перенос свойств:
     * значения свойств будут отрисовываться
     * перед началом анимации (при отложенном запуске)
     * , но после анимации не будут
     * @type {string}
     * @const
     */
    var FILLMODE_BACKWARDS = "backwards";

    /**
     * Перенос свойств:
     * значения свойств будут отрисовываться
     * перед началом анимации (при отложенном запуске)
     * и после её окончания
     * @type {string}
     * @const
     */
    var FILLMODE_BOTH = "both";

    /**
     * Состояние анимации: работает, т.е. элемент(-ы) анимируются
     * @type {string}
     * @const
     */
    var PLAYSTATE_RUNNING = "running";

    /**
     * Состояние анимации: приостановлена
     * @type {string}
     * @const
     */
    var PLAYSTATE_PAUSED = "paused";

    /**
     * Специальное значение для количества итераций - "бесконечно"
     * @type {string}
     * @const
     */
    var ITERATIONCOUNT_INFINITE = "infinite";

    /**
     * Идеальное количество кадров для анимации на JavaScript.
     * Пол умолчанию 60, т.к. к этому стремится requestAnimationFrame.
     * @type {number}
     * @const
     */
    var FRAMES_PER_SECOND = 60;

    /**
     * Число-предел, ограничивающее обычные отметки времени от Date.now и новые высокочувствительные таймеры
     * @type {number}
     * @const
     */
    var HIGHRESOLUTION_TIMER_BOUND = 1e12;

    /**
     * Количество знаков после запятой для значений временных функций
     * @type {number}
     * @const
     */
    var ROUND_DIGITS_EASING = 3;

    /**
     * Количество знаков после запятой для значений CSS свойств
     * @type {number}
     * @const
     */
    var ROUND_DIGITS_CSS = 1;

    /**
     * Имя атрибута для связывания элемента и
     * данных, связанных с ним
     * @type {string}
     * @const
     */
    var DATA_ATTR_NAME = mel + "-data-id";

    /**
     * Специальное значение свойства, указывающее
     * на то, что нужно брать запомненное исходное
     * значение свойства для элемента
     * @type {null}
     * @const
     */
    var SPECIAL_VALUE = null;

    /**
     * Для перевода из проценты в доли
     * @type {number}
     * @const
     */
    var FRACTION_TO_PERCENT = 100;

    /**
     * Максимальный прогресс по проходу, в долях
     * @type {number}
     * @const
     * */
    var MAXIMAL_PROGRESS = 1.0;

    /**
     * Минимальный прогресс по проходу, в долях
     * @type {number}
     * @const
     * */
    var MINIMAL_PROGRESS = 0;

    /**
     * Использовать ли перехват (true) или всплытие (false) в обработчике событий конца CSS анимаций
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
     * Служебное имя для CSS анимации
     * @const
     * @type {string}
     */
    var ANIMATION_NAME_NONE = "none";

    /**
     * чем разделяются аргументы у временных функций CSS.
     * (аргумент к String.split)
     * @type {string}
     * @const
     */
    var TIMINGFUNCTION_SEPARATOR = ",";

    /**
     * чем соединяются аргументы у временных функций CSS.
     * (аргумент к Array.join)
     * @type {string}
     * @const
     */
    var TIMINGFUNCTION_SEPARATOR = ",";

    /**
     * Второй аргумент к лестничной временной функции,
     * указывающий на то, что отсчитывать ступени нужно с начала
     * @type {string}
     * @const
     */
    var STEPS_START = "start";

    /**
     * чем соединяется стиль одной анимации
     * (аргумент к Array.join)
     * @type {string}
     * @const
     */
    var ANIMATION_SINGLE_JOINER = " ";

    /**
     * по чему разделяются стили анимации
     * (аргумент к String.split)
     * @type {RegExp}
     * @const
     */
    var ANIMATIONS_SEPARATOR = /,\s+(?=[a-z])/i;

    /**
     * чем соединяются стили анимации
     * (аргумент к Array.join)
     * @type {string}
     * @const
     */
    var ANIMATIONS_JOINER = ",";

    /**
     * Имя CSS-свойства для CSS3 анимации.
     * @type {string}
     * @const
     */
    var ANIMATION = "animation";

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