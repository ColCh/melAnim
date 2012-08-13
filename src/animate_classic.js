/*--------------------------- КЛАССИЧЕСКАЯ АНИМАЦИЯ ---------------------------------*/
	var animateClassic = function (target, id, fromStyle, properties, duration, easing, callback) {

		var instance;
		
		properties = normalizeProperties(properties);

		easing = easings[easing];

		duration = parseFloat(duration, 10) * 1000;

		instance = {
			started: getNow(),
			duration: duration,
			properties: properties,
			id: id,
			complete: callback,
			style: fromStyle,
			easing: easing
		};

		ticker.insert(instance);

	};

	// управление периодически повторяющимися действиями.
	var ticker = {
		idle: true,
		insert: function (instance) {
			// instances  определена в главном замыкании.
			instances[instance.started] = instance;
			// первый запуск, или нет активных анимаций.
			if (!instances._length) {
				instances._length = 0;
				this.awake();
			}
			// счётчик запущенных анимаций.
			instances._length += 1;
		},
		sleep: function () {
			this.idle = true;
		},
		awake: function () {
			this.idle = false;
			requestAnimationFrame(ticker.tick);
		},
		tick: function (now) {
			var instanceId,
				instance;

			if (ticker.idle) {
				return;
			}

			requestAnimationFrame(ticker.tick);

			for (instanceId in instances) if (instanceId !== "_length") {
				instance = instances[instanceId];

				// renderTick возвратит true, если экземпляр можно удалить из списка запущенных.
				if (renderTick(instance, now)) {
					instance.complete();
					// закончилась последняя запущенная анимация.
					if (instances._length === 1) {
						ticker.sleep();
					}
					instances._length -= 1;
					delete instances[instance.id];
				}
			}
		}
	};

	// вычислит текущее значение свойства.
	var count = function (from, to, easing, dimension) {
		if (dimension === false) {
			dimension = "px";
		} else if (dimension === undefined) {
			dimension = 0;
		}
		return ((to - from) * easing + from) + dimension;
	};

	// тики анимации
	var renderTick = function (instance, now) {

		var currProp,
			currTransform,
			time = now - instance.started,
			progr = time / instance.duration,
			currentValue,
			i,
			transform,
			properties = instance.properties,
			easing,
			propertyName,
			buffer = "";

		if (progr > 1) {
			progr = 1;
		}

		easing = instance.easing(progr, time, 0, 1, instance.duration);

		for (propertyName in properties) {
			currProp = properties[propertyName];

			if (/transform/i.test(propertyName)) {
				currentValue = "";
				for (transform in currProp) {
					currTransform = currProp[transform];

					currentValue += transform + "(";
					currentValue += count(currTransform.from, currTransform.to, easing, currTransform.dimension);
					currentValue += ")" + " ";
				}
			} else if (/color/i.test(propertyName)) {
				currentValue = [];
				
				for (i = 0; i < 3; i += 1) {
					currentValue[i] = Math.ceil(count(currProp.from[i], currProp.to[i], easing));
				}
				currentValue = "rgb(" + currentValue.join(", ") + ")";
			} else {
				currentValue = count(currProp.from, currProp.to, easing, currProp.dimension);
			}
			buffer += propertyName + ":" + currentValue + ";";
		}

		instance.style.cssText = buffer;

		return progr === 1;
	};

	// превратит объект анимируемых свойств в machine-readable
	var normalizeProperties = function (properties) {
		var newProperties = {},
			property,
			prop,
			propInfo,
			matched,
			directions = ["from", "to"],
			i,
			direction;

		for (property in properties) if (properties.hasOwnProperty(property)) {
			propInfo = properties[property];

			if (property === "transform") {
				property = "-" + prefix + "-transform";
				newProperties[property] = normalizeProperties(propInfo);
			} else {
				prop = newProperties[property] = {};

				for (i = 0; direction = directions[i]; i += 1) 
					if (/color/i.test(property)) {
						prop[direction] = hexToRgb(propInfo[direction]);
					} else {
						matched = propInfo[direction].match(dimReg);
						// анимирование только числовых свойств :(
						prop[direction] = parseFloat(matched[2], 10);
						// "PX" - размерность по-умолчанию
						if (matched[3] && matched[3] !== "px") {
							prop.dimension = matched[3];
						} else if (property !== "opacity") {
							prop.dimension = false;
						}
					}
			}
		}

		return newProperties;
	};


