    //TODO удалить, т.к. директивы определены в animate_wrap.js
    var DEFAULT_DURATION = "400ms";
    var DEFAULT_EASING = "ease";
    var DEFAULT_FILLMODE = "forwards";
    var DEFAULT_DELAY = 0;
    var DEFAULT_DIRECTION = "normal";
    var DEFAULT_ITERATIONCOUNT = 1;
    var DEFAULT_HANDLER = noop;
    var DEFAULT_PLAYINGSTATE = "paused";

    /**
     * Имя атрибута для связывания элемента и
     * данных, связанных с ним
     * @type {String}
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
    var PERCENT_TO_FRACTION = 1 / 100;

    /**
     * Конструктор анимаций с ключевыми кадрами на JavaScript.
     * @constructor
     */
    function KeyframeAnimation() {
        this.targets = [];
        this.cache = {};
        this.name = generateId();
        /** @type KeyframeAnimation.prototype.keyframes */
        this.keyframes = [];
        this.specialEasing = {};
        this.iterations = 1;
        this.rules = {};
        this.animatedProperties = {};
        // начальный и конечный ключевые кадры
        // их свойства наследуют вычисленные
        this.addKeyframe(0, createObject(this.animatedProperties));
        this.addKeyframe(1, createObject(this.animatedProperties));
        this.timer = new ReflowLooper(this.tick, this);
    }

    /*
    *   Наследуемые свойства.
    * */

    /**
     * Время отложенного запуска, в миллисекундах
     * Значение устанавливается методом
     * @see KeyframeAnimation.delay
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.delayTime = parseTimeString(DEFAULT_DELAY);

    /**
     * Режим заливки свойств, устанавливается методом
     * @see KeyframeAnimation.fillMode
     * @type {string}
     * @private
     */
    KeyframeAnimation.prototype.fillingMode = DEFAULT_FILLMODE;

    /**
     * Продолжительность одного прохода, в миллисекундах
     * Значение устанавливается методом.
     * @see KeyframeAnimation.duration
     * @private
     * @type {number}
     */
    KeyframeAnimation.prototype.animationTime = parseTimeString(DEFAULT_DURATION);

    /**
     * Число проходов;
     * Значение устанавливается методом iterationCount.
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.iterations = parseInt(DEFAULT_ITERATIONCOUNT, 10);

    /**
     * Челосисленное число проходов;
     * Значение устанавливается методом iterationCount.
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.integralIterations = floor(DEFAULT_ITERATIONCOUNT);

    /**
     * Направление анимации.
     * Значение устанавливается методом direction.
     * @type {string}
     * @private
     */
    KeyframeAnimation.prototype.animationDirection = DEFAULT_DIRECTION;

    /**
     * Смягчение всей анимации
     * @type {Function}
     * @private
     */
    KeyframeAnimation.prototype.smoothing = cubicBezierApproximations[ DEFAULT_EASING ];

    /**
     * Обработчик завершения анимации
     * @private
     * @type {Function}
     */
    KeyframeAnimation.prototype.oncomplete = noop;

    /**
     * Обработчик завершения прохода
     * @type {Function}
     * @private
     */
    KeyframeAnimation.prototype.oniteration = noop;

    /*
    *   Индивидуальные свойства
    * */

    /**
     * Объект с временными данными, вроде кешей
     * или же запомненных индивидуальных значений свойств.
     * @type {Object}
     * @private
     */
    KeyframeAnimation.prototype.cache = undefined;

    /**
     * Уникальная строка - имя анимации.
     * Создаётся автоматически.
     * @type {string}
     * @private
     */
    KeyframeAnimation.prototype.name = undefined;

    /**
     * Коллекция элементов, учавствующих в анимации.
     * Заполняется сеттером "element"
     * @private
     * @type {Array.<Element>}
     */
    KeyframeAnimation.prototype.targets = undefined;

    /**
     * Объект с CSS-правилами, в котором будут отрисовываться свойства.
     * Ключ - ID элемента, значение - CSS правило.
     * @enum {CSSRule}
     */
    KeyframeAnimation.prototype.rules = undefined;

    /**
     * Отсортированный по возрастанию свойства "key" массив ключевых кадров.
     * @private
     * @typedef Array.{{key: number, properties: Object.<string, number>, easing: Function}}
     */
    KeyframeAnimation.prototype.keyframes = undefined;

    /**
     * Словарь, содержащий все анимируемые свойства.
     * Заполняется из метода установки значений свойств по прогрессу (propAt)
     * Нужен для первого (0%) и последнего (100%) ключевых кадров.
     * @type {Object}
     * @private
     */
    KeyframeAnimation.prototype.animatedProperties = undefined;

    /**
     * Объект с особыми смягчениями для свойств
     * Ключ - имя свойства, Значение - функция смягчения
     * Значения устанавливаются методом easing
     * @type {Object.<string, Function>}
     */
    KeyframeAnimation.prototype.specialEasing = undefined;

    /**
     * Временная метка старта
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.started = undefined;

    /**
     * Таймер отрисовки
     * @type {ReflowLooper}
     * @private
     */
    KeyframeAnimation.prototype.timer = undefined;

    /*
    * Публичные методы
    * */

    /**
     * Добавит элемент(-ы) в коллекцию анимируемых.
     * @param {(HTMLElement|Array.<HTMLElement>)} elem Элемент
     */
    KeyframeAnimation.prototype.element = function (elem) {
        var id, elements;
        if (type.element(elem)) {
            id = generateId();
            this.rules[id] = addRule("." + id);
            addClass(elem, id);
            elem.setAttribute(DATA_ATTR_NAME, id);
            this.cache[id] = {};
            this.targets.push(elem);
        } else {
            elements = slice(elem);
            each(elements, this.element, this);
        }
    };

    /**
     * Установка продолжительности прохода анимации.
     * Отрицательные значения считаются за нулевое.
     * Нулевое значение соответствует мгновенному проходу анимации, при этом
     * все события (конца прохода и конца анимации) возникают так же, как и при положительной продолжительности прохода
     * и режим заполнения (fillMode) работает так же, как и при положительной продолжительности прохода
     * @param {string} duration
     */
    KeyframeAnimation.prototype.duration = function (duration) {
        var numericDuration = parseTimeString(duration);
        if (type.number(numericDuration)) {
            this.animationTime = numericDuration;
        } else if (ENABLE_DEBUG) {
            console.warn('duration: bad value "'+ duration +'"');
        }
    };

    /**
     * Установка обработчика завершения анимации
     * @param {Function} callback
     */
    KeyframeAnimation.prototype.onComplete = function (callback) {
        if (type.func(callback)) {
            this.oncomplete = callback;
        } else if (ENABLE_DEBUG) {
            console.warn("onComplete: callback is not a function : %o", callback);
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
     * @param {(Function|string)} timingFunction временная функция CSS, JS функция или алиас смягчения
     * @param {string=} position прогресс по проходу в процентах (по умол. не зваисит от прогресса)
     * @param {string=} property для какого свойства устанавливается (по умол. для всех)
     * @see cubicBezierAliases
     * @see cubicBezierApproximations
     */
    KeyframeAnimation.prototype.easing = function (timingFunction, position, property) {

        /**
         * Временной кадр, если указываем смягчение для него
         * @type {{key: number, properties: Object, easing: Function}}
         * */
        var keyframe;
        /**
         * Функция смягчения
         * @type {Function}
         */
        var easing;
        /**
         * Аргументы к временной функции
         * @type {Array}
         */
        var points;
        /**
         * для выделения алиасов
         * ease-in -> easeIn
         * @type {string}
         */
        var camelCased;
        /**
         * строка временной функции css без пробелов
         * @type {string}
         */
        var trimmed;
        /**
         * Количество ступеней лестничной функции
         * @type {number}
         */
        var stepsAmount;
        /**
         * Отсчитывать ли ступени лестничной функции от старта (или с конца)
         * @type {boolean}
         */
        var countFromStart;
        /**
         * Числовое представление прогресса
         * @type {number}
         */
        var key;

        if (type.func(timingFunction)) {
            easing = timingFunction;
        } else if (type.string(timingFunction)) {
            // alias или CSS timing-function

            trimmed = trim(timingFunction);
            camelCased = camelCase(trimmed);

            if (camelCased in cubicBezierApproximations) {
                // алиас функции приближения
                easing = cubicBezierApproximations[camelCased];
            } else if (camelCased in cubicBezierAliases) {
                // алиас к точкам
                points = cubicBezierAliases[camelCased];
            } else {
                // строка временной функции css
                if (cubicBezierReg.test(trimmed)) {
                    points = trimmed.match(cubicBezierReg)[1].split(",");
                } else if (stepsReg.test(trimmed)) {
                    points = trimmed.match(stepsReg)[1].split(",");
                }
            }

            if (points) {
                // переданы аргументы к временным функциям.
                if (points.length === 4) {
                    // 4 аргумента - это кубическая кривая Безье
                    points = map(points, parseFloat);
                    // абсциссы точек должны лежать в [0, 1]
                    if (inRange(points[0], 0, 1, true) && inRange(points[2], 0, 1, true)) {
                        easing = partial(cubicBezier, points);
                    }
                } else if (points.length === 2) {
                    // 2 аргумента - лестничная функция
                    stepsAmount = parseInt(points[0], 10);
                    countFromStart = points[1] === "start";
                    if (type.number(stepsAmount)) {
                        easing = partial(steps, [stepsAmount, countFromStart]);
                    }
                }
            }

        }

        if (type.func(easing)) {
            if (type.string(property)) {
                this.specialEasing[property] = easing;
            } else {
                if (type.undefined(position)) {
                    this.smoothing = easing;
                } else {
                    key = normalizeKey(position);
                    if (type.number(key)) {
                        // указываем в процентах, используем в долях.
                        key *= PERCENT_TO_FRACTION;
                        keyframe = this.lookupKeyframe(key) || this.addKeyframe(key);
                        keyframe.easing = easing;
                    }
                }
            }
        } else if (ENABLE_DEBUG) {
            console.warn('easing: cannot form a function from arguments %o', timingFunction);
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
    KeyframeAnimation.prototype.direction = function (animationDirection) {

        if (animationDirection === DIRECTION_NORMAL ||
            animationDirection === DIRECTION_REVERSE ||
            animationDirection === DIRECTION_ALTERNATE ||
            animationDirection === DIRECTION_ALTERNATE_REVERSE) {

            this.animationDirection = animationDirection;

        } else if (ENABLE_DEBUG) {
            console.warn('direction: invalid value "%s"', animationDirection);
        }
    };

    /**
     * Установка задержки старта
     * Если значение положительное, старт анимации будет отложен на численное представление.
     * Если отрицательное, то будет считаться, что прошло уже столько времени со старта.
     * @param {(number|string)} delay
     */
    KeyframeAnimation.prototype.delay = function (delay) {
        var numericDelay = parseTimeString(delay);
        if (type.number(numericDelay)) {
            this.delayTime = numericDelay;
        } else if (ENABLE_DEBUG) {
            console.warn('delay: cannot parse value "%s"', delay);
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
    KeyframeAnimation.prototype.fillMode = function (fillMode) {

        if (fillMode === FILLMODE_FORWARDS ||
            fillMode === FILLMODE_BACKWARDS ||
            fillMode === FILLMODE_BOTH ||
            fillMode === FILLMODE_NONE) {

            this.fillingMode = fillMode;

        } else if (ENABLE_DEBUG) {
            console.warn('fillMode: invalid value "%s"', fillMode);
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
    KeyframeAnimation.prototype.iterationCount = function (iterations) {

        /**
         * Числовое представление
         * @type {number}
         */
        var numericIterations;

        // исключение составляет специальное значение
        if (iterations === ITERATIONCOUNT_INFINITE) {
            numericIterations = Number.POSITIVE_INFINITY;
        } else {
            numericIterations = parseFloat(iterations);
            if (!isFinite(numericIterations) || numericIterations < 0) {
                if (ENABLE_DEBUG) {
                    console.warn('iterationCount: passed iterations is not a number or is negative "%s"', iterations);
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
    KeyframeAnimation.prototype.start = function () {

        if (this.delayTime > 0) {
            setTimeout(bind(this.timer.start, this.timer), this.delayTime);
        } else {
            this.timer.start();
        }

        // запоминаем текущие значения анимируемых свойств для каждого элемента
        each(this.targets, function (element) {

            var id = element.getAttribute(DATA_ATTR_NAME);
            var elementData = this.cache[id];

            each(this.animatedProperties, function (special_value, propertyName) {
                elementData[propertyName] = css(element, propertyName);
            });

        }, this);

        this.started = now();
        this.tick(this.started);

        if (ENABLE_DEBUG) {
            console.log('start: animation "%s" started', this.name);
        }
    };

    /**
     * Остановка анимации
     */
    KeyframeAnimation.prototype.stop = function () {

        var fillsForwards;

        this.timer.stop();

        fillsForwards = this.fillingMode === FILLMODE_FORWARDS ||this.fillingMode === FILLMODE_BOTH;

        if (fillsForwards) {
            this.tick(this.started + this.iterations * this.animationTime);
        }

        if (ENABLE_DEBUG) {
            console.log('stop: animation "%s" stopped', this.name);
        }

        this.oncomplete();

    };

    /**
     * Установка значения свойства при указанном прогрессе
     * Для установки смягчения используется метод easing
     * @param {string} name имя свойства
     * @param {string} value значение свойства
     * @param {string=} position строка прогресса в процентах (по умол. 100%)
     * @see KeyframeAnimation.easing
     */
    KeyframeAnimation.prototype.propAt = function (name, value, position) {

        /**
         * Ключевой кадр, имеющий свои свойства и своё смягчение
         * @typedef {{key: number, properties: Object.<string, number>, easing: Function}}
         * */
        var keyframe, keyframes, key;
        var startingKeyframe, endingKeyframe;

        /**
         * @type {Array.<keyframe>}
         */
        keyframes = this.keyframes;

        key = type.undefined(position) ? keyAliases["to"] : position;
        key = normalizeKey(position);
        // в долях
        key *= PERCENT_TO_FRACTION;

        if (!type.number(key)) {
            if (ENABLE_DEBUG) {
                console.warn('propAt: passed keyframe key is invalid "%s"', position);
            }
            return;
        }

        keyframe = this.lookupKeyframe(key) || this.addKeyframe(key);
        this.animatedProperties[name] = SPECIAL_VALUE;
        keyframe.properties[name] = value;
    };

    /*
    *   Приватные методы.
    * */

    /**
     * Добавит ключевой кадр на указанном прогрессе по проходу в долях и вернёт его
     * @param {number} position
     * @param {Object=} properties
     * @param {Function=} easing
     * @private
     */
    KeyframeAnimation.prototype.addKeyframe = function (position, properties, easing) {

        var keyframe, keyframes;

        if (type.number(position)) {

            /** @type {{key: number, properties: Object.<string, number>, easing: Function}} */
            keyframe = {
                key: position,
                properties: type.object(properties) ? properties : {}
            };

            if (type.func(easing)) {
                keyframe.easing = easing;
            }

            keyframes = this.keyframes;
            keyframes.push(keyframe);
            bubbleSort(/** @type {Array} */keyframes, compareKeyframes);

            return keyframe;

        }

    };

    /**
     * Попытается найти в коллекции ключевой кадр
     * с указанным прогрессом по проходу (в долях)
     * @param {number} position
     * @return {Object}
     * @private
     */
    KeyframeAnimation.prototype.lookupKeyframe = function (position) {
        var keyframe, index;
        index = binarySearch(/** @type {Array} */this.keyframes, position, function (key, keyframe) {
            return key - keyframe.key;
        });
        keyframe = this.keyframes[index];
        return keyframe;
    };

    /**
     * Высчитает значения свойств при указанном прогрессе про проходу
     * @param {number} fractionalTime прогресс по проходу ( [0, 1] )
     * @return {Object}
     * @private
     */
    KeyframeAnimation.prototype.fetch = function (fractionalTime) {

        var elementData;
        var id;
        var keyframes, globalFetch, fetchedProperties, firstKeyframe, secondKeyframe, from, to, propertyName;
        var element;
        var fractionalTime, offset, scale;
        var timingFunction, specialEasing, index, easing;

        keyframes = this.keyframes;

        /*
         * Поиск функции смягчения для текущего ключевого кадра
         */
        timingFunction = this.smoothing;

        index = binarySearch(keyframes, fractionalTime, function (fractionalTime, firstKeyframe, index, keyframes) {
            var secondKeyframe = keyframes[ index + 1];
            // для навигации в бинарном поиске
            var MOVE_RIGHT = 1, MOVE_LEFT = -1, STOP = 0;

            if (!secondKeyframe) return MOVE_LEFT;
            if (firstKeyframe.key > fractionalTime) return MOVE_LEFT;
            if (secondKeyframe.key <= fractionalTime) return MOVE_RIGHT;

            return STOP;
        });

        if (index in keyframes && type.func(keyframes[index].easing)) {
            timingFunction = keyframes[index].easing;
        } else if (!type.func(timingFunction)) {
            timingFunction = cubicBezierApproximations[ DEFAULT_EASING ];
        }

        /**
         *  информация о вычисленных значениях
         *  для каждого элемента
         *  */
        globalFetch = map(this.targets, function (element) {

            var fetchedProperties;

            id = element.getAttribute(DATA_ATTR_NAME);
            elementData = this.cache[id];

            fetchedProperties = map(this.animatedProperties, function (_, propertyName) {

                /*
                 * Поиск двух ближайших ключевых кадров
                 * для которых задано значение свойства
                 */
                firstKeyframe = keyframes[0];
                secondKeyframe = keyframes[keyframes.length - 1];

                //TODO было бы неплохо заменить линейный поиск на бинарный
                each(keyframes, function (keyframe) {
                    // специальное значение для прекращения обхода
                    var STOP_ITERATION = false;
                    if (propertyName in keyframe) {
                        if (fractionalTime <= keyframe.key) {
                            secondKeyframe = keyframe;
                            return STOP_ITERATION;
                        }
                        firstKeyframe = keyframe;
                    }
                });

                // для вычисления прогресса между двумя точками
                offset = firstKeyframe.key;
                scale = 1.0 / (secondKeyframe.key - firstKeyframe.key);

                easing = timingFunction((fractionalTime - offset) * scale);

                if (firstKeyframe.properties[propertyName] === SPECIAL_VALUE) {
                    from = elementData[propertyName];
                } else {
                    from = firstKeyframe.properties[propertyName];
                }

                if (secondKeyframe.properties[propertyName] === SPECIAL_VALUE) {
                    to = elementData[propertyName];
                } else {
                    to = secondKeyframe.properties[propertyName];
                }

                from = normalize(element, propertyName, from, false);
                to = normalize(element, propertyName, to, false);

                return {
                    name: propertyName,
                    value: blend(propertyName, from, to, easing)
                };

            }, this);

            return {
                id: id,
                properties: fetchedProperties
            };

        }, this);

        return globalFetch;
    };

    /**
     * Отрисует высчитанные значения свойств
     * @param {Object} globalFetch возвращённые fetch'ем значения
     * @param {boolean} direct НЕ (!) использовать ли правило в таблице стилей для отрисовки одинаковых для элементов значений
     * @see KeyframeAnimation.fetch
     * @private
     */
    KeyframeAnimation.prototype.render = function (globalFetch, direct) {

        // TODO вывод одинаковых значений в css правило
        each(globalFetch, function (fetchInfo) {

            var id = fetchInfo.id;
            var elementIndex = LinearSearch(this.targets, function (element) {
                if (id === element.getAttribute(DATA_ATTR_NAME)) {
                    return 0;
                }
                return;
            });
            var element, elementStyle;
            var rule, ruleStyle;
            var destinationStyle;

            if (elementIndex !== -1) {

                element = this.targets[elementIndex];
                elementStyle = element.style;
                rule = this.rules[id];
                ruleStyle = rule.style;
                destinationStyle = direct ? elementStyle : ruleStyle;

                each(fetchInfo.properties, function (fetchedProperty) {
                    var propertyName = getVendorPropName(fetchedProperty.name);
                    var propertyValue = normalize(element, propertyName, fetchedProperty.value, true);
                    if (!direct && elementStyle[propertyName]) {
                        // удалить свойство из стиля элемента, чтобы оно не перекрывало значение css правила
                        elementStyle[propertyName] = '';
                        if (ENABLE_DEBUG) {
                            console.info('Property "%s" was overridden. Removing it from style of %o', propertyName, element);
                        }
                    }
                    destinationStyle[propertyName] = propertyValue;
                }, this);
            }
        }, this);

    };

    /**
     * Тик анимации
     * просчитывание и отрисовка (fetch & render)
     * @param {number} timeStamp временная метка
     * @private
     */
    KeyframeAnimation.prototype.tick = function (timeStamp) {

        var animationProgress, iterationProgress;
        var currentIteration;
        var fetchedProperties;
        var iterationCount;

        iterationCount = this.iterations;
        animationProgress = this.computeElapsedTime(timeStamp) / this.animationTime;
        currentIteration = floor(animationProgress);

        iterationProgress = animationProgress - min(currentIteration, this.integralIterations);
        iterationProgress = min(iterationProgress, 1.0);

        if (iterationProgress === 1.0 && currentIteration <= iterationCount) {
            // Условие завершения итерации
            if (ENABLE_DEBUG) {
                console.log('tick: %s - iteration %d of total %d', this.name, currentIteration, iterationCount);
            }
            this.oniteration();
        } else if (animationProgress >= iterationCount) {
            // Условие завершения анимации
            this.stop();
        } else {
            if (this.needsReverse(currentIteration)) {
                iterationProgress = 1.0 - iterationProgress;
            }
            fetchedProperties = this.fetch(iterationProgress);
            this.render(fetchedProperties, false);
        }

    };

    /**
     * Вычислит прошедшее со старта время до временной метки
     * @param {number} timeStamp временная метка
     * @return {number}
     * @private
     */
    KeyframeAnimation.prototype.computeElapsedTime = function (timeStamp) {
        var elapsedTime = timeStamp - this.started;
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
    KeyframeAnimation.prototype.needsReverse = function (iterationNumber) {

        var needsReverse, iterationIsOdd, direction;

        direction = this.animationDirection;
        iterationIsOdd = isOdd(iterationNumber);

        needsReverse = direction === DIRECTION_REVERSE;
        needsReverse = needsReverse || direction === DIRECTION_ALTERNATE && iterationIsOdd;
        needsReverse = needsReverse || direction === DIRECTION_ALTERNATE_REVERSE && !iterationIsOdd;

        return needsReverse;
    };

    /** @export */
    window["KeyframeAnimation"] = KeyframeAnimation;