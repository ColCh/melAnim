(function (){
	"use strict"; 

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


     // сама ф-я анимирования
    var animate = function animate(target, properties, duration, easing, callback, classicMode){
       
        var i;

        classicMode = classicMode || !prefix;// ДОПИЛИТЬ ДЛЯ СКРОЛЛА

        // для селектора - сам селектор
        var id = typeof target === "string" ? target: '#'+(target.id ? target.id:(target.id="mel_anim_"+Date.now().toString(32)));
        
        var fromRule = addRule(id, " ");
        var fromStyle = fromRule.style;

        var toStyle, currentProperty;
        
        if(!classicMode){
            toStyle = addRule(id, " ").style;
        }

        var dimReg = /(?:([^\(]+)\()?(\d+)([^\)]+)\)?/;

        for(i in properties){
            currentProperty = properties[i];

            setStyle(fromStyle, i, currentProperty.from);
            if(classicMode) {
                // приводим значения свойств в machine-readable вид

                dimReg.exec(currentProperty.from)
                currentProperty.from = +RegExp.$2;
                currentProperty.to = +currentProperty.to.match(dimReg)[2];
                currentProperty.dimension = RegExp.$3;
                if(i === "transform"){
                    currentProperty.transform = RegExp.$1;
                }

            } else {
                setStyle(dummy, i, curretProperty.to);
            }
        }

        instances[id] = {
            rule: fromRule,
            style: fromStyle,
            easing: classicMode ? mathemate(easing):easing,
            complete: callback,
            endingStyle: toStyle,
            duration: classicMode ? parseInt(duration, 10)*1e3:duration,
            properties: properties
        };

        if(classicMode){// передаем управление классической функции 
            return animateClassic(target, id);
        } else {
            // счетчик запуска "перед отрисовкой". Firefox\Opera repaint bug(or feature:)
            i = 0;
            requestAnimFrame(function loop(){
                    i += 1;
                    if(i === 2){
                        // применились начальные стили
                        setStyle(fromStyle, "transition", "all "+duration+" "+easing+" 0s");
                        requestAnimFrame(loop);
                    } else if(i === 3){
                        // применился стиль перехода 
                        toStyle.cssText = dummy.cssText;
                        dummy.cssText = "";
                    } else {
                        requestAnimFrame(loop);
                    }
            });
        }
    };

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

        instance.complete.call(undefined, instance.endingStyle);
    };


     // классическая функция анимирования
    var animateClassic = function(target, id){
        var instance = instances[id], properties = instance.properties, currProp;
        delete instances[id];
        instance.started = Date.now();

        requestAnimFrame(function classicAnimLoop(){
            var progr = (Date.now() - instance.started) / instance.duration;
            if(progr > 1){
                progr = 1;
            }

            var i;
            for(i in properties){
                currProp = properties[i];
                setStyle(instance.style, i, (currProp.transform?currProp.transform+":":"")+((currProp.to - currProp.from)*instance.easing(progr) + currProp.from) + currProp.dimension);
            }

            if(progr < 1){
                requestAnimFrame(classicAnimLoop);
            } else {
               instance.complete.call(undefined, instance.style);
            }
        });
    };

    // превратить cubic-bezier в обычную функцию
    var mathemate = function(easing){
       return function(a){return a*a;}; 
    };


    // установить ч-либо стиль, исп-я хуки по возможности
    var setStyle = function(style, property, value){

        var newProperty, hook = setStyle.hooks[property];

        if(hook){

            if("cached" in hook){

                property = hook["cached"];

            } else {

                newProperty = hook(prefix, value, setProperty, style, styleIsCorrect);
                // если хук поставит свойство сам, он должен вернуть falsy.
                // пример: transform для IE посредством матриц
                if(newProperty/* && !styleIsCorrect(newProperty)*/){
                    property = hook["cached"] = newProperty;
                }
            }
        }

        setProperty.call(style, property, value, "");
    }; 

    animate.styleHooks = setStyle.hooks = {
        "transition": function(prefix, value){
            return (prefix && ("-"+prefix+'-'))+'transition';
        },
        "transform": function(prefix, value, setStyle, style){
            if(value.indexOf(':') === -1){
                setStyle.call(style, (prefix && ("-"+prefix+'-'))+'transform', value);
            } else {
                value = value.split(':');
                setStyle.call(style, "transform", value[0]+"("+value[1]+")");      
            }
            return false;
        }
    };
    // проверит имя css-свойства на корректность
    var styleIsCorrect = function(name){
        var oldDummy = dummy.cssText, res;
        dummy.cssText = "";

        var values = ["", "none", "0"], i; // значения всех типов
        for(i = 0; i in values; i += 1){
            try{ setProperty.call(dummy, name, values[i], ""); } catch(e){}
        }
        res = dummy.cssText.length > 0;
        dummy.cssText = oldDummy;

        return res;
    };
    // добавит правило в конец таблицы стилей и вернёт его
    var addRule =  function addRule(selector, text){
        return cssRules[stylesheet.insertRule ? stylesheet.insertRule(selector+"{"+text+"}", cssRules.length):stylesheet.addRule(selector, text, cssRules.length),cssRules.length-1];
    };

    // костыль для IE < 9
    var setProperty = CSSStyleDeclaration.prototype.setProperty ||
                                function(property, value){ 
                                    this[ 
                                        property.replace(/-([a-z])/g, 
                                                function(founded, firstLetter){ 
                                                    return firstLetter.toUpperCase();
                                                })
                                    ] = value;
                                };


})();


