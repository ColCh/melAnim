/*--------------------------- НОРМАЛИЗИРОВАНИЕ СВОЙСТВ ---------------------------------*/

	// словит число и размерность значения CSS свойства.
	var dimension_reg = /(\d*\.?\d+)(.*)/;

	// размерности по-умолчанию для исключений.
	var dimensions = { _default: "px", opacity: "", rotate: "deg" };


	// пройдётся по свойствам и приведёт их в скрипто-читабельный вид.
	var normalize_properties = function (instance, properties) {

		var classic_mode = instance.animMode & CLASSIC_MODE, normalized_properties = {};
		var prop, prefixed_prop, prop_info;
		
		// для классического вида - шаблон, для анимации - cssText кейфреймов.
		instance.propsBuffer = classic_mode ? ";":({ from: "", to: ";" });

		if (!classic_mode && typeof properties === "string") {
			// PARSE 
		}

		for (prop in properties) {

			// информация о анимируемом свойстве. { to [, from] : css_value }, или css_"to"_value (строка)
			prop_info = properties[prop];
			// имя свойства, приведённое в порядок, для вставки в таблицу стилей
			prefixed_prop = getVendorPropName(prop, dummy_style, true);

			if (classic_mode) {
				// значение - css_"to"_value
				if (typeof prop_info === "string") {
					
				}
			}

			(normalize[prop] || normalize._default) (classic_mode, prefixed_prop, prop, prop_info, instance, normalized_properties, true);
		}

		// для css анимации нужны только буфферы.
		if (classic_mode) {
			instance.props = normalized_properties;
		}
	};

	// функции для нормализирования отдельных свойств. шаблон "стратегия"
	var normalize = {
		_default: function (classic_mode, prefixed_prop, orig_prop, source, instance, destination, write_buffer) {
			var from, to, dimension;

			from = source["from"];
			to = source["to"];

			if (from === undefined) {
				// COMPUTED
			}

			if (classic_mode) {

				if (write_buffer) {
					instance.propsBuffer += prefixed_prop + ":${" + orig_prop + "};";
				}

				destination = destination[orig_prop] = {};

				if (color.test(orig_prop)) {
					destination.from = color_to_rgb(from);
					destination.to = color_to_rgb(to);
				} else {
					from = dimension_reg.exec(from);
					to = dimension_reg.exec(to);

					dimension = (from[2] === to[2]) ? from[2] : (orig_prop in dimensions ? dimensions[orig_prop]:dimensions._default);

					from = parseFloat(from[1]);
					to = parseFloat(to[1]);

					destination.from = from;
					destination.to = to;
					destination.dimension = dimension;
				}
			} else if (write_buffer) {
				instance.propsBuffer.from += prefixed_prop + ":" + from + ";";
				instance.propsBuffer.to += prefixed_prop + ":" + to + ";";
			}
		},

		transform: function (classic_mode, prefixed_prop, orig_prop, source, instance, destination) {
			var transform, transformInfo;
	
			if (classic_mode) {
				instance.propsBuffer += prefixed_prop + ":${" + orig_prop + "};";
				destination = destination[orig_prop] = {};
			} else {
				instance.propsBuffer.from += prefixed_prop + ":";
				instance.propsBuffer.to += prefixed_prop + ":";
			}

			for (transform in source) {
				transformInfo = source[transform];
				if (classic_mode) {
					normalize._default(classic_mode, prefixed_prop, transform, transformInfo, instance, destination, false);
				} else {
					instance.propsBuffer.from += transform + "(" + transformInfo["from"] + ") ";
					instance.propsBuffer.to += transform + "(" + transformInfo["to"] + ") ";
				}
			}

			if (!classic_mode) {
				instance.propsBuffer.from += ";";
				instance.propsBuffer.to += ";";
			}
		}
	};

	// конвертирует строку с цветом в rgb.
	var color_to_rgb = function (color) {
		// пока только hex
		color = parseInt( color.slice(1), 16);
		return [ color >> 16 & 0xFF, color >> 8 & 0xFF, color & 0xFF ];
	};
