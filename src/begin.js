    var
    
        mel = "mel_animation_",
    
        document = window.document,
    
        undefined;
    
        // aka linear easing.
        function noop (x) { return x; }


    //TODO Play-State / Fill-Mode

    var dummy = document.documentElement.style, prefix, lowPrefix;



    var stylesheet = document.createElement("style");
    document.getElementsByTagName("script")[0].parentNode.appendChild(stylesheet);
    stylesheet = stylesheet.sheet || stylesheet.styleSheet;