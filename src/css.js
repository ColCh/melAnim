/*--------------------------- УСТАНОВКА СТИЛЕЙ ---------------------------------*/
	var hooks = {},

	trimSides = /(?:^\s+)|(?:\s+$)/,

	setStyle = animate["css"] = function (style, name, value) {
		var origName = name,
				action = value === undefined ? "get" : "set",
				index,
				csstext;

		if (dummy.style[name] === undefined) {
			name = normalized[name] || normalizeName(name);
		}
		if (name) {
			// если имя св-а нормализировано
			if (action === "set") {
				// в IE установка неверного значения породит ошибку.
				try { style[name] = value; } catch (e) { return false; }
				return true;
			} else {
				if (style[name] !== undefined) {
					return style[name];
				} else {
					if (dummy.style.getPropertyValue) {
						return style.getPropertyValue(origName);
					} else {
						// отрезаем всё, что находится между
						// именем свойства + двоеточием
						// и точкой с запятой.
						csstext = style.cssText + ";";
						// IE переводит cssText в upper case.
						index = csstext.search(new RegExp(origName, "i"));
						if (index !== -1) {
							csstext = csstext.slice(csstext.indexOf(":", index + origName.length) + 1, csstext.indexOf(";", index));
							// и убираем пробелы по краям.
							return csstext.replace(trimSides, "");
						} else {
							return false;
						}
					}
				}

			}
		} else if (hooks[origName] && hooks[origName][action]) {
			// нормализированное имя не найдено. даем шанс хукам.
			return hooks[origName][action](style, origName, value, hooks[origName]["cache"]);
		} else {
			return false;
		}
	},

	normalized = {},

	prefixes = ["webkit", "Moz", "O", "ms"],

	dashReg = /-([a-z])/ig,

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

	setStyle["attachHook"] = function (propName, action, func) {
		var hook = hooks[propName] || { "cache": {} };

		if (action in hook || typeof func !== "function") {
			return false;
		} else {
			// не изменяет. добавляет.
			hook[action] = func;
			hooks[propName] = hook;
			return true;
		}
	};

