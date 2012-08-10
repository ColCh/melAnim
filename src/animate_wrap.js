/*--------------------------- ГЛАВНАЯ ФУНКЦИЯ АНИМАЦИИ ---------------------------------*/
	var animate = function animate_wrap(target, properties, duration, easing, callback, classicMode) {

		var
			id,
			fromRule,
			fromStyle,
			propertyName,
			transform,
			buffer;

		// определение режима
		classicMode = classicMode === undefined ? !supported : classicMode;

		// определяем ид анимации
		if (typeof target === "string") {
			id = target; // селектор
		} else {
			if (!target.id) {
				target.id = "anim_" + Date.now().toString(32);
			}
			id = '#' + target.id;
		}

		fromRule = addRule(id, " ");
		fromStyle = fromRule.style;

		if (!easings[easing]) {
				easing = "linear";
		}

		for (propertyName in properties) {
			if (propertyName === "transform") {
				buffer = "";
				for (transform in properties[propertyName]) {
					buffer += " " + transform + "(" + properties[propertyName][transform].from + ")";
				}
				setStyle(fromStyle, propertyName, buffer);
			} else {
				setStyle(fromStyle, propertyName, properties[propertyName].from);
			}
		}

		if (classicMode) {
			return animateClassic(target, id, fromStyle, properties, duration, easing, callback);
		} else {
			return animateTransition(id, fromRule, properties, duration, easing, callback);
		}

	};
