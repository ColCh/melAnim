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
        this.addKeyframe(keyAliases["from"], createObject(this.intrinsic));
        this.addKeyframe(keyAliases["to"], createObject(this.intrinsic));
    }

    merge(KeyframeAnimation.prototype, /** @lends {KeyframeAnimation.prototype} */{

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
         * Идентификацинный номер таймаута
         * @type {number}
         * @private
         */
        timeoutId: undefined,

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
        duration:function (duration) {
            this.animationTime = duration;
        },

        /**
         * Установка обработчика
         * завершения анимации
         * @param {Function} callback
         */
        onComplete:function (callback) {
            this.oncomplete = callback;
        },

        /**
         * Установка смягчения анимации при прогрессе (в долях)
         * возможно установить особое смягчение для свойства
         * При установке смягчения для свойства параметр прогресса игнорируется
         * @param {Function} easing функция смягчения
         * @param {number=} position прогресс в долях (по умол. 1)
         * @param {string=} property для какого свойства устанавливается (по умол. для всех)
         */
        easing:function (easing, position, property) {
            var keyframe;
            if (type.string(property)) {
                this.specialEasing[property] = easing;
            } else {
                if (type.undefined(position)) {
                    position = keyAliases["to"];
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
         * @param {key} position
         * @return {keyframe}
         * @private
         */
        lookupKeyframe:function (position) {
            var keyframe, index;
            position = normalizeKey(position);
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
        start: function (keepOn) {

            var prop;

            if (!keepOn) {
                this.started = now();
            }

            for (prop in this.intrinsic) {
                this.intrinsic[prop] = normalize(this.target, prop);
            }

            //this.tick(this.started);
            this.timeoutId = setInterval(bind(this.tick, this), 1e3 / FRAMES_PER_SECOND);
        },

        /**
         * Остановка или пауза анимации
         * @param {boolean=} gotoEnd Установить ли конечные значения
         */
        stop: function (gotoEnd) {

            cancelRequestAnimationFrame(this.timeoutId);

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
        propAt:function (name, value, position) {

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

            position = normalizeKey(position);

            if (type.undefined(position)) position = keyAliases["to"];
            if (!type.number(position)) return;

            keyframe = this.lookupKeyframe(position) || this.addKeyframe(position);

            this.intrinsic[name] = css(this.target, name);

            keyframe.properties[name] = value;
        },

        /**
         * Высчитает значения свойств
         * @param {number} elapsedTime прошеднее со старта время
         * @return {Object}
         * @private
         */
        fetch:function (elapsedTime) {

            var easing, timingFunction, i;
            var self = this;

            var keyframes;
            var firstKeyframe, secondKeyframe;

            var fetchedProperties;

            var progr = 1e2 * elapsedTime / self.animationTime;

            if (progr > 100) progr = 100;

            // TODO fetching для нескольких элементов?

            // поиск двух ключевых кадров для текущего прогресса
            // должно выполняться неравенство
            // для первого кадра :
            // КЛЮЧ_ПРЕДЫДУЩЕГО <= ТЕКУЩИЙ_ПРОГРЕСС < КЛЮЧ_СЛЕДУЮЩЕГО
            // для второго :
            // КЛЮЧ_ПРЕДЫДУЩЕГО < ТЕКУЩИЙ_ПРОГРЕСС <= КЛЮЧ_СЛЕДУЮЩЕГО
            keyframes = self.keyframes;

            /*
            firstKeyframeIndex = binarySearch(keyframes, progr, function (progr, _, index, keyframes) {
                var previous = keyframes[index];
                var next = keyframes[index + 1];
                var inLowerBound, inUpperBound, inBound;

                inLowerBound = previous.key <= progr;
                inUpperBound = next.key >= progr;

                inBound = inLowerBound && inUpperBound;

                if (inBound) return 0;
                if (previous.key > progr) return -1;
                if (next.key < progr) return 1;
            });
            */

            i = 0;
            while (i < keyframes.length) {

                // TODO доделать смягчение

                if ((keyframes[i].key < progr || (keyframes[i].key === progr && progr === 100)) && type.function(keyframes[i].easing)) {
                    timingFunction = keyframes[i].easing;
                    break;
                }
                i += 1;
            }

            fetchedProperties = {};

            var firstKeyframe, secondKeyframe;
            var from, to;
            var i;
            var element = self.target;
            var offset, scale;
            var property;

            for (property in this.intrinsic) {

                // TODO replace linear to binary search
                for (i = 0; i < keyframes.length; i++) {
                    if (property in keyframes[i].properties) {
                        if (progr < keyframes[i].key) {
                            secondKeyframe = keyframes[i];
                            break;
                        }
                        firstKeyframe = keyframes[i];
                    }
                }

                if (!firstKeyframe) firstKeyframe = keyframes[0];
                if (!secondKeyframe) secondKeyframe = keyframes[keyframes.length - 1];

                offset = firstKeyframe.key;
                scale = 1.0 / (secondKeyframe.key - firstKeyframe.key);
                easing = timingFunction((progr / 100 - offset) * scale);

                from = normalize(element, property, firstKeyframe.properties[property]);
                to = normalize(element, property, secondKeyframe.properties[property]);

                fetchedProperties[property] = blend(property, from, to, easing);
            }




            //each(this.intrinsic, function (_, name) {

                /*var from = firstKeyframe.properties[name];
                var to = secondKeyframe.properties[name];
                var element = self.target;
                var offset, scale;

                var helpFirstKeyframe, helpSecondKeyframe, i;
                var helpFrom,  helpTo;

                /* если в первом ключевом кадре нет этого свойства,
                 * ищем ближайший со значением, двигаясь к начальным значениям
                 */
                /*i = firstKeyframeIndex;
                helpFirstKeyframe = firstKeyframe
                while (type.undefined(helpFirstKeyframe.properties[name])) {
                    helpFirstKeyframe = keyframes[i];
                    i -= 1;
                }*/

                /*helpFrom = helpFirstKeyframe.properties[name];
                if (helpFirstKeyframe.key === keyAliases["from"] && (!type.number(helpFrom) && !type.string(helpFrom))) helpFrom = css(element, name);
                if (!type.number(helpFrom)) helpFrom = normalize(element, name, helpFrom);
                */
                /* если во втором ключевом кадре нет этого свойства,
                * ищем ближайший со значением, двигаясь к конечным значениям
                */
                /*
                i = firstKeyframeIndex;
                helpSecondKeyframe = secondKeyframe;
                while (type.undefined(helpSecondKeyframe.properties[name])) {
                    helpSecondKeyframe = keyframes[i];
                    i += 1;
                }
                */
                /*
                helpTo = helpSecondKeyframe.properties[name];
                if (helpSecondKeyframe.key === keyAliases["to"] && (!type.number(helpTo) && !type.string(helpTo))) helpTo = css(element, name);
                if (!type.number(helpTo)) helpTo = normalize(element, name, helpTo);
                */
                /*
                if (!type.number(from) && !type.string(from)) {
                    from = firstKeyframe.properties[name] = (helpTo - helpFrom) * (firstKeyframe.key / (helpFirstKeyframe.key + helpSecondKeyframe.key)) + helpFrom;
                }
                *//*
                if (!type.number(from)) {
                    from = secondKeyframe.properties[name] = normalize(self.target, name, from, false);
                }
                /*
                if (!type.number(to) && !type.string(to)) {
                    to = secondKeyframe.properties[name] = (helpTo - helpFrom) * (secondKeyframe.key / (helpFirstKeyframe.key + helpSecondKeyframe.key)) + helpFrom;
                }*//*
                if (!type.number(to)) {
                    to = secondKeyframe.properties[name] = normalize(self.target, name, to, false);
                }*/

                // TODO доделать нормальный fetching свойств
           /*
                var firstKeyframe, secondKeyframe;
                var from, to;
                var i;
                var element = self.target;
                var offset, scale;

                offset = firstKeyframe.key;
                scale = 1.0 / (secondKeyframe.key - firstKeyframe.key);
                easing = timingFunction((progr / 100 - offset) * scale);

                fetchedProperties[name] = blend(name, from, to, easing);
            }); */

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
            this.rule.style.cssText = buffer;
        },

        /**
         * Тик анимации
         * просчитывание, определение завершения анимации и отрисовка
         * @param {number=} timeStamp временная метка (или текущее время)
         * @private
         */
        tick: function (timeStamp) {
            var elapsedTime;
            var fetchedProperties;

            timeStamp = timeStamp || now();

            elapsedTime = timeStamp - this.started;

            if (elapsedTime < 0) elapsedTime = 0;

            fetchedProperties = this.fetch(elapsedTime);
            this.render(fetchedProperties);

            if (elapsedTime < this.animationTime) {
                //this.timeoutId = requestAnimationFrame(this.tick, this);
            } else {
                clearInterval(this.timeoutId);
                type.function(this.oncomplete) && this.oncomplete();
            }
        }
    });

    window.KeyframeAnimation = KeyframeAnimation;
