/*--------------------------- ИНИЦИАЛИЗАЦИЯ ---------------------------------*/
	window['animate'] = function () {

		// определение префикса для текущего браузера.
		var prefixReg = /^(Moz|webkit|O|ms)(?=[A-Z])/, property, i;

		for (property in dummy_style) {
			if (prefixReg.test(property)) {
				prefix = property.match(prefixReg)[1];
				lowPrefix = prefix.toLowerCase();
				break;
			}
		}

		// определение фич
		if (getVendorPropName("animation", dummy_style, true)) {
			animation_supported = true;
			keyframes = "@" + ("animation" in gVPN_cache ? "-"+lowPrefix+"-":"") + "keyframes";
			for (i = animationEndEventNames.length; i--; ) {
				document.body.addEventListener(animationEndEventNames[i], animationEndHandler, true);
			}
		}
		var animStartTime = getVendorPropName("animationStartTime", window);
		requestAnimationFrame = getVendorPropVal("requestAnimationFrame", window) || requestAnimationFrame;

		if (animStartTime) {
			getNow = makeGetter(animStartTime, window);
		}
		
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
