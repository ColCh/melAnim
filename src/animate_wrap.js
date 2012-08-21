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
		
		if (mode & CLASSIC_MODE) { // классический режим.

			// приводим в порядок анимируемые свойства.
			properties = normalize_properties(properties, target);
			instance.buffer = ";" + properties.buffer;
			properties = properties.normalized;
			
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

		// собираем экземпляр
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


	// словит число и размерность значения CSS свойства.
	var dimension_reg = /(\d*\.?\d+)(.*)/;
	// размерности по-умолчанию для исключений.
	var dimensions = { _default: "px", opacity: "", rotate: "deg" };

	var normalize_properties = function (properties, target, extra) {
		var property, from, to, dimension, buffer = "", propInfo, normalized, computed;
		
		// нельзя изменять текущие анимируемые свойства.
		var normalized_properties = {};

		for (property in properties) {

			if (!extra || extra !== "transform") {
				buffer += getVendorPropName(property, dummy_style, true) + ":${" + property + "};";
			}
			normalized = {};
			propInfo = properties[property];

			if (typeof propInfo ===  "object" && !propInfo.from && !propInfo.to) {
				propInfo = normalize_properties(propInfo, target, (extra ? extra + "-":"") + property);
				normalized = propInfo.normalized;
				buffer += propInfo.buffer;
			} else {	
				if (/color/i.test(property)) {
					normalized.from = color_to_rgb(properties[property].from);
					normalized.to = color_to_rgb(properties[property].to);
				} else {

					from = propInfo.from;
					to = propInfo.to;

					if (!from) {
						if (!computed) {
							computed = window.getComputedStyle ? window.getComputedStyle(target[0], ""):target[0].currentStyle;
						}
						from = getVendorPropVal(property, computed, false);
						if (!dimension_reg.test(from)) {
							from = "0";
						}
					}

					from = dimension_reg.exec(from);
					to = dimension_reg.exec(to);

					dimension = (from[2] === to[2]) ? from[2] : (property in dimensions ? dimensions[property]:dimensions._default);

					from = parseFloat(from[1], 10);
					to = parseFloat(to[1], 10);

					normalized.from = from;
					normalized.to = to;
					normalized.dimension = dimension;
				}
			}

			normalized_properties[property] = normalized;
		}

		return { normalized: normalized_properties, buffer: buffer  };
	};

	// конвертирует строку с цветом в rgb.
	var color_to_rgb = function (color) {
		// пока только hex
		color = parseInt( color.slice(1), 16);
		return [ color >> 16 & 0xFF, color >> 8 & 0xFF, color & 0xFF ];
	};
