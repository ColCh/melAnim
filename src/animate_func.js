    /**
     * "Одноразовая" функция, позволяющая анимировать без муторного создания объектов в один вызов
     * Формат записи свойств и вообще аргументов - как в jQuery (для удобства)
     * Типы свойств и параметров - как в AnimateWrap.
     * @param {!Element} element Элемент для анимирования
     * @param {!Object} properties Свойства для анимирования. Ключ - имя свойства, значение - конечная величина свойства.
     * @param {(number|string)=} duration Продолжительность в миллисекундах (число) или в формате CSS Timestring (строка)
     * @param {(string|!Array.<number>|!Easing|!CubicBezier|!Steps)=} easing Смягчение всей анимации (алиас, CSS Timefunction, аргументы к временной функции или сама функция)
     * @param {(function (this: AnimationWrap))=} complete Обработчик события завершения анимации
     * @return {!AnimationWrap}
     */
    function animate (element, properties, duration, easing, complete) {
        var self = new AnimationWrap();

        var progress;

        if (arguments.length === 3) {
            duration = properties['duration'];
            easing = properties['easing'];
            progress = properties['progress'];
            complete = properties['complete'];
            self.delay(properties['delay']);
            self.fillMode(properties['fillMode']);
            self.direction(properties['direction']);
            self.iterationCount(properties['iterationCount']);
        }

        self.duration(duration);
        self.easing(easing);
        if (goog.isFunction(progress)) {
            self.onStep(progress);
        }
        if (goog.isFunction(complete)) {
            self.onComplete(complete);
        }

        for (var propName in properties) {
            self.propAt(propName, properties[propName]);
        }

        self.start();

        return self;
    }