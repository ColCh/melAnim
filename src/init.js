/*--------------------------- ИНИЦИАЛИЗАЦИЯ ---------------------------------*/
	window['animate'] = function () {

		// определение префикса для текущего браузера.
		var prefixReg = /^(Moz|webkit|O|ms)(?=[A-Z])/, property;

		for (property in dummy_style) {
			if (prefixReg.test(property)) {
				prefix = property.match(prefixReg)[1];
				lowPrefix = prefix.toLowerCase();
				break;
			}
		}

		// определение фич
		var transitionEndEventNames = { "": "transitionend", "webkit": "webkitTransitionEnd", "O": "oTransitionEnd", "ms": "MSTransitionEnd" };
		if (getVendorPropName("transition", dummy_style, true)) {
			transition_supported = true;
			transitionEnd = transitionEndEventNames[prefix] || transitionEndEventNames[""];
			document.body.addEventListener(transitionEnd, transitionEnd_delegator, false);
		}
		var animStartTime = getVendorPropName("animationStartTime", window);
		requestAnimationFrame = getVendorPropVal("requestAnimationFrame", window) || requestAnimationFrame;
		matchesSelector = getVendorPropVal("matchesSelector", dummy) || matchesSelector;

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
	};
