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

    /**
     * Конструктор анимаций с использованием CSS-анимаций
     * @constructor
     */
    function CSSAnimation () {
        this.name = generateId();
        this.elements = [];
        this.animationRule = addRule("." + this.name);
        this.keyframesRule = addRule("@" + KEYFRAME_PREFIX + " " + this.name);
    }

    /*
     * Наследуемые свойства
     */

    /**
     * Время отложенного запуска, в миллисекундах
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
     * @type {number}
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

    /**
     * CSS-правило, где прописаны свойства анимации
     * @type {CSSRule}
     */
    CSSAnimation.prototype.animationRule = null;

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
        var keyframe = this.keyframesRule.findRule(percents);
        return keyframe;
    };

    /*
     * Публичные методы
     */
    CSSAnimation.prototype.addElement = function (elem) {
        if (typeOf.element(elem)) {
            // CSS анимация не может анимировать не-элементы
            this.elements.push(elem);
            addClass(elem, this.name);
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
            this.delayTime = delay;
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
            this.animationTime = duration;
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
     * @param {(Array|string)} timingFunction временная функция CSS, алиас смягчения или массив точек (2 - Steps, 4 - CubicBezier)
     * @param {(number|string)=} position прогресс по проходу в процентах (по умол. не зависит от прогресса)
     * @see cubicBezierAliases
     * @see cubicBezierApproximations
     */
    CSSAnimation.prototype.easing = function (timingFunction, position) {
        var points, trimmed, camelCased;
        var stepsAmount, countFromStart;

        if (typeOf.array(timingFunction)) {
            // переданы аргументы к временным функциям CSS
            points = timingFunction;
        } else if (typeOf.string(timingFunction)) {
            // алиас или временная функция CSS
            trimmed = trim(timingFunction);
            camelCased = camelCase(timingFunction);
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
                this.timingFunction = "cubic-bezier" + "(" + points.join(", ") + ")";
            } else if (ENABLE_DEBUG) {
                console.log('easing: cubic bezier invalid absciss "' + points[0] + '" or "' + points[2] + '"');
            }
        } else if (points.length === 2) {
            // лестничная функция
            stepsAmount = parseInt(points[0], 10);
            countFromStart = points[1] === "start";
            if (typeOf.number(stepsAmount)) {
                this.timingFunction = "steps" + "(" + stepsAmount.toString() + ", " + (countFromStart ? "start" : "end") + ")";
            } else if (ENABLE_DEBUG) {
                console.log('easing: invalid steps amount for staircase timing function "' + stepsAmount + '"')
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
        if (iterationCount === ITERATIONCOUNT_INFINITE) {
            numericIterations = Number.POSITIVE_INFINITY;
        } else {
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
            this.oncomplete = callback;
        }
    };

    /**
     * Установка функции, которая завершится при окончании прохода
     * @param {Function} callback
     */
    CSSAnimation.prototype.onIteration = function (callback) {
        if (typeOf.func(callback)) {
            this.oniteration = callback;
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
        var key = typeOf.undefined(position) ? keyAliases["to"] : normalizeKey(position);
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
        var animStyle = this.animationRule.style;

        css(animStyle, "animation-play-state", DEFAULT_PLAYINGSTATE);
        css(animStyle, "animation-name", this.name);
        css(animStyle, "animation-duration", this.animationTime);
        css(animStyle, "animation-timing-function", this.timingFunction);
        css(animStyle, "animation-delay", this.delayTime);
        css(animStyle, "animation-iteration-count", this.iterations);
        css(animStyle, "animation-direction", this.animationDirection);
        css(animStyle, "animation-fill-mode", this.fillingMode);

        css(animStyle, "animation-play-state", PLAYSTATE_RUNNING);

        if (ENABLE_DEBUG) {
            console.log('start: animation "' + this.name + '" started');
        }
    };

    /**
     * Остановка анимации
     */
    CSSAnimation.prototype.stop = function () {};

    /* Экспорты */
    CSSAnimation.prototype["addElement"] = CSSAnimation.prototype.addElement;
    CSSAnimation.prototype["delay"] = CSSAnimation.prototype.delay;
    CSSAnimation.prototype["duration"] = CSSAnimation.prototype.duration;
    CSSAnimation.prototype["direction"] = CSSAnimation.prototype.direction;
    CSSAnimation.prototype["easing"] = CSSAnimation.prototype.easing;
    CSSAnimation.prototype["fillMode"] = CSSAnimation.prototype.fillMode;
    CSSAnimation.prototype["iterationCount"] = CSSAnimation.prototype.iterationCount;
    CSSAnimation.prototype["onComplete"] = CSSAnimation.prototype.onComplete;
    CSSAnimation.prototype["propAt"] = CSSAnimation.prototype.propAt;
    CSSAnimation.prototype["start"] = CSSAnimation.prototype.start;
    CSSAnimation.prototype["stop"] = CSSAnimation.prototype.stop;