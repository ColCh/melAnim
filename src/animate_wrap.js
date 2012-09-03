/*--------------------------- ГЛАВНАЯ ФУНКЦИЯ АНИМАЦИИ ---------------------------------*/
	/**
	 * @param {(Element|Array.<Element>)} elements Элемент(-ы) для анимирования.
	 * @param {(string|Object.<string,(string|{from: string, to: string})>)} properties Объект. Формат: строка "до"; объект, где ключ - имя свойства, а значение - либо строка "до", либо объект, где ключ "to" - "до" обязателен, и ключ "from" - "от" необязателен.
	 * @param {(string|number)} duration Продолжительность анимации. Либо строка, совместимая с аналогичным свойством из CSS анимации, либо число - миллисекунды, либо ключ из объекта "times".
	 * @param {string} easing Аналог timing-function из CSS анимаций.
	 * @param {function()} callback Функция, которая будет вызвана по окончании анимации.
	 * @param {boolean} force_classic_mode Флаг, устанавливающий принудительное использование классического режима в контексте текущей анимации.
	 *
	 * @return {string} ID запущенной анимации. Передаётся в статические методы stop, pause, continue.
	 * */
	function animate (elements, properties, duration, easing, callback, classicMode) {

		var id = "mel_anim_" + animationsAmount++;

		classicMode = classicMode === undefined ? !animation_supported:!!classicMode;

		if (durationReg.test(duration)) {
			if (classicMode) {
				duration = parseFloat(duration) * (duration.match(durationReg)[1] === "s" ? 1000:1);
			}
		} else {
			duration = times[duration] || times._default;
			if (!classicMode) {
				duration += "ms";
			}
		}

		// один элемент -> массив элементов
		if (elements.tagName) {
			elements = [ elements ];
		}

		// собираем экземпляр
		// объект с информацией о текущей анимации
		/** @const */ var instance = instances[id] = {		
			targets: elements,
			classicMode: classicMode,
			animationDuration: duration,
			timingFunction: easing,
			completeHandler: callback,
			animationId: id
		};

		// приводим в порядок анимируемые свойства и добавляем буффер
		normalize_properties(instance, properties);

		// анимируем
		(classicMode ? animateClassic:animateAnimation)(instance);
		
		// возвращает ID для манипулирования анимацией после её запуска.
		return id;
	};