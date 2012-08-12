/*--------------------------- КЛАССИЧЕСКАЯ АНИМАЦИЯ ---------------------------------*/
	var animateClassic = function (target, id, fromStyle, properties, duration, easing, callback) {

		var instance;
		
		properties = normalizeProperties(properties);

		easing = easings[easing];

		duration = parseFloat(duration, 10) * 1000;

		instance = {
			started: +new Date,
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
		instances: [],
		idle: true,
		insert: function (instance) {
			if (this.instances.length === 0) {
				this.awake();
			}
			this.instances.push(instance);
		},
		sleep: function () {
			this.idle = true;
		},
		awake: function () {
			this.idle = false;
			ticker.tick();
		},
		tick: function (now) {
			each(ticker.instances, function (instance, index, instances) {
				// анимация закончилась.
				if (renderTick(instance, now)) {
					if (instances.length === 1) {
						ticker.sleep();
					}
					delete instances[index];
				}
			});
			if (!ticker.idle) {
				requestAnimationFrame(ticker.tick);
			}
		}
	};

	// тики анимации
	var renderTick = function (instance, now) {

		var currProp;

		var time = now - instance['started'];
		var progr = time / instance['duration'];

		progr = progr > 1 ? 1:+progr.toFixed(1);

		var currentValue;
	
		var i, transform, properties = instance.properties, value;

		for (i in properties) {

			currProp = properties[i];

			if (i === "transform") {
				value = "";
				for (transform in properties[i]) {
					currProp = properties[i][transform];
					currentValue = (currProp.to - currProp.from) * instance.easing(progr, time, 0, 1, instance.duration) + currProp.from + (currProp.dimension || "px");
					value += transform + "(" + currentValue + ") ";
				}
				setStyle(instance.style, i, value); 
			} else if (/color/i.test(i)) {
				currentValue = [];
				currentValue[0] = Math.round((currProp.to[0] - currProp.from[0]) * instance.easing(progr, time, 0, 1, instance.duration) + currProp.from[0]);
				currentValue[1] = Math.round((currProp.to[1] - currProp.from[1]) * instance.easing(progr, time, 0, 1, instance.duration) + currProp.from[1]);
				currentValue[2] = Math.round((currProp.to[2] - currProp.from[2]) * instance.easing(progr, time, 0, 1, instance.duration) + currProp.from[2]);
				currentValue = "rgb(" + currentValue.join(", ") + ")";
				setStyle(instance.style, i, currentValue);
			} else {
				currentValue = (currProp.to - currProp.from) * instance.easing(progr, time, 0, 1, instance.duration) + currProp.from + (currProp.dimension || "px");
				setStyle(instance.style, i, currentValue);
			}
		}


		if (progr >= 1) {
			instance['complete'].call(); 
			return true;
		}

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
						}
					}
			}
		}

		return newProperties;
	};


