/*-------------------- <begin.js> --------------------*/
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

    // изинги
    var easings = {
        'ease':        [0.25, 0.1, 0.25, 1.0], 
        'linear':      [0.00, 0.0, 1.00, 1.0],
        'ease-in':     [0.42, 0.0, 1.00, 1.0],
        'ease-out':    [0.00, 0.0, 0.58, 1.0],
        'ease-in-out': [0.42, 0.0, 0.58, 1.0]
    };
/*-------------------- </begin.js> --------------------*/

/*-------------------- <init.js> --------------------*/
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
/*-------------------- </init.js> --------------------*/

/*-------------------- <transitions.js> --------------------*/
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
/*-------------------- </transitions.js> --------------------*/

/*-------------------- <classic.js> --------------------*/
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


    var mathemated = {};

    // превратить cubic-bezier в обычную функцию
    var mathemate = function(name){
        if(!mathemated[name]){
            mathemated[name] = function(progress){
                var points = easings[name];
                return calc.apply(this, points.concat(progress));
            };
        }

        return mathemated[name];
    };


    var calc = function(p1x, p1y, p2x, p2y, progress){

        var res;
        
        if(p1x === p1y && p2x === p2y) {

            res = progress;

        } else {
            
            var timeX = getTimeX(progress, p1x, p2x);            
            res = calcBezier(timeX, p1y, p2y);

        }

        return res; 
    }



    // вспомогательные ф-и  
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

    // укоротители
    var A = function (aA1, aA2){ 
        return 1.0 - 3.0 * aA2 + 3.0 * aA1;
    }
    var B = function (aA1, aA2){ 
        return 3.0 * aA2 - 6.0 * aA1;
    }
    var C = function (aA1){
        return 3.0 * aA1;
    }
/*-------------------- </classic.js> --------------------*/

/*-------------------- <css.js> --------------------*/
    // установить ч-либо стиль, исп-я хуки по возможности
    var setStyle = function(style, property, value){

        var newProperty, hook = hooks[property];

        if(hook){

            if('cached' in hook){   // результат выполнения хука закеширован

                property = hook['cached'];

            } else {

                newProperty = hook({
                            'hook': hook,
                            'prefix': prefix,
                            'value': value,
                            'style': style,
                            'setProperty': setProperty
                        });
                // если хук поставит свойство сам, он должен вернуть falsy.
                // пример: transform для IE посредством матриц
                if(newProperty/* && !styleIsCorrect(newProperty)*/){
                    property = hook['cached'] = newProperty;
                }

            }

        }

        setProperty.call(style, property, value, "");
    }; 



    var hooks = animate['styleHooks'] = {};

    // расширяем хуки
    hooks['transition'] = function(info){
        return (info['prefix'] && ("-"+info['prefix']+'-'))+'transition';
    };

    hooks['transform'] = function(info){
            
        if(info.value.indexOf(':') === -1){

            setProperty.call(info.style, (info.prefix && ("-"+info.prefix+'-'))+'transform', info.value);

        } else {

            info.value = info.value.split(':');
            info.hook[info.value[0]](info.style, parseFloat(info.value[1]), info.setProperty, (info.prefix && ("-"+info.prefix+'-'))+'transform');
            
        }

        return false;
    };

    hooks['transform']['rotate'] = function(style, value, setProperty, propertyName){
        if('filters' in style){
            // IE
        } else {

            var rad = value*Math.PI/180;
            var cos = Math.cos(rad).toFixed(2);
            var sin = Math.sin(rad).toFixed(2);

            var newValue = "matrix("+cos+", "+sin+", -"+sin+" ,"+cos+", 0, 0)";

            setProperty.call(style, propertyName, newValue);
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
    if(CSSStyleDeclaration.prototype.setProperty){
        setProperty = function(property, value){
                    this.setProperty(property, value, "");
                }
    } else {
        setProperty = function(property, value){ 
                            this[ 
                                property.replace(/-([a-z])/g,  // можно закешировать replace callback и регу
                                        function(founded, firstLetter){ 
                                            return firstLetter.toUpperCase();
                                        })
                            ] = value;
                        };
    }
/*-------------------- </css.js> --------------------*/

/*-------------------- <end.js> --------------------*/
})();
/*-------------------- </end.js> --------------------*/

