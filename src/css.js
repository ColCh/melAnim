/*--------------------------- УСТАНОВКА СТИЛЕЙ ---------------------------------*/
	var hooks = {},

	trimSides = /(?:^\s+)|(?:\s+$)/,

	setStyle = function (style, name, value) {
		var origName = name;

		if (dummy.style[name] === undefined || name.indexOf("-") !== -1) {
			name = normalized[name] || normalizeName(name);
		}
		if (name) {
			// в IE установка неверного значения породит ошибку.
			try { style[name] = value; } catch (e) { return false; }
		} else if (hooks[origName]) {
			// нормализированное имя не найдено. даем шанс хукам.
			return hooks[origName].interceptor(style, origName, value, hooks[origName].cache);
		}
	},

	normalized = {},

	dashReg = /-(.)/g,

	ccCallback = function () {
		return arguments[1].toUpperCase();
	},

	normalizeName = function (name) {
		var i, camelcased;

		if (!normalized[name]) {
			camelcased = name.replace(dashReg, ccCallback);
			if (dummy.style[camelcased] === undefined) {
				// похоже, мы имеем дело с CSS3 свойством. итерируем префиксы.
				camelcased = camelcased.charAt().toUpperCase() + camelcased.slice(1);
				for (i = 0; i in prefixes; i += 1) {
					if (prefixes[i] + camelcased in dummy.style) {
						normalized[name] = prefixes[i] + camelcased;
					}
				}
			} else {
				normalized[name] = camelcased;
			}
		}

		return normalized[name] || false;
	};

	setStyle.attachHook = function (propName, func) {
		hooks[propName] = { 
			"cache": {},
			"interceptor": func
		};
	};
	
	var transformReg = /(\w+)\(([-\d.]+)\w*(?:,\s?([-\d.]+)\w*)?\)/,
	
			multiply = function (A, B) {
				var C = [[], []];
				C[0][0] = A[0][0] * B[0][0] + A[0][1] * B[1][0];
				C[0][1] = A[0][0] * B[0][1] + A[0][1] * B[1][1];
				C[1][0] = A[1][0] * B[0][0] + A[1][1] * B[1][0];
				C[1][1] = A[1][0] * B[0][1] + A[1][1] * B[1][1];
				return C;
			},

			using_filters = false,

			cache,

			matrixReg = /M\d{2}=[-\d.]+/g;


	setStyle.attachHook("transform", function (style, name, value, hook_cache) {
			// спарсенный параментр транформации
			// skew(4deg, 5deg) ==> ["skew(4deg, 5deg)", "skew", "4", "5"]
			// rotate(6deg) ==> ["rotate(6deg)", "rotate", "6", undefined]
			var matched, i,
					// обычное состояние
					matrix = [ [1, 0], [0, 1]],
					// сдвиг по x/y
					dx = 0,
					dy = 0,
					// scale - вынесено в отдельное свойство.
					zoom = +style.zoom || 1,
					// коэффициент для перевода из градусов в радианы
					deg2rad = Math.PI / 180,
					// укорочение
					math = Math,
					// высчитанные значения. можно заменить на одно.
					sin, cos, tan, rad,

					origValue = value;

		if (!cache) {
			cache = hook_cache;
		}

		// формируем матрицу транформации
		name = "filter";
		for (i = 0, value = value.split(/\s(?!-?\d)/); i in value; i += 1) {
			matched = transformReg.exec(value[i]);
			switch (matched[1]) {
			case "rotate":
				rad = matched[2] * deg2rad;
				sin = math.sin(rad);
				cos = math.cos(rad);
				matrix = multiply(matrix, [
					[cos, -sin],
					[sin, cos]
				]);
				break;
			case "translateX":
				dx += +matched[2];
				break;
			case "translateY":
				dy += +matched[2];
				break;
			case "translate":
				dx += +matched[2];
				dy += +matched[3];
				break;
			case "skewX":
				matrix = multiply(matrix, [
					[1, math.tan(matched[2] * deg2rad)],
					[0, 1]
				]);
				break;
			case "skewY":
				matrix = multiply(matrix, [
					[1, 0],
					[math.tan(matched[2] * deg2rad)], 1]);
				break;
			case "skew":
				//X
				rad = matched[2] * deg2rad;
				tan = math.tan(rad);
				matrix = multiply(matrix, [
					[1, tan],
					[0, 1]
				]);

				//Y
				rad = matched[3] * deg2rad;
				tan = math.tan(rad);
				matrix = multiply(matrix, [
					[1, 0],
					[tan, 1]
				]);
				break;
			case "scaleX":
				matrix[0][0] *= +matched[2];
				break;
			case "scaleY":
				matrix[1][1] *= +matched[2];
				break;
			case "scale":
				matrix[0][0] *= +matched[2];
				matrix[1][1] *= +matched[3];
				break;
			}
		}

		var cacheKey = [];

		value = style[name] || "";
		if (value.indexOf("Matrix") === -1) {
			value += ' progid:DXImageTransform.Microsoft.Matrix(M11=1, M12=0, M21=0, M22=1, SizingMethod="auto expand")';
		}
		// заменяем M11=0 и другие на значения из вычисленной матрицы
		value = value.replace(matrixReg, function (a) {
			a = a.slice(0, 4) + matrix[ +a.charAt(1) - 1 ][ +a.charAt(2) - 1 ].toFixed(3);
			cacheKey.push(a);
			return a;
		});
		cache[cacheKey] = origValue;
		setStyle(style, name, value);
		setStyle(style, "zoom", zoom);
		setStyle(style, "margin-top", dy);
		setStyle(style, "margin-left", dx);
	});

	setStyle.attachHook("opacity", function (style, name, value, hook_cache) {
		var alpha = Math.ceil(parseFloat(value, 10) * 100);

		value = style.filter;
		if (value.indexOf("Alpha") === -1) {
			value +=  " progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";
		}
		value = value.replace(/Opacity=\d+/i, "Opacity=" + alpha);
		setStyle(style, "filter", value);
	});
