/*--------------------------- ГЛАВНАЯ ФУНКЦИЯ АНИМАЦИИ ---------------------------------*/
	var animate = function animate_wrap(target, properties, duration, easing, callback, classicMode) {

		var
			i,
			id,
			fromRule,
			fromStyle,
			curr;

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
			// передана cubic-bezier
			if (easingReg.test(easing)) {
				easings[easing] = easing;
			} else {
				easing = "linear";
			}
		}

		each(properties, function iterate_properties(current, propertyName) {
			setStyle(fromStyle, propertyName, current["from"]);
		}, "object");

		if (classicMode) {
			return animateClassic(target, id, fromStyle, properties, duration, easing, callback);
		} else {
			return animateTransition(id, fromRule, properties, duration, easing, callback);
		}

	};
