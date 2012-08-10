/*--------------------------- АНИМИРОВАНИЕ С ПОМОЩЬЮ ПЕРЕХОДОВ ---------------------------------*/
	var animateTransition = function animate_transitions(id, fromRule, properties, duration, easing, callback) {

		var toStyle;

		toStyle = addRule(id, " ").style;

		instance = {
			fromRule: fromRule,
			complete: callback,
			id: id
		};

		var instance_id = duration.slice(0, -1);

		if (!instances[instance_id]) {
			instances[instance_id] = [];
		}
		instances[instance_id].push(instance);

		requestAnimationFrame(function () {

			setStyle(fromRule.style, "transition", "all " + duration + " " + easing + " 0s");

			requestAnimationFrame(function () {
				// применился начальный стиль
				// применяем опции перехода
				var property, transform;
				for (property in properties) {
					if (property === "transform") {
						property = "";
						for (transform in properties.transform) {
							property += " " + transform + "(" + properties.transform[transform].to + ")"; 
						}
						setStyle(toStyle, "transform", property);
					} else {
						setStyle(toStyle, property, properties[property].to);
					}
				}
			});

		});
	};

	// для делегирования всплывающих событий конца анимации
	var transitionEndHandler = function handler(event) {

		var instance, i;

		if (event.elapsedTime in instances) {
			instances = instances[event.elapsedTime];

			for (i = instances.length; i--; ) {

				if (matchesSelector.call(event.target, instances[i].id)) {

					instance = instances[i];
					delete instances[i];

					var ruleIndex = Array.prototype.indexOf.call(cssRules, instance.fromRule);
					stylesheet.deleteRule(ruleIndex);

					instance.complete();
				}

			}
		}
	}
