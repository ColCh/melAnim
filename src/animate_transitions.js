/*--------------------------- АНИМИРОВАНИЕ С ПОМОЩЬЮ ПЕРЕХОДОВ ---------------------------------*/
	var animateTransition = function animate_transitions(id, fromRule, properties, duration, easing, callback) {

		var toStyle;

		easing = easings_bezier[easing];

		if (typeof easing !== "string") {
			easing = "cubic-bezier(" + easing.join(", ") + ")";
		}

		toStyle = addRule(id, " ").style;

		instances[id] = {
			fromRule: fromRule,
			complete: callback,
			duration: duration
		};

		requestAnimationFrame(function () {

			setStyle(toStyle, "transition", "all " + duration + " " + easing + " 0s");

			requestAnimationFrame(function () {
				// применился начальный стиль
				// применяем опции перехода
				each(properties, function iterate_properties(current, propertyName) {
					setStyle(toStyle, propertyName, current["to"]);
				}, "object");

			});

		});
	};
