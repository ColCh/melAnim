module("Utils Tests");

test('Unique generators', function () {
    ok(uuid() !== uuid(), 'uuid two calls inequality');
    ok(generateId() !== generateId(), 'generateId two calls inequality');
    strictEqual(typeof generateId(), 'string', 'generateId returned value type check');
});

test("linearSearch", function() {

    equal( linearSearch([ 'this', 'is', 'testing', 6, 'array', 'for', 'linearSearch' ], function (arrayElement, index, array) {
        return arrayElement === 6;
    }), 3, "normal search");

    equal( linearSearch([ ], new Function), -1, "search in blank array with blank callback");

    var desiredArray = ['foo'];

    linearSearch(desiredArray, function (arrayElement, index, array) {
        strictEqual(arrayElement, 'foo', 'check first arg in callback');
        strictEqual(index, 0, 'check second arg in callback');
        strictEqual(array, array, 'check third arg in callback');
    });

});

test("getVendorPropName", function() {

    strictEqual(getVendorPropName('width', false), 'width', 'regular property lookup in style');
    ok(getVendorPropName('margin-top', false) in document.documentElement.style, 'property with a hyphen lookup in style');
    strictEqual(getVendorPropName('' + +new Date(), false), '', 'non-existent property lookup in style');

    window.gvpn = 'gvpntest';
    strictEqual(getVendorPropName('gvpn', true), 'gvpn', 'regular property lookup in global');
    try { delete window.gvpn; } catch (e) { window.gvpn = null; }

    var dummyPropertyPrefix = 'unitTest';
    vendorPrefixes.push(dummyPropertyPrefix);
    window[dummyPropertyPrefix + 'Randomprop'] = 'customvalue';
    strictEqual(getVendorPropName(dummyPropertyPrefix + '-' + 'randomprop', true), dummyPropertyPrefix + 'Randomprop', 'regular property lookup in global with prefix check');
    try { delete window[dummyPropertyPrefix + 'Randomprop']; } catch (e) { window[dummyPropertyPrefix + 'Randomprop'] = null; }

});

asyncTest("now", function () {
    expect(1);

    var startTimeStamp = now();
    var delay = 50;
    var inaccuracyCoef = 0.05;

    setTimeout(function () {
        var endTimeStamp = now();
        var timeDiff = endTimeStamp - startTimeStamp;
        var difference = timeDiff / delay;
        ok(difference >= 1 && difference <= 1.5, 'time difference check with inaccuracy ( ' + timeDiff + ' vs ' + delay + ')');
        start();
    }, delay);
});

test('sortArray', function () {

    var desiredArray = new Array(10);
    var i = desiredArray.length;
    while ( i-->0 ) desiredArray[i] = Math.random() * 1e6 | 0;

    sortArray(desiredArray, function (arrayFirstElement, arraySecondElement) {
        return arrayFirstElement - arraySecondElement;
    });

    var every = false;
    i = desiredArray.length;
    while ( i-->1 ) {
        every = desiredArray[i] - desiredArray[i - 1] >= 0;
        if (!every) break;
    }

    ok(every, 'regular sorting array with random integers');

});

test('round', function () {
    strictEqual(round(4, 0), 4, 'integer rounding');
    strictEqual(round(4.5, 0), 5, 'float rounding');
    strictEqual(round(4.123456, 5), 4.12346, 'precision rounding');
});

test('blend', function () {
    var from = [0],
        to = [1],
        current = [],
        progress = 0.5,
        roundDigits = 1;

    ok(blend(from, to, progress, current, roundDigits), 'valueIsChanged (is changed)');
    ok(!blend(from, to, progress, current, roundDigits), 'valueIsChanged (is not changed)');
    strictEqual(current[0], 0.5, 'check result value');
    blend(from, to, 0.5555, current, 2);
    strictEqual(current[0], 0.56, 'check rounding (precision)');
    blend(from, to, 0.5555, current, 0);
    strictEqual(current[0], 1, 'check rounding (to integer)');
});

test('trim', function () {
    strictEqual(trim(''), '', 'blank string');
    strictEqual(trim('   '), '', 'string consists of spaces');
    strictEqual(trim(' foo'), 'foo', 'spaces in beginning');
    strictEqual(trim('foo '), 'foo', 'spaces in end');
    strictEqual(trim(' foo '), 'foo', 'spaces in both');
    strictEqual(trim('    foo  '), 'foo', 'tabs');
    strictEqual(trim('    foo   bar  '), 'foo   bar', 'tabs and spaces inside string');
});

test('camelCase', function () {
    strictEqual(camelCase('foo-bar'), 'fooBar', 'regular string with hyphen in the middle');
});

