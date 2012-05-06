(function mainClosure(){
	"use strict";
	
    var dummy = document.createElement('p').style;

    // сама ф-я анимирования
    var animate = function animate(target, properties, duration, callback){
       
        var i;

        // для селектора - сам селектор
        var id = typeof target === "string" ? target: '#'+(target.id ? target.id:(target.id="mel_anim_"+Date.now().toString(32)));

        var fromRule = addRule(id+" { }");
        var fromStyle = fromRule.style;

        var toStyle = addRule(id+" { }").style;

        for(i in properties){
            fromStyle.setProperty(i, properties[i].from, "");
            dummy.setProperty(i, properties[i].to, "");
        }

        // счетчик запуска "перед перерисовкой". Firefox\Opera bug.
        i = 0;
        
        requestAnimFrame(function loop(){

                i += 1;

                if(i === 2){
                    // применились начальные стили
                    fromStyle[transitionStyleProp] = "all "+duration+" linear 0s";
                    requestAnimFrame(loop);
                } else if(i === 3){
                    // применился стиль перехода (Chrome bug)
                    toStyle.cssText = dummy.cssText;
                } else {
                    requestAnimFrame(loop);
                }

        });

        instances[id] = {
            rule: fromRule,
            style: fromStyle,
            complete: callback
        };

    };
    
    // добавит правило в конец таблицы стилей и вернёт его
    var addRule = function addRule(text){
        return cssRules.item(stylesheet.insertRule(text, cssRules.length));
    };

    


    // информация о запущенных анимациях
    var instances = {};

    // для делегирования всплывающих событий конца анимации
    var transitionEndHandler = function handler(event){

        var id, instance;

        for(id in instances){
            if(matchesSelector.call(event.target, id)) {
                instance = instances[id];
                delete instances[id];
                break;
            }
        }
        
        if(!instance){
            return;
        }

        var ruleIndex = Array.prototype.indexOf.call(cssRules, instance.rule);
        stylesheet.deleteRule(ruleIndex);

        instance.complete.call(event.target, event);
    };





    // свойство для перехода
    var transitionStyleProp;

    // собственная таблица стилей
    var stylesheet;
    var cssRules;

    // соответствие селектору (native)
    var matchesSelector;

    // для добавления конечный стилей после отрисовки
    var requestAnimFrame = window.requestAnimationFrame;

	window["animate"] = function init(){
        
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

            if(!transitionStyleProp && prefixes[i]+"Transition" in dummy) {
                transitionStyleProp = prefixes[i]+"Transition";
                document.body.addEventListener(eventNames[prefixes[i]], transitionEndHandler, false);
		    }
            if(!matchesSelector){
                matchesSelector = html[lowPrefix+"MatchesSelector"]
            }
            if(!requestAnimFrame){
                requestAnimFrame = window[lowPrefix+"RequestAnimationFrame"];
            }
        }

        if(!requestAnimFrame){
            requestAnimFrame = function customRequestAnimationFrame(callback){

                document.body.setAttribute("custom", Date.now());

                setTimeout(function customRAFTimeout(){
                        callback();
                        document.body.removeAttribute("custom");
                }, 1);
            };
        }

        
        /* добавляем свой <style> */
        var style = document.createElement("style");

        document.body.appendChild(style);

        stylesheet = style.sheet;

        cssRules = stylesheet.cssRules;

        /* вызов оригинальной функции анимироания */
        window["animate"] = animate;

        return arguments.length && animate.apply(this, arguments);
    };
})();


animate(document.querySelector("div"), { 
		"top" : {
            from: "45%",
            to: "50%"
        },
        "left": {
            from: "45%",
            to: "50%"
        },
        "border-width": {
            from: "30px",    
            to: "20px"
        },
        "width": {
            from: "100px",
            to: "200px"
        },
        "height": {
            from: "5px", 
            to: "100px"
        },
        "font-size": {
            from: "10px", 
            to: "40px"
        }
	},
    '1s',
	function animateComplete(){
        this.style.backgroundColor = "green";
        this.style.borderColor = "green";
        this.innerHTML = 'Okay :)';
    }
);
