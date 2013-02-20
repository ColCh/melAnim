    /**
     * То, что идёт после собаки ("@") в CSS-правилах
     * Как правило, в нему дописыватеся вендорный префикс, если у
     * свойства анимации тоже есть префикс.
     * @type {string}
     * @const
     */
    var KEYFRAME_PREFIX = (getVendorPropName("animation") === "animation" ? "" : surround(lowPrefix, "-")) + "keyframes";

    if (ENABLE_DEBUG) {
        console.log('keyframe prefix is "' + KEYFRAME_PREFIX + '"');
    }

    if (CSSANIMATIONS_SUPPORTED) {
        // навешиваем обработчики на все имена событий
        // бывают курьёзы, вроде FireFox - когда свойство "animation" с префиксом ("-moz-animation")
        // а имя события - без префикса, ещё и в нижнем регистре ("animationend")
        each(ANIMATION_END_EVENTNAMES.concat(ANIMATION_ITERATION_EVENTNAMES).concat(ANIMATION_START_EVENTNAMES), function (eventName) {
            // лучше и быстрее всего ловить их не на стадии всплытия
            // а на стадии погружение. Для большей скорости возьмём корневой элемент
            rootElement.addEventListener(eventName, exclusiveHandler, ANIMATION_HANDLER_USES_CAPTURE);
        });
    }

    /**
     * Первичная функция-обработчик событий
     * т.к. обработчики установлены на все события, которые могут никогда и не исполниться
     * (например, у webkit никогда не будет события с вендорным префиксом "ms")
     * то лучше убрать остальные мусорные обработчики и оставить один.
     * @param {(AnimationEvent|Event)} event
     */
    function exclusiveHandler (event) {
        var eventName = event.type, lowerCased = toLowerCase(eventName);
        var eventNames;

        if (ENABLE_DEBUG) {
            console.log('exclusiveHandler: eventName is "' + eventName + '"');
        }

        if (lowerCased.indexOf("start") !== -1) {
            eventNames = ANIMATION_START_EVENTNAMES;
            if (ENABLE_DEBUG) {
                console.log('exclusiveHandler: eventName "' + eventName + '" belongs to animation start events');
            }
        } else if (lowerCased.indexOf("iteration") !== -1) {
            eventNames = ANIMATION_ITERATION_EVENTNAMES;
            if (ENABLE_DEBUG) {
                console.log('exclusiveHandler: eventName "' + eventName + '" belongs to animation iteration end events');
            }
        } else if (lowerCased.indexOf("end") !== -1) {
            eventNames = ANIMATION_END_EVENTNAMES;
            if (ENABLE_DEBUG) {
                console.log('exclusiveHandler: eventName "' + eventName + '" belongs to animation end events');
            }
        } else {
            // по-идее, никогда не исполнится. unreachable code
            if (ENABLE_DEBUG) {
                console.log('exclusiveHandler: unknown animation event type "' + eventName + '"');
            }
            return;
        }

        // снимаем все навешанные обработчики событий
        each(eventNames, function (eventName) {
            rootElement.removeEventListener(eventName, exclusiveHandler, ANIMATION_HANDLER_USES_CAPTURE);
        });

        // вешаем обратно обычный обработчик на точно определённое имя события
        rootElement.addEventListener(eventName, animationHandlerDelegator, ANIMATION_HANDLER_USES_CAPTURE);

        // вызываем тут же оригинальный обработчик
        animationHandlerDelegator(event);
    }

    /**
     * Объект с функциями-обработчиками всех событий анимаций
     * Ключ - имя события, значение - объект с именем анимации и функцей-обработчиком
     * @type {Object.<string, Object.<string, Function>>}
     */
    var delegatorCallbacks = {};

    /**
     * Объект с обработчиками событий окончания анимаций
     * @type {Object.<string, Function>}
     */
    delegatorCallbacks[ ANIMATION_END_EVENTTYPE ] = {};

    /**
     * Объект с обработчиками событий конца итераций анимаций
     * @type {Object.<string, Function>}
     */
    delegatorCallbacks[ ANIMATION_ITERATION_EVENTTYPE ] = {};

    /**
     * Объект с обработчиками событий старта анимаций
     * @type {Object.<string, Function>}
     */
    delegatorCallbacks[ ANIMATION_START_EVENTTYPE ] = {};

    /**
     * Функция будет ловить все поступающих события конца анимации
     * @param {(AnimationEvent|Event)} event
     */
    var animationHandlerDelegator = function (event) {
        // TODO пофиксить неподдерживаемый в android < 2.1 режим заполнения (fill-mode)
        var animationName = event.animationName, callback, eventType, handlersList;
        var eventName = event.type, lowerCased = toLowerCase(eventName);

        if (lowerCased.indexOf("start") !== -1) {
            eventType = ANIMATION_START_EVENTTYPE;
        } else if (lowerCased.indexOf("iteration") !== -1) {
            eventType = ANIMATION_ITERATION_EVENTTYPE
        } else if (lowerCased.indexOf("end") !== -1) {
            eventType = ANIMATION_END_EVENTTYPE;
        } else {
            // по-идее, никогда не исполнится. unreachable code
            if (ENABLE_DEBUG) {
                console.log('animationHandlerDelegator: unknown animation event type "' + eventName + '"');
            }
            return;
        }

        if (eventType in delegatorCallbacks) {
            handlersList = delegatorCallbacks[eventType];
            if (animationName in handlersList) {
                callback = handlersList[animationName];
                callback();
            } else if (ENABLE_DEBUG) {
                //console.log('animationHandlerDelegator: unregistered animation name "' + animationName + '" for event name "' + eventName + '" (event type "' + eventType + '")');
                // незарегистрированная анимация. ничего не можем сделать.
            }
        }
    };

    /**
     * Конструктор анимаций с использованием CSS-анимаций
     * @constructor
     */
    function CSSAnimation () {

        this.name = generateId();
        this.elements = [];
        this.keyframesRule = /** @type {CSSKeyframesRule} */ (addRule("@" + KEYFRAME_PREFIX + " " + this.name));

        if (ENABLE_DEBUG) {
            if (this.name !== this.keyframesRule.name) {
                // имена должны совпадать
                console.log('CSSAnimation constructor: anim name "' + this.name + '" and keyframes name "' + this.keyframesRule.name + '" are different');
            }
        }

    }

    /*
     * Наследуемые свойства
     */

    /**
     * Время отложенного запуска, временная строка CSS.
     * Значение устанавливается методом
     * @see CSSAnimation.delay
     * @type {string}
     * @private
     */
    CSSAnimation.prototype.delayTime = DEFAULT_DELAY;

    /**
     * Режим заливки свойств, устанавливается методом
     * @see CSSAnimation.fillMode
     * @type {string}
     * @private
     */
    CSSAnimation.prototype.fillingMode = DEFAULT_FILLMODE;

    /**
     * Продолжительность одного прохода, временная строка CSS
     * Значение устанавливается методом.
     * @see CSSAnimation.duration
     * @private
     * @type {string}
     */
    CSSAnimation.prototype.animationTime = DEFAULT_DURATION;

    /**
     * Число проходов;
     * Значение устанавливается методом iterationCount.
     * @type {string}
     * @private
     */
    CSSAnimation.prototype.iterations = DEFAULT_ITERATIONCOUNT;

    /**
     * Направление анимации.
     * Значение устанавливается методом direction.
     * @type {string}
     * @private
     */
    CSSAnimation.prototype.animationDirection = DEFAULT_DIRECTION;

    /**
     * Смягчение всей анимации
     * @type {string}
     * @private
     */
    CSSAnimation.prototype.timingFunction = DEFAULT_EASING;

    /**
     * Обработчик завершения анимации
     * @private
     * @type {Function}
     */
    CSSAnimation.prototype.oncomplete = noop;

    /**
     * Обработчик завершения прохода
     * @type {Function}
     * @private
     */
    CSSAnimation.prototype.oniteration = noop;

    /**
     * Обработчик начала проигрывания анимации
     * @type {Function}
     * @private
     */
    CSSAnimation.prototype.onstart = noop;

    /*
     * Индивидуальные свойства
     */

    /**
     * Имя анимации; никогда не должно быть "none".
     * @type {string}
     */
    CSSAnimation.prototype.name = "";

    /**
     * Коллекция анимируемых элементов
     * @type {Array.<HTMLElement>}
     */
    CSSAnimation.prototype.elements = null;

    /**
     * CSS-правило для ключевых кадров
     * @type {CSSKeyframesRule}
     */
    CSSAnimation.prototype.keyframesRule = null;

    /*
     * Приватные методы
     */

    /**
     * Добавит ключевой кадр на указанном прогрессе по проходу в долях и вернёт его
     * @param {number} position
     * @return {CSSKeyframeRule}
     * @private
     */
    CSSAnimation.prototype.addKeyframe = function (position) {
        /**
         * Добавленный ключевой кадр
         * @type {CSSKeyframeRule}
         */
        var keyframe;
        // добавляются с указанием процентов
        var percents = position / PERCENT_TO_FRACTION + "%";
        // стиль ключевого кадра пока пуст
        var keyframeBody = "{" + "}";
        var keyframes = this.keyframesRule;
        // у Chrome или у FireFox какое-то время было неверное следование спецификации
        // было неверное имя метода для добавления ключевых кадров
        var add = keyframes.appendRule || keyframes.insertRule;
        apply(add, [ percents + " " + keyframeBody  ], keyframes);
        keyframe = keyframes.findRule(percents);
        return keyframe;
    };

    /**
     * Попытается найти в коллекции ключевой кадр
     * с указанным прогрессом по проходу (в долях)
     * @param {number} position
     * @return {CSSKeyframeRule}
     * @private
     */
    CSSAnimation.prototype.lookupKeyframe = function (position) {
        // поиск проходит с указанием процентов
        var percents = position / PERCENT_TO_FRACTION + "%";
        return this.keyframesRule.findRule(percents);
    };

    /**
     * Применит параметры анимации к стилю элемента без
     * уничтожения текущих анимаций, соблюдая правила добавления.
     * @param {HTMLElement} element
     * @private
     */
    CSSAnimation.prototype.applyStyle = function (element) {

        var names, playStates, durations, timingFunctions, delays, iterations, directions, fillModes;

        // для начала проверим, применена ли уже анимация
        names = css(element, ANIMATION_NAME);

        if (names.indexOf(this.name) !== -1) {
            // такое имя уже присутствует в списке применных
            if (ENABLE_DEBUG) {
                console.log('applyStyle: animation style for "' + this.name + '" already applied : "' + names + '"');
            }
            return;
        }

        // параметры уже применённых анимаций
        names = names.split(ANIMATIONS_SEPARATOR);
        playStates = css(element, ANIMATION_PLAY_STATE).split(ANIMATIONS_SEPARATOR);
        durations = css(element, ANIMATION_DURATION).split(ANIMATIONS_SEPARATOR);
        timingFunctions = css(element, ANIMATION_TIMING_FUNCTION).split(ANIMATIONS_SEPARATOR);
        delays = css(element, ANIMATION_DELAY).split(ANIMATIONS_SEPARATOR);
        iterations = css(element, ANIMATION_ITERATION_COUNT).split(ANIMATIONS_SEPARATOR);
        directions = css(element, ANIMATION_DIRECTION).split(ANIMATIONS_SEPARATOR);
        fillModes = css(element, ANIMATION_FILL_MODE).split(ANIMATIONS_SEPARATOR);

        if (names.length === 0 || (names.length === 1 && (names[0] === "" || names[0] === "none"))) {
            // нет применённых анимаций
            if (ENABLE_DEBUG) {
                console.log("applyStyle: element doesn't has any animations applied");
            }
            names = [ this.name ];
            playStates = [ DEFAULT_PLAYINGSTATE ];
            durations = [ this.animationTime ];
            timingFunctions = [ this.timingFunction ];
            delays = [ this.delayTime ];
            iterations = [ this.iterations ];
            directions = [ this.animationDirection ];
            fillModes = [ this.fillingMode ];
        } else {
            if (ENABLE_DEBUG) {
                console.log('applyStyle: element has "' + names.length + '" applied animations.');
            }
            names.push(this.name);
            // применяем анимацию приостановленной
            playStates.push(DEFAULT_PLAYINGSTATE);
            durations.push(this.animationTime);
            timingFunctions.push(this.timingFunction);
            delays.push(this.delayTime);
            iterations.push(this.iterations);
            directions.push(this.animationDirection);
            fillModes.push(this.fillingMode);
        }

        // применяем обновленные параметры анимаций
        css(element, ANIMATION_NAME, names.join(ANIMATIONS_JOINER));
        css(element, ANIMATION_PLAY_STATE, playStates.join(ANIMATIONS_JOINER));
        css(element, ANIMATION_DURATION, durations.join(ANIMATIONS_JOINER));
        css(element, ANIMATION_TIMING_FUNCTION, timingFunctions.join(ANIMATIONS_JOINER));
        css(element, ANIMATION_DELAY, delays.join(ANIMATIONS_JOINER));
        css(element, ANIMATION_ITERATION_COUNT, iterations.join(ANIMATIONS_JOINER));
        css(element, ANIMATION_DIRECTION, directions.join(ANIMATIONS_JOINER));
        css(element, ANIMATION_FILL_MODE, fillModes.join(ANIMATIONS_JOINER));
    };

    /**
     * Уберёт параметры текущей анимации из стиля элемента с
     * соблюдением правил добавления стилец анимации,
     * при этом не затрагивая других анимаций.
     * @param {HTMLElement} element
     * @private
     */
    CSSAnimation.prototype.removeStyle = function (element) {
        // параметры уже применённых анимаций
        var names = css(element, "animation-name").split(ANIMATIONS_SEPARATOR);
        var playStates = css(element, "animation-play-state").split(ANIMATIONS_SEPARATOR);
        var durations = css(element, "animation-duration").split(ANIMATIONS_SEPARATOR);
        var timingFunctions = css(element, "animation-timing-function").split(ANIMATIONS_SEPARATOR);
        var delays = css(element, "animation-delay").split(ANIMATIONS_SEPARATOR);
        var iterations = css(element, "animation-iteration-count").split(ANIMATIONS_SEPARATOR);
        var directions = css(element, "animation-direction").split(ANIMATIONS_SEPARATOR);
        var fillModes = css(element, "animation-fill-mode").split(ANIMATIONS_SEPARATOR);

        // индекс этой (this) анимации в списке применённых к элементу
        var index = LinearSearch(names, this.name);

        // просто удаляем из списков параметры с индексом имени этой анимации
        removeAtIndex(names, index);
        removeAtIndex(playStates, index);
        removeAtIndex(durations, index);
        removeAtIndex(timingFunctions, index);
        removeAtIndex(delays, index);
        removeAtIndex(iterations, index);
        removeAtIndex(directions, index);
        removeAtIndex(fillModes, index);

        // применяем анимации без этой (this)
        css(element, "animation-name", names.join(ANIMATIONS_JOINER));
        css(element, "animation-play-state", playStates.join(ANIMATIONS_JOINER));
        css(element, "animation-duration", durations.join(ANIMATIONS_JOINER));
        css(element, "animation-timing-function", timingFunctions.join(ANIMATIONS_JOINER));
        css(element, "animation-delay", delays.join(ANIMATIONS_JOINER));
        css(element, "animation-iteration-count", iterations.join(ANIMATIONS_JOINER));
        css(element, "animation-direction", directions.join(ANIMATIONS_JOINER));
        css(element, "animation-fill-mode", fillModes.join(ANIMATIONS_JOINER));
    };

    /**
     * Установит параметру анимаци указанное значение для элемента.
     * Такая аккуратность нужна, чтобы не затрагивать уже примененные
     * к элементу анимации
     * @param {HTMLElement} element элемент
     * @param {string} parameterName имя параметра (напр, "animation-duration")
     * @param {string} parameterValue значение параметра (напр. "5s")
     * @param {number=} animationIndex индекс анимации в списке примененных (если не указывать, найдет сама для этой (this) анимации)
     * @private
     */
    CSSAnimation.prototype.setParameter = function (element, parameterName, parameterValue, animationIndex) {
        var paramsList = css(element, parameterName).split(ANIMATIONS_SEPARATOR);
        var names;

        if (!typeOf.number(animationIndex)) {
            names = css(element, ANIMATION_NAME).split(ANIMATIONS_SEPARATOR);
            animationIndex = LinearSearch(names, this.name);
        }

        if (animationIndex >= 0) {
            paramsList[ animationIndex ] = parameterValue;
            css(element, parameterName, paramsList.join(ANIMATIONS_JOINER));
        } else if (ENABLE_DEBUG) {
            console.log('setParameter: cannot set parameter value; invalid animationIndex "' + animationIndex + '"');
        }
    };

    /**
     * Установит параметру анимаци указанное значение для всех элементов.
     * Такая аккуратность нужна, чтобы не затрагивать уже примененные
     * к элементу анимации
     * @param {string} parameterName имя параметра (напр, "animation-duration")
     * @param {string} parameterValue значение параметра (напр. "5s")
     * @private
     */
    CSSAnimation.prototype.rewriteParameter = function (parameterName, parameterValue) {
        each(this.elements, function (element) {
            this.setParameter(element, parameterName, parameterValue);
        }, this);
    };

    /*
     * Публичные методы
     */

    /**
     * Добавит элемент для анимирования
     * @param {HTMLElement} elem
     */
    CSSAnimation.prototype.addElement = function (elem) {
        if (typeOf.element(elem)) {
            // CSS анимация не может анимировать не-элементы
            this.elements.push(elem);
            this.applyStyle(elem);
        } else if (ENABLE_DEBUG) {
            console.log('addElement: passed variable is non-HTMLElement "' + elem + '"');
        }
    };

    /**
     * Установка задержки старта
     * Если значение положительное, старт анимации будет отложен на численное представление.
     * Если отрицательное, то при старте будет считаться, что прошло уже указанное по модулю время со старта.
     * @param {(number|string)} delay
     */
    CSSAnimation.prototype.delay = function (delay) {
        var numeric;
        if (typeOf.number(delay)) {
            // переданное число - миллисекунды
            numeric = delay;
            delay = delay + "ms";
        } else {
            numeric = parseTimeString(delay);
        }
        // численное значение должно быть небесконечным
        if (isFinite(numeric)) {
            this.delayTime = /** @type {string} */ (delay);
            this.rewriteParameter(ANIMATION_DELAY, this.delayTime);
        } else if (ENABLE_DEBUG) {
            console.log('delay: passed value "' + delay + '" (numeric : "' + numeric + '") is non-finite');
        }
    };

    /**
     * Установка продолжительности прохода анимации.
     * Отрицательные значения считаются за нулевые.
     * Нулевое значение соответствует мгновенному проходу анимации, при этом
     * все события (конца прохода и конца анимации) возникают так же, как и при положительной продолжительности прохода
     * и режим заполнения (fillMode) работает так же, как и при положительной продолжительности прохода
     * @param {(string|number)} duration
     */
    CSSAnimation.prototype.duration = function (duration) {
        var numeric;
        if (typeOf.number(duration)) {
            // переданное число - миллисекунды
            numeric = duration;
            duration = duration + "ms";
        } else {
            numeric = parseTimeString(duration);
        }

        // по спецификации отрицательные значения считаются за нулевые
        if (numeric < 0) {
            if (ENABLE_DEBUG) {
                console.log('duration: dur "' + duration + '" is negative (numeric val : "' + numeric + '") so setting it to "0"');
            }
            numeric = 0;
            duration = "0s";
        }

        // численное значение должно быть небесконечным
        if (isFinite(numeric)) {
            this.animationTime = /** @type {string} */ (duration);
            this.rewriteParameter(ANIMATION_DURATION, this.animationTime);
        } else if (ENABLE_DEBUG) {
            console.log('duration: non-integer value "' + duration + '" (numeric val: "' + numeric + '")');
        }
    };

    /**
     * Установка направления анимации
     * Значение "normal" соответствует возрастанию прогресса от 0 до 1 при каждом проходе
     * Значение "reverse" соответствует убыванию прогресса от 1 до 0 при каждом проходе
     * Значение "alternate" соответствует направлению "normal" для нечётных проходов и "reverse" для чётных
     * Значение "alternate-reverse" соответствует направлению "reverse" для нечётных проходов и "normal" для чётных
     * @param {string} direction
     */
    CSSAnimation.prototype.direction = function (direction) {
        if (direction === DIRECTION_NORMAL ||
            direction === DIRECTION_REVERSE ||
            direction === DIRECTION_ALTERNATE ||
            direction === DIRECTION_ALTERNATE_REVERSE) {

            this.animationDirection = direction;
            this.rewriteParameter(ANIMATION_DIRECTION, this.animationDirection);

        } else if (ENABLE_DEBUG) {
            console.log('direction: invalid value "' + direction + '"');
        }
    };

    /**
     * Установка смягчения анимации или ключевого кадра.
     *
     * Установленное смягчение ключевого кадра будет использовано,
     * если прогресс по проходу будет соответствовать неравенству:
     * ТЕКУЩИЙ_КЛЮЧЕВОЙ_КАДР <= ПРОГРЕСС_ПО_ПРОХОДУ < СЛЕДУЮЩИЙ_КЛЮЧЕВОЙ_КАДР
     *
     * (!) Абсциссы первой и второй точек для кубической кривой Безье должны принадлежать промежутку [0, 1].
     * @param {(Array|string)} timingFunction временная функция CSS, алиас смягчения или массив точек (2 - Steps, 4 - CubicBezier)
     * @param {(number|string)=} position прогресс по проходу в процентах (по умол. не зависит от прогресса)
     * @see cubicBezierAliases
     * @see cubicBezierApproximations
     */
    CSSAnimation.prototype.easing = function (timingFunction, position) {
        var points, trimmed, camelCased;
        var stepsAmount, countFromStart;
        var CSSTimingFunction, key, keyframe;

        if (typeOf.array(timingFunction)) {
            // переданы аргументы к временным функциям CSS
            points = timingFunction;
        } else if (typeOf.string(timingFunction)) {
            // алиас или временная функция CSS
            trimmed = trim(/** @type {string} */ (timingFunction));
            camelCased = camelCase(trimmed);
            if (camelCased in cubicBezierAliases) {
                // алиас
                points = cubicBezierAliases[camelCased];
            } else {
                // временная функция CSS
                if (cubicBezierReg.test(trimmed)) {
                    points = trimmed.match(cubicBezierReg)[1].split(",");
                } else if (stepsReg.test(trimmed)) {
                    points = trimmed.match(stepsReg)[1].split(",");
                }
            }
        }

        if (points.length === 4) {
            // кубическая кривая Безье
            points = map(points, parseFloat);
            if (inRange(points[0], 0, 1, true) && inRange(points[2], 0, 1, true)) {
                CSSTimingFunction = "cubic-bezier" + "(" + points.join(", ") + ")";
            } else if (ENABLE_DEBUG) {
                console.log('easing: cubic bezier invalid absciss "' + points[0] + '" or "' + points[2] + '"');
            }
        } else if (points.length === 2) {
            // лестничная функция
            stepsAmount = parseInt(points[0], 10);
            countFromStart = points[1] === "start";
            if (typeOf.number(stepsAmount)) {
                CSSTimingFunction = "steps" + "(" + stepsAmount.toString() + ", " + (countFromStart ? "start" : "end") + ")";
            } else if (ENABLE_DEBUG) {
                console.log('easing: invalid steps amount for staircase timing function "' + stepsAmount + '"')
            }
        }

        if (typeOf.undefined(position)) {
            this.timingFunction = CSSTimingFunction;
            this.rewriteParameter(ANIMATION_TIMING_FUNCTION, CSSTimingFunction);
        } else {
            key = normalizeKey(/** @type {(number|string)} */(position));
            if (typeOf.number(key)) {
                // в долях
                key = key * PERCENT_TO_FRACTION;
                keyframe = this.lookupKeyframe(key) || this.addKeyframe(key);
                css(keyframe.style, ANIMATION_TIMING_FUNCTION, CSSTimingFunction);
            }
        }
    };

    /**
     * Установка режима заполнения
     * Значение "backwards" соответствует отрисовке значений
     * начального ключевого кадра сразу после старта (и перед самим анимированием)
     * Значение "forwards" соответствует отрисовке значений
     * конечного ключевого кадра после окончания анимации.
     * Значение "none" не соответствует ни одному из значений;
     * Значение "both" соответствует и первому, и второму одновременно.
     * @param {string} fillMode
     * @see DEFAULT_FILLMODE
     */
    CSSAnimation.prototype.fillMode = function (fillMode) {
        if (fillMode === FILLMODE_FORWARDS ||
            fillMode === FILLMODE_BACKWARDS ||
            fillMode === FILLMODE_BOTH ||
            fillMode === FILLMODE_NONE) {

            this.fillingMode = fillMode;
            this.rewriteParameter(ANIMATION_FILL_MODE, this.fillingMode);

        } else if (ENABLE_DEBUG) {
            console.log('fillMode: invalid value "' + fillMode + '"');
        }
    };

    /**
     * Установка количества проходов цикла анимации.
     * Значение "infinite" соответствует бесконечному числу повторений анимации.
     * Дробные значения соответствуют конечному значению прогресса по проходу.
     * Отрицательные числовые значения игнорируются.
     * @param {string} iterationCount
     * @see DEFAULT_ITERATIONCOUNT
     */
    CSSAnimation.prototype.iterationCount = function (iterationCount) {

        /**
         * Числовое представление
         * @type {number}
         */
        var numericIterations;

        // исключение составляет специальное значение
        if (iterationCount !== ITERATIONCOUNT_INFINITE) {
            numericIterations = parseFloat(iterationCount);
            if (!isFinite(numericIterations) || numericIterations < 0) {
                if (ENABLE_DEBUG) {
                    console.log('iterationCount: passed iterations is not a number or is negative "' + iterationCount + '"');
                }
                return;
            }
        }

        this.iterations = iterationCount;
        this.rewriteParameter(ANIMATION_ITERATION_COUNT, this.iterations);
    };

    /**
     * Установка функции, которая исполнится при завершении анимации
     * @type {Function} callback
     */
    CSSAnimation.prototype.onComplete = function (callback) {
        if (typeOf.func(callback)) {
            delegatorCallbacks[ ANIMATION_END_EVENTTYPE ] [ this.name ] = bind(callback, this);
            this.oncomplete = callback;
        }
    };

    /**
     * Установка функции, которая завершится при окончании прохода
     * @param {Function} callback
     */
    CSSAnimation.prototype.onIteration = function (callback) {
        if (typeOf.func(callback)) {
            delegatorCallbacks[ ANIMATION_ITERATION_EVENTTYPE ] [ this.name ] = bind(callback, this);
            this.oniteration = callback;
        }
    };

    /**
     * Установка функции, которая исполнится, когда анимация начнет проигрываться
     * @param {Function} callback
     */
    CSSAnimation.prototype.onStart = function (callback) {
        if (typeOf.func(callback)) {
            delegatorCallbacks[ ANIMATION_START_EVENTTYPE ] [ this.name ] = bind(callback, this);
            this.onstart = callback;
        }
    };

     /**
     * Установка значения свойства при указанном прогрессе
     * Для установки смягчения используется метод CSSAnimation.easing
     * @param {string} name имя свойства
     * @param {string} value значение свойства
     * @param {string=} position строка прогресса в процентах (по умол. 100%)
     */
    CSSAnimation.prototype.propAt = function (name, value, position) {
        var keyframe;
        var key = typeOf.undefined(position) ? keyAliases["to"] : normalizeKey(/** @type {(number|string)} */ (position));
        if (typeOf.number(key)) {
            // в долях
            key = key * PERCENT_TO_FRACTION;
            keyframe = this.lookupKeyframe(key) || this.addKeyframe(key);
            css(keyframe.style, name, value);
        } else if (ENABLE_DEBUG) {
            console.log('propAt: passed key "' + position + '" (numeric val: "' + key + '") is invalid');
        }
    };

    /**
     * Старт анимации
     */
    CSSAnimation.prototype.start = function () {

        // Webkit считает применение анимации началом ее запуска, FireFox - нет
        // переприменяем анимацию
        // TODO облагородить это временное решение или найти более лучшее
        each(this.elements, function (element) {
            var names, animationIndex;

            names = css(element, ANIMATION_NAME).split(ANIMATIONS_SEPARATOR);
            // анимация должна быть уже применена, т.к. это делает метод addElement
            animationIndex = LinearSearch(names, this.name);

            // установка имени этой (this) анимации на пустое
            names[ animationIndex ] = "none";
            css(element, ANIMATION_NAME, names.join(ANIMATIONS_JOINER));

            // начало проигрывания пустой анимации
            this.setParameter(element, ANIMATION_PLAY_STATE, PLAYSTATE_RUNNING, animationIndex);

            // возвращение имени обратно запустит оригинальную анимацию
            names[ animationIndex ] = this.name;
            css(element, ANIMATION_NAME, names.join(ANIMATIONS_JOINER));
        }, this);

        if (ENABLE_DEBUG) {
            console.log('start: animation "' + this.name + '" started');
        }
    };

    /**
     * Остановка анимации
     */
    CSSAnimation.prototype.stop = function () {};

    /**
     * Разрушение анимации
     * удаление всех CSS-свойств, снятие применённых анимаций и т.д.
     */
    CSSAnimation.prototype.destruct = function () {
        // удаляем применённые параметры анимации
        each(this.elements, function (element) {
            // безопаснее снимать анимацию тогда, когда она приостановлена,
            // т.к. если снимать сразу, то FF и CH ведут себя по разному
            var names = css(element, "animation-name").split(ANIMATIONS_SEPARATOR);
            // индекс этой (this) анимации в списке применённых
            var index = LinearSearch(names, this.name);
            // приостанавливаем её
            var playStates = css(element, "animation-play-state").split(ANIMATIONS_SEPARATOR);
            playStates[ index ] = PLAYSTATE_PAUSED;
            css(element, "animation-play-state", playStates.join(ANIMATIONS_JOINER));
            // аккуратно удаляем примененные параметры анимаций
            this.removeStyle(element);
        }, this);

        // удаляем CSS-правило с ключевыми кадрами из таблицы стилей
        removeRule(this.keyframesRule);

        if (ENABLE_DEBUG) {
            console.log('destruct: animation "' + this.name + '" totally destructed');
        }
    };

    /* Экспорты */
    CSSAnimation.prototype["addElement"] = CSSAnimation.prototype.addElement;
    CSSAnimation.prototype["delay"] = CSSAnimation.prototype.delay;
    CSSAnimation.prototype["duration"] = CSSAnimation.prototype.duration;
    CSSAnimation.prototype["direction"] = CSSAnimation.prototype.direction;
    CSSAnimation.prototype["easing"] = CSSAnimation.prototype.easing;
    CSSAnimation.prototype["fillMode"] = CSSAnimation.prototype.fillMode;
    CSSAnimation.prototype["iterationCount"] = CSSAnimation.prototype.iterationCount;
    CSSAnimation.prototype["onComplete"] = CSSAnimation.prototype.onComplete;
    CSSAnimation.prototype["onIteration"] = CSSAnimation.prototype.onIteration;
    CSSAnimation.prototype["propAt"] = CSSAnimation.prototype.propAt;
    CSSAnimation.prototype["start"] = CSSAnimation.prototype.start;
    CSSAnimation.prototype["stop"] = CSSAnimation.prototype.stop;
    CSSAnimation.prototype["destruct"] = CSSAnimation.prototype.destruct;
    CSSAnimation.prototype["onStart"] = CSSAnimation.prototype.onStart;