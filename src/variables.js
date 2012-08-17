/*--------------------------- ОБЬЯВЛЕНИЯ ---------------------------------*/
	var 

		// константы
		SELECTOR_MODE = 2,
		CLASSIC_MODE = 1,
		
		// вендорный префикс для текущего браузера
		prefix,
		lowPrefix,

		// поддерживаются ли анимации текущим браузером
		animation_supported,

		// имена событий конца анимации
		animationEndEventNames = ["animationend", "webkitAnimationEnd", "OAnimationEnd", "MSAnimationEnd"],
		// имя события конца анимации для текущего браузера
		animationEnd,

		// имя css-правила для кейфреймов анимации
		keyframes,

		// элемент, где можно проверить поддержку фич
		dummy = document.documentElement,
		dummy_style = dummy.style,

		// запущенные экземпляры анимаций.
		instances = {},

		// вернёт отметку времени.
		// тут будет геттер animationStartTime, если оно поддерживается
		getNow = function () {
			return +new Date;
		},
		
		// выполнит callback перед отрисовкой, и передаст в него отметку времени
		requestAnimationFrame = function (callback) {
			setTimeout(function () {
				callback( getNow() );
			}, 16);
		},

		// функции, изменяющие прогресс.
		// должны быть похожи на timing-function'ы из CSS Transition's
		easings = {
			"ease": function (progr) {
				return (-Math.cos(pos*Math.PI)/2) + 0.5;
			},
			"ease-out": function (progr) {
				return Math.sin(progr * Math.PI / 2);
			},
			"ease-in": function (progr) {
				return progr * progr;
			},
			"ease-in-out": function (progr) {
				return progr;
			},
			"linear": function (progr) {
				return progr;
			}
		},

		// вернёт имя свойства, добавит к нему префикс при возможности
		// для css-свойств может возвращать я двух типах - для dom css, и для правил css. 
		getVendorPropName = function (propName, obj, css) {
			if (css && propName in gVPN_cache) {
				return gVPN_cache[propName];
			}
			if (propName in obj || 
					(css && (propName.replace(/-(.)/g, function(a, letter){return letter.toUpperCase()}) in obj))) {

				return propName;
			} else {
				var origProp = propName;
				propName = propName.charAt(0).toUpperCase() + propName.slice(1);
				if (prefix + propName in obj) {
					if (css) {
						return (gVPN_cache[origProp] = "-" + prefix + "-" + origProp);
					} else {
						return prefix + propName;
					}
				} else if (lowPrefix + propName in obj) {
					return lowPrefix + propName;
				}
			}
			return null;
		},

		// то же самое, но вместо имени свойства вернёт его значение.
		// - для всяких requestAnimationFrame.
		getVendorPropVal = function (propName, obj, css) {
			propName = getVendorPropName(propName, obj, css);
			return propName ? obj[propName]:propName;
		},

		// кеш для getVendorPropName
		gVPN_cache = {},

		// вернёт функцию, которая при вызове будет читать указанное имя свойства из
		// указанного объекта
		// сделано для animationStartTime
		makeGetter = function (prop, obj) {
			return function () {
				return obj[prop];
			};
		},

		// своя таблица стилей.
		stylesheet,
		// её правила
		cssRules,

		// добавит правило в конец таблицы стилей и вернёт его
		addRule = function addRule(selector, text) {
				var index = cssRules.length;
				text = text || " ";

				if (stylesheet.insertRule) {
						stylesheet.insertRule(selector + " " + "{" + text + "}", index);
				} else {
						stylesheet.addRule(selector, text, index);
				}

				return cssRules[index];
		};
