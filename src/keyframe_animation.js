    //TODO удалить, т.к. директивы определены в animate_wrap.js
    var DEFAULT_DURATION = "400ms";
    var DEFAULT_EASING = "ease";
    var DEFAULT_FILLMODE = "forwards";
    var DEFAULT_DELAY = 0;
    var DEFAULT_DIRECTION = "normal";
    var DEFAULT_ITERATIONCOUNT = 1;
    var DEFAULT_HANDLER = noop;
    var DEFAULT_PLAYINGSTATE = "paused";

    // TODO animation-delay
    // TODO animation-fill-mode
    // TODO REFACTORING

    /**
     * Конструктор анимаций с ключевыми кадрами
     * отличается от обычной тем, что
     * есть возможность установить значение
     * для свойства, или определённое смягчение
     * при указанном прогрессе анимации
     * @constructor
     */
    function KeyframeAnimation () {
        this.name = generateId();
        /** @type KeyframeAnimation.prototype.keyframes */
        this.keyframes = [];
        this.specialEasing = {};
        this.iterations = 1;
        this.rule = addRule("." + this.name, "");
        this.intrinsic = {};
        // начальный и конечный ключевые кадры
        // их свойства наследуют вычисленные
        this.addKeyframe(0, createObject(this.intrinsic));
        this.addKeyframe(1, createObject(this.intrinsic));
        this.timer = new ReflowLooper(this.tick, this);
    }

    merge(KeyframeAnimation.prototype, /** @lends {KeyframeAnimation.prototype} */{

        /**
         * Имя анимации
         * @type {string}
         * @private
         */
        name: undefined,

        /**
         * Анимируемый элемент
         * @private
         * @type {Element}
         */
        target: undefined,

        /**
         * CSS-правило, в котором анимация будет отрисовываться
         * @type {CSSRule}
         */
        rule: undefined,

        /**
         * Отсортированный массив ключевых кадров
         * @private
         * @typedef Array.{{key: number, properties: Object.<string, number>, easing: Function}}
         */
        keyframes: undefined,

        /**
         * Значения вычисленного стиля.
         * Родитель значений свойств
         * для первого (0%) и последнего (100%) ключевых кадров
         * @type {Object}
         * @private
         */
        intrinsic: undefined,

        /**
         * Число проходов (по умол. 1)
         * @type {number}
         * @private
         */
        iterations: undefined,

        /**
         * Направление анимации
         * @type {string}
         * @private
         */
        animationDirection: DIRECTION_NORMAL,

        /**
         * Объект с особыми смягчениями для свойств
         * Ключ - имя свойства, Значение - функция смягчения
         * @type {Object.<string, Function>}
         */
        specialEasing: undefined,

        /**
         * Продолжительность анимации
         * @private
         * @type {number}
         */
        animationTime: undefined,

        /**
         * Обработчик завершения анимации
         * @private
         * @type {Function}
         */
        oncomplete: undefined,

        /**
         * Обработчик завершения прохода
         * @type {Function}
         * @private
         */
        oniteration: undefined,

        /**
         * Временная метка старта
         * @type {number}
         * @private
         */
        started: undefined,

        /**
         * Смягчение анимации
         * @type {Function}
         * @private
         */
        smoothing: undefined,

        /**
         * Таймер отрисовки
         * @type {ReflowLooper}
         * @private
         */
        timer: undefined,

        /**
         * Установит анимируемый элемент
         * @param {Element} elem Элемент
         */
        element: function (elem) {
            addClass(elem, this.name);
            this.target = elem;
        },

        /**
         * Установка продолжительности анимации
         * @param {number} duration
         */
        "duration": function (duration) {
            this.animationTime = duration;
        },

        /**
         * Установка обработчика
         * завершения анимации
         * @param {Function} callback
         */
        "onComplete": function (callback) {
            this.oncomplete = callback;
        },

        /**
         * Установка смягчения анимации при прогрессе (в долях)
         * возможно установить особое смягчение для свойства
         * При установке смягчения для свойства параметр прогресса игнорируется
         * @param {Function} easing функция смягчения
         * @param {number=} position прогресс в долях (по умол. для всей анимации)
         * @param {string=} property для какого свойства устанавливается (по умол. для всех)
         */
        "easing":function (easing, position, property) {
            var keyframe;
            if (type.string(property)) {
                this.specialEasing[property] = easing;
            } else {
                if (type.undefined(position)) {
                    this.smoothing = easing;
                } else {
                    position = normalizeKey(position);
                }
                if (type.number(position)) {
                    keyframe = this.lookupKeyframe(position) || this.addKeyframe(position);
                    keyframe.easing = easing;
                }
            }
        },

        /**
         * Установка направления анимации
         * Допустимые значения см. в документации к CSS3 анимациям
         * @param {string} animationDirection
         */
        "direction": function (animationDirection) {
            this.animationDirection = animationDirection;
        },

        /**
         * Добавит ключевой кадр на указанном прогрессе
         * и вернёт его
         * @param {key} position
         * @param {Object=} properties
         * @param {Function=} easing
         * @private
         */
        addKeyframe:function (position, properties, easing) {

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
        },

        /**
         * Попытается найти в коллекции
         * ключевой кадр с указанным прогрессом
         * @param {number} position
         * @return {Object}
         * @private
         */
        lookupKeyframe:function (position) {
            var keyframe, index;
            index = binarySearch(this.keyframes, position, function (key, keyframe) {
                return key - keyframe.key;
            });
            keyframe = this.keyframes[index];
            return keyframe;
        },

        /**
         * Старт анимации или её продолжение после паузы
         * @param {boolean=} keepOn Продолжить ли предыдущие значения (установка в FALSY запускает заново)
         */
        "start": function (keepOn) {

            var prop;

            this.timer.start();

            if (!keepOn) {
                this.started = now();
            }

            for (prop in this.intrinsic) {
                this.intrinsic[prop] = normalize(this.target, prop);
            }

            this.tick(this.started);
        },

        /**
         * Остановка или пауза анимации
         * @param {boolean=} gotoEnd Установить ли конечные значения
         */
        "stop": function (gotoEnd) {

            this.timer.stop();

            if (gotoEnd) {
                this.tick(this.animationTime);
            }

        },

        /**
         * Установка значения свойства при указанном прогрессе
         * Для установки смягчения см. метод easing
         * @param {string} name имя свойства
         * @param {string|number} value значение свойства
         * @param {(string|number)=} position позиция, в долях. (по умол. 1)
         * @see KeyframeAnimation.easing
         */
        "propAt": function (name, value, position) {

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

            this.intrinsic[name] = css(this.target, name);

            keyframe.properties[name] = value;
        },

        /**
         * Высчитает значения свойств, вызовет обработчиков итерации\завершения
         * и завершит анимацию, если нужно. (семантическая ошибка, надо пофиксить)
         * @param {number} elapsedTime прошеднее со старта время
         * @return {Object}
         * @private
         */
        fetch:function (elapsedTime) {

            var i;
            var self = this;
            var keyframes, fetchedProperties, firstKeyframe, secondKeyframe, from, to, property;
            var element;
            var progr, offset, scale;
            var iterations, integralIterations, currentIteration, needsReverse, iterationIsOdd;
            var easing, timingFunction;

            //прогресс анимации без учёта итераций
            progr = elapsedTime / self.animationTime;

            currentIteration = Math.floor(progr);

            // аналогично операции NUM % 2
            // т.е. является ли число нечётным
            iterationIsOdd = currentIteration & 1;

            iterations = this.iterations;

            // исключение составляет специальное значение
            if (iterations == ITERATIONCOUNT_INFINITE) {
                iterations = Number.POSITIVE_INFINITY;
            } else {

                iterations = parseFloat(iterations);

                if (!isFinite(iterations) || iterations < 0) {
                    // установлено неприменимое значение для кол-ва итераций
                    // откатываемся к значению по умолчанию
                    iterations = DEFAULT_ITERATIONCOUNT;
                }
            }

            integralIterations = Math.floor(iterations);

            // превращаем прогресс относительно первого прохода
            // в прогресс относительно текущего прохода
            progr -= Math.min(currentIteration, integralIterations);

            if (progr > 1) progr = 1;

            if (progr === 1) {
                // конец итерации, но не анимации
                if (iterations - currentIteration > 0) {
                    type.func(this.oniteration) && this.oniteration();
                } else {
                    // завершение анимации
                    this.stop(false);
                    type.func(this.oncomplete) && this.oncomplete();
                }
            }

            needsReverse = this.animationDirection === DIRECTION_REVERSE;
            needsReverse |= this.animationDirection === DIRECTION_ALTERNATE && iterationIsOdd;
            needsReverse |= this.animationDirection === DIRECTION_ALTERNATE_REVERSE && !iterationIsOdd;

            if (needsReverse) {
                progr = 1 - progr;
            }

            keyframes = self.keyframes;

            timingFunction = self.smoothing || cubicBezierApproximations[ DEFAULT_EASING ];

            // поиск функции смягчения для текущего ключевого кадра
            i = 0;
            while (i < keyframes.length - 1) {
                // КЛЮЧ_ПРЕДЫДУЩЕГО <= ПРОГРЕСС < КЛЮЧ_СЛЕДУЮЩЕГО
                //TODO первое условие вместе с циклом можно заменить бинарным поиском
                if (keyframes[i].key <= progr && keyframes[i + 1].key > progr) {
                    if (keyframes[i].easing) {
                        timingFunction = keyframes[i].easing;
                        break;
                    }
                }
                i += 1;
            }

            // высчитанные значения свойств
            fetchedProperties = {};

            // в intrinsic находятся начальные значения
            // всех анимируемых свойств
            // высчитываем значение каждого свойства
            for (property in this.intrinsic) {

                // поиск двух ближайших ключевых кадров
                // для которых задано значение свойства
                firstKeyframe = keyframes[0];
                secondKeyframe = keyframes[keyframes.length - 1];

                //TODO было бы неплохо тоже заменить линейный поиск на бинарный
                for (i = 1; i < keyframes.length - 1; i++) {
                    if (property in keyframes[i].properties) {
                        if (progr <= keyframes[i].key) {
                            secondKeyframe = keyframes[i];
                            break;
                        }
                        firstKeyframe = keyframes[i];
                    }
                }

                // смещение первого ключевого кадра
                // относительно начала анимации
                offset = firstKeyframe.key;
                // масштаб для сплющивания прогресса
                scale = 1.0 / (secondKeyframe.key - firstKeyframe.key);
                // приводим прогресс к долям и считаем смягчение
                // относительно двух ключевых кадров
                easing = timingFunction( (progr - offset) * scale );

                element = self.target;

                from = normalize(element, property, firstKeyframe.properties[property]);
                to = normalize(element, property, secondKeyframe.properties[property]);

                fetchedProperties[property] = blend(property, from, to, easing);
            }

            return fetchedProperties;
        },

        /**
         * Отрисует высчитанные значения свойств
         * @param {Object} fetchedProperties
         * @private
         */
        render: function (fetchedProperties) {
            var buffer = '', property, name;
            for (property in fetchedProperties) {
                name = getVendorPropName.cache[property] || getVendorPropName(property);
                buffer += name + ":" + normalize(null, property, fetchedProperties[property], true) + ';';
            }
            //TODO Rules vs style проверка производительности
            this.rule.style.cssText = buffer;
        },

        /**
         * Тик анимации
         * просчитывание и отрисовка
         * @param {number=} timeStamp временная метка (или текущее время)
         * @private
         */
        tick: function (timeStamp) {

            var elapsedTime;
            var fetchedProperties;

            elapsedTime = timeStamp - this.started;

            if (elapsedTime < 0) elapsedTime = 0;

            fetchedProperties = this.fetch(elapsedTime);
            this.render(fetchedProperties);
        }
    });

    window["KeyframeAnimation"] = KeyframeAnimation;
