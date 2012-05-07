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
