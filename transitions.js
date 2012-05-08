     // сама ф-я анимирования
    var animate = function animate(target, properties, duration, easing, callback, classicMode){
       
        var i;

        classicMode = classicMode || !prefix;// ДОПИЛИТЬ ДЛЯ СКРОЛЛА

        // id анимации
        var id;

        if(typeof target === "string"){
            id = target; // селектор
        } else {
            if(!target.id){ 
                target.id = "mel_anim_"+Date.now().toString(32);
            }
            id = '#'+target.id;
        }
        

        var fromRule = addRule(id, " ");
        var fromStyle = fromRule.style;

        var toStyle, currentProperty;
        

        if(!easings[easing]){

            if(easing){
                
                var matched = easing.match(easingReg).slice(1);

                for(i = 0; i in matched; i += 1){
                    matched[i] = parseFloat(matched[i], 10);
                }

                easings[easing] = matched;

            } else {
                easing = "linear";
            }
        }
        
        if(classicMode){
            easing = mathemate(easing);
        } else {

            easing = easings[easing];
            easing = "cubic-bezier("+(easing.join(", "))+")";

            toStyle = addRule(id, " ").style;
        }

        

        for(i in properties){
            currentProperty = properties[i];

            setStyle(fromStyle, i, currentProperty['from']);
            if(classicMode) {
                // приводим значения свойств в machine-readable вид

                dimReg.exec(currentProperty['from'])
                currentProperty['from'] = +RegExp.$2;
                currentProperty['to'] = +currentProperty.to.match(dimReg)[2];
                currentProperty['dimension'] = RegExp.$3;
                if(i === "transform"){
                    currentProperty['transform'] = RegExp.$1;
                }

            } else {
                setStyle(dummy, i, currentProperty['to']);
            }
        }

        instances[id] = {
            'rule': fromRule,
            'style': fromStyle,
            'easing': easing,
            'complete': callback,
            'endingStyle': toStyle,
            'duration': classicMode ? parseInt(duration, 10)*1e3:duration,
            'properties': properties
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

        var ruleIndex = Array.prototype.indexOf.call(cssRules, instance['rule']);
        stylesheet.deleteRule(ruleIndex);

        instance.complete.call(undefined, instance['endingStyle']);
    };
