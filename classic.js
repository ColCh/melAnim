     // классическая функция анимирования
    var animateClassic = function(target, id){
        var instance = instances[id], properties = instance['properties'], currProp;
        delete instances[id];
        instance.started = Date.now();

        requestAnimFrame(function classicAnimLoop(){
            var progr = (Date.now() - instance['started']) / instance['duration'];
            if(progr > 1){
                progr = 1;
            }

            var i;
            for(i in properties){
                currProp = properties[i];
                setStyle(instance['style'], i, (currProp['transform']?currProp['transform']+":":"")+((currProp['to'] - currProp['from'])*instance['easing'](progr) + currProp['from']) + currProp['dimension']);
            }

            if(progr < 1){
                requestAnimFrame(classicAnimLoop);
            } else {
               instance.complete.call(undefined, instance['style']);
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
