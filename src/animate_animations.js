/*--------------------------- АНИМИРОВАНИЕ С ПОМОЩЬЮ CSS3 АНИМАЦИИ ---------------------------------*/
	var animateAnimation = function (instance) {
		var target, i, k;

		// добавляем сгенерированные строки стилей в правило кейфреймов
		/** @type {CSSKeyframesRule} */ var keyfrs = instance.keyframes = addRule(keyframes + " "+ instance.animationId);
		var add = keyfrs.appendRule || keyfrs.insertRule;
		var buffer = instance.buffer, procent;

		for (procent in buffer) {
			add.call(keyfrs, procent + "{" + buffer[procent] + "}");
		}

		var to = keyfrs.findRule("100%").style;

		i = instance.targets.length;
		while (i--) {
			target = instance.targets[i].style;
			target[animation + "Name"] += (target[animation + "Name"] ? ", ":"") + instance.animationId;
			target[animation + "Duration"] += (target[animation + "Duration"] ? ", ":"") + instance.animationDuration;
			target[animation + "TimingFunction"] += (target[animation + "TimingFunction"] ? ", ":"") + instance.timingFunction;
			k = to.length;
			while (k--) {
				target[ to[k] ] = to[ to[k] ];
			}
		}
	};

	// для делегирования всплывающих событий конца анимации
	var animationEndHandler = function (event) {

		var id = event.animationName, instance = instances[id], cache, pos, target;

		if (!instance) {
			// уже удалена или анимируется "чужой".
			return;
		}

		// удаляем кейфреймы с таблицы стилей.
		var ruleIndex = Array.prototype.indexOf.call(cssRules, instance.keyframes);
		stylesheet.deleteRule(ruleIndex);

		// убираем прописанную анимацию.
		i = instance.targets.length;
		while (i--) {
			target = instance.targets[i].style;

			target[animation + "Name"] = target[animation + "Name"].replace(new RegExp("(?:^|, )" + instance.animationId), "");
			target[animation + "Duration"] = target[animation + "Duration"].replace(new RegExp("(?:^|, )" + instance.animationDuration), "");
			target[animation + "TimingFunction"] = target[animation + "TimingFunction"].replace(new RegExp("(?:^|, )" + instance.timingFunction), "");
		}

		// удаляем экземпляр
		delete instances[id];

		instance.completeHandler();
	};