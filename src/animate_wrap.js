/*--------------------------- ГЛАВНАЯ ФУНКЦИЯ АНИМАЦИИ ---------------------------------*/
	var animate = function (target, properties, duration, easing, callback, mode) {

		// уникальный ID анимации
		var id = "mel_anim_" + animations_amount++;

		// объект с информацией о текущей анимации
		var instance = instances[id] = {};

		// selector mode |  classic mode  |  result
		//      0        |      0         |     0
		//      0        |      1         |     1
		//      1        |      0         |     2
		//      1        |      1         |     3
		if (typeof mode !== "number" || mode < 0 || mode > 3) {
			mode = 0;
			if (typeof target === "string") {
				// строку считаем селектором
				mode |= SELECTOR_MODE;
			}
			if (!animation_supported) {
				mode |= CLASSIC_MODE;
			}
		}

		// подготовка к анимированию - расстановка в порядок стилей, и подобное.
		if (mode & CLASSIC_MODE) { // классический режим.

			// приводим в порядок анимируемые свойства.
			properties = normalize_properties(properties);
			duration = parseFloat(duration, 10) * 1000;
			easing = easings[easing] || easings.linear; 

			if (mode & SELECTOR_MODE) { // анимация селектора
				target = [addRule(target).style];
			} else { // анимация элементов
				// запоминаем текущие инлайновые стили.
				instance.beginCssText = [];
				if ("nodeType" in target) {
					target = [target];
				}
			} 
		} else { // режим CSS3 анимации
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

		instance.target = target;
		instance.mode = mode;
		instance.properties = properties;
		instance.duration = duration;
		instance.easing = easing;
		instance.complete = callback;
		instance.id = id;

		// анимирование
		if (mode & CLASSIC_MODE) {
			animateClassic(instance);
		} else {
			animateAnimation(instance);
		}
		
		// возвращает ID для манипулирования анимацией после её запуска.
		return id;
	};

	var normalize_properties = function (properties) {
		var property, from, to, dimension;
		
		// нельзя изменять текущие анимируемые свойства.
		var normalized_properties = {};

		// словит число и размерность значения CSS свойства.
		var dimension_reg = /(\d*\.?\d+)(.*)/;

		// размерности по-умолчанию для исключений.
		var dimensions = { _default: "px", opacity: "", rotate: "deg" };

		for (property in properties) {
			if (property === "transform") {
				normalized_properties[property] = normalize_properties(properties[property]);
			} else {	
				normalized_properties[property] = {};

				if (/color/i.test(property)) {
					normalized_properties[property].from = color_to_rgb(properties[property].from);
					normalized_properties[property].to = color_to_rgb(properties[property].to);
				} else {

					from = properties[property].from;
					to = properties[property].to;

					from = dimension_reg.exec(from);
					to = dimension_reg.exec(to);

					dimension = (from[2] === to[2]) ? from[2] : (property in dimensions ? dimensions[property]:dimensions._default);

					from = parseFloat(from[1], 10);
					to = parseFloat(to[1], 10);

					normalized_properties[property].from = from;
					normalized_properties[property].to = to;
					normalized_properties[property].dimension = dimension;
				}
			}
		}
		return normalized_properties;
	};

	// конвертирует строку с цветом в rgb.
	var color_to_rgb = function (color) {
		// пока только hex
		color = parseInt( color.slice(1), 16);
		return [ color >> 16 & 0xFF, color >> 8 & 0xFF, color & 0xFF ];
	};
