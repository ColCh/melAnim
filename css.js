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
