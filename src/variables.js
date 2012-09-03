/*--------------------------- ОБЬЯВЛЕНИЯ ---------------------------------*/
	var 

		// шорткаты
		document = window.document,
		undefined,

		// константы
		SELECTOR_MODE = 2,
		CLASSIC_MODE = 1,
		
		// вендорный префикс для текущего браузера
		prefix,
		lowPrefix,

		// поддерживаются ли анимации текущим браузером
		animation_supported,

		// имя css-свойства для анимации
		animation,
		// имя css-свойства для кейфреймов анимации
		keyframes,

		// элемент, где можно проверить поддержку фич
		dummy = document.documentElement,
		dummy_style = dummy.style,
		
		// объект со всеми хуками.
		hooks = animate["hooks"] = {},

		// запущенные экземпляры анимаций.
		instances = {},

		// количество анимаций с момента загрузки страницы
		// для генерации ID
		animationsAmount = 0,

		// вернёт отметку времени.
		getNow = Date.now || function () { return +new Date; },
		
		// выполнит callback перед отрисовкой, и передаст в него отметку времени
		// это полифил
		requestAnimationFrame = function (callback) {
			setTimeout(function () {
				callback( getNow() );
			}, 1000 / 60);
		},

		// функции, изменяющие прогресс.
		// должны быть похожи на timing-function'ы из CSS Transition's
		// TODO
		easings = {
			"ease": function (progr) {
				return ( - Math.cos(progr * Math.PI) / 2) + 0.5;
			},
			"ease-out": function (progr) {
				return Math.sin(progr * Math.PI / 2);
			},
			"ease-in": function (progr) {
				return Math.pow(time / duration, 2);
			},
			"ease-in-out": function (progr) {
				return progr;
			},
			"linear": function (progr) {
				return progr;
			}
		},

		// алиасы для времён
		times = {
			"slow": 600,
			"fast": 200,

			_default: 0
		},

		durationReg = /^\d+(m?s?)$/,

		color = /color/i,

		// вернёт имя свойства, добавит к нему префикс при необходимости.
		// для css-свойств может возвращать я двух типах - для dom css, и для правил css. 
		getVendorPropName = function (propName, obj, css) {
			var camelcased, cache, prfx, i;
			css |= 0; // to number
			cache = gVPN_cache[css];

			if (propName in obj) {
				return cache[propName] = propName;
			} else if (propName in cache) {
				return cache[propName];
			} else {

				camelcased = propName.replace(/-(.)/g, gVPN_replace_callback);

				if (css && camelcased in obj) {
					return cache[propName] = propName;
				}

				camelcased = camelcased.charAt(0).toUpperCase() + camelcased.slice(1);

				prfx = prefix ? [prefix]:["webkit", "Moz", "O", "ms"];
				i = prfx.length;
				while(i--) {
					if (prfx[i] + camelcased in obj) {
						prefix = prfx[i];
						lowPrefix = prefix.toLowerCase();
						return cache[propName] = css ? "-" + prefix + "-" + propName:prefix + camelcased;
					} else if (lowPrefix + camelcased in obj) {
						prefix = prfx[i];
						lowPrefix = prefix.toLowerCase();
						return cache[propName] = lowPrefix + camelcased;
					}
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
		gVPN_cache = [ {}, {} ],

		// закешировання функция для перевода имён правил из css в dom
		gVPN_replace_callback = function (a, letter) {
			return letter.toUpperCase();
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
