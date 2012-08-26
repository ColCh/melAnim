/*--------------------------- АНИМИРОВАНИЕ С ПОМОЩЬЮ CSS3 АНИМАЦИИ ---------------------------------*/
	var animateAnimation = function (instance) {
		var targets, i;

		// добавляем сгенерированные строки стилей в правило кейфреймов
		var keyframes = instance.keyframes;
		var add = keyframes.appendRule || keyframes.insertRule;
		var buffer = instance.propsBuffer;

		add.call(keyframes, "0% { " + buffer.from + "}");
		add.call(keyframes, "100% { " + buffer.to + "}");

		// прописываем анимацию целям.
		targets = instance.targets;
		var anim = animation + ":" + instance.animationId + " " + instance.animationDuration + " " + instance.timingFunction;
		for (i = targets.length; i--; ) {
			targets[i].style.cssText += ";" + anim;
		}
	};

	// для делегирования всплывающих событий конца анимации
	var animationEndHandler = function (event) {

		var id = event.animationName, instance = instances[id];

		delete instances[id];

		var to_buffer = instance.keyframes.findRule("100%").style.cssText, i = instance.targets.length, target;
		while(i--) {
			target = instance.targets[i];
			target.style.cssText += to_buffer;
		}

		var ruleIndex = Array.prototype.indexOf.call(cssRules, instance.keyframes);
		stylesheet.deleteRule(ruleIndex);

		instance.completeHandler();
	}
