/*--------------------------- НОРМАЛИЗИРОВАНИЕ СВОЙСТВ ---------------------------------*/

	// словит число и размерность значения CSS свойства.
	var dimensionReg = /(-?\d*\.?\d+)(.*)/;

	// размерности по-умолчанию для исключений.
	var dimensions = { _default: "px", opacity: "", rotate: "deg" };


	// пройдётся по свойствам и приведёт их в скрипто-читабельный вид.
	var normalize_properties = function (instance, properties) {

		var classicMode = instance.classicMode, normalizedProperties = {};
		var prop, prefixedProp, propInfo, dest;
		
		if (!classicMode) {
			instance.buffer = {};
		}

		for (prop in properties) {

			propInfo = properties[prop];
			prefixedProp = getVendorPropName(prop, dummy_style, classicMode);

			if (classicMode) {
				dest = normalizedProperties[prop] = {};
				dest.prefixed = prefixedProp;
				dest.procents = [];
				dest.currProc = 0;
			}

			(normalize[prop] || normalize._default) (classicMode, prefixedProp, propInfo, instance, normalizedProperties, dest);
		}

		// для css анимации нужны только буфферы.
		if (classicMode) {
			instance.props = normalizedProperties;
		}
	};

	var procsreg = /^(\d{1,3})%?$/;

	// функции для нормализирования отдельных свойств.
	var normalize = hooks["normalize"] = {
		_default: function (classicMode, prop, source, instance, destination, dest) {
			var procent, value, dimension, buffer, i;
			if (source["100%"] || source["to"]) {
				if (classicMode && (!source["0%"] || !source["from"])) {
					dest.procents.push(0);
					i = instance.targets.length;
					while (i--) {
						if (!dest.special) {
							dest.special = {};
						}
						(dest.special[i] = {}).from = getCSS(instance.targets[i], prop);
					}
				}
				for (procent in source) {
					value = source[procent];
					procent = procent === "from" ? "0%":procent === "to" ? "100%":procent;
					if (procsreg.test(procent)) {
						if (classicMode) {
							procent = parseInt(procent, 10) / 100;
							value = value.match(dimensionReg);
							dest[procent] = parseFloat(value[1]);
							dest.dimension = dest.dimension || value[2];
							dest.procents.push(procent);
						} else {
							instance.buffer[procent] = (instance.buffer[procent] || "") + prop + ":" + value + ";"
						}
					}
				}
			}
		},

		transform: function (classicMode, prop, source, instance, destination, dest) {
			var transform;
			dest.transforms = {};
			for (transform in source) {
				dest.transforms[transform] = {};
				normalize._default(classicMode, prop, source[transform], instance, dest, dest.transforms[transform]);
			}
		}
	};

	// конвертирует строку с цветом в rgb.
	var colorToRGB = function (color) {
		// пока только hex
		color = parseInt( color.slice(1), 16);
		return [ color >> 16 & 0xFF, color >> 8 & 0xFF, color & 0xFF ];
	};
