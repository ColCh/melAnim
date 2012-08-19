/*--------------------------- ХУКИ ДЛЯ СТИЛЕЙ ---------------------------------*/
	var hooks = {},
		
		multiply = function (A, B) {
			var C = [[], []];
			C[0][0] = A[0][0] * B[0][0] + A[0][1] * B[1][0];
			C[0][1] = A[0][0] * B[0][1] + A[0][1] * B[1][1];
			C[1][0] = A[1][0] * B[0][0] + A[1][1] * B[1][0];
			C[1][1] = A[1][0] * B[0][1] + A[1][1] * B[1][1];
			return C;
		},

		cache,

		deg2rad = Math.PI / 180,
		
		progid = "progid:",
		prefix = "DXImageTransform.Microsoft.",
		Matrix = prefix + "Matrix",
		Alpha = prefix + "Alpha";

	hooks.transform = function (instance, transforms, easing) {
		var matrix = [ [1, 0], [0, 1]], dx = 0, dy = 0, zoom = 0, math = Math, sin, cos, tan, rad, value;
		var transform, current, needs_correction = false;

		// формируем матрицу трансформации
		for (transform in transforms) {
			current = transforms[transform];
			value = steps._count(current.from, current.to, easing);

			switch (transform) {
				case "rotate":
					needs_correction = true;
					rad = value * deg2rad;
					sin = math.sin(rad);
					cos = math.cos(rad);
					matrix = multiply(matrix, [
						[cos, -sin],
						[sin, cos]
					]);
					break;
				case "translateX":
					dx += value;
					break;
				case "translateY":
					dy += value;
					break;
				case "skewX":
					tan = math.tan(value * deg2rad);

					matrix = multiply(matrix, [
						[1, tan],
						[0, 1]
					]);
					break;
				case "skewY":
					tan = math.tan(value * deg2rad);

					matrix = multiply(matrix, [
						[1, 0],
						[tan], 1]);
					break;
				case "scaleX":
					matrix[0][0] *= value;
					break;
				case "scaleY":
					matrix[1][1] *= value;
					break;
			}
		}

		var target, i = instance.target.length, matrFilter;
		var origWidth, origHeight;
		while(i--) {
			target = instance.target[i];

			if (target.style.filter.indexOf("Matrix") === -1) {
				target.style.filter += " " + progid + Matrix + '(M11=1, M12=0, M21=0, M22=1, SizingMethod="auto expand")';
			}
			matrFilter = target.filters.item(Matrix);
			if (needs_correction) {
				origWidth = target.offsetWidth;
				origHeight = target.offsetHeight;
			}
			matrFilter.M11 = matrix[0][0];
			matrFilter.M12 = matrix[0][1];
			matrFilter.M21 = matrix[1][0];
			matrFilter.M22 = matrix[1][1];
			if (needs_correction) {
				target.style.marginLeft = (target.offsetWidth - origWidth) / 2 + "px";
				target.style.marginTop = (target.offsetHeight - origHeight) / 2 + "px";
			}
		}
	};

	hooks.opacity = function (instance, opacity, easing) {
		var alpha = Math.ceil(steps._count(opacity.from, opacity.to, easing) * 100);
		var target, i;

		i = instance.target.length;
		while(i--) {
			target = instance.target[i];
			if (target.style.filter.indexOf("Alpha") === -1) {
				target.style.filter +=  " " + progid + Alpha + "(Opacity=100)";
			}
			target.filters.item(Alpha).opacity = alpha;
		}
	};
