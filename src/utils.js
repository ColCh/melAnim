    function type (x) {
        var type = typeof(x);
        if (type === "object") {
            type = Object.prototype.toString.call(x).slice(8, -1).toLowerCase();
        }
        return type;
    }