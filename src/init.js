/*--------------------------- ИНИЦИАЛИЗАЦИЯ ---------------------------------*/
	window['animate'] = function () {

		// имена событий конца анимации
		var animationEndEventNames = ["animationend", "webkitAnimationEnd", "OAnimationEnd", "MSAnimationEnd"], i;

		// определение фич
		animation = getVendorPropName("animation", dummy_style, true)
		if (animation) {
			animation_supported = true;
			// правило кейфреймов сохраним, чтобы каждый раз не выполнять это условие.
			keyframes = "@" + (keyframes !== "animation" ? "-"+lowPrefix+"-":"") + "keyframes";
			// без мытарства с определением верного имени события просто вешаем на все сразу.
			i = animationEndEventNames.length;
			while (i--) {
				document.body.addEventListener(animationEndEventNames[i], animationEndHandler, true);
			}
		}
		requestAnimationFrame = getVendorPropVal("requestAnimationFrame", window) || requestAnimationFrame;

		// добавление своей таблицы стилей.
		stylesheet = document.createElement("style");
		document.body.appendChild(stylesheet);
		stylesheet = stylesheet.sheet || stylesheet.styleSheet;
		cssRules = stylesheet.cssRules || stylesheet.rules;

		/* вызов оригинальной функции анимирования */
		window['animate'] = animate;
		if (arguments.length) {
			return animate.apply(this, arguments);
		}
		return true;
	};