test('removeSpaces', function () {
    strictEqual(removeSpaces('   foo  bar  baz  '), 'foobarbaz', 'tabs and spaces removal');
});

test('[set/get]Style', function () {
    // It's using getVendorPropName which is tested already

    var element = document.createElement('div');

    document.body.appendChild(element);

    element.style.fontSize = '16px';

    // setStyle
    setStyle(element, 'width', '1em')
    strictEqual(element.style.width, '1em', 'test setting pixel value');

    // getStyle
    strictEqual(getStyle(element, 'width', false), '1em', 'test getting value from style');

    // getStyle from computed
    var computedValue = getStyle(element, 'width', true);
    ok(computedValue === '16px' || computedValue === '1em', 'test getting value from computed style');

    document.body.removeChild(element);
});

test('toNumericValue', function () {
    var element = document.createElement('div');

    deepEqual(toNumericValue(element, 'width', '', 'width'), [], 'convert null value to pixels');

    element.style.width = 'auto';

    deepEqual(toNumericValue(element, 'width', 'auto', 'width'), [ 0 ], 'convert initial "auto" value to pixels on detached element');

    document.body.appendChild(element);
    element.style.position = 'absolute';
    element.style.paddingLeft = '5px';

    deepEqual(toNumericValue(element, 'width', 'auto', 'width'), [ 5 ], 'convert initial "auto" value to pixels on attached element');

    deepEqual(toNumericValue(element, 'width', 5, 'width'), [ 5 ], 'passing already numeric value');
    deepEqual(toNumericValue(element, 'width', '5px', 'width'), [ 5 ], 'passing absolute value (px)');
    deepEqual(toNumericValue(element, 'width', '-5px', 'width'), [ -5 ], 'passing negative absolute value (px)');
    deepEqual(toNumericValue(element, 'width', '5', 'width'), [ 5 ], 'passing absolute value (unitless)');

    var elementWrapper = document.createElement('div');
    document.body.appendChild(elementWrapper);
    elementWrapper.appendChild(element);

    element.style.cssText = '';
    elementWrapper.style.width = '100px';

    deepEqual(toNumericValue(element, 'width', '1%', 'width'), [ 1 ], 'passing positive relative value (percent)');
    deepEqual(toNumericValue(element, 'width', '-1%', 'width'), [ -1 ], 'passing negative relative value (percent)');

    element.style.fontSize = '16px';

    deepEqual(toNumericValue(element, 'width', '1em', 'width'), [ 16 ], 'passing positive relative value (em)');
    deepEqual(toNumericValue(element, 'width', '-1em', 'width'), [ -16 ], 'passing negative relative value (em)');

    elementWrapper.style.fontSize = '16px';
    element.style.fontSize = '2em';

    deepEqual(toNumericValue(element, 'font-size', '2em', 'fontSize'), [ 32 ], 'font-size (em)');
    deepEqual(toNumericValue(element, 'font-size', '1em', 'fontSize'), [ 16 ], 'passing positive relative value to font-size (em)');
    deepEqual(toNumericValue(element, 'font-size', '-1em', 'fontSize'), [ -16 ], 'passing negative relative value to font-size (em)');

    elementWrapper.parentNode.removeChild(elementWrapper);
});

// toStringValue remains untested

test('toDeg', function () {
    // W3C: ‘90deg’ or ‘100grad’ or ‘0.25turn’ or approximately ‘1.570796326794897rad’.
    strictEqual(toDeg('90deg'), 90, 'check degrees to numeric degree conversion');
    ok(equalsAppox(toDeg('100grad'), 90), 'check grads to numeric degree conversion(with inaccuracy)');
    ok(equalsAppox(toDeg('0.25turn'), 90), 'check turns to numeric degree conversion(with inaccuracy)');
    ok(equalsAppox(toDeg('1.570796326794897rad'), 90), 'check rads to numeric degree conversion (with inaccuracy)');
});

test('addRule', function () {
    var testElement = document.createElement('div');
    testElement.id = 'testing-addRule';
    document.body.appendChild(testElement);

    var rule = addRule('#testing-addRule');
    rule.style.width = '9px';

    // getStyle already tested
    strictEqual(getStyle(testElement, 'width', true), '9px', 'test rule styles equation');

    var rules = STYLESHEET.cssRules || STYLESHEET.rules;
    var ruleIndex = linearSearch(rules, function (stylesheetRule) {
        return stylesheetRule === rule;
    });

    notStrictEqual(ruleIndex, -1, 'test stylesheet rule removing');
    // no 'removeRule' func in lib
    (STYLESHEET.deleteRule || STYLESHEET.removeRule).call(STYLESHEET, ruleIndex);

    testElement.parentNode.removeChild(testElement);
});

// CSS3 Animation events checking?