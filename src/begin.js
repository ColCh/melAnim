    var
    
        mel = "mel_animation_",
    
        document = window.document,

        parseInt = window.parseInt,

        parseFloat = window.parseFloat,
    
        undefined;

    /** @define {boolean} */
    var ENABLE_DEBUG = true;

    var FRAMES_PER_SECOND = 60;

    var dummy = document.documentElement.style, prefix, lowPrefix;

    var cssNumericValueReg = /(-?\d*\.?\d+)(.*)/;

    var animCount = 0;

    var noop = function () {};

    var cubicBezierReg = /^cubic-bezier\(((?:\s*\d*\.?\d+\s*,\s*){3}\d*\.?\d+\s*)\)$/i;

    var stepsReg = /^steps\((\d+(?:,\s*(?:start|end))?)\)$/i;

    var style = document.createElement("style");

    document.getElementsByTagName("head")[0].parentNode.appendChild(style);

    var stylesheet = style.sheet || style.styleSheet;