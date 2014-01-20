    /**
     * "Одноразовая" функция, позволяющая анимировать без муторного создания объектов в один вызов
     * Формат записи свойств и вообще аргументов - как в jQuery (для удобства)
     * Типы свойств и параметров - как в AnimateWrap.
     * @param {!HTMLElement} element Элемент для анимирования
     * @param {!Object} properties Свойства для анимирования. Ключ - имя свойства, значение - конечная величина свойства.
     * @param {(number|string)=} duration Продолжительность в миллисекундах (число) или в формате CSS Timestring (строка)
     * @param {(string|!Array.<number>|!Easing|!CubicBezier|!Steps)=} easing Смягчение всей анимации (алиас, CSS Timefunction, аргументы к временной функции или сама функция)
     * @param {(function (this: AnimationWrap))=} complete Обработчик события завершения анимации
     * @return {!AnimationWrap}
     */
    function animate (element, properties, duration, easing, complete) {
        var self = new AnimationWrap();

        var progress;

        self.target(element);

        var options;

        if ( arguments.length === 3 && goog.isObject(duration) ) {
            options = duration;
            duration = options['duration'];
            easing = options['easing'];
            progress = options['progress'];
            complete = options['complete'];
            self.delay(options['delay']);
            self.fillMode(options['fillMode']);
            self.direction(options['direction']);
            self.iterationCount(options['iterationCount']);
        }

        self.duration(duration);
        self.easing(easing);

        if (goog.isFunction(progress)) {
            self.onStep(progress);
        }

        if (goog.isFunction(complete)) {
            self.onComplete(complete);
        }

        for (var propName in properties) if (properties.hasOwnProperty(propName)) {
            self.propAt(propName, properties[propName]);
        }

        self.start();

        return self;
    }