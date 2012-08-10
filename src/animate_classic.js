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

		var res = {};

		each(properties, function normalize_properties(info, property) {

			var member = {}, matched;

			if (property === "transform") {

				each(["from", "to"], function iterate_directions(direction) {
					each(info[direction].split(/\s(?!\d)/), function iterate_transforms(transformMember) {
						var curr;
						matched = transformMember.match(dimReg);
						if (matched[4]) {
							each(["X", "Y"], function iterate_axis(axis, i) {
								curr = member[matched[1] + axis];
								if (!curr) {
									curr = member[matched[1] + axis] = {};
								}
								curr[direction] = parseFloat(matched[i * 2 + 2]);
								curr.dimension = matched[3];
							});
						} else {
							curr = member[matched[1]];
							if (!curr) {
								curr = member[matched[1]] = {};
							}
							curr[direction] = parseFloat(matched[2], 10);
							curr.dimension = matched[3];
						}

					});
				});

			} else {
				matched = info["from"].match(dimReg);
				member.from = parseFloat(matched[2], 10);
				member.dimension = matched[3];
				member.to = parseFloat(info["to"].match(dimReg)[2], 10);
			}

			res[property] = member;

		});

		return res;
	};


