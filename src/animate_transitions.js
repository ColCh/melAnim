/*--------------------------- АНИМИРОВАНИЕ С ПОМОЩЬЮ ПЕРЕХОДОВ ---------------------------------*/
	var instances_by_duration = {};

	var animateTransition = function (instance) {
		// генерируем строки стилей для перехода.
		var from_buffer = ";", to_buffer = ";", property, properties = instance.properties, transform, prop;
		var target, i;

		for (property in properties) {
			prop = getVendorPropName(property, dummy_style, true);
			from_buffer += prop + ":";
			to_buffer += prop + ":";
			if (property === "transform") {
				for (transform in properties[property]) {
					from_buffer += transform + "(" + properties[property][transform].from + ")" + " ";
					to_buffer += transform + "(" + properties[property][transform].to + ")" + " ";
				}
			} else {
				from_buffer += properties[property].from;
				to_buffer += properties[property].to;
			}
			from_buffer += ";";
			to_buffer += ";";
		}

		to_buffer += getVendorPropName("transition", dummy_style, true) + ": all " + instance.duration + " " + instance.easing + " 0s;";
		
		if (instance.selectorMode) {
			target = instance.target;
			target.from.style.cssText = from_buffer;
		} else {
			target = instance.target;
			for (i = 0; i in target; i += 1) {
				target[i].style.cssText = instance.beginCssText[i] + ";" + from_buffer;
			}
		}
		// форсированная отрисовка
		window.scrollBy(0, 0);
		if (instance.selectorMode) {
			target.to.style.cssText = to_buffer;
		} else {
			for (i = 0; i in target; i += 1) {
				target[i].style.cssText = instance.beginCssText[i] + ";" + to_buffer;
			}
		}
	};

	// для делегирования всплывающих событий конца анимации
	var transitionEnd_delegator = function (event) {

		var instance, i, current, duration = event.elapsedTime + 's', id;

		current = instances_by_duration[duration];
		if (current) {
			for (i = current.length; i-- && !instance; ) {
				id = current[i];
				instance = instances[id];

				if (instance &&
						event.propertyName in instance.properties && 
							instance.selector ? matchesSelector.call(event.target, instance.selector):true) {

					delete instances[id];
					current.splice(i, 1);

					if (instance.selectorMode) {
						var ruleIndex = Array.prototype.indexOf.call(cssRules, instance.target.from);
						stylesheet.deleteRule(ruleIndex);
					}

					instance.complete();
				}

			}
		}
	}

	// обработка события конца анимации на элементе.
	var transitionEnd_element = function (event) {
		var _this = event.target;
		_this.style[ getVendorPropName("transition", dummy_style) ] = "";
		_this.removeEventListener(transitionEnd, transitionEnd_element);
	};
