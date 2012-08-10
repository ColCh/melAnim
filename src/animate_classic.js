/*--------------------------- КЛАССИЧЕСКАЯ АНИМАЦИЯ ---------------------------------*/
	var animateClassic = function (target, id, fromStyle, properties, duration, easing, callback) {

		var instance;
		
		properties = normalizeProperties(properties);

		easing = easings_classic[easing];

		duration = parseFloat(duration, 10) * 1000;

		instance = {
			started: Date.now(),
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

		if (progr > 1) {
			progr = 1;
		}

		var currentValue;
	
		var i, transform, properties = instance.properties, value;

		for (i in properties) {

			currProp = properties[i];

			if (i === "transform") {
				value = "";
				for (transform in properties[i]) {
					currProp = properties[i][transform];
					currentValue = (currProp.to - currProp.from) * instance.easing(progr, time, 0, 1, instance.duration) + currProp.from + currProp.dimension;
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
				currentValue = (currProp.to - currProp.from) * instance.easing(progr, time, 0, 1, instance.duration) + currProp.from + currProp.dimension;
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

		var propertyInfo,
			property,
			i,
			transform,
			matched;

		for (property in properties) {

			propertyInfo = properties[property];

			if (property === "transform") {

				for (transform in propertyInfo) {

					property = propertyInfo[transform];
					matched = property.from.match(dimReg);

					if (matched[4]) {
						delete propertyInfo[transform];

						propertyInfo[transform + "X"] = {};
						propertyInfo[transform + "Y"] = {};

						propertyInfo[transform + "X"].from = parseFloat(matched[2], 10);
						propertyInfo[transform + "Y"].from = parseFloat(matched[4], 10);

						propertyInfo[transform + "X"].dimension = matched[3]; 
						propertyInfo[transform + "Y"].dimension = matched[3];

						matched =  property.to.match(dimReg);
						propertyInfo[transform + "X"].to = parseFloat(matched[2], 10);
						propertyInfo[transform + "Y"].to = parseFloat(matched[4], 10);

					} else {
						property.from = parseFloat(matched[2], 10);
						property.to = parseFloat(property.to.match(dimReg)[2], 10);
						property.dimension = matched[3];
					}
				}

			} else if (/color/i.test(property)) {
				propertyInfo.from = hexToRgb(propertyInfo.from);
				propertyInfo.to = hexToRgb(propertyInfo.to);
			} else {
				matched = propertyInfo["from"].match(dimReg);
				propertyInfo.from = parseFloat(matched[2], 10);
				propertyInfo.dimension = matched[3];
				propertyInfo.to = parseFloat(propertyInfo["to"].match(dimReg)[2], 10);
			}
		}

		return properties;
	};


