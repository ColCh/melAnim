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

		/* события. префиксы определены в главном замыкании */
		var eventNames = ["webkitTransitionEnd", "transitionend", "oTransitionEnd", "MSTransitionEnd" ];

		var i, 
			lowPrefix, 
			animationStartTime,
			currentPrefix;

		// есть нативная реализация, без префиксов
		matchesSelector = dummy.matchesSelector || matchesSelector;
		requestAnimationFrame = window.requestAnimationFrame || requestAnimationFrame;
		animationStartTime = "animationStartTime" in window ? "animationStartTime":undefined;

		for (i = 0; !supported && (currentPrefix = prefixes[i]); i += 1) {
		
			lowPrefix = currentPrefix.toLowerCase();

			matchesSelector = dummy[lowPrefix + "MatchesSelector"] || matchesSelector;
			requestAnimationFrame = window[lowPrefix + "RequestAnimationFrame"] || requestAnimationFrame;

			if (!animationStartTime && lowPrefix + "AnimationStartTime" in window) {
				animationStartTime = lowPrefix + "AnimationStartTime";
			}
			

			if (currentPrefix + "Transition" in dummy.style) {
				prefix = lowPrefix;
				document.body.addEventListener(eventNames[i], transitionEndHandler, false);
				supported = true;
			} 

			if (!prefix && currentPrefix + "TransformProperty" in dummy.style) {
				prefix = lowPrefix;
			}
		}

		if (animationStartTime) {
			getNow = makeGetter(animationStartTime);
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
