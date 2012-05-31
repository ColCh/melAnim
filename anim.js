console.profile("a");

(function (){

    // на чём тестируем имена CSS свойств 
    var dummy = document.createElement('p').style;

    // информация о запущенных анимациях
    var instances = {};

    // префикс для браузера
    var prefix;

    // собственная таблица стилей
    var stylesheet;
    var cssRules; // её правила

    // соответствие селектору
    var matchesSelector;

    // поддерживаются ли CSS Transitions
    var supported;

    // костыль для выполнения ф-й перед отрисовкой:w
    var requestAnimationFrame = function(){
        // время последней отрисовки
        var last = 0; 
        // функции будут набираться в массив
        var stack = [];

        requestAnimationFrame = function(callback){
            if(Date.now() - last < 16){
                stack.push(callback);
            } else {

                for(var i = 0; i in stack; i += 1){
                    stack[i]();
                }
                // форсированная отрисовка
                window.scrollBy(0, 0);
                last = Date.now();
            }
        };
        requestAnimationFrame.apply(this, arguments);
    };

    // изинги
    var easings = {
        'ease':        [0.25, 0.10, 0.25, 1.0], 
        'swing':       [0.02, 0.01, 0.47, 1.0],
        'linear':      [0.00, 0.00, 1.00, 1.0],
        'ease-in':     [0.42, 0.00, 1.00, 1.0],
        'ease-out':    [0.00, 0.00, 0.58, 1.0],
        'ease-in-out': [0.42, 0.00, 0.58, 1.0]
    };

    // rotate(90deg) => [rotate, 90, deg]
    // 90px => [undefined, 90, px]
    // skew(10deg, 45deg) => [skew, 10, deg, 45];
    var dimReg = /\s*(?:([^\(]+)\()?(-?\d+)(%|\w*)(?:,\s?(-?\d+)\w*)?\)?/;
    var easingReg = /^cubic\-bezier\(\s*(\-?\d*(?:\.\d+)?)\s*,\s*(\-?\d*(?:\.\d+)?)\s*,\s*(\-?\d*(?:\.\d+)?)\s*,\s*(\-?\d*(?:\.\d+)?)\s*\)$/;
    var transformReg = /(\w+)\(?(\d+)(\w*)(?:,?\s?(\d+)\w*)?\)?/g;

    if("jQuery" in window){
        matchesSelector = function(selector){
            return window["jQuery"]["find"]["matchesSelector"](this, selector); 
        }
    } else if("all" in document){
        matchesSelector = function(selector){
            var res;
            var index = cssRules.length;
            
            stylesheet.addRule(selector, "a:b", index);
            res = this.currentStyle['a'] === "b";
            stylesheet.removeRule(index);

            return res;
        };
    }

    var each = function(what, callback, type){
        var i;
        
        type = type || (what[0]||what.length ? "array":"object");

        if(type === "array") {
            for(i = 0; i in what; i += 1){
                callback(what[i], i, what);
            }
        } else {
            for(i in what){
                if(what.hasOwnProperty(i)){
                    callback(what[i], i, what);
                }
            }
        }
    };
    
/*--------------------------- ИНИЦИАЛИЗАЦИЯ ---------------------------------*/
    window['animate'] = function init(){

        /* проверка поддержки */
        var prefixes = {
            "O": "oTransitionEnd",
            "ms": "MSTransitionEnd",
            "Moz": "transitionend",
            "webkit": "webkitTransitionEnd"
        }; 

        var html = document.documentElement;

        // есть нативная реализация, без префиксов
        matchesSelector = html.matchesSelector || matchesSelector;
        requestAnimationFrame = window.requestAnimationFrame || requestAnimationFrame;

        each(prefixes, function iterate_prefixes(eventName, i){
            lowPrefix = i.toLowerCase();

            matchesSelector = html[lowPrefix+"MatchesSelector"] || matchesSelector;
            requestAnimationFrame = window[lowPrefix+"RequestAnimationFrame"] || requestAnimationFrame;
            
            if(i+"Transition" in dummy) {
                prefix = i;
                document.body.addEventListener(eventName, transitionEndHandler, false);
                supported = true;
            }
        }, "object");

        // префикс для CSS3 правил - тут определяем наугад.
        if(!prefix){
            if("globalStorage" in window){
                prefix = "Moz";
            } else if("opera" in window){
                prefix = "O";
            } else if(/webkit/i.test(navigator.userAgent)){
                prefix = "webkit";
            } else if("\v" == "\v"){
                prefix = "ms";
            }
        }

        /* добавляем свой <style> */
        var style = document.createElement("style");
        document.body.appendChild(style);
        stylesheet = style.sheet || style.styleSheet;
        cssRules = stylesheet.cssRules || stylesheet.rules;

        
        /* вызов оригинальной функции анимирования */
        window['animate'] = animate;

        return arguments.length && animate.apply(this, arguments);
    };
/*--------------------------- ГЛАВНАЯ ФУНКЦИЯ АНИМАЦИИ ---------------------------------*/
    var animate = function animate(target, properties, duration, easing, callback, classicMode){
       
        var
            i,
            id,
            fromRule,
            fromStyle, 
            toStyle,
            curr;
        
        classicMode = classicMode === undefined ? !supported:classicMode;
        
        // определяем ид анимации
        if(typeof target === "string"){
            id = target; // селектор
        } else {
            if(!target.id){ 
                target.id = "mel_anim_"+Date.now().toString(32);
            }
            id = '#'+target.id;
        }

        fromRule = addRule(id, " ");
        fromStyle = fromRule.style;

        if(!easings[easing]){
            // передана cubic-bezier
            if(easingReg.test(easing)){ 
                easings[easing] = easing;
            } else {
                easing = "linear";
            }
        }

        each(properties, function iterate_properties(current, propertyName){
                setStyle(fromStyle, propertyName, current["from"]);
                if(!classicMode){
                    setStyle(dummy, propertyName, current["to"]);
                }
        }, "object");

        if(classicMode){
            return animateClassic(target, id, fromStyle, properties, duration, easing, callback);
        }

        easing = easings[easing];

        if(typeof easing !== "string"){
            easing = "cubic-bezier("+easing.join(", ")+")";
        }

        toStyle = addRule(id, " ").style;

        instances[id] = {
            fromRule: fromRule,
            complete: callback,
            duration: duration
        };

        requestAnimationFrame(function(){

            setStyle(toStyle, "transition", "all "+duration+" "+easing+" 0s");

            requestAnimationFrame(function(){
                // применился начальный стиль
                // применяем опции перехода
                toStyle.cssText += ";"+dummy.cssText;
                dummy.cssText = "";
            });

        });
    };

    // для делегирования всплывающих событий конца анимации
    var transitionEndHandler = function handler(event){

        var id, instance;

        for(id in instances){
            if(event.elapsedTime+'s' === instances[id].duration && matchesSelector.call(event.target, id)) {

                instance = instances[id];
                delete instances[id];

                var ruleIndex = Array.prototype.indexOf.call(cssRules, instance.fromRule);
                stylesheet.deleteRule(ruleIndex);

                instance.complete();

                break;
            }
        }
    };
/*--------------------------- КЛАССИЧЕСКАЯ АНИМАЦИЯ ---------------------------------*/
    var animateClassic = function(target, id, fromStyle, properties, duration, easing, callback){

        var instance = {};

        properties = normalizeProperties(properties);

        console.profileEnd("a");
    };


    var classicAnimLoop = function(){

        var instance = this, currProp;

        var progr = (Date.now() - instance['started']) / instance['duration'];

        if(progr > 1){
            progr = 1;
        }

        var i, currentValue;

        for(i in instance['properties']){

            currProp = instance['properties'][i];

            currentValue = (currProp.to - currProp.from) * instance.easing(progr) + currProp.from + currProp.dimension

            if(currProp.transform){
                setStyle(instance.style, i, currProp.transform+"("+ currentValue +")");
            } else {
                setStyle(instance.style, i, currentValue);
            }
        }


        if(progr < 1){
            requestAnimFrame(instance['step'], instance, []);
        } else {
            delete instances[ instance['id'] ];
            instance['complete'].call(undefined, instance['style']);
        }

    };

    // превратит объект анимируемых свойств в machine-readable
    var normalizeProperties = function(properties){
    
        var res = {};
        
        each(properties, function normalize_properties(info, property){

            var member = {}, matched;

            if(property === "transform") {

                each(["from", "to"], function iterate_directions(direction){
                    each(info[direction].split(/\s(?!\d)/), function iterate_transforms(transformMember){
                        var curr;
                        matched = transformMember.match(dimReg);
                        if(matched[4]) {
                            each(["X", "Y"], function iterate_axis(axis, i){
                                curr = member[matched[1]+axis];
                                if(!curr){
                                    curr = member[matched[1]+axis] = {};
                                }
                                curr[direction] = matched[i *2 + 2];
                                curr.dim = matched[3];
                            });
                        } else {
                            curr = member[matched[1]];
                            if(!curr){
                                curr = member[matched[1]] = {};
                            }
                            curr[direction] = matched[2];
                            curr.dim = matched[3];
                        }
                        
                    });
                });
            
            } else {
                matched = info["from"].match(dimReg);
                member.from = matched[2];
                member.dim = matched[3];
                member.to = info["to"].match(dimReg)[2];
            }

            res[property] = member;
            
        });

        return res;
    };

    // превратить cubic-bezier в обычную функцию
    var mathemate = function(name){
        if(!easings[name]['mathemated']){
            easings[name]['mathemated'] = function(progress){
                var points = easings[name];
                return calc.apply(0, points.concat(progress));
            };
        }

        return easings[name]['mathemated'];
    };


    // вычислить значение кубической кривой привремени progress ( e [0;1] )
    var calc = function(p1x, p1y, p2x, p2y, progress){

        var res;
        
        if(p1x === p1y && p2x === p2y) {

            res = progress;

        } else {
            
            var timeX = getTimeX(progress, p1x, p2x);            
            res = calcBezier(timeX, p1y, p2y);

        }

        return res; 
    };



    // вспомогательные ф-и для calc  
    var getTimeX = function(progr, p1x, p2x){
                
        var timeX = progr;

        for(var i = 0; i < 4; ++i) {

            var currentslope = slope(timeX, p1x, p2x);

            if(currentslope == 0.0) {
                return timeX;
            }

            var currentx = calcBezier(timeX, p1x, p2x) - progr;

            timeX -= currentx / currentslope;
        }

        return timeX;
    
    };
    var calcBezier = function(progr, px1, px2) {
        return (  ( A(px1,px2)*progr + B(px1,px2) )*progr + C(px1)  )*progr;
    }
    var slope = function(progr, px1, px2) {
        return 3.0*A(px1, px2)*progr*progr + 2.0*B(px1, px2)*progr + C(px1);
    }

    // укоротители для calcBezier
    var A = function (aA1, aA2){ 
        return 1.0 - 3.0 * aA2 + 3.0 * aA1;
    }
    var B = function (aA1, aA2){ 
        return 3.0 * aA2 - 6.0 * aA1;
    }
    var C = function (aA1){
        return 3.0 * aA1;
    }

    // установить ч-либо стиль, исп-я хуки по возможности
    var setStyle = function(style, property, value){

        var newProperty, hook = hooks[property];

        if(hook){

            if(hook.cached){   
                // результат выполнения хука закеширован
                property = hook.cached;

            } else {

                newProperty = hook(prefix, hook, value, style);

                // если хук поставит свойство сам, он должен вернуть falsy.
                if(newProperty){
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
    hooks.transition = function(prefix){
        var res = "transition";

        if(!styleIsCorrect(res)){
            res = '-'+prefix+'-'+res;
        }
        
        return res;
    };

    hooks.transform = function(prefix, hook, value, style){
            
        // результирующая матрица трансформации
        var resultMatrix = [ [1, 0], [0, 1] ];// обычное состояние
        var dx = 0, dy = 0; // смещение по координатам

        var deg2rad = Math.PI/180;

        for(var curr, currMatrix, transformReg = /\s*\w+\((?:,?\s?\d+\w*)+\)?/g; curr = transformReg.exec(value); ){
            curr = dimReg.exec(curr);
            switch(curr[1]){
                case "rotate":

                    var rad = curr[2]*deg2rad;
                    var cos = Math.cos(rad);
                    var sin = Math.sin(rad);

                    currMatrix = [ [cos, sin], [-sin, cos] ];
                    resultMatrix = multiply(resultMatrix, currMatrix);

                    // вычислить dx,dy для IE
                break;
                case "scale":
                    currMatrix = [ [ curr[2], 0 ], [ curr[4], 0 ] ];
                    resultMatrix = multiply(resultMatrix, currMatrix);
                break;
                case "skew":
                    var rad, tan;
                    // X
                    rad = curr[2]*deg2rad;
                    tan = Math.tan(rad);
                    currMatrix = [ [ 1, 0 ], [tan, 1] ];
                    resultMatrix = multiply(resultMatrix, currMatrix);

                    // Y
                    if(curr[4]){
                        rad = curr[4]*deg2rad;
                        tan = Math.tan(rad);
                        currMatrix = [ [ 1, tan ], [0, 1] ];
                        resultMatrix = multiply(resultMatrix, currMatrix);
                    }
                break;
                case "translate":
                    dx = curr[2];
                    dy = curr[4];
                break;
                default: /*nothing*/;
            }
        }

        var val, propertyName;

        if(styleIsCorrect("filter")){ 
            // начнём с IE
            propertyName = "filter";
            val = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',"+
                  "M11="+resultMatrix[0][0]+", M12="+resultMatrix[0][1]+","+
                  "M21="+resultMatrix[1][0]+", M22="+resultMatrix[1][1]+
                  "Dx="+dx+", Dy="+dy+";";
        } else {
            propertyName = "transform";

            if(!styleIsCorrect(propertyName)){
                propertyName = "-"+prefix+"-"+propertyName;
            }

            val = "matrix("+resultMatrix[0].join(", ")+", "+resultMatrix[1].join(", ")+", "+dx+", "+dy+")";
        }

        setProperty(style, propertyName, val);
    };



    // проверит имя css-свойства на корректность с помощью CSS-движка
    var styleIsCorrect = function(name, value){

        var oldDummy = dummy.cssText, res, values, i;

        dummy.cssText = "";

        values = value === undefined ? ["", "none", "0"]:[value], i; 

        for(i = 0; i in values; i += 1){
            try{ setProperty.call(dummy, name, values[i], ""); } catch(e){}
        }

        res = dummy.cssText.length > 0; // неверный стиль не попадёт сюда.
        dummy.cssText = oldDummy;

        return res;
    };



    // добавит правило в конец таблицы стилей и вернёт его
    var addRule =  function addRule(selector, text){

        var index = cssRules.length;

        if(stylesheet.insertRule){
            stylesheet.insertRule(selector+"{"+text+"}", index);
        } else{
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
        setProperty = function(style, property, value){ 
                             style[ 
                                property.replace(/-([a-z])/g,  // можно закешировать replace callback, и регу
                                        function(founded, firstLetter){ 
                                            return firstLetter.toUpperCase();
                                        })
                            ] = value;
                        };
    //}


    // быстро перемножит 2 квадратные матрицы 
    // jsperf.com/square-matrix-multiply
    var multiply = function(A,B){
        var C = [ [], [] ];
        C[0][0] = A[0][0]*B[0][0] + A[0][1]*B[1][0];
        C[0][1] = A[0][0]*B[0][1] + A[0][1]*B[1][1];
        C[1][0] = A[1][0]*B[0][0] + A[1][1]*B[1][0];
        C[1][1] = A[1][0]*B[0][1] + A[1][1]*B[1][1];
        return C;
    };
})();
