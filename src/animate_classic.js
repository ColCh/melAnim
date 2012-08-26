/*--------------------------- КЛАССИЧЕСКАЯ АНИМАЦИЯ ---------------------------------*/
	var animateClassic = function (instance) {
		if (!ids.length) {	
			requestAnimationFrame(renderTicks);
		}
		ids.push(instance.animationId);
	};

	// ID'шники запущенных в классическом режиме анимаций.
	/** @const */
	var ids = [];

	var renderTicks = function (now) {
		var i, instance, property, time, progr, easing, step, properties;
		var propVal, propName, propInfo;
		var buffer;
		var k, target;

		i = ids.length;
		while (i--) {
			instance = instances[ids[i]];
			properties = instance.props;
			buffer = instance.propsBuffer;

			if (instance.started) {
				time = now - instance.started;
				progr = time / instance.animationDuration;
				if (progr > 1) {
					// гарантируется точность того, что при последнем кадре будут применены конечные значения
					progr = easing = 1;
				} else {
					easing = instance.timingFunction(progr, time, 0, 1, instance.animationDuration);
				}
			} else {
				// первый кадр; будут проставляться значения "от"
				easing = progr = 0;
				instance.started = now;
				instance.beginCssText = [];
			}


			// вычисляем значения для свойств и записываем в буффер.
			for (property in properties) {
				propInfo = properties[property];
				if (!gVPN_cache[1][property] && hooks[property]) {
					buffer += hooks[property](instance, propInfo, easing) || ""; 
				} else {
					step = color.test(property) ? steps.color:steps[property] || steps._default;
					propVal = step(propInfo, easing);
					buffer = buffer.replace("${" + property + "}", propVal);
				}
			}
			
			// применяем буффер к целям.
			k = instance.targets.length;
			while(k--) {
				target = instance.targets[k];	
				if (instance.beginCssText[k] === undefined) {
					// запоминаем начальный стиль.
					instance.beginCssText[k] = target.style.cssText + ";";
				}
				target.style.cssText = instance.beginCssText[k] + buffer;
			}

			if (progr === 1) {
				// анимация закончена.
				delete instances[ ids.splice(i, 1)[0] ];
				instance.completeHandler();
			}
		}

		// если есть хотя бы одна активная анимация
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
			return steps._count(property.from, property.to, easing) + property.dimension;
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
