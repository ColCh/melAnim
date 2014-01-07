/**
 * @file Файл с тестами для абстракций
 * @author ColCh <colouredchalkmelky@gmail.com>
 */

module('Abstractions');

asyncTest('Ticker', function () {

    expect(1);

    var startTime = +new Date();
    var id;
    var delay = 50;

    var testCallbackDeltaTime = function (delta) {
        var endTime = +new Date();
        var elapsed = endTime - startTime;
        var deltaWithDelay = delta + delay;

        ok(equalsPart(elapsed, deltaWithDelay, 0.2), 'passed delta time check (with inaccuracy and delay ' + delay + 'ms): ' + elapsed + ' vs ' + deltaWithDelay);

        Ticker.setFPS(100);
        Ticker.off(id);
        start();
    };

    setTimeout(function () {
        id = Ticker.on(testCallbackDeltaTime);
        window.scrollBy(0, 0); // forced Reflow
    }, delay);

});

// Keyframe remains untested

test('KeyframesCollection', function () {
    var dummyCollection = new KeyframesCollection();

    var numberOfKeyframes = 10;

    var i = numberOfKeyframes, randomProgress, randomValue;
    while ( i-->0 ) {
        randomProgress = Math.random() * 1e3 | 0;
        randomValue = [ Math.random() * 1e6 | 0 ];
        if (dummyCollection.indexOf(randomProgress) === -1) {
            dummyCollection.add( randomProgress ).setValue( randomValue );
        } else {
            // non-unique key
            numberOfKeyframes -= 1;
        }
    }

    var every = false;
    var i = numberOfKeyframes;
    while ( i-->1 ) {
        every = dummyCollection.item(i).numericKey > dummyCollection.item(i - 1).numericKey;
        if (!every) break;
    }

    ok(every, 'keyframes are sorted by unique numeric key value');

    strictEqual(dummyCollection.item(dummyCollection.indexOf(randomProgress)).numericKey, randomProgress, 'test indexOf with known progress');
    deepEqual(dummyCollection.indexOf(+new Date), -1, 'test indexOf with unknown progress. Must return unknown value');

    ok(dummyCollection.item(dummyCollection.indexOfLeft(randomProgress)).numericKey <= randomProgress, 'indexOfLeft must return index of left keyframe (key <= progress)');

});

// PropertyDescriptor remains untested
// PropertyDescriptorCollection remains untested

// EasingRegistry remains untested
// Easing remains untested

test('CubicBezier', function () {
    // Linear function is perfect and obvious for testing purposes
    var dummyCurve = new CubicBezier(0, 0, 1, 1);

    ok(equalsAppox(dummyCurve.B_absciss(0.5), 0.5), 'compute Bx (absciss) on 0.5');
    ok(equalsAppox(dummyCurve.B_derivative_I_absciss(0.5), 1.5), 'compute B`x (first derivative on absciss equation) on 0.5');
    ok(equalsAppox(dummyCurve.B_ordinate(0.5), 0.5), 'compute By (ordinate) on 0.5');

    ok(equalsAppox(dummyCurve.compute(0.5), 0.5), 'computing on linear curve');

    strictEqual(dummyCurve.compute(0), 0, 'compute on lowest absciss value');
    strictEqual(dummyCurve.compute(1), 1, 'compute on hightest absciss value');

    strictEqual(dummyCurve.toString(), 'cubic-bezier(0, 0, 1, 1)', 'transformation to CSS3 time-function');
});

// Steps
test('Steps', function () {
    var dummySteps = new Steps(3, true);

    strictEqual(dummySteps.compute(0), 0, 'compute on lowest absciss value ( steps(3, start) )');
    strictEqual(dummySteps.compute(0 + 0.000001), 1/3, 'compute on low (0 + 0.000001) absciss value ( steps(3, start) )');
    strictEqual(dummySteps.compute(1), 1, 'compute on hightest absciss value ( steps(3, start) )');
    strictEqual(dummySteps.compute(1 - 0.000001), 1, 'compute on high (1 - 0.000001) absciss value ( steps(3, start) )');

    // Take some results from func
    var values = [ ];

    for (var i = 0, k, F; i <= 1000; i++) {
        k = i / 1000;
        F = dummySteps.compute(k);
        if (linearSearch(values, function (value) { return value === F; }) === -1) {
            values.push(F);
        }
    }

    strictEqual(values.length, 4, 'returned values count ( steps(3, start) )');
    ok(equalsAppox(values[0] + values[1] + values[2], 1.0), 'returned values integrity ( steps(3, start) )');

    var dummySteps = new Steps(3, false);

    strictEqual(dummySteps.compute(0), 0, 'compute on lowest absciss value ( steps(3, end) )');
    strictEqual(dummySteps.compute(0 + 0.000001), 0, 'compute on low (0 + 0.000001) absciss value ( steps(3, end) )');
    strictEqual(dummySteps.compute(1), 1, 'compute on hightest absciss value ( steps(3, end) )');
    strictEqual(dummySteps.compute(1 - 0.000001), 2 * (1/3), 'compute on high (1 - 0.000001) absciss value ( steps(3, end) )');
});

// KeyframesRulesRegistry remains untested