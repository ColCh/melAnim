/*--------------------------- АНИМИРОВАНИЕ С ПОМОЩЬЮ ПЕРЕХОДОВ ---------------------------------*/
	var animateAnimation = function (instance) {
		// генерируем строки стилей для перехода.
		var from_buffer = "", to_buffer = "", property, properties = instance.properties, transform, prop;
		var target, i, animation;

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
		var add = keyframes.addRule || keyframes.insertRule;

		add.call(keyframes, "from { " + from_buffer + "}");
		add.call(keyframes, "to { " + to_buffer + "}");

		// прописываем анимацию целям.
		target = instance.target;
		animation = getVendorPropName("animation", dummy_style, false);
		for (i = target.length; i--; ) {
			target[i].style[ animation + "Name" ] = instance.id;
			target[i].style[ animation + "Duration" ] = instance.duration;
			target[i].style[ animation + "TimingFunction" ] = instance.easing;
			target[i].style[ animation + "FillMode" ] = "forwards";
		}
	};

	// для делегирования всплывающих событий конца анимации
	var animationEndHandler = function (event) {

		var id = event.animationName, instance = instances[id];

		delete instances[id];

		//var ruleIndex = Array.prototype.indexOf.call(cssRules, instance.keyframes);
		//stylesheet.deleteRule(ruleIndex);

		//ruleIndex = Array.prototype.indexOf.call(cssRules, instance.target[0]);
		//stylesheet.deleteRule(ruleIndex);
		if (!animationEnd) {
			animationEnd = event.type;
		}

		instance.complete();
	}
