    var melAnim = animate;

    goog.exportProperty(goog.global, 'melAnim', melAnim);

    goog.exportProperty(melAnim, 'Animation', AnimationWrap);

    goog.exportProperty(melAnim, 'css', /**@type {function (!Element, string, string?): (string|undefined)} */(function (element, propertyName, propertyValue) {
        if (goog.isString(propertyValue)) {
            setStyle(element, propertyName, /** @type {string} */(propertyValue));
        } else {
            return getStyle(element, propertyName, true);
        }
    }));

    goog.exportProperty(melAnim, 'now', now);
    goog.exportProperty(melAnim, 'vendorize', getVendorPropName);

    goog.exportProperty(melAnim, 'Ticker', Ticker);

    goog.exportProperty(Ticker, "attach", Ticker.on);
    goog.exportProperty(Ticker, "detach", Ticker.off);
    goog.exportProperty(Ticker, "setFPS", Ticker.setFPS);
    goog.exportProperty(Ticker, "ignoreReflow", Ticker.ignoreReflow);