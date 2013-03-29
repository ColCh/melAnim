    /**
     * Конструктор анимаций с ключевыми кадрами на JavaScript.
     * @constructor
     * @class
     */
    //TODO перезапись анимаций (animation override)
    //TODO слепки параметров анимации после старта - parametres snapshotting
    //TODO типы свойств для интерполяции (вместо самих свойств)
    //TODO провесить временную функцию на ключевом кадре - кажется, оно багнулось
    //TODO относительное изменение свойств
    function ClassicAnimation() {
        this.startingValues = {};
        this.animationId = generateId();
        this.keyframes = new Keyframes();
        this.specialEasing = {};
        this.iterations = 1;
        this.animatedProperties = {};
        this.rule = addRule("." + this.animationId);

        // специальная обработка смягчения по умолчанию
        this.easing(DEFAULT_EASING);
        this.timer = new ReflowLooper(this.tick, this);

        if (ENABLE_DEBUG) {
            console.log('CREATED NEW <JAVASCRIPT> ANIMATION INSTANCE');
        }
    }

    /*
    *   Наследуемые свойства.
    * */

    /**
     * Время отложенного запуска, в миллисекундах
     * Значение устанавливается методом
     * @see ClassicAnimation.delay
     * @type {number}
     * @private
     */
    ClassicAnimation.prototype.delayTime = /** @type {number} */ (parseTimeString(DEFAULT_DELAY));

    /**
     * Режим заливки свойств, устанавливается методом
     * @see ClassicAnimation.fillMode
     * @type {string}
     * @private
     */
    ClassicAnimation.prototype.fillingMode = DEFAULT_FILLMODE;

    /**
     * Продолжительность одного прохода, в миллисекундах
     * Значение устанавливается методом.
     * @see ClassicAnimation.duration
     * @private
     * @type {number}
     */
    ClassicAnimation.prototype.animationTime = /** @type {number} */ (parseTimeString(DEFAULT_DURATION));

    /**
     * Число проходов;
     * Значение устанавливается методом iterationCount.
     * @type {number}
     * @private
     */
    ClassicAnimation.prototype.iterations = parseInt(DEFAULT_ITERATIONCOUNT, 10);

    /**
     * Челосисленное число проходов;
     * Значение устанавливается методом iterationCount.
     * @type {number}
     * @private
     */
    ClassicAnimation.prototype.integralIterations = floor(parseInt(DEFAULT_ITERATIONCOUNT, 10));

    /**
     * Направление анимации.
     * Значение устанавливается методом direction.
     * @type {string}
     * @private
     */
    ClassicAnimation.prototype.animationDirection = DEFAULT_DIRECTION;

    /**
     * Смягчение всей анимации
     * @type {Easing}
     * @private
     */
    ClassicAnimation.prototype.smoothing = cubicBezierApproximations[ DEFAULT_EASING ];

    /**
     * Обработчик завершения анимации
     * @private
     * @type {Function}
     */
    ClassicAnimation.prototype.oncomplete = noop;

    /**
     * Обработчик завершения прохода
     * @type {Function}
     * @private
     */
    ClassicAnimation.prototype.oniteration = noop;

    /**
     * Обработчик начала проигрывания анимации
     * @type {Function}
     * @private
     */
    ClassicAnimation.prototype.onstart = noop;

     /**
     * Функция будет выполняться на каждом тике (tick) анимации
     * @private
     * @type {Function}
     */
    ClassicAnimation.prototype.onstep = noop;

    /*
    *   Индивидуальные свойства
    * */

    /**
     * Снимок ключевых кадров
     * @type {Keyframes}
     * @private
     */
    ClassicAnimation.prototype.shapshot = null;

    /**
     * Объект со стартовыми значениями свойств
     * @type {Object.<string, Object.<string, (number|Array)>>}
     * @private
     */
    ClassicAnimation.prototype.startingValues = null;

    /**
     * Уникальная строка - имя анимации.
     * Создаётся автоматически.
     * @type {string}
     * @private
     */
    ClassicAnimation.prototype.animationId = "";

    /**
     * Анимируемый элемент
     * Заполняется сеттером "element"
     * @private
     * @type {Element}
     */
    ClassicAnimation.prototype.element = null;

    /**
     * Коллекция ключевых кадров
     * @private
     * @type {Keyframes}
     */
    ClassicAnimation.prototype.keyframes = null;

    /**
     * Словарь, содержащий все анимируемые свойства.
     * Заполняется из метода установки значений свойств по прогрессу (propAt)
     * Нужен для первого (0%) и последнего (100%) ключевых кадров.
     * @type {Object}
     * @private
     */
    ClassicAnimation.prototype.animatedProperties = null;

    /**
     * Объект с особыми смягчениями для свойств
     * Ключ - имя свойства, Значение - функция смягчения
     * Значения устанавливаются методом easing
     * @type {Object.<string, (Function|CubicBezier|Steps)>}
     * @private
     */
    ClassicAnimation.prototype.specialEasing = null;

    /**
     * Временная метка старта
     * @type {number}
     * @private
     */
    ClassicAnimation.prototype.started = 0;

    /**
     * Номер текущей итерации
     * @type {number}
     * @private
     * */
    ClassicAnimation.prototype.currentIteration = 0;

    /**
     * Прошедшее со старта время
     * @type {number}
     * @private
     */
    ClassicAnimation.prototype.elapsedTime = 0;

    /**
     * Текущий прогресс по проходу
     * @type {number}
     * @private
     */
    ClassicAnimation.prototype.fractionalTime = 0.0;

    /**
     * Прогресс относительно первой итерации
     * @type {number}
     * @private
     */
    ClassicAnimation.prototype.animationProgress = 0.0;

    /**
     * Таймер отрисовки
     * @type {ReflowLooper}
     * @private
     */
    ClassicAnimation.prototype.timer = null;

    /*
    * Публичные методы
    * */

    /**
     * Добавит элемент(-ы) в коллекцию анимируемых.
     * @param {HTMLElement} elem Элемент
     */
    ClassicAnimation.prototype.setElement = function (elem) {
        var id;
        if (typeOf.element(elem)) {
            id = generateId();
            this.startingValues = {};
            if (this.element) {
                removeClass(this.element, this.animationId);
            }
            addClass(elem, this.animationId);
            this.element = elem;
        } else if (ENABLE_DEBUG) {
            console.log('addElement: passed variable is non-HTMLElement "' + elem + '"');
        }
    };

    /**
     * Геттер для элемента анимации
     * Не приватный, но его имя срезается GCC
     * @return {Element}
     */
    ClassicAnimation.prototype.getElement = function () {
        return this.element;
    };

    /**
     * Установка продолжительности прохода анимации.
     * Отрицательные значения считаются за нулевые.
     * Нулевое значение соответствует мгновенному проходу анимации, при этом
     * все события (конца прохода и конца анимации) возникают так же, как и при положительной продолжительности прохода
     * и режим заполнения (fillMode) работает так же, как и при положительной продолжительности прохода
     * @param {(string|number)} duration
     */
    ClassicAnimation.prototype.duration = function (duration) {
        var numericDuration = typeOf.number(duration) ? duration : parseTimeString(duration);
        if (typeOf.number(numericDuration)) {
            if (numericDuration < 0) {
                if (ENABLE_DEBUG) {
                    console.log('duration: argument has a negative value "' + numericDuration + '" so setting it to "0"');
                }
                numericDuration = 0;
            }
            this.animationTime = /** @type {number} */ (numericDuration);
        } else if (ENABLE_DEBUG) {
            console.log('duration: bad value "'+ duration +'"');
        }
    };

    /**
     * Установка обработчика завершения анимации
     * @param {Function} callback
     */
    ClassicAnimation.prototype.onComplete = function (callback) {
        if (typeOf.func(callback)) {
            this.oncomplete = callback;
        } else if (ENABLE_DEBUG) {
            console.warn("onComplete: callback is not a function : %o", callback);
        }
    };

    /**
     * Установка функции, которая исполнится, когда анимация начнет проигрываться
     * @param {Function} callback
     */
    ClassicAnimation.prototype.onStart = function (callback) {
        if (typeOf.func(callback)) {
            this.onstart = callback;
        }
    };

    /**
     * Установка функции, которая завершится при окончании прохода
     * @param {Function} callback
     */
    ClassicAnimation.prototype.onIteration = function (callback) {
        if (typeOf.func(callback)) {
            this.oniteration = callback;
        }
    };

    /**
     * Установка смягчения анимации при прогрессе.
     * Возможно установить особое смягчение для свойства (на протяжении всей анимации).
     *
     * Установленное смягчение будет использовано,
     * если прогресс по проходу будет соответствовать неравенству:
     * ТЕКУЩИЙ_КЛЮЧЕВОЙ_КАДР <= ПРОГРЕСС_ПО_ПРОХОДУ < СЛЕДУЮЩИЙ_КЛЮЧЕВОЙ_КАДР
     * Метод устанавливает смягчение для "текущего" (см. неравенство) ключевого кадра.
     *
     * При установке смягчения для свойства параметр прогресса игнорируется.
     * (!) Абсциссы первой и второй точек для кубической кривой должны принадлежать промежутку [0, 1].
     *     *
     * @param {(Function|Array|string)} timingFunction временная функция CSS, JS функция или алиас смягчения
     * @param {(number|string)=} key прогресс по проходу в процентах (по умол. не зваисит от прогресса)
     * @param {string=} property для какого свойства устанавливается (по умол. для всех)
     *
     * @see cubicBezierAliases
     * @see cubicBezierApproximations
     */
    ClassicAnimation.prototype.easing = function (timingFunction, key, property) {
        var easing, position;

        easing = EasingRegistry.request(timingFunction);

        if (easing) {
            if (typeOf.string(property)) {
                this.specialEasing[/** @type {string} */(property)] = easing;
            } else {
                if (typeOf.undefined(key)) {
                    this.smoothing = easing;
                } else {
                    position = normalizeKey(/** @type {(number|string)} */(key));
                    if (typeOf.number(position)) {
                        this.keyframes.easing(easing, position);
                    } else if (ENABLE_DEBUG) {
                        console.log('ClassicAnimation.easing: cannot parse passed key "' + key + '"');
                    }
                }
            }
        } else if (ENABLE_DEBUG) {
            console.log('easing: cannot form a function from arguments "' + timingFunction + '"');
        }
    };

    /**
     * Установка направления анимации
     * Значение "normal" соответствует возрастанию прогресса от 0 до 1 при каждом проходе
     * Значение "reverse" соответствует убыванию прогресса от 1 до 0 при каждом проходе
     * Значение "alternate" соответствует направлению "normal" для нечётных проходов и "reverse" для чётных
     * Значение "alternate-reverse" соответствует направлению "reverse" для нечётных проходов и "normal" для чётных
     * @see DEFAULT_DIRECTION
     * @param {string} animationDirection
     */
    ClassicAnimation.prototype.direction = function (animationDirection) {

        if (animationDirection === DIRECTION_NORMAL ||
            animationDirection === DIRECTION_REVERSE ||
            animationDirection === DIRECTION_ALTERNATE ||
            animationDirection === DIRECTION_ALTERNATE_REVERSE) {

            this.animationDirection = animationDirection;

        } else if (ENABLE_DEBUG) {
            console.log('direction: invalid value "' + animationDirection + '"');
        }
    };

    /**
     * Установка задержки старта
     * Если значение положительное, старт анимации будет отложен на численное представление.
     * Если отрицательное, то будет считаться, что прошло уже столько времени со старта.
     * @param {(number|string)} delay
     */
    ClassicAnimation.prototype.delay = function (delay) {
        var numericDelay = parseTimeString(delay);
        if (typeOf.number(numericDelay)) {
            this.delayTime =/** @type {number} */ (numericDelay);
        } else if (ENABLE_DEBUG) {
            console.log('delay: cannot parse value "' + delay + '"');
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
    ClassicAnimation.prototype.fillMode = function (fillMode) {

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
     * @param {string} iterations
     * @see DEFAULT_ITERATIONCOUNT
     */
    ClassicAnimation.prototype.iterationCount = function (iterations) {

        /** @type {number} */
        var numericIterations;

        // исключение составляет специальное значение
        if (iterations === ITERATIONCOUNT_INFINITE) {
            numericIterations = Number.POSITIVE_INFINITY;
        } else {
            numericIterations = parseFloat(iterations);
            if (!isFinite(numericIterations) || numericIterations < 0) {
                if (ENABLE_DEBUG) {
                    console.log('iterationCount: passed iterations is not a number or is negative "' + iterations + '"');
                }
                return;
            }
        }

        this.iterations = numericIterations;
        this.integralIterations = floor(numericIterations);
    };

    /**
     * Старт анимации
     */
    ClassicAnimation.prototype.start = function () {

        var fillsBackwards;

        if (this.delayTime > 0) {
            if (ENABLE_DEBUG) {
                console.log('start: ' + this.animationId + ' has positite delay "' + this.delayTime + '" ms');
            }
            setTimeout(bind(function () {
                var self = /** @type {ClassicAnimation} */(this);
                self.timer.start();
                self.onstart();
            }, this), this.delayTime);
        } else {
            if (ENABLE_DEBUG) {
                console.log('start: ' + this.animationId + ' has non-positite delay "' + this.delayTime + '" so starting right now.');
            }
            this.timer.start();
        }

        // запоминаем текущие значения анимируемых свойств для каждого элемента
        var element = this.element;
        var startingValues = this.startingValues;

        overrideRegistry.add(this);

        each(this.animatedProperties, function (special_value, propertyName) {
            var currentPropertyValue = css(element, propertyName);
            startingValues[propertyName] = normalize(element, propertyName, currentPropertyValue, false);
            css(element, propertyName, '');
        }, this);

        this.snapshot = new Keyframes();

        this.keyframes.forEach(function (propertyName, propertyValue, position) {
            var normalizedValue;
            if (propertyName === this.keyframes.easingProperty) {
                this.snapshot.easing(propertyValue, position);
            } else {
                if (propertyValue === SPECIAL_VALUE) {
                    propertyValue = css(this.element, propertyName);
                }
                normalizedValue = normalize(this.element, propertyName, propertyValue, false);
                this.snapshot.propAt(propertyName, normalizedValue, position);
            }
        }, this);

        if (ENABLE_DEBUG) {
            console.log('ClassicAnimation.start: keyframes are snapshotted');
        }

        fillsBackwards = this.fillingMode === FILLMODE_BOTH || this.fillingMode === FILLMODE_BACKWARDS;

        this.started = now();

        if (this.delayTime <= 0 || fillsBackwards) {
            this.tick(this.started);
        }

        if (ENABLE_DEBUG) {
            console.log('start: animation "' + this.animationId + '" started');
        }
    };

    /**
     * Остановка анимации
     */
    ClassicAnimation.prototype.stop = function () {

        var fillsForwards, endFractionalTime;

        this.timer.stop();
        overrideRegistry.remove(this);

        fillsForwards = this.fillingMode === FILLMODE_FORWARDS || this.fillingMode === FILLMODE_BOTH;

        if (fillsForwards) {
            endFractionalTime = this.needsReverse(this.iterations) ? 0.0 : 1.0;
            if (ENABLE_DEBUG) {
                console.log('stop: animation fills forwards and has direction "' + this.animationDirection + '" and iteration count "' + this.iterations + '" so fetching with keyframe "' + endFractionalTime + '"');
            }
            this.fetch(endFractionalTime, true);
        }
        //TODO fillMode: none

        if (ENABLE_DEBUG) {
            console.log('stop: animation "' + this.animationId + '" stopped');
        }

    };

     /**
     * Установка функции, которая будет выполняться на каждом шаге анимации
     * @param {Function} callback
     */
    ClassicAnimation.prototype.onStep = function (callback) {
       if (typeOf.func(callback)) {
           this.onstep = callback;
       }
    };

    /**
     * Установка значения свойства при указанном прогрессе
     * Для установки смягчения используется метод easing
     * @param {string} name имя свойства
     * @param {string} value значение свойства
     * @param {(number|string)=} position строка прогресса в процентах (по умол. 100%)
     * @see ClassicAnimation.easing
     */
    ClassicAnimation.prototype.propAt = function (name, value, position) {

        var keyframe;
        /** @type {(number|string)} */
        var key;

        key = typeOf.undefined(position) ? keyAliases["to"] : normalizeKey(/** @type {(number|string)} */(position));

        if (!typeOf.number(key)) {
            if (ENABLE_DEBUG) {
                console.log('propAt: passed keyframe key is invalid "' + position + '"');
            }
            return;
        }

        this.animatedProperties[name] = SPECIAL_VALUE;
        this.keyframes.propAt(name, value, key);
    };

    /**
     * Проверка установки значнеия свойства
     * Сделано для перезаписи анимаций.
     * @param {string} name имя свойства
     * @return {boolean} значение свойства
     */
    ClassicAnimation.prototype.isPropSetted = function (name) {
        return this.keyframes.isSetted(name);
    };

    /**
     * Перегрузка toString
     * возвратит имя анимации
     * @return {string}
     * @override
     * @inheritDoc
     */
    ClassicAnimation.prototype.toString = function () {
        return this.animationId;
    };

    /*
    *   Приватные методы.
    * */

    /**
     * Высчитает значения свойств при указанном прогрессе про проходу
     * @param {number} fractionalTime прогресс по проходу ( [0, 1] )
     * @param {boolean} direct отрисовка напрямую - передаётся методу render
     * @private
     */
    ClassicAnimation.prototype.fetch = function (fractionalTime, direct) {
        var firstKeyframe, secondKeyframe, position;
        var timingFunction;

        position = fractionalTime * FRACTION_TO_PERCENT;

         // смягчение для текущего ключевого кадра
        timingFunction = /** @type {Easing} */(this.snapshot.retrieveEasing(position) || this.smoothing);

        each(this.animatedProperties, function (_, propertyName) {

            var value, individualFractionalTime, keyframes;
            var offset, scale, easing;

            if (overrideRegistry.isOverridden(this, propertyName)) {
                // пропустить перезаписанное свойство
                return;
            }

            /*
             * Поиск двух ближайших ключевых кадров
             * для которых задано значение свойства
             */
            keyframes = this.snapshot.retrieveValue(propertyName, position);
            firstKeyframe = keyframes[0];
            secondKeyframe = keyframes[1];

            offset = firstKeyframe.key;
            scale = 1.0 / (secondKeyframe.key - firstKeyframe.key);
            individualFractionalTime = (position - offset) * scale;

            easing = timingFunction.compute(individualFractionalTime);

            value = blend(propertyName, /** @type {(Array|number)} */ (firstKeyframe.value), /** @type {(Array|number)} */(secondKeyframe.value), easing);

            this.render(propertyName, value, direct);

        }, this); // end properties loop

    };

    /**
     * Отрисует высчитанные значения свойств
     * @see ClassicAnimation.fetch
     * @param {string} propertyName имя свойства
     * @param {(number|Array)} propertyValue значение свойства
     * @param {boolean} direct отрисовка напрямую в стиль элемента
     * @private
     */
    ClassicAnimation.prototype.render = function (propertyName, propertyValue, direct) {
        css((direct ? this.element:this.rule).style, propertyName, propertyValue);
    };

    /**
     * Тик анимации
     * просчитывание и отрисовка (fetch & render)
     * @param {number} timeStamp временная метка
     * @private
     */
    ClassicAnimation.prototype.tick = function (timeStamp) {

        var iterationCount, animationProgress;
        var previousIteration, currentIteration;

        iterationCount = this.iterations;
        previousIteration = this.currentIteration;

        animationProgress = this.animationProgress = this.computeProgress(timeStamp);
        currentIteration = this.currentIteration = this.computeIteration(this.animationProgress);
        this.fractionalTime = this.computeFractionalTime(this.animationProgress, this.currentIteration);

        if (animationProgress >= iterationCount) {
            // Условие завершения анимации
            this.stop();
            this.oncomplete();
            // метод stop сам отрисует конечный кадр, т.к. он зависит от параметра fill-mode
            return;
        } else if (currentIteration !== previousIteration) {
            // Условие завершения итерации
            if (ENABLE_DEBUG && iterationCount !== Number.POSITIVE_INFINITY) {
                console.log('tick: "' + this.animationId + '" - iteration "' + currentIteration + '" of total "' + iterationCount + '"');
            }
            this.oniteration();
        } else {
            this.onstep();
        }

        this.fetch(this.fractionalTime, false);
    };

    /***
     * Вычислит и вернёт прогресс анимации относительно первой итерации
     * @param {number} timeStamp временная метка
     * @return {number} прогресс анимации относительно первой итерации
     * @private
     */
    ClassicAnimation.prototype.computeProgress = function (timeStamp) {
        return this.computeElapsedTime(timeStamp) / this.animationTime;
    };

    /**
     * Вычислит номер текущей итерации из прогресса.
     * @param {number} animationProgress прогресс относительно первого прохода
     * @return {number}
     * @private
     */
    ClassicAnimation.prototype.computeIteration = function (animationProgress) {
        var currentIteration;
        currentIteration = floor(animationProgress);
        return min(currentIteration, this.integralIterations);
    };

    /***
     * Вычислит и вернёт прогресс анимации относительно текущей итерации
     * @param {number} animationProgress прогресс относительно первой итерации
     * @param {number} currentIteration номер итерации из прогресса
     * @return {number} прогресс анимации относительно текущей итерации
     * @private
     */
    ClassicAnimation.prototype.computeFractionalTime = function (animationProgress, currentIteration) {

        var iterationProgress;

        iterationProgress = animationProgress - currentIteration;
        iterationProgress = min(iterationProgress, MAXIMAL_PROGRESS);

        if (this.needsReverse(currentIteration)) {
            iterationProgress = MAXIMAL_PROGRESS - iterationProgress;
        }

        return iterationProgress;
    };

    /**
     * Вычислит прошедшее со старта время до временной метки
     * @param {number} timeStamp временная метка
     * @return {number}
     * @private
     */
    ClassicAnimation.prototype.computeElapsedTime = function (timeStamp) {
        var elapsedTime;

        if (timeStamp < HIGHRESOLUTION_TIMER_BOUND) {
            // высокоточный таймер
            timeStamp += navigStart;
        }

        elapsedTime = timeStamp - this.started;
        elapsedTime += -1 * this.delayTime;
        elapsedTime = max(elapsedTime, 0);
        return elapsedTime;
    };

    /**
     * Нужно ли обратить прогресс анимации, в зависимости от направления и номера текущей итерации
     * @param {number} iterationNumber
     * @return {boolean}
     * @private
     */
    ClassicAnimation.prototype.needsReverse = function (iterationNumber) {

        var needsReverse, iterationIsOdd, direction;

        direction = this.animationDirection;
        iterationIsOdd = isOdd(iterationNumber);

        needsReverse = direction === DIRECTION_REVERSE;
        needsReverse = needsReverse || direction === DIRECTION_ALTERNATE && iterationIsOdd;
        needsReverse = needsReverse || direction === DIRECTION_ALTERNATE_REVERSE && !iterationIsOdd;

        return needsReverse;
    };

    /* Экспорты */
    ClassicAnimation.prototype["setElement"] = ClassicAnimation.prototype.setElement;
    ClassicAnimation.prototype["delay"] = ClassicAnimation.prototype.delay;
    ClassicAnimation.prototype["duration"] = ClassicAnimation.prototype.duration;
    ClassicAnimation.prototype["direction"] = ClassicAnimation.prototype.direction;
    ClassicAnimation.prototype["easing"] = ClassicAnimation.prototype.easing;
    ClassicAnimation.prototype["fillMode"] = ClassicAnimation.prototype.fillMode;
    ClassicAnimation.prototype["iterationCount"] = ClassicAnimation.prototype.iterationCount;
    ClassicAnimation.prototype["onComplete"] = ClassicAnimation.prototype.onComplete;
    ClassicAnimation.prototype["propAt"] = ClassicAnimation.prototype.propAt;
    ClassicAnimation.prototype["start"] = ClassicAnimation.prototype.start;
    ClassicAnimation.prototype["stop"] = ClassicAnimation.prototype.stop;
    ClassicAnimation.prototype["onStep"] = ClassicAnimation.prototype.onStep;
    ClassicAnimation.prototype["onStart"] = ClassicAnimation.prototype.onStart;
    ClassicAnimation.prototype["destruct"] = noop;