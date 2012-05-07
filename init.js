    window['animate'] = function init(){
        
        /* --- инициализация --- */
        

        /* проверка поддержки переходов */
        var prefixes = "webkit Moz O ms".split(" ");
        var i, lowPrefix;
        var eventNames = {
            "O": "oTransitionEnd",
            "ms": "MSTransitionEnd",
            "Moz": "transitionend", // <--- ?!
            "webkit": "webkitTransitionEnd"
        }; 
        var html = document.documentElement;

        matchesSelector = html.matchesSelector;

        for(i = 0; i in prefixes; i += 1){

            lowPrefix = prefixes[i].toLowerCase();

            if(!prefix && prefixes[i]+"Transition" in dummy) {
                prefix = prefixes[i];
                document.body.addEventListener(eventNames[prefix], transitionEndHandler, false);
            }
            if(!matchesSelector){
                matchesSelector = html[lowPrefix+"MatchesSelector"]
            }
            if(!requestAnimFrame){
                requestAnimFrame = window[lowPrefix+"RequestAnimationFrame"];
            }
        }


        // костыль для исполнения ф-и после отрисовки
        if(!requestAnimFrame){
            requestAnimFrame = function customRequestAnimationFrame(callback){
                window.scrollBy(0, 0);
                callback();
            };
        }


        // костыль для проверки принадлежности элемента к селектору
        if(!matchesSelector){

            // помощь от библиотеки qsa от devote
            if("qsa" in window){ 

                matchesSelector = function(selector){
                    return qsa.matchesSelector(this, selector);
                };

            } else if("jQuery" in window){

                matchesSelector = function(selector){
                    return $(this).is(selector);
                };

            } else if("querySelector" in document){

                matchesSelector = function(selector){

                    var temp = document.createElement('div');

                    temp.appendChild(this.cloneNode(false));

                    return temp.querySelector(selector) === this;
                    // temp = null ?
                };

            } else if("all" in document){

                matchesSelector = function(selector){
                    // стоит ли проверять здесь, какой браузер сюда попал? >IE 7<
                    var res;
                    var index = stylesheet.addRule(selector, "correct:okay", cssRules.length);

                    res = this.currentStyle['correct'] === "okay";

                    stylesheet.removeRule(index);
                    return res;
                };

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
