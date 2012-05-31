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
        });

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
