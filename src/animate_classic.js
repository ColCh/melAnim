/*--------------------------- КЛАССИЧЕСКАЯ АНИМАЦИЯ ---------------------------------*/
	var ids = [];

	var animateClassic = function (instance) {

		instance.started = getNow();

		ids.push(instance.id);

		if (ids.length === 1) {
			requestAnimationFrame(renderTicks);
		}
	};

	var renderTicks = function (now) {
		var i, instance, property, time, progr, easing, step, properties;
		var propVal, propName;
		var buffer;
		var k, target;

		for (i = ids.length; i--;) {
			instance = instances[ids[i]];
			properties = instance.properties;
			buffer = "";

			time = now - instance.started;
			progr = time / instance.duration;
			if (progr > 1) {
				progr = 1;
			}
			easing = instance.easing(progr, time, 0, 1, instance.duration);

			for (property in properties) {
				if (property in steps) {
					step = steps[property];
				} else if (/color/i.test(property)) {
					step = steps.color;
				} else {
					step = steps._default;
				}
				
				propVal = step(properties[property], easing);
				if (property in hooks) {
					hooks[property](); // TODO
				} else {
					propName = getVendorPropName(property, dummy_style, true);
					buffer += propName + ":" + propVal + ";";
				}
			}
			for (k = instance.target.length; k--; ) {
				target = instance.target[k];
				if ("nodeType" in target) {
					target.style.cssText = instance.beginCssText[k] + ";" + buffer;
				} else {
					target.cssText = buffer;
				}
			}
		
			if (progr === 1) {
				delete instances[ ids.splice(i, 1)[0] ];
				instance.complete();
			}
		}

		if (ids.length) {
			requestAnimationFrame(renderTicks);
		}
	};

	var steps = {
		_default: function (property, easing) {
			return (property.delta * easing + property.from).toFixed(3) + property.dimension;
		},
		color: function (prop, easing) {
			var i = 3, val = [];
			while (i--) {
				val[i] = Math.ceil((prop.to[i] - prop.from[i]) * easing + prop.from[i]);
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

	var hooks = {};
