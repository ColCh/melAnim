console.profile("a");

(function (){

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

    // поддерживаются ли CSS Transitions
    var supported;

    // костыль для выполнения ф-й перед отрисовкой:w
    var requestAnimationFrame = function(){
        // время последней отрисовки
        var last = 0; 
        // функции будут набираться в массив
        var stack = [];

        requestAnimationFrame = function(callback){
            if(Date.now() - last < 16){
                stack.push(callback);
            } else {

                for(var i = 0; i in stack; i += 1){
                    stack[i]();
                }
                // форсированная отрисовка
                window.scrollBy(0, 0);
                last = Date.now();
            }
        };
        requestAnimationFrame.apply(this, arguments);
    };

    // изинги
    var easings = {
        'ease':        [0.25, 0.10, 0.25, 1.0], 
        'swing':       [0.02, 0.01, 0.47, 1.0],
        'linear':      [0.00, 0.00, 1.00, 1.0],
        'ease-in':     [0.42, 0.00, 1.00, 1.0],
        'ease-out':    [0.00, 0.00, 0.58, 1.0],
        'ease-in-out': [0.42, 0.00, 0.58, 1.0]
    };

    // rotate(90deg) => [rotate, 90, deg]
    // 90px => [undefined, 90, px]
    // skew(10deg, 45deg) => [skew, 10, deg, 45];
    var dimReg = /\s*(?:([^\(]+)\()?(-?\d+)(%|\w*)(?:,\s?(-?\d+)\w*)?\)?/;
    var easingReg = /^cubic\-bezier\(\s*(\-?\d*(?:\.\d+)?)\s*,\s*(\-?\d*(?:\.\d+)?)\s*,\s*(\-?\d*(?:\.\d+)?)\s*,\s*(\-?\d*(?:\.\d+)?)\s*\)$/;
    var transformReg = /(\w+)\(?(\d+)(\w*)(?:,?\s?(\d+)\w*)?\)?/g;

    if("jQuery" in window){
        matchesSelector = function(selector){
            return window["jQuery"]["find"]["matchesSelector"](this, selector); 
        }
    } else if("all" in document){
        matchesSelector = function(selector){
            var res;
            var index = cssRules.length;
            
            stylesheet.addRule(selector, "a:b", index);
            res = this.currentStyle['a'] === "b";
            stylesheet.removeRule(index);

            return res;
        };
    }

    var each = function(what, callback, type){
        var i;
        
        type = type || (what[0]||what.length ? "array":"object");

        if(type === "array") {
            for(i = 0; i in what; i += 1){
                callback(what[i], i, what);
            }
        } else {
            for(i in what){
                if(what.hasOwnProperty(i)){
                    callback(what[i], i, what);
                }
            }
        }
    };
