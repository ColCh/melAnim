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

