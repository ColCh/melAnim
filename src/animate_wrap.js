/*--------------------------- ГЛАВНАЯ ФУНКЦИЯ АНИМАЦИИ ---------------------------------*/
	var animate = function (target, properties, duration, easing, callback, force_classic_mode) {

		// уникальный ID анимации
		var id = "mel_anim_" + animations_amount++;

		// объект с информацией о текущей анимации
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
				duration = duration.match(duration_reg);
				duration = parseFloat(duration[1], 10) * (duration[2] === "s" ? 1000:1);
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
			if (mode & SELECTOR_MODE) {
				target = [addRule(target).style];
			} else {
				// текущие инлайновые стили элементов запомнятся при первом кадре
				instance.beginCssText = [];
				if ("nodeType" in target) {
					target = [target];
				}
			} 
		} else {
			instance.keyframes = addRule(keyframes + " " + id);
			if (mode & SELECTOR_MODE) {
				instance.selector = target;
				target = [ addRule(target) ];
			} else {
				if ("nodeType" in target) {
					target = [target];
				}
			}
		}

		// собираем экземпляр
		instance.target = target;
		instance.mode = mode;
		instance.duration = duration;
		instance.easing = easing;
		instance.complete = callback;
		instance.id = id;

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
