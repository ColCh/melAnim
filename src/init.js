/*--------------------------- ИНИЦИАЛИЗАЦИЯ ---------------------------------*/
	if ("jQuery" in window) {
		matchesSelector = function (selector) {
			return window["jQuery"]["find"]["matchesSelector"](this, selector);
		}
	} else if ("all" in document) {
		matchesSelector = function (selector) {
			var res;
			var index = cssRules.length;

			stylesheet.addRule(selector, "a:b", index);
			res = this.currentStyle['a'] === "b";
			stylesheet.removeRule(index);

			return res;
		};
	}


	window['animate'] = function init() {

		/* проверка поддержки */
		var prefixes = {
			"O": "oTransitionEnd",
			"ms": "MSTransitionEnd",
			"Moz": "transitionend",
			"webkit": "webkitTransitionEnd"
		};

		var i, lowPrefix;

		// есть нативная реализация, без префиксов
		matchesSelector = dummy.matchesSelector || matchesSelector;
		requestAnimationFrame = window.requestAnimationFrame || requestAnimationFrame;

		for (i in prefixes) {
			lowPrefix = i.toLowerCase();

			matchesSelector = dummy[lowPrefix + "MatchesSelector"] || matchesSelector;
			requestAnimationFrame = window[lowPrefix + "RequestAnimationFrame"] || requestAnimationFrame;

			if (i + "Transition" in dummy.style) {
				prefix = i;
				document.body.addEventListener(prefixes[i], transitionEndHandler, false);
				supported = true;
			}
		}

		// префикс для CSS3 правил - тут уже определяем наугад.
		if (!prefix) {
			if ("globalStorage" in window) {
				prefix = "Moz";
			} else if ("opera" in window) {
				prefix = "O";
			} else if (/webkit/i.test(navigator.userAgent)) {
				prefix = "webkit";
			} else if ("\v" == "\v") {
				prefix = "ms";
			}
		}

		/* добавляем свой <style> */
		var style = document.createElement("style");
		document.body.appendChild(style);
		stylesheet = style.sheet || style.styleSheet;
		cssRules = stylesheet.cssRules || stylesheet.rules;


		/* вызов оригинальной функции анимирования */
		window['animate'] = animate;

		if (arguments.length) {
			return animate.apply(this, arguments);
		}
	};
