/*--------------------------- КЛАССИЧЕСКАЯ АНИМАЦИЯ ---------------------------------*/
	var animateClassic = function (instance) {
		instance.timingFunction = easings[instance.timingFunction] || easings.linear;
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
		var propVal, propInfo, procents, l, from, to, propEasing, propProgr;
		var k, target;
		var buffer = "";

		i = ids.length;
		while (i--) {
			instance = instances[ids[i]];
			properties = instance.props;

			if (!instance.started) {
				// первый кадр.
				instance.started = now;
				progr = 0;
			} else {
				progr = (now - instance.started) / instance.animationDuration;
				if (progr > 1) {
					progr = 1;
				}
			}

			easing = instance.timingFunction(progr);

			// вычисление текущего значения для свойств.
			for (property in properties) {
				propInfo = properties[property];
				procents = propInfo.procents;

				if (procents[propInfo.currProc + 1] < progr) {
					propInfo.currProc++;
					propInfo.started = now;
				}

				from = procents[propInfo.currProc];
				to = procents[ propInfo.currProc + 1 ];
				
				if (from) {
					propProgr = (now - propInfo.started) / from / instance.animationDuration;
					if (propProgr > 1 || progr === 1) {
						propProgr = 1;
					}
					propEasing = instance.timingFunction(propProgr);
				} else {
					propEasing = easing;
				}

				step = steps[property] || steps._count;

				if (propInfo[from] === undefined) {
					k = instance.targets.length;
					while (k--) {
						propInfo.special[k].currentValue = step(propInfo.special[k].from, propInfo[to], propEasing);
					}
				} else {
					propInfo.currentValue = step(propInfo[from], propInfo[to], propEasing);
				}
			}
			
			// применяем изменения к элементам.
			k = instance.targets.length;
			while(k--) {
				target = instance.targets[k];
				for (property in properties) {
					propInfo = properties[property];
					propVal = propInfo.currentValue || propInfo.special[k].currentValue;
					if (renderHooks[property]) {
						renderHooks[property](propVal, instance.targets, propInfo);
					} else {
						target.style[properties[property].prefixed] = propVal + propInfo.dimension;
					}
				}
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
	var steps = hooks["steps"] = {
		_count: function (from, to, easing) {
			return (1 - easing) * from + easing * to;	
		},
		color: function (prop, easing) {
			var i = 3, val = [];
			while (i--) {
				val[i] = Math.floor( steps._count(prop.from[i], prop.to[i], easing) );
			}
			return "rgb(" + val.join(", ") + ")";
		},
		transform: function (from, to, prop, easing) {
			var transform, transforms = prop.transforms, transformInfo;
			for (transform in transforms) {
				transformInfo = transforms[transform];
				transformInfo.currentValue = steps._count(transformInfo[from], transformInfo[to], easing);
			}
		}
	};