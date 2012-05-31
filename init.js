    
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
