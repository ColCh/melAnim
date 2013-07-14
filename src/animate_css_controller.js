    /**
     * То, что идёт после собаки ("@") в CSS-правилах
     * Как правило, в нему дописыватеся вендорный префикс, если у
     * свойства анимации тоже есть префикс.
     * @type {string}
     * @const
     */
    var KEYFRAME_PREFIX = (getVendorPropName("animation") === "animation" ? "" : surround(lowPrefix, "-")) + "keyframes";


    /**
     * Поддерживаются ли CSS3 анимации текущим браузером.
     * @type {boolean}
     * @const
     */
    var CSSANIMATIONS_SUPPORTED = !!getVendorPropName("animation");

    if (ENABLE_DEBUG) {
        console.log('Detected native CSS3 Animations support.');
    }

    if (ENABLE_DEBUG) {
        if (getVendorPropName("animation") === "animation") {
            console.log('UA supports CSS3 Animations without vendor prefix');
        } else {
            console.log('UA supports CSS3 Animations width "' + prefix + '" DOM prefix ("' + lowPrefix + '" CSS prefix)');
        }
    }

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
            } // else {
                // незарегистрированная анимация. ничего не можем сделать.
            // }
        }
    };

    /**
     * Конструктор анимаций с использованием CSS-анимаций
     * @constructor
     * @class
     */
    function CSSAnimation () {

        this.animationId = generateId();
        this.keyframesRule = /** @type {CSSKeyframesRule} */ (addRule("@" + KEYFRAME_PREFIX + " " + this.animationId));

        this.firstKeyframe = this.addKeyframe(0.0);
        this.lastKeyframe = this.addKeyframe(1.0);

        if (ENABLE_DEBUG) {
            if (this.animationId !== this.keyframesRule.name) {
                // имена должны совпадать
                console.log('CSSAnimation constructor: anim name "' + this.animationId + '" and keyframes name "' + this.keyframesRule.name + '" are different');
            }
            if (ENABLE_DEBUG) {
                console.log('CREATED NEW <CSS3> ANIMATION INSTANCE');
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

    /**
     * Функция, которая будет исполняться на каждом шаге анимации
     * @type {Function}
     * @private
     */
    CSSAnimation.prototype.onstep = noop;

    /*
     * Индивидуальные свойства
     */

    /**
     * Имя анимации; никогда не должно быть "none".
     * @type {string}
     * @private
     */
    CSSAnimation.prototype.animationId = "";

    /**
     * Анимируемый элемент
     * @type {HTMLElement}
     * @private
     */
    CSSAnimation.prototype.element = null;

    /**
     * CSS-правило для ключевых кадров
     * @type {CSSKeyframesRule}
     * @private
     */
    CSSAnimation.prototype.keyframesRule = null;

    /**
     * Ссылка на первый ключевой кадр с ключом "0%"
     * @type {CSSKeyframeRule}
     * @private
     */
    CSSAnimation.prototype.firstKeyframe = null;

    /**
     * Ссылка на последний ключевой кадр с ключом "100%"
     * @type {CSSKeyframeRule}
     * @private
     */
    CSSAnimation.prototype.lastKeyframe = null;

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
        var percents = position / FRACTION_TO_PERCENT + "%";
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
        var percents = position / FRACTION_TO_PERCENT + "%";
        return this.keyframesRule.findRule(percents);
    };

    /**
     * Применит параметры анимации к стилю элемента без
     * уничтожения текущих анимаций, соблюдая правила добавления.
     * @param {HTMLElement} element
     * @private
     */
    CSSAnimation.prototype.applyStyle = function (element) {

        var appliedAnimations, singleAnimation, playStates, names;

        // для начала проверим, применена ли уже анимация
        appliedAnimations = css(element, ANIMATION);

        if (appliedAnimations.indexOf(this.animationId) !== -1) {
            if (ENABLE_DEBUG) {
                console.log('applyStyle: animation style for "' + this.animationId + '" already applied : "' + css(element, ANIMATION_NAME) + '"');
            }
            appliedAnimations = appliedAnimations.replace(ANIMATIONS_SEPARATOR, "");
        }

        //порядок свойств важен и описан в спецификации
        singleAnimation = [
            this.animationId,
            this.animationTime,
            this.timingFunction,
            this.delayTime,
            this.iterations,
            this.animationDirection,
            this.fillingMode
        ].join(ANIMATION_SINGLE_JOINER);

        if (ENABLE_DEBUG && !appliedAnimations) {
            console.log('applyStyle: is seems that element doesnt has any animations applied, even with name "none"');
        }

        // сначала добавим параметр паузы, перед применением анимации
        playStates = css(element, ANIMATION_PLAY_STATE).split(ANIMATIONS_SEPARATOR);
        names = css(element, ANIMATION_NAME).split(ANIMATIONS_SEPARATOR);
        if (!names[0] || !playStates[0]) {
            playStates = DEFAULT_PLAYINGSTATE;
            if (ENABLE_DEBUG) {
                console.log('applyStyle: zero computed animation-play-state length');
            }
        } else {
            if (ENABLE_DEBUG) {
                console.log('applyStyle: computed play-state length equals "' + playStates.length + '"');
            }
            playStates.push(DEFAULT_PLAYINGSTATE);
        }
        css(element, ANIMATION_PLAY_STATE, playStates.join(ANIMATIONS_JOINER));

        if (!appliedAnimations || names.length === 1 && names[0] === ANIMATION_NAME_NONE) {
            appliedAnimations = singleAnimation;
            if (ENABLE_DEBUG) {
                console.log('applyStyle: element has empty applied animations string and "' + names.join(", ") + '" applied names string. OVERWRITTEN');
            }
        } else {
            appliedAnimations += ANIMATIONS_JOINER + singleAnimation;
            if (ENABLE_DEBUG) {
                console.log('applyStyle: element has "' + names.length + '" (without current) applied: "' + names.join(", ") + '"');
            }
        }

        css(element, ANIMATION, appliedAnimations);
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
        var index = LinearSearch(names, this.animationId);

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
            animationIndex = LinearSearch(names, this.animationId);
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
        this.setParameter(element, parameterName, parameterValue);
    };

    /*
     * Публичные методы
     */

    /**
     * Добавит элемент для анимирования
     * @param {HTMLElement} elem
     */
    CSSAnimation.prototype.setElement = function (elem) {
        if (typeOf.element(elem)) {
            // CSS анимация не может анимировать не-элементы
            if (elem !== this.element) {
                this.element = elem;
            }
            // запись в регистр перезаписи анимаций
        } else if (ENABLE_DEBUG) {
            console.log('setElement: passed variable is non-HTMLElement "' + elem + '"');
        }
    };

    /**
     * Геттер для элемента анимации
     * @return {Element}
     */
    CSSAnimation.prototype.getElement = function () {
        return this.element;
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
     *
     * @param {(Array|string)} timingFunction временная функция CSS, алиас смягчения или массив точек (2 - Steps, 4 - CubicBezier)
     * @param {(number|string)=} position прогресс по проходу в процентах (по умол. не зависит от прогресса)
     *
     * @see cubicBezierAliases
     * @see cubicBezierApproximations
     */
    CSSAnimation.prototype.easing = function (timingFunction, position) {
        var points, trimmed, camelCased;
        var stepsAmount, countFromStart;
        var CSSTimingFunction, key, keyframe;

        CSSTimingFunction = '';

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

        if (!typeOf.array(points)) {
            if (ENABLE_DEBUG) {
                console.log('easing: invalid argument "' + timingFunction + '"');
            }
            return;
        }

        if (points.length === 4) {
            // кубическая кривая Безье
            points = map(points, parseFloat);
            if (inRange(points[0], 0, 1, true) && inRange(points[2], 0, 1, true)) {
                CSSTimingFunction = "cubic-bezier" + "(" + points.join(", ") + ")";
            } else if (ENABLE_DEBUG) {
                console.log('easing: cubic bezier invalid absciss "' + points[0] + '" or "' + points[2] + '"');
            }
        } else if (points.length === 2 || points.length === 1) {
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
        } else {
            key = normalizeKey(/** @type {(number|string)} */(position));
            if (typeOf.number(key)) {
                // в долях
                key = key * FRACTION_TO_PERCENT;
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
    };

    /**
     * Установка функции, которая исполнится при завершении анимации
     * @type {Function} callback
     */
    CSSAnimation.prototype.onComplete = function (callback) {
        if (typeOf.func(callback)) {
            delegatorCallbacks[ ANIMATION_END_EVENTTYPE ] [ this.animationId ] = bind(callback, this);
            this.oncomplete = callback;
        }
    };

    /**
     * Установка функции, которая завершится при окончании прохода
     * @param {Function} callback
     */
    CSSAnimation.prototype.onIteration = function (callback) {
        if (typeOf.func(callback)) {
            delegatorCallbacks[ ANIMATION_ITERATION_EVENTTYPE ] [ this.animationId ] = bind(callback, this);
            this.oniteration = callback;
        }
    };

    /**
     * Установка функции, которая исполнится, когда анимация начнет проигрываться
     * @param {Function} callback
     */
    CSSAnimation.prototype.onStart = function (callback) {
        if (typeOf.func(callback)) {
            delegatorCallbacks[ ANIMATION_START_EVENTTYPE ] [ this.animationId ] = bind(callback, this);
            this.onstart = callback;
        }
    };

     /**
     * Установка значения свойства при указанном прогрессе
     * Для установки смягчения используется метод CSSAnimation.easing
     * @param {string} name имя свойства
     * @param {string} value значение свойства
     * @param {(number|string)=} position строка прогресса в процентах (по умол. 100%)
     */
     //TODO относительное изменение свойств
    CSSAnimation.prototype.propAt = function (name, value, position) {
        var currentValue;
        var keyframe;
        var key = typeOf.undefined(position) ? keyAliases["to"] : normalizeKey(/** @type {(number|string)} */ (position));
        if (typeOf.number(key)) {
            // в долях
            key = key * FRACTION_TO_PERCENT;
            keyframe = this.lookupKeyframe(key) || this.addKeyframe(key);
            css(keyframe.style, name, value);

            if (key !== 0.0 && !this.firstKeyframe.style[name]) {
                currentValue = css(this.element, name);
                css(this.firstKeyframe.style, name, currentValue);
                if (ENABLE_DEBUG) {
                    console.log('propAt: adding current value "' + currentValue + '" of property "' + name + '" to FIRST keyframe');
                }
            }
            if (key !== 1.0 && !this.lastKeyframe.style[name]) {
                if (!currentValue) {
                    currentValue = css(this.element, name);
                }
                css(this.lastKeyframe.style, name, currentValue);
                if (ENABLE_DEBUG) {
                    console.log('propAt: adding current value "' + currentValue + '" of property "' + name + '" to LAST keyframe');
                }
            }
        } else if (ENABLE_DEBUG) {
            console.log('propAt: passed key "' + position + '" (numeric val: "' + key + '") is invalid');
        }
    };

    /**
     * Старт анимации
     */
    CSSAnimation.prototype.start = function () {

        // для того, чтобы не перезаписывались уже установленные анимации
        // применяем анимацию к каждому элементу, соблюдая правила
        var element = this.element;
        this.applyStyle(element);
        // безопаснее запускать анимацию только после того, как она применена
        var playStates = css(element, "animation-play-state").split(ANIMATIONS_SEPARATOR);
        // текущая анимация должна быть последней
        playStates[ playStates.length - 1 ] = PLAYSTATE_RUNNING;
        css(element, "animation-play-state", playStates.join(ANIMATIONS_JOINER));


        if (ENABLE_DEBUG) {
            console.log('start: animation "' + this.animationId + '" started');
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
        var element = this.element;
        // безопаснее снимать анимацию тогда, когда она приостановлена,
        // т.к. если снимать сразу, то FF и CH ведут себя по разному
        var names = css(element, ANIMATION_NAME).split(ANIMATIONS_SEPARATOR);
        // индекс этой (this) анимации в списке применённых
        var index = LinearSearch(names, this.animationId);
        // приостанавливаем её
        var playStates = css(element, ANIMATION_PLAY_STATE).split(ANIMATIONS_SEPARATOR);
        playStates[ index ] = PLAYSTATE_PAUSED;
        css(element, ANIMATION_PLAY_STATE, playStates.join(ANIMATIONS_JOINER));

        // обрабатываем режим заполнения
        //TODO дополнительная обработка текущей итерации в зависимости от параметра направления
        var endingKey, endingKeyframe, endingStyle;
        if (this.fillingMode !== FILLMODE_NONE) {
            if (this.fillingMode === FILLMODE_FORWARDS || this.fillingMode === FILLMODE_BOTH) {
                // заполняется конечный ключевой кадр
                endingKey = 1.0;
            } else if (this.fillingMode === FILLMODE_BACKWARDS || this.fillingMode === FILLMODE_BOTH) {
                // заполняется начальный ключевой кадр
                endingKey = 0.0;
            }

            endingKeyframe = this.lookupKeyframe(endingKey);

            if (endingKeyframe) {
                var propertyName, propertyValue;
                endingStyle = endingKeyframe.style;
                for (var i = 0, m = endingStyle.length; i < m; i++) {
                    propertyName = endingStyle[i];
                    propertyValue = endingStyle[propertyName];
                    if (propertyName !== ANIMATION_TIMING_FUNCTION) {
                        css(element, propertyName, propertyValue);
                    }
                }
            } else if (ENABLE_DEBUG) {
                console.log("destruct: WTF?! beginning or ending keyframe does not exist");
            }
        }

        // аккуратно удаляем примененные параметры анимаций
        this.removeStyle(element);

        // удаляем CSS-правило с ключевыми кадрами из таблицы стилей
        removeRule(this.keyframesRule);

        if (ENABLE_DEBUG) {
            console.log('destruct: animation "' + this.animationId + '" totally destructed');
        }
    };

    /**
     * Установка функции, которая будет выполняться на каждом шаге анимации
     * @param {Function} callback
     */
    //TODO сделать onstep для CSS анимации
    CSSAnimation.prototype.onStep = function (callback) {
        if (typeOf.func(callback)) {
            this.onstep = callback;
        }
    };

    /**
     * Перегрузка toString
     * возвратит имя анимации
     * @return {string}
     * @override
     * @inheritDoc
     */
    CSSAnimation.prototype.toString = function () {
        return this.animationId;
    };


    /* Экспорты */
    CSSAnimation.prototype["setElement"] = CSSAnimation.prototype.setElement;
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
    CSSAnimation.prototype["onStep"] = CSSAnimation.prototype.onStep;
