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
