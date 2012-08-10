/*--------------------------- КЛАССИЧЕСКАЯ АНИМАЦИЯ ---------------------------------*/
	var animateClassic = function (target, id, fromStyle, properties, duration, easing, callback) {

		var instance;
		
		properties = normalizeProperties(properties);

		easing = mathemate(easing);

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
		tick: function () {
			each(ticker.instances, function (instance, index, instances) {
				// анимация закончилась.
				if (renderTick(instance)) {
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
	var renderTick = function (instance) {

		var currProp;

		var progr = (Date.now() - instance['started']) / instance['duration'];

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
					currentValue = (currProp.to - currProp.from) * instance.easing(progr) + currProp.from + currProp.dimension;
					value += transform + "(" + currentValue + ") ";
				}
				setStyle(instance.style, i, value); console.log(i, value);
			} else {
				currentValue = (currProp.to - currProp.from) * instance.easing(progr) + currProp.from + currProp.dimension;
				setStyle(instance.style, i, currentValue);
			}
		}


		if (progr < 1) {
			//requestAnimFrame(instance['step'], instance, []);
		} else {
			instance['complete'](); console.log(instance.style);
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

	// превратить cubic-bezier в обычную функцию
	var mathemate = function (name) {
		if (!easings[name]['mathemated']) {
			easings[name]['mathemated'] = function (progress) {
				var points = easings[name];
				return calc.apply(0, points.concat(progress));
			};
		}

		return easings[name]['mathemated'];
	};


	// вычислить значение кубической кривой привремени progress ( e [0;1] )
	var calc = function (p1x, p1y, p2x, p2y, progress) {

		var res;

		if (p1x === p1y && p2x === p2y) {

			res = progress;

		} else {

			var timeX = getTimeX(progress, p1x, p2x);
			res = calcBezier(timeX, p1y, p2y);

		}

		return res;
	};



	// вспомогательные ф-и для calc
	var getTimeX = function (progr, p1x, p2x) {

		var timeX = progr;

		for (var i = 0; i < 4; ++i) {

			var currentslope = slope(timeX, p1x, p2x);

			if (currentslope == 0.0) {
				return timeX;
			}

			var currentx = calcBezier(timeX, p1x, p2x) - progr;

			timeX -= currentx / currentslope;
		}

		return timeX;

	};
	var calcBezier = function (progr, px1, px2) {
		return ((A(px1, px2) * progr + B(px1, px2)) * progr + C(px1)) * progr;
	}
	var slope = function (progr, px1, px2) {
		return 3.0 * A(px1, px2) * progr * progr + 2.0 * B(px1, px2) * progr + C(px1);
	}

	// укоротители для calcBezier
	var A = function (aA1, aA2) {
		return 1.0 - 3.0 * aA2 + 3.0 * aA1;
	}
	var B = function (aA1, aA2) {
		return 3.0 * aA2 - 6.0 * aA1;
	}
	var C = function (aA1) {
		return 3.0 * aA1;
	}
