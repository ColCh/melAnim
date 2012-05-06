(function mainClosure(){
	"use strict";
	
    var dummy = document.createElement('p').style;

    // сама ф-я анимирования
    var animate = function animate(target, properties, duration, easing, callback){
       
        var i;

        // для селектора - сам селектор
        var id = typeof target === "string" ? target: '#'+(target.id ? target.id:(target.id="mel_anim_"+Date.now().toString(32)));
        
        var fromRule = addRule(id, " ");
        var fromStyle = fromRule.style;

        var toStyle = addRule(id, " ").style;

        for(i in properties){
            setStyle(fromStyle, i, properties[i].from);
            setStyle(dummy, i, properties[i].to);
        }

        // счетчик запуска "перед отрисовкой". Firefox\Opera bug.
        i = 0;
        
        requestAnimFrame(function loop(){

                i += 1;

                if(i === 2){
                    // применились начальные стили
                    setStyle(fromStyle, "transition", "all "+duration+" "+(easings[easing]||"linear")+" 0s");
                    requestAnimFrame(loop);
                } else if(i === 3){
                    // применился стиль перехода (Chrome bug)
                    toStyle.cssText = dummy.cssText;
                    dummy.cssText = "";
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

    var easings = animate.easings = {
        'in': 'ease-in',
        'out': 'ease-out',
        'in-out': 'ease-in-out',
        'linear': 'cubic-bezier(0.250, 0.250, 0.750, 0.750)',
        'ease-in-quad': 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
        'ease-in-cubic': 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
        'ease-in-circ': 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
        'ease-in-back': 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
        'ease-out-cubic': 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
        'ease-out-circ': 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
        'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
        'ease-out-quad': 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
        'ease-in-out-quart': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
        'ease-in-out-circ': 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
        'ease-in-out-back': 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
    };

    // добавит правило в конец таблицы стилей и вернёт его
    var addRule = function addRule(selector, text){
        return cssRules.item[stylesheet.insertRule ? stylesheet.insertRule(text, cssRules.length):stylesheet.addRule(selector, text, cssRules.length),cssRules.length-1];
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


    // проверит имя css-свойства на корректность
    var styleIsCorrect = function(name){
        var oldDummy = dummy.cssText, res;
        dummy.cssText = "";

        var values = ["", "none", "0"], i; // значения всех типов
        for(i = 0; i in values; i += 1){
            try{ dummy.setProperty(name, values[i], ""); } catch(e){}
        }
        res = dummy.cssText.length > 0;
        dummy.cssText = oldDummy;

        return res;
    };

    // запоминание свойств для setStyle
    var setStyleMemoize = {};

    // установить ч-либо стиль, исп-я хуки по возможности
    var setStyle = function(style, property, value){

        var newProperty;

        if(property in setStyle.hooks){
            if(property in setStyleMemoize){
                property = setStyleMemoize[property];
            } else {
                if(!styleIsCorrect(property)){
                    newProperty = setStyle.hooks[property](prefix, value);
                    // если хук поставит свойство сам, то дальше ничего не делаем
                    // пример: transform для IE посредством матриц
                    if(!newProperty){
                        return;
                    }
                    setStyleMemoize[property] = newProperty;
                    property = newProperty;
                }
            }
        }
        style.setProperty(property, value, "");
    };
    animate.styleHooks = setStyle.hooks = {
        "transition": function(prefix, value){
            return (prefix && ("-"+prefix+'-'))+'transition';
        },
        "transform": function(prefix, value){
            return (prefix && ("-"+prefix+'-'))+'transform';
        }
    };


    // префикс для браузера
    var prefix;

    // собственная таблица стилей
    var stylesheet;
    var cssRules; // её правила

    // соответствие селектору
    var matchesSelector;

    // для добавления конечных стилей после отрисовки
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
                };
            } else if("all" in document){
                matchesSelector = function(selector){
                    // стоит ли проверять здесь, какой браузер сюда попал? >IE 7<
                    var res;
                    var index = stylesheet.addRule(selector, "correct:okay", cssRules.length);

                    for(var i, all = document.all; i in all; i += 1){
                        if(all[i].currentStyle.correct === "okay" && all[i] === this){
                            res = true;
                        }
                    }

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
        window["animate"] = animate;

        return arguments.length && animate.apply(this, arguments);
    };
})();


animate(document.getElementsByTagName("div"), { 
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
        },
        "transform": {
            from: "rotate(9deg)",
            to: "rotate(90deg)"
        }
	},
    '1s',
    'ease-in-out-quart',
	function animateComplete(){
        this.style.backgroundColor = "green";
        this.style.borderColor = "green";
        this.innerHTML = 'Okay :)';
    }
);
