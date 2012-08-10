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
	easings = {
		'ease': [0.25, 0.10, 0.25, 1.0],
		'swing': [0.02, 0.01, 0.47, 1.0],
		'linear': [0.00, 0.00, 1.00, 1.0],
		'ease-in': [0.42, 0.00, 1.00, 1.0],
		'ease-out': [0.00, 0.00, 0.58, 1.0],
		'ease-in-out': [0.42, 0.00, 0.58, 1.0]
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

	// для делегирования всплывающих событий конца анимации
	transitionEndHandler = function handler(event) {

		var id, instance;

		for (id in instances) {
			if (event.elapsedTime + 's' === instances[id].duration && matchesSelector.call(event.target, id)) {

				instance = instances[id];
				delete instances[id];

				var ruleIndex = Array.prototype.indexOf.call(cssRules, instance.fromRule);
				stylesheet.deleteRule(ruleIndex);

				instance.complete();

				break;
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
	};

