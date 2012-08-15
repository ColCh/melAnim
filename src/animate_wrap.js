/*--------------------------- ГЛАВНАЯ ФУНКЦИЯ АНИМАЦИИ ---------------------------------*/
	var animate = function (target, properties, duration, easing, callback, classicMode) {

		// уникальный ID анимации
		var id = Math.random();

		// объект с информацией о текущей анимации
		var instance = instances[id] = {};

		// определение цели анимирования (селектор\элемент)
		var selectorMode;

		if (typeof target === "string") {
			// строку считаем селектором
			selectorMode = true;
		} else if ("nodeType" in target) {
			// передан элемент
			selectorMode = false;
			target = [target];
		} else if ("0" in target) {
			// что-то, похожее на массив.
			selectorMode = false;
		}

		// определение режима анимации (классический\переходы)
		// оставляем возможность ручной смены режима
		if (classicMode === undefined) {
			if (transition_supported) {
				classicMode = true;
			} else {
				classicMode = false;
			}
		}

		// подготовка к анимированию - расстановка в порядок стилей, и подобное.
		if (classicMode) {

			// приводим в порядок анимируемые свойства.
			properties = normalize_properties(properties);
			duration = parseFloat(duration, 10) * 1000;
			easing = easings[easing] || easings.linear; 

			if (selectorMode) {
				var rule = addRule(target);
				// в цели должен быть массив
				target = [rule.style];
			} else {
				// запоминаем текущие инлайновые стили.
				instance.beginCssText = [];
				for (var i = 0; i in target; i += 1 ) {
					instance.beginCssText[i] = target[i].style.cssText;
				}
			} 
		} else {
			if (!instances_by_duration[duration]) {
				instances_by_duration[duration] = [];
			}
			instances_by_duration[duration].push(id);

			if (selectorMode) {
				instance.selector = target;
				var rules = {};
				rules.from = addRule(target);
				rules.to = addRule(target);
				target = rules;
			} else {
				instance.beginCssText = [];
				for (var i = 0; i in target; i += 1) {
					instance.beginCssText[i] = target[i].style.cssText;
					target[i].addEventListener(transitionEnd, transitionEnd_element, false);
				}
			}
		}

		instance.target = target;
		instance.selectorMode = selectorMode;
		instance.properties = properties;
		instance.duration = duration;
		instance.easing = easing;
		instance.complete = callback;
		instance.id = id;

		// анимирование
		if (classicMode) {
			animateClassic(instance);
		} else {
			animateTransition(instance);
		}
		
		// возвращает ID для манипулирования анимацией после её запуска.
		return id;
	};

	var normalize_properties = function (properties) {
		var property, from, to, delta, dimension;
		
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

					delta = to - from;

					normalized_properties[property].from = from;
					normalized_properties[property].delta = delta;
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
