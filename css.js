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
