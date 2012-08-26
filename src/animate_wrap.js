/*--------------------------- ГЛАВНАЯ ФУНКЦИЯ АНИМАЦИИ ---------------------------------*/
	/**
	 * @param {(string|Element|Array.<Element>)} target Цель анимирования. Селектор или элемент(-ы).
	 * @param {(string|Object.<string,(string|{from: string, to: string})>)} properties Объект. Формат: строка "до"; объект, где ключ - имя свойства, а значение - либо строка "до", либо объект, где ключ "to" - "до" обязателен, и ключ "from" - "от" необязателен.
	 * @param {(string|number)} duration Продолжительность анимации. Либо строка, совместимая с аналогичным свойством из CSS анимации, либо число - миллисекунды, либо ключ из объекта "times".
	 * @param {string} easing Аналог timing-function из CSS анимаций.
	 * @param {function()} callback Функция, которая будет вызвана по окончании анимации.
	 * @param {boolean} force_classic_mode Флаг, устанавливающий принудительное использование классического режима в контексте текущей анимации.
	 *
	 * @return {string} ID запущенной анимации. Передаётся в статические методы stop, pause, continue.
	 * */
	var animate = function (target, properties, duration, easing, callback, force_classic_mode) {

		// уникальный ID анимации
		var id = "mel_anim_" + animationsAmount++;

		// объект с информацией о текущей анимации
		/** @const */
		var instance = instances[id] = {};

		// selector mode |  classic mode  |  result
		//      0        |      0         |     0
		//      0        |      1         |     1
		//      1        |      0         |     2
		//      1        |      1         |     3
		var mode = 0;
		if (typeof target === "string") {
			// строку считаем селектором
			mode |= SELECTOR_MODE;
		}
		if (!animation_supported || force_classic_mode) {
			mode |= CLASSIC_MODE;
		}

		// подготовка к анимированию - расстановка в порядок стилей, и подобное.

		// приводим в порядок длительность анимации.
		if (duration_reg.test(duration)) {
			if (mode & CLASSIC_MODE) {
				var parsedDuration = duration.match(duration_reg);
				duration = parseFloat(parsedDuration[1]) * (parsedDuration[2] === "s" ? 1000:1);
			}
		} else {
			duration = times[duration] || times._default;
			if (mode ^ CLASSIC_MODE) {
				duration += "ms";
			}
		}

		// добавляем правила в таблицу стилей, или запоминем текущие стили, в зависимости от режима.

		if (mode & CLASSIC_MODE) {
			easing = easings[easing] || easings.linear; 
		} else {
			/** @type {CSSKeyframesRule} */
			instance.keyframes = addRule(keyframes + " " + id, " ");
		}

		if (mode & SELECTOR_MODE) {
			target = [ addRule(target, " ") ];
		} else {
			if (target.tagName) {
				target = [ target ];
			}
		}

		// собираем экземпляр
		instance.targets = target;
		instance.animMode = mode;
		instance.animationDuration = duration;
		instance.timingFunction = easing;
		instance.completeHandler = callback;
		instance.animationId = id;

		// приводим в порядок анимируемые свойства и добавляем буффер
		normalize_properties(instance, properties);

		// анимируем
		if (mode & CLASSIC_MODE) {
			animateClassic(instance);
		} else {
			animateAnimation(instance);
		}
		
		// возвращает ID для манипулирования анимацией после её запуска.
		return id;
	};
