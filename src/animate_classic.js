/*--------------------------- КЛАССИЧЕСКАЯ АНИМАЦИЯ ---------------------------------*/
	var animateClassic = function (target, id, fromStyle, properties, duration, easing, callback) {

		var instance;
		
		properties = normalizeProperties(properties);

		easing = easings[easing];

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
				//currentValue = "#" + rgbToHex(currentValue);
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
			matched,
			newProperties;

		newProperties = {};

		for (property in properties) {

			propertyInfo = properties[property];
			newProperties[property] = {};

			if (property === "transform") {

				for (transform in propertyInfo) {

					matched = propertyInfo[transform].from.match(dimReg);

					if (matched[4]) {

						newProperties[property][transform + "X"] = {};
						newProperties[property][transform + "Y"] = {};

						newProperties[property][transform + "X"].from = parseFloat(matched[2], 10);
						newProperties[property][transform + "Y"].from = parseFloat(matched[4], 10);

						newProperties[property][transform + "X"].dimension = matched[3]; 
						newProperties[property][transform + "Y"].dimension = matched[3];

						matched =  propertyInfo[transform].to.match(dimReg);
						newProperties[property][transform + "X"].to = parseFloat(matched[2], 10);
						newProperties[property][transform + "Y"].to = parseFloat(matched[4], 10);

					} else {
						newProperties[property][transform] = {};
						newProperties[property][transform].from = parseFloat(matched[2], 10);
						newProperties[property][transform].to = parseFloat(propertyInfo[transform].to.match(dimReg)[2], 10);
						newProperties[property][transform].dimension = matched[3];
					}
				}

			} else if (/color/i.test(property)) {
				newProperties[property].from = hexToRgb(propertyInfo.from);
				newProperties[property].to = hexToRgb(propertyInfo.to);
			} else {
				matched = propertyInfo["from"].match(dimReg);
				newProperties[property].from = parseFloat(matched[2], 10);
				newProperties[property].dimension = matched[3];
				newProperties[property].to = parseFloat(propertyInfo["to"].match(dimReg)[2], 10);
			}
		}

		return newProperties;
	};


