/*--------------------------- КЛАССИЧЕСКАЯ АНИМАЦИЯ ---------------------------------*/
	var animateClassic = function (instance) {
		if (ids.push(instance.id) === 1) {
			requestAnimationFrame(renderTicks);
		}
	};

	// ID'шники запущенных в классическом режиме анимаций.
	var ids = [];

	var renderTicks = function (now) {
		var i, instance, property, time, progr, easing, step, properties;
		var propVal, propName;
		var buffer;
		var k, target;

		i = ids.length;
		while (i--) {
			instance = instances[ids[i]];
			properties = instance.properties;
			buffer = instance.buffer;

			if (instance.started) {
				time = now - instance.started;
				progr = time / instance.duration;
			} else {
				// первый запуск; будут проставляться значения "от"
				time = progr = 0;
				instance.started = now;
				instance.beginCssText = [];
			}

			if (progr < 1) {

				easing = instance.easing(progr, time, 0, 1, instance.duration);

				// вычисляем значения для свойств и записываем в буффер.
				for (property in properties) {
					if (!gVPN_cache[1][property] && hooks[property]) {
						buffer += hooks[property](instance, properties[property], easing) || ""; 
					} else {
						step = /color/i.test(property) ? steps.color:steps[property] || steps._default;
						propVal = step(properties[property], easing);
						buffer = buffer.replace("${" + property + "}", propVal);
					}
				}
				
				// применяем буффер к целям.
				k = instance.target.length;
				while(k--) {
					target = instance.target[k];	
					if (instance.beginCssText[k] === undefined) {
						instance.beginCssText[k] = target.style.cssText + ";";
					}
					target.style.cssText = instance.beginCssText[k] + buffer;
				}

			} else {
				// анимация закончена.
				delete instances[ ids.splice(i, 1)[0] ];
				instance.complete();
			}
		}

		if (ids.length) {
			requestAnimationFrame(renderTicks);
		}
	};

	// вычисление текущего значения свойства
	// ключ - имя свойства без вендорного префикса
	var steps = {
		_count: function (from, to, easing) {
			return (1 - easing) * from + easing * to;	
		},
		_default: function (property, easing) {
			return steps._count(property.from, property.to, easing).toFixed(3) + property.dimension;
		},
		color: function (prop, easing) {
			var i = 3, val = [];
			while (i--) {
				val[i] = Math.floor( steps._count(prop.from[i], prop.to[i], easing) );
			}
			return "rgb(" + val.join(", ") + ")";
		},
		transform: function (prop, easing) {
			var transform, res = "";
			for (transform in prop) {
				res += transform + "(" + steps._default(prop[transform], easing) + ")" + " ";
			}
			return res;
		}
	};
