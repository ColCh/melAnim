/*--------------------------- АНИМИРОВАНИЕ С ПОМОЩЬЮ CSS3 АНИМАЦИИ ---------------------------------*/
	var animateAnimation = function (instance) {
		var target, i;

		// добавляем сгенерированные строки стилей в правило кейфреймов
		var keyframes = instance.keyframes;
		var add = keyframes.appendRule || keyframes.insertRule;
		var buffer = instance.buffer;

		add.call(keyframes, "from { " + buffer.from + "}");
		add.call(keyframes, "to { " + buffer.to + "}");

		// прописываем анимацию целям.
		target = instance.target;
		var anim = animation + ":" + instance.id + " " + instance.duration + " " + instance.easing;
		for (i = target.length; i--; ) {
			target[i].style.cssText += ";" + anim;
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
