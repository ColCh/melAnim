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
				target.id = "anim_" + (Math.random()*1e6|0).toString(32);
			}
			id = '#' + target.id;
		}

		fromRule = addRule(id, " ");
		fromStyle = fromRule.style;

		if (!easings[easing]) {
				easing = "linear";
		}

		buffer = "";
		for (propertyName in properties) {
			if (propertyName === "transform") {
				buffer += propertyName + ":";
				for (transform in properties[propertyName]) {
					buffer += transform + "(" + properties[propertyName][transform].from + ")" + "";
				}
			} else {
				buffer += propertyName + ":" + properties[propertyName].from;
			}
			buffer += ";";
		}
		fromStyle.cssText = buffer;

		if (classicMode) {
			return animateClassic(target, id, fromStyle, properties, duration, easing, callback);
		} else {
			return animateTransition(id, fromRule, properties, duration, easing, callback);
		}

	};
