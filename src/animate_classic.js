    function easingSearchCallback (fractionalTime, firstKeyframe, index, keyframes) {
        var secondKeyframe = keyframes[ index + 1];
        // для навигации в бинарном поиске
        var MOVE_RIGHT = 1, MOVE_LEFT = -1, STOP = 0;

        if (!secondKeyframe) return MOVE_LEFT;
        if (firstKeyframe.key > fractionalTime) return MOVE_LEFT;
        if (secondKeyframe.key <= fractionalTime) return MOVE_RIGHT;

        return STOP;
    }

    /**
     * Конструктор ключевых кадров.
     * @constructor
     * @class
     * @param {number} key
     * @param {Object=} properties
     * @param {Function=} easing
     */
    function Keyframe (key, properties, easing) {
        if (typeOf.number(key)) {
            this.key = /** @type {number} */ (key);
        }
        if (typeOf.object(properties)) {
            this.properties = /** @type {Object} */ (properties);
        } else {
            this.properties = {};
        }
        if (typeOf.func(easing)) {
            this.easing = /** @type {Function} */(easing);
        }
    }

    /**
     * Прогресс, к которому относится ключевой кадр (в долях)
     * @type {number}
     */
    Keyframe.prototype.key = 0.00;

    /**
     * Смягчение ключевого кадра
     * @type {(Function|CubicBezier|Steps)}
     */
    Keyframe.prototype.easing = noop;

    /**
     * Значения свойств для этого ключевого кадра.
     * @type {Object}
     */
    Keyframe.prototype.properties = {};

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
        this.targets = [];
        this.startingValues = {};
        this.currentValues = {};
        this.cache = {};
        this.animationId = generateId();
        this.keyframes = [];
        this.specialEasing = {};
        this.iterations = 1;
        this.animatedProperties = {};
        // начальный и конечный ключевые кадры
        // их свойства наследуют вычисленные
        this.addKeyframe(0.0, createObject(this.animatedProperties));
        this.addKeyframe(1.0, createObject(this.animatedProperties));
        this.timer = new ReflowLooper(this.tick, this);
        return this;
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
     * @type {(Function|CubicBezier|Steps)}
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

    /**
     * Количество знаков после запятой для прогресса и свойств.
     * @type {number}
     * @private
     */
    ClassicAnimation.prototype.digits = DEFAULT_DIGITS_ROUND;

    /*
    *   Индивидуальные свойства
    * */

    /**
     * Объект с временными данными.
     * @type {Object}
     * @private
     */
    ClassicAnimation.prototype.cache = null;

    /**
     * Объект с текущими значениями свойств
     * @type {Object.<string, Object.<string, (number|Array)>>}
     * @private
     */
    ClassicAnimation.prototype.currentValues = null;

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
     * Коллекция элементов, учавствующих в анимации.
     * Заполняется сеттером "element"
     * @private
     * @type {Array.<Element>}
     */
    ClassicAnimation.prototype.targets = null;

    /**
     * Отсортированный по возрастанию свойства "key" массив ключевых кадров.
     * @private
     * @typedef Array.{{key: number, properties: Object.<string, number>, easing: Function}}
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
    ClassicAnimation.prototype.addElement = function (elem) {
        var id;
        if (typeOf.element(elem)) {
            id = generateId();
            elem.setAttribute(DATA_ATTR_NAME, id);
            this.cache[id] = {};
            this.startingValues[id] = {};
            this.currentValues[id] = {};
            this.targets.push(elem);
        } else if (ENABLE_DEBUG) {
            console.log('addElement: passed variable is non-HTMLElement "' + elem + '"');
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
            this.digits = floor(lg(this.animationTime * FRAMES_PER_SECOND)) - 2.0;
            if (ENABLE_DEBUG) {
                console.log('duration: computed epsilon is "' + this.digits + '" digits');
            }
        } else if (ENABLE_DEBUG) {
            console.warn('duration: bad value "'+ duration +'"');
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
     * @param {(number|string)=} position прогресс по проходу в процентах (по умол. не зваисит от прогресса)
     * @param {string=} property для какого свойства устанавливается (по умол. для всех)
     *
     * @see cubicBezierAliases
     * @see cubicBezierApproximations
     */
    ClassicAnimation.prototype.easing = function (timingFunction, position, property) {

        /**
         * Временной кадр, если указываем смягчение для него
         * @type {{key: number, properties: Object, easing: Function}}
         * */
        var keyframe;
        /**
         * Функция смягчения
         * @type {(Function|CubicBezier|Steps)}
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

        if (typeOf.func(timingFunction)) {
            easing = /** @type {Function} */ (timingFunction);
        } else if (typeOf.string(timingFunction)) {
            // alias или CSS timing-function

            trimmed = trim(/** @type {string} */ (timingFunction) );
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
                        easing = new CubicBezier(points[0], points[1], points[2], points[3]);
                    }
                } else if (points.length === 2) {
                    // 2 аргумента - лестничная функция
                    stepsAmount = parseInt(points[0], 10);
                    countFromStart = points[1] === "start";
                    if (typeOf.number(stepsAmount)) {
                        easing = new Steps(stepsAmount, countFromStart);
                    }
                }
            }

        }

        if (typeOf.func(easing) || instanceOf(easing, CubicBezier) || instanceOf(easing, Steps)) {
            if (typeOf.string(property)) {
                this.specialEasing[/** @type {string} */(property)] = easing;
            } else {
                if (typeOf.undefined(position)) {
                    this.smoothing = easing;
                } else {
                    key = normalizeKey(/** @type {(number|string)} */(position));
                    if (typeOf.number(key)) {
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

        if (this.delayTime > 0) {
            if (ENABLE_DEBUG) {
                console.log('start: ' + this.animationId + ' has positite delay "' + this.delayTime + '" ms');
            }
            setTimeout(bind(function () {
                var self = /** @type {ClassicAnimation} */(this);
                self.timer.start();
                self.onstart();
            }, this.timer), this.delayTime);
        } else {
            if (ENABLE_DEBUG) {
                console.log('start: ' + this.animationId + ' has non-positite delay "' + this.delayTime + '" so starting right now.');
            }
            this.timer.start();
        }

        // запоминаем текущие значения анимируемых свойств для каждого элемента
        each(this.targets, function (element) {

            var id = element.getAttribute(DATA_ATTR_NAME);
            var startingValues = this.startingValues[id];

            each(this.animatedProperties, function (special_value, propertyName) {
                var currentPropertyValue = css(element, propertyName);
                startingValues[propertyName] = normalize(element, propertyName, currentPropertyValue, false);
            }, this);

        }, this);

        this.started = now();
        this.tick(this.started);

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

        fillsForwards = this.fillingMode === FILLMODE_FORWARDS ||this.fillingMode === FILLMODE_BOTH;

        if (fillsForwards) {
            endFractionalTime = this.needsReverse(this.iterations) ? 1.0 : 0.0;
            if (ENABLE_DEBUG) {
                console.log('stop: animation fills forwards and has direction "' + this.animationDirection + '" and iteration count "' + this.iterations + '" so fetching with keyframe "' + endFractionalTime + '"');
            }
            this.fetch(endFractionalTime);
            this.render();
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
        // в долях
        key *= PERCENT_TO_FRACTION;

        if (!typeOf.number(key)) {
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
    ClassicAnimation.prototype.addKeyframe = function (position, properties, easing) {

        var keyframe;
        var keyframes;

        if (typeOf.number(position)) {
            keyframe = new Keyframe(position, properties, easing);
            keyframes = this.keyframes;
            keyframes.push(keyframe);
            bubbleSort(/** @type {Array} */(keyframes), compareKeyframes);
        }

        return keyframe;
    };

    /**
     * Попытается найти в коллекции ключевой кадр
     * с указанным прогрессом по проходу (в долях)
     * @param {number} position
     * @return {Object}
     * @private
     */
    ClassicAnimation.prototype.lookupKeyframe = function (position) {
        var keyframe, index;
        index = binarySearch(/** @type {Array} */(this.keyframes), position, function (key, keyframe) {
            return key - keyframe.key;
        });
        keyframe = this.keyframes[index];
        return keyframe;
    };

    /**
     * Высчитает значения свойств при указанном прогрессе про проходу
     * @param {number} fractionalTime прогресс по проходу ( [0, 1] )
     * @return {undefined}
     * @private
     */
    ClassicAnimation.prototype.fetch = function (fractionalTime) {

        var keyframes, firstKeyframe, secondKeyframe, from, to;
        var offset, scale;
        var timingFunction, index, easing;
        keyframes = this.keyframes;

        /*
         * Поиск функции смягчения для текущего ключевого кадра
         */
        timingFunction = this.smoothing;

        index = binarySearch(/**@type {Array}*/(keyframes), fractionalTime, easingSearchCallback);

        if (index !== -1 && keyframes[index].easing !== noop) {
            timingFunction = keyframes[index].easing;
        }

        /**
         *  информация о вычисленных значениях
         *  для каждого элемента
         *  */
        each(this.targets, function (element) {

            var id, startingValues, currentValues;

            id = element.getAttribute(DATA_ATTR_NAME);
            startingValues = this.startingValues[id];
            currentValues = this.currentValues[id];

            each(this.animatedProperties, function (_, propertyName) {

                var value, individualFractionalTime;

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

                    var key = /** @type {number} */ (keyframe.key);
                    if (propertyName in keyframe.properties) {
                        if (fractionalTime < key || (fractionalTime === 1.0 && key === 1.0)) {
                            secondKeyframe = keyframe;
                            return STOP_ITERATION;
                        }
                        firstKeyframe = keyframe;
                    }
                    return !STOP_ITERATION;
                });

                offset = firstKeyframe.key;
                scale = 1.0 / (secondKeyframe.key - firstKeyframe.key);
                individualFractionalTime = (fractionalTime - offset) * scale;

                if (instanceOf(timingFunction, CubicBezier)) {
                    easing = /** @type {CubicBezier} */(timingFunction).calc(individualFractionalTime);
                } else if (instanceOf(timingFunction, Steps)) {
                    easing = /** @type {Steps} */(timingFunction).calc(individualFractionalTime);
                } else {
                    easing = timingFunction(individualFractionalTime);
                }
                easing = round(easing, this.digits);

                if (firstKeyframe.properties[propertyName] === SPECIAL_VALUE) {
                    from = startingValues[propertyName];
                } else {
                    from = firstKeyframe.properties[propertyName];
                    from = normalize(element, propertyName, from, false);
                }

                if (secondKeyframe.properties[propertyName] === SPECIAL_VALUE) {
                    to = startingValues[propertyName];
                } else {
                    to = secondKeyframe.properties[propertyName];
                    to = normalize(element, propertyName, to, false);
                }

                value = blend(propertyName, /** @type {(Array|number)} */ (from), /** @type {(Array|number)} */(to), easing, this.digits);

                currentValues[propertyName] = value;

            }, this); // end properties loop

        }, this); // end targets loop
    };

    /**
     * Отрисует высчитанные значения свойств
     * @see ClassicAnimation.fetch
     * @private
     */
    ClassicAnimation.prototype.render = function () {
        each(this.targets, function (element) {

            var id, currentValues;
            var elementStyle = element.style;

            id = element.getAttribute(DATA_ATTR_NAME);
            currentValues = this.currentValues[id];

            each(currentValues, function (propertyValue, propertyName) {
                css(elementStyle, propertyName, propertyValue);
            }, this);

        }, this);
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

        if (currentIteration !== previousIteration) {
            // Условие завершения итерации
            if (ENABLE_DEBUG) {
                console.log('tick: "' + this.animationId + '" - iteration "' + currentIteration + '" of total "' + iterationCount + '"');
            }
            this.oniteration();
        } else if (animationProgress >= iterationCount) {
            // Условие завершения анимации
            this.stop();
            this.oncomplete();
            // метод stop сам отрисует конечный кадр, т.к. он зависит от параметра fill-mode
            return;
        } else {
            this.onstep();
        }

        this.fetch(this.fractionalTime);
        this.render();
    };

    /***
     * Вычислит и вернёт прогресс анимации относительно первой итерации
     * @param {number} timeStamp временная метка
     * @return {number} прогресс анимации относительно первой итерации
     * @private
     */
    ClassicAnimation.prototype.computeProgress = function (timeStamp) {

        var animationProgress;

        animationProgress = this.computeElapsedTime(timeStamp) / this.animationTime;
        animationProgress = round(animationProgress, this.digits);

        return animationProgress;
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
    ClassicAnimation.prototype["addElement"] = ClassicAnimation.prototype.addElement;
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