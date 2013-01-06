    var DEFAULT_DURATION = "400ms";
    var DEFAULT_EASING = "ease";
    var DEFAULT_FILLMODE = "forwards";
    var DEFAULT_DELAY = 0;
    var DEFAULT_DIRECTION = "normal";
    var DEFAULT_ITERATIONCOUNT = 1;
    var DEFAULT_HANDLER = noop;
    var DEFAULT_PLAYINGSTATE = "paused";

    /*
     * Конструктор анимаций.
     * @constructor
     *
     * @param {(Element|Array.<Element>)} elements Элемент(ы) для анимирования.
     * @param {object} keyframes Свойства для анимирования.
     * @param {string=} duration Длительность анимации. По-умолчанию : "400ms".
     * @param {string=} easing Как будут прогрессировать значения свойств. По-умолчанию : "linear".
     * @param {function=} complete Функция, которая исполнится после завершения анимации. По-умолчанию : "noop".
     */
    function Animation (elements, keyframes, duration, easing, complete) {

        var animationName,
            classicMode,
            direction,
            start,
            iteration,
            iterationCount,
            delay,
            fillMode,
            start,
            iteration,
            state,

            lowLevelProcedure,
            belongsToZeroOne,
            aliases;

        // если передан объект с расширенными опциями; разворачиваем его.
        if (type(duration) === "object" && arguments.length === 3) {
            classicMode = duration["classicMode"];
            direction = duration["direction"];
            start = duration["start"];
            iteration = duration["iteration"];
            iterationCount = duration["iterationCount"];
            delay = duration["delay"];
            fillMode = duration["fillMode"];
            complete = duration["complete"];
            easing = duration["easing"];
            duration = duration["duration"];
        }

        classicMode = classicMode || !CSSANIMATIONS_SUPPORTED;



        // имя анимации
        animationName = generateId();



        // создание анимации через конструктор предполагает ручной запуск
        state = DEFAULT_PLAYINGSTATE;



        // проверка входных данных
        elements = type.element(elements) ? [elements]:slice(elements);



        duration = parseTimeString(duration);

        // время не может быть отрицательным
        // и должно быть числом
        if (duration < 0 || isNaN(duration)) {
            duration = DEFAULT_DURATION;
        }



        if (type.func(easing)) {
            classicMode = true;
        } else {
            // превращаем easing в массив точек \ аргументов.

            // не передана.
            easing = easing || DEFAULT_EASING;
            // передан алиас
            aliases = classicMode ? cubicBezierAliases:cubicBezierApproximations;
            easing = aliases[easing] || easing;

            // строка CSS timing-function
            if (type(easing) === "string") {

                easing = cubicBezierReg.exec(easing) || stepsReg.exec(easing) || "";
                easing = easing.slice(1).split(",");

                if (easing.length === 4) {
                    // cubic bezier.
                    // проверяем Х и Y точек

                    easing = eachReplace(easing, parseFloat);

                    belongsToZeroOne = function (num) { return inRange(num, 0, 1, true); };

                    if (!belongsToZeroOne(easing[0]) || isNaN(easing[1]) || !belongsToZeroOne(easing[2]) || isNaN(easing[3])) {
                        easing = aliases[DEFAULT_EASING];
                    }

                } else if (easing.length === 1 || easing.length === 2) {
                    // staircase
                    easing[0] = parseInt(easing[0], 10);

                    if (isNaN(easing[0]) || easing[0] <= 0) {
                        easing = aliases[DEFAULT_EASING];
                    } else {
                        easing[1] = easing[1] || "end";
                    }

                }

            }
        }



        fillMode = toLowerCase(fillMode || "");
        fillMode = fillMode in fillmodes ? fillMode:DEFAULT_FILLMODE;



        direction = toLowerCase(direction || "");
        direction = direction in directions ? direction:DEFAULT_DIRECTION;



        delay = parseTimeString(delay);

        if (isNaN(delay)) {
            delay = DEFAULT_DELAY;
        }



        iterationCount = type.undefined(iterationCount) ? DEFAULT_ITERATIONCOUNT:iterationCount;
        iterationCount = iterationCounts[toLowerCase(iterationCount)] || iterationCount;
        iterationCount = parseInt(iterationCount, 10);
        iterationCount = iterationCount > 0 && !isNaN(iterationCount) ? iterationCount:DEFAULT_ITERATIONCOUNT;



        complete = type.func(complete) ? complete:DEFAULT_HANDLER;
        start = type.func(start) ? complete:DEFAULT_HANDLER;
        iteration = type.func(iteration) ? complete:DEFAULT_HANDLER;



        lowLevelProcedure = classicMode ? animateClassic:animateCSSAnimation;

        return lowLevelProcedure(animationName, elements, keyframes, duration, easing, fillMode, delay, direction, iterationCount, state, complete, start, iteration);
    };
