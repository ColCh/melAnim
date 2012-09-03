/*--------------------------- ИНИЦИАЛИЗАЦИЯ ---------------------------------*/
	var animationEndEventNames = ["animationend", "webkitAnimationEnd", "OAnimationEnd", "MSAnimationEnd"], i;

	// определение фич
	animation = getVendorPropName("animation", dummy_style, false);

	if (animation) {
		animation_supported = true;
		// правило кейфреймов сохраним, чтобы каждый раз не выполнять это условие.
		keyframes = "@" + (animation !== "animation" ? "-"+lowPrefix+"-":"") + "keyframes";
		// без мытарства с определением верного имени события просто вешаем на все сразу.
		i = animationEndEventNames.length;
		while (i--) {
			dummy.addEventListener(animationEndEventNames[i], animationEndHandler, true);
		}
	}

	requestAnimationFrame = getVendorPropVal("requestAnimationFrame", window, false) || requestAnimationFrame;

	// добавление своей таблицы стилей перед самым последним тегом <script>.
	var pos = document.getElementsByTagName("script");
	pos = pos[ pos.length - 1 ];

	stylesheet = document.createElement("style");
	pos.parentNode.insertBefore(stylesheet, pos);

	stylesheet = stylesheet.sheet || stylesheet.styleSheet;
	cssRules = stylesheet.cssRules || stylesheet.rules;

	window["animate"] = animate;