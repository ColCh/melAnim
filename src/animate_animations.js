/*--------------------------- АНИМИРОВАНИЕ С ПОМОЩЬЮ CSS3 АНИМАЦИИ ---------------------------------*/
	var animateAnimation = function (instance) {
		// генерируем строки стилей для перехода.
		var from_buffer = "", to_buffer = "", property, properties = instance.properties, transform, prop;
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

		// добавляем сгенерированные строки стилей в правило кейфреймов
		var keyframes = instance.keyframes;
		var add = keyframes.appendRule || keyframes.insertRule;

		add.call(keyframes, "from { " + from_buffer + "}");
		add.call(keyframes, "to { " + to_buffer + "}");

		// прописываем анимацию целям.
		target = instance.target;
		for (i = target.length; i--; ) {
			target[i].style[animation] = instance.id + " " + instance.duration + " " + instance.easing;
		}
	};

	// для делегирования всплывающих событий конца анимации
	var animationEndHandler = function (event) {

		var id = event.animationName, instance = instances[id];

		delete instances[id];

		var to_buffer = instance.keyframes.findRule("100%").style.cssText, i = instance.target.length, target, animation;
		animation = getVendorPropName("animation", dummy_style, false);
		while(i--) {
			target = instance.target[i];
			target.style.cssText += to_buffer;
		}

		var ruleIndex = Array.prototype.indexOf.call(cssRules, instance.keyframes);
		stylesheet.deleteRule(ruleIndex);

		instance.complete();
	}
