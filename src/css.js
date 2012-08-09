/*--------------------------- УСТАНОВКА СТИЛЕЙ ---------------------------------*/
	// установить ч-либо стиль, исп-я хуки по возможности
	var setStyle = function (style, property, value) {

		var newProperty, hook = hooks[property];

		if (hook) {

			if (hook.cached) {
				// результат выполнения хука закеширован
				property = hook.cached;

			} else {

				newProperty = hook(prefix, hook, value, style);

				// если хук поставит свойство сам, он должен вернуть falsy.
				if (newProperty) {
					property = hook.cached = newProperty;
				} else {
					return;
				}

			}

		}

		setProperty(style, property, value, "");
	};


	// хуки для setStyle
	var hooks = animate.styleHooks = {};

	// расширяем хуки
	hooks.transition = function (prefix) {
		var res = "transition";

		if (!styleIsCorrect(res)) {
			res = '-' + prefix + '-' + res;
		}

		return res;
	};

	hooks.transform = function (prefix, hook, value, style) {

		// результирующая матрица трансформации
		var resultMatrix = [[1, 0], [0, 1]]; // обычное состояние
		var dx = 0,
			dy = 0; // смещение по координатам

		var deg2rad = Math.PI / 180;

		for (var curr, currMatrix, transformReg = /\s*\w+\((?:,?\s?\d+\w*)+\)?/g; curr = transformReg.exec(value);) {
			curr = dimReg.exec(curr);
			switch (curr[1]) {
			case "rotate":

				var rad = curr[2] * deg2rad;
				var cos = Math.cos(rad);
				var sin = Math.sin(rad);

				currMatrix = [[cos, sin], [-sin, cos]];
				resultMatrix = multiply(resultMatrix, currMatrix);

				// вычислить dx,dy для IE
				break;
			case "scale":
				currMatrix = [[curr[2], 0], [curr[4], 0]];
				resultMatrix = multiply(resultMatrix, currMatrix);
				break;
			case "skew":
				var rad, tan;
				// X
				rad = curr[2] * deg2rad;
				tan = Math.tan(rad);
				currMatrix = [[1, 0], [tan, 1]];
				resultMatrix = multiply(resultMatrix, currMatrix);

				// Y
				if (curr[4]) {
					rad = curr[4] * deg2rad;
					tan = Math.tan(rad);
					currMatrix = [[1, tan], [0, 1]];
					resultMatrix = multiply(resultMatrix, currMatrix);
				}
				break;
			case "translate":
				dx = curr[2];
				dy = curr[4];
				break;
			default:
				/*nothing*/
				;
			}
		}

		var val, propertyName;

		if (styleIsCorrect("filter")) {
			// начнём с IE
			propertyName = "filter";
			val = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand'," + "M11=" + resultMatrix[0][0] + ", M12=" + resultMatrix[0][1] + "," + "M21=" + resultMatrix[1][0] + ", M22=" + resultMatrix[1][1] + "Dx=" + dx + ", Dy=" + dy + ";";
		} else {
			propertyName = "transform";

			if (!styleIsCorrect(propertyName)) {
				propertyName = "-" + prefix + "-" + propertyName;
			}

			val = "matrix(" + resultMatrix[0].join(", ") + ", " + resultMatrix[1].join(", ") + ", " + dx + ", " + dy + ")";
		}

		setProperty(style, propertyName, val);
	};



	// проверит имя css-свойства на корректность с помощью CSS-движка
	var styleIsCorrect = function (name, value) {

		var oldDummy = dummy.cssText,
			res, values, i;

		dummy.cssText = "";

		values = value === undefined ? ["", "none", "0"] : [value], i;

		for (i = 0; i in values; i += 1) {
			try {
				setProperty.call(dummy, name, values[i], "");
			} catch (e) {}
		}

		res = dummy.cssText.length > 0; // неверный стиль не попадёт сюда.
		dummy.cssText = oldDummy;

		return res;
	};



	// добавит правило в конец таблицы стилей и вернёт его
	var addRule = function addRule(selector, text) {

		var index = cssRules.length;

		if (stylesheet.insertRule) {
			stylesheet.insertRule(selector + "{" + text + "}", index);
		} else {
			stylesheet.addRule(selector, text, index);
		}

		return cssRules[index];
	};


	var setProperty;

	// костыль для IE < 9
	/*if(CSSStyleDeclaration.prototype.setProperty){
					setProperty = function style_setPropetry(style, property, value){
											style.setProperty(property, value, "");
									}
			} else {*/
	setProperty = function (style, property, value) {
		style[
		property.replace(/-([a-z])/g, // можно закешировать replace callback, и регу
		function (founded, firstLetter) {
			return firstLetter.toUpperCase();
		})] = value;
	};
	//}


	// быстро перемножит 2 квадратные матрицы
	// jsperf.com/square-matrix-multiply
	var multiply = function (A, B) {
		var C = [[], []];
		C[0][0] = A[0][0] * B[0][0] + A[0][1] * B[1][0];
		C[0][1] = A[0][0] * B[0][1] + A[0][1] * B[1][1];
		C[1][0] = A[1][0] * B[0][0] + A[1][1] * B[1][0];
		C[1][1] = A[1][0] * B[0][1] + A[1][1] * B[1][1];
		return C;
	};
