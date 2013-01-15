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
        this.rule = addRule("." + this.name, "");
        this.animatedProperties = {};
        // начальный и конечный ключевые кадры
        // их свойства наследуют вычисленные
        this.addKeyframe(0, createObject(this.animatedProperties));
        this.addKeyframe(1, createObject(this.animatedProperties));
        this.timer = new ReflowLooper(this.tick, this);
    }

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
     * CSS-правило, в котором будут отрисовываться свойства, значения которых совпадают для каждого элемента.
     * @type {CSSRule}
     */
    KeyframeAnimation.prototype.rule = undefined;

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
     * Число проходов;
     * Значение устанавливается методов iterationCount.
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.iterations = undefined;

    /**
     * Направление анимации.
     * Значение устанавливается методом direction.
     * @type {string}
     * @private
     */
    KeyframeAnimation.prototype.animationDirection = undefined;

    /**
     * Объект с особыми смягчениями для свойств
     * Ключ - имя свойства, Значение - функция смягчения
     * Значения устанавливаются методом easing
     * @type {Object.<string, Function>}
     */
    KeyframeAnimation.prototype.specialEasing = undefined;

    /**
     * Продолжительность одного прохода, в миллисекундах
     * Значение устанавливается методом.
     * @see KeyframeAnimation.duration
     * @private
     * @type {number}
     */
    KeyframeAnimation.prototype.animationTime = undefined;

    /**
     * Обработчик завершения анимации
     * @private
     * @type {Function}
     */
    KeyframeAnimation.prototype.oncomplete = undefined;

    /**
     * Обработчик завершения прохода
     * @type {Function}
     * @private
     */
    KeyframeAnimation.prototype.oniteration = undefined;

    /**
     * Временная метка старта
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.started = undefined;

    /**
     * Смягчение всей анимации
     * @type {Function}
     * @private
     */
    KeyframeAnimation.prototype.smoothing = undefined;

    /**
     * Таймер отрисовки
     * @type {ReflowLooper}
     * @private
     */
    KeyframeAnimation.prototype.timer = undefined;

    /**
     * Время отложенного запуска, в миллисекундах
     * Значение устанавливается методом
     * @see KeyframeAnimation.delay
     * @type {number}
     * @private
     */
    KeyframeAnimation.prototype.delayTime = undefined;

    /**
     * Режим заливки свойств, устанавливается методом
     * @see KeyframeAnimation.fillMode
     * @type {string}
     * @private
     */
    KeyframeAnimation.prototype.fillingMode = undefined;

    /**
     * Добавит элемент(-ы) в коллекцию анимируемых.
     * @param {(HTMLElement|Array.<HTMLElement>)} elem Элемент
     */
    KeyframeAnimation.prototype.element = function (elem) {
        var id, elements;
        if (type.element(elem)) {
            addClass(elem, this.name);
            id = generateId();
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
        }
    };

    /**
     * Установка обработчика завершения анимации
     * @param {Function} callback
     */
    KeyframeAnimation.prototype.onComplete = function (callback) {
        this.oncomplete = callback;
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
     * @param {(Function|string)} timingFunction временная функция CSS, JS функция или алиас смягчения
     * @param {string=} position прогресс по проходу в процентах (по умол. не зваисит от прогресса)
     * @param {string=} property для какого свойства устанавливается (по умол. для всех)
     * @see cubicBezierAliases
     * @see cubicBezierApproximations
     */
    KeyframeAnimation.prototype.easing = function (timingFunction, position, property) {
        var keyframe;
        var leftBracketIndex, rightBracketIndex, points, camelCased;
        var countFromStart, stepsAmount;

        if (type.string(timingFunction)) {
            // alias или CSS timing-function

            camelCased = camelCase(trim(timingFunction));
            if (camelCased in cubicBezierApproximations) {
                timingFunction = cubicBezierApproximations[camelCased];
            } else if (camelCased in cubicBezierAliases) {
                timingFunction = cubicBezierAliases[camelCased];
            }

            if (!type.func(timingFunction)) {
                if (type.array(timingFunction)) {
                    points = timingFunction;
                } else if (cubicBezierReg.test(timingFunction)) {
                    leftBracketIndex = timingFunction.indexOf("(");
                    rightBracketIndex = timingFunction.indexOf(")", leftBracketIndex);
                    points = timingFunction.slice(leftBracketIndex, rightBracketIndex);
                    points = map(points.split(","), parseFloat);
                } else if (stepsReg.test(timingFunction)) {
                    leftBracketIndex = timingFunction.indexOf("(");
                    rightBracketIndex = timingFunction.indexOf(")", leftBracketIndex);
                    points = timingFunction.slice(leftBracketIndex, rightBracketIndex);
                    points = points.split(",");
                }

                // 4 аргумента - это кубическая кривая Безье
                if (points.length === 4) {
                    // TODO проверка абсцисс
                    timingFunction = partial(cubicBezier, points);
                } else if (points.length === 2) {
                    // 2 аргумента - лестничная функция
                    stepsAmount = parseInt(points[0], 10);
                    countFromStart = points[1] === "start";
                    timingFunction = partial(steps, [stepsAmount, countFromStart]);
                }
            }
        }

        if (!type.func(timingFunction)) {
            return;
        }

        if (type.string(property)) {
            this.specialEasing[property] = timingFunction;
        } else {
            if (type.undefined(position)) {
                this.smoothing = timingFunction;
            } else {
                position = normalizeKey(position);
            }
            if (type.number(position)) {
                position /= 100;
                keyframe = this.lookupKeyframe(position) || this.addKeyframe(position);
                keyframe.easing = timingFunction;
            }
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
        this.animationDirection = animationDirection;
    };

    /**
     * Установка задержки старта
     * Если значение положительное, старт анимации будет отложен на численное представление.
     * Если отрицательное, то будет считаться, что прошло уже столько времени со старта.
     * @param {string} delay
     */
    KeyframeAnimation.prototype.delay = function (delay) {
        delay = parseTimeString(delay);
        if (type.number(delay)) {
            this.delayTime = delay;
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
        this.fillingMode = fillMode;
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

        // исключение составляет специальное значение
        if (iterations === ITERATIONCOUNT_INFINITE) {
            iterations = Number.POSITIVE_INFINITY;
        } else {
            iterations = parseFloat(iterations);
            if (!isFinite(iterations) || iterations < 0) {
                return;
            }
        }

        this.iterations = iterations;
    };

    /**
     * Добавит ключевой кадр на указанном прогрессе по проходу в долях и вернёт его
     * @param {key} position
     * @param {Object} properties
     * @param {Function} easing
     * @private
     */
    KeyframeAnimation.prototype.addKeyframe = function (position, properties, easing) {

        var keyframe, keyframes;
        var key, properties, easing;

        position = normalizeKey(position);

        if (!type.number(position)) return;

        /** @typedef {number} */
        key = position;
        /** @typedef {Object.<string, number>} */
        properties = properties || {};
        /** @typedef {Function} */
        easing = easing || null;

        /** @typedef {{key: key, properties: properties, easing: easing}} */
        keyframe = {
            key:key,
            properties:properties,
            easing:easing
        };

        /** @type {Array.<keyframe>} */
        keyframes = this.keyframes;
        keyframes.push(keyframe);
        bubbleSort(keyframes, compareKeyframes);

        return keyframe;
    };

    /**
     * Попытается найти в коллекции ключевой кадр
     * с указанным прогрессом по проходу в долях
     * @param {number} position
     * @return {Object}
     * @private
     */
    KeyframeAnimation.prototype.lookupKeyframe = function (position) {
        var keyframe, index;
        index = binarySearch(this.keyframes, position, function (key, keyframe) {
            return key - keyframe.key;
        });
        keyframe = this.keyframes[index];
        return keyframe;
    };

    /**
     * Старт анимации
     */
    KeyframeAnimation.prototype.start = function () {

        var prop, delay, numericDefaultDelay, fillsBackwards, fillMode;
        var i;

        numericDefaultDelay = parseTimeString(DEFAULT_DELAY);

        fillMode = this.fillingMode || DEFAULT_FILLMODE;
        fillsBackwards = fillMode === FILLMODE_BACKWARDS;
        fillsBackwards |= fillMode === FILLMODE_BOTH;

        delay = parseTimeString(this.delayTime);
        delay = type.number(delay) ? delay : numericDefaultDelay;

        setTimeout(bind(this.timer.start, this.timer), delay);

        this.started = now();

        // запоминаем текущие значения анимируемых свойств для каждого элемента
        each(this.targets, function (element) {
            var id = element.getAttribute(DATA_ATTR_NAME);
            var elementData = this.cache[id];
            each(this.animatedProperties, function (special_value, propertyName) {
                elementData[propertyName] = normalize(element, propertyName, css(element, propertyName));
            }, this);
        }, this);

        if ((fillsBackwards && delay > 0) || delay <= 0) {
            this.render(this.fetch(0));
        }
    };

    /**
     * Остановка анимации
     */
    KeyframeAnimation.prototype.stop = function () {

        var fillsForwards, fillMode;

        this.timer.stop();

        fillMode = this.fillingMode || DEFAULT_FILLMODE;
        fillsForwards = fillMode === FILLMODE_FORWARDS;
        fillsForwards |= fillMode === FILLMODE_BOTH;

        if (fillsForwards) {
            this.render(this.fetch(1), true);
        }

        type.func(this.oncomplete) && this.oncomplete();

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
        var keyframe, keyframes;
        var startingKeyframe, endingKeyframe;

        /**
         * @type {Array.<keyframe>}
         */
        keyframes = this.keyframes;

        if (type.undefined(position)) position = keyAliases["to"];
        position = normalizeKey(position);
        // в долях
        position /= 100;

        if (!type.number(position)) return;

        keyframe = this.lookupKeyframe(position) || this.addKeyframe(position);
        this.animatedProperties[name] = SPECIAL_VALUE;
        keyframe.properties[name] = value;
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
        var i, j;
        var keyframes, globalFetch, fetchedProperties, firstKeyframe, secondKeyframe, from, to, propertyName;
        var element;
        var fractionalTime, offset, scale;
        var timingFunction, index, easing;

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

            id = element.getAttribute(DATA_ATTR_NAME);
            elementData = this.cache[id];

            return map(this.animatedProperties, function (_, propertyName) {

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

        }, this);

        return globalFetch;
    };

    /**
     * Отрисует высчитанные значения свойств
     * @param {Object} fetchedInfo возвращённые fetch'ем значения
     * @param {boolean} direct НЕ (!) использовать ли правило в таблице стилей для отрисовки одинаковых для элементов значений
     * @see KeyframeAnimation.fetch
     * @private
     */
    KeyframeAnimation.prototype.render = function (fetchedInfo, direct) {

        var buffer, property, propertyName, propertyValue, element;
        var i, j, fetchedProperties;
        var index, NOT_FOUND, colonIndex, semiIndex;

        NOT_FOUND = -1;

        for (i = 0; i < this.targets.length; i++) {

            element = this.targets[i];
            fetchedProperties = fetchedInfo[i];
            buffer = element.style.cssText + ';';

            for (j = 0; j < fetchedProperties.length; j++) {

                property = fetchedProperties[j].name;
                propertyName = getVendorPropName.cache[property] || getVendorPropName(property);
                propertyValue = normalize(element, property, fetchedProperties[j].value, true);

                index = buffer.indexOf(propertyName, 0);
                index = index === NOT_FOUND ? buffer.indexOf(property, 0) : index;

                if (index === NOT_FOUND) {
                    buffer += propertyName + ":" + propertyValue + ";";
                } else {
                    colonIndex = buffer.indexOf(":", index);
                    semiIndex = buffer.indexOf(";", colonIndex);
                    buffer = buffer.slice(0, colonIndex + 1) + propertyValue + buffer.slice(semiIndex);
                }
            }

            // TODO Rules vs style проверка производительности
            element.style.cssText = buffer;
        }
    };

    /**
     * Тик анимации
     * просчитывание и отрисовка (fetch & render)
     * @param {number} timeStamp временная метка (или текущее время)
     * @private
     */
    KeyframeAnimation.prototype.tick = function (timeStamp) {

        var elapsedTime, progr, fractionalTime;
        var iterations, integralIterations, currentIteration, iterationIsOdd;
        var fetchedProperties;

        /*
         * Вычисление прогресса по итерации
         * */
        elapsedTime = timeStamp - this.started;
        elapsedTime += -1 * this.delayTime;
        if (elapsedTime < 0) elapsedTime = 0;

        // прогресс относительно первой итерации
        progr = elapsedTime / this.animationTime;

        currentIteration = Math.floor(progr);

        iterations = this.iterations;
        integralIterations = Math.floor(iterations);

        // прогресс относительно текущего прохода
        fractionalTime = progr - Math.min(currentIteration, integralIterations);

        if (fractionalTime > 1) fractionalTime = 1;

        /*
         * Условие завершения итерации
         */
        if (fractionalTime === 1 && currentIteration < iterations) {
            this.oniteration();
        }

        /*
         * Условие завершения анимации
         */
        if (progr > iterations) {
            this.stop();
        } else {
            iterationIsOdd = currentIteration & 1;

            if (needsReverse(this.animationDirection, currentIteration)) {
                fractionalTime = 1 - fractionalTime;
            }

            fetchedProperties = this.fetch(fractionalTime);
            this.render(fetchedProperties);
        }
    };

    /** @export */
    window["KeyframeAnimation"] = KeyframeAnimation;