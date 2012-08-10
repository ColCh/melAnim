/*--------------------------- ОБЬЯВЛЕНИЯ ---------------------------------*/
	// на чём тестируем имена CSS свойств
	var dummy = document.documentElement,

	// информация о запущенных анимациях
	instances = {},

	// префикс для браузера
	prefix,

	// собственная таблица стилей
	stylesheet,
	// её правила
	cssRules,

	// соответствие селектору
	matchesSelector,

	// поддерживаются ли CSS Transitions
	supported,

	// время последней отрисовки
	last = 0,
	// набравшиеся функции для исполнения перед отрисовки
	stack = [],

	// костыль для выполнения ф-й перед отрисовкой
	requestAnimationFrame = function request_anim_frame(callback) {
		var now = Date.now();
		if (now - last < 16) {
			stack.push(callback);
		} else {
			for (var i = 0; i in stack; i += 1) {
				stack[i].call(window, now);
			}
			// форсированная отрисовка
			window.scrollBy(0, 0);
			last = now;
		}
	},

	// переходы
	easings_bezier = {
		'ease': [0.25, 0.10, 0.25, 1.0],
		'linear': [0.00, 0.00, 1.00, 1.0],
		'ease-in': [0.42, 0.00, 1.00, 1.0],
		'ease-out': [0.00, 0.00, 0.58, 1.0],
		'ease-in-out': [0.42, 0.00, 0.58, 1.0]
	},

	easings_classic = {
		'ease': function (x, t, b, c, d) {
			var ts=(t/=d)*t;
			var tc=ts*t;
			return b+c*(6*tc*ts + -15*ts*ts + 10*tc);
		},
		'linear': function (x) {
			return x;
		},
		'ease-in': function (x, t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		'ease-out': function (x, t, b, c, d) {
			return ( -Math.cos( x * Math.PI ) / 2 ) + 0.5;
		},
		'ease-in-out': function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		}
	},


	// rotate(90deg) => [rotate, 90, deg]
	// 90px => [undefined, 90, px]
	// skew(10deg, 45deg) => [skew, 10, deg, 45];
	dimReg = /\s*(?:([^\(]+)\()?(-?\d+)(%|\w*)(?:,\s?(-?\d+)\w*)?\)?/,

	// для добавления своих
	easingReg = /^cubic\-bezier\(\s*(\-?\d*(?:\.\d+)?)\s*,\s*(\-?\d*(?:\.\d+)?)\s*,\s*(\-?\d*(?:\.\d+)?)\s*,\s*(\-?\d*(?:\.\d+)?)\s*\)$/,

	// ловля трансформаций (для IE)
	transformReg = /(\w+)\(?(\d+)(\w*)(?:,?\s?(\d+)\w*)?\)?/g,

	// итерирование хешей и обьектов, похожих на массивы.
	each = function (what, callback, type) {
		var i;

		type = type || (what[0] || what.length ? "array" : "object");

		if (type === "array") {
			for (i = 0; i in what; i += 1) {
				callback(what[i], i, what);
			}
		} else {
			for (i in what) {
				if (what.hasOwnProperty(i)) {
					callback(what[i], i, what);
				}
			}
		}
	},

	// добавит правило в конец таблицы стилей и вернёт его
	addRule = function addRule(selector, text) {

			var index = cssRules.length;

			if (stylesheet.insertRule) {
					stylesheet.insertRule(selector + "{" + text + "}", index);
			} else {
					stylesheet.addRule(selector, text, index);
			}

			return cssRules[index];
	},

	hexToRgb = function (hex) {
		hex = hex.slice(1);
		hex = parseInt(hex, 16);
		var r = hex >> 16 & 0xFF;
		var g = hex >> 8 & 0xFF;
		var b = hex & 0xFF;

		return [r, g, b];
	},

	// превратить cubic-bezier в обычную функцию
	mathemate = function (name) {
		// TODO
	};
