/**
 * Externs for CSS Keyframes DOM extensions.
 *
 * @author melky ( colch@ro.ru )
 * @externs
 * */

/**
 * @type {number}
 */
CSSRule.KEYFRAMES_RULE = 7;

/**
 * @type {number}
 */
CSSRule.KEYFRAME_RULE = 8;

/**
 * @constructor
 * @extends {CSSRule}
 * */
function CSSKeyframeRule () {}

/**
 * @type {string}
 * */
CSSKeyframeRule.prototype.keyText;

/**
 * @type {CSSStyleDeclaration}
 * */
CSSKeyframeRule.prototype.style;

/**
 * @constructor
 * @extends {CSSRule}
 * */
function CSSKeyframesRule () {}

/**
 * @type {string}
 * */
CSSKeyframesRule.prototype.name;

/**
 * @type {CSSRuleList}
 * */
CSSKeyframesRule.prototype.cssRules;

/**
 * @param {string} rule
 * @return {undefined}
 * */
CSSKeyframesRule.prototype.appendRule = CSSKeyframesRule.prototype.insertRule = function (rule) {};

/**
 * @param {string} key
 * @return {undefined}
 * */
CSSKeyframesRule.prototype.deleteRule = CSSKeyframesRule.prototype.removeRule = function (key) {};

/**
 * @param {string} key
 * @return {CSSKeyframeRule}
 * */
CSSKeyframesRule.prototype.findRule = function (key) {};

/**
 * @constructor
 * @extends {Event}
 * */
function AnimationEvent () {};

/** @type {string} */
AnimationEvent.prototype.animationName;

/** @type {number} */
AnimationEvent.prototype.elapsedTime;

/**
 * @param {string} typeArg
 * @param {boolean} canBubbleArg
 * @param {boolean} cancelableArg
 * @param {string} animationNameArg
 * @param {number} elapsedTimeArg
 *
 * @return {undefined}
 * */
AnimationEvent.prototype.initAnimationEvent = function (typeArg, canBubbleArg, cancelableArg, animationNameArg, elapsedTimeArg) {};
