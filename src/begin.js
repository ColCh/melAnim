    var
    
        mel = "mel_animation_",
    
        document = window.document,

        parseInt = window.parseInt,

        parseFloat = window.parseFloat,
    
        undefined;

    /** @define {boolean} */
    var ENABLE_DEBUG = true;

    var dummy = document.documentElement.style, prefix, lowPrefix;

    var cssNumericValueReg = /(-?\d*\.?\d+)(.*)/;

    var animCount = 0;

    var noop = function () {};

    var cubicBezierReg = /^cubic-bezier\(((?:\s*\d*\.?\d+\s*,\s*){3}\d*\.?\d+\s*)\)$/i;

    var stepsReg = /^steps\((\d+(?:,\s*(?:start|end))?)\)$/i;

    var stylesheet = document.createElement("style");
    document.getElementsByTagName("script")[0].parentNode.appendChild(stylesheet);
    stylesheet = stylesheet.sheet || stylesheet.styleSheet;