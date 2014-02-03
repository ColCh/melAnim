/**
 * @file Файл с тестами встроенных хуков для анимирования свойств
 * @author ColCh <colouredchalkmelky@gmail.com>
 */

module('Property Hooks Tests');

test('toNumericValueHooks["color"]', function () {
    var dummyElement = null,
        propertyName = 'color',
        vendorizedPropName = 'color';

    deepEqual(toNumericValueHooks["color"](dummyElement, propertyName, 'yellow', vendorizedPropName), [255, 255, 0], 'conversion of named color (yellow)');

    deepEqual(toNumericValueHooks["color"](dummyElement, propertyName, '#FFFF00', vendorizedPropName), [255, 255, 0], 'conversion of hex color (yellow)');
    deepEqual(toNumericValueHooks["color"](dummyElement, propertyName, '#00FFFF', vendorizedPropName), [0, 255, 255], 'conversion of hex color (aqua)');

    deepEqual(toNumericValueHooks["color"](dummyElement, propertyName, 'rgb(255, 255, 0)', vendorizedPropName), [255, 255, 0], 'conversion of rgb integers color (yellow)');
    deepEqual(toNumericValueHooks["color"](dummyElement, propertyName, 'rgb(254.999, 254.999, 0)', vendorizedPropName), [255, 255, 0], 'conversion of rgb FLOATED integers color (yellow)');
    deepEqual(toNumericValueHooks["color"](dummyElement, propertyName, 'rgb(100%, 100%, 0%)', vendorizedPropName), [255, 255, 0], 'conversion of rgb percents color (yellow)');

    deepEqual(toNumericValueHooks["color"](dummyElement, propertyName, 'hsl(0, 100%, 50%)', vendorizedPropName), [255, 0, 0], 'conversion of hsl color (red)');
    deepEqual(toNumericValueHooks["color"](dummyElement, propertyName, 'hsl(0, 99.999%, 49.999%)', vendorizedPropName), [255, 0, 0], 'conversion of hsl FLOATED color (red)');

    deepEqual(toNumericValueHooks["color"](dummyElement, propertyName, 'rgba(255, 255, 0, 0.5)', vendorizedPropName), [255, 255, 0, 0.5], 'conversion of rgba integers color (with transparency) (yellow)');
    deepEqual(toNumericValueHooks["color"](dummyElement, propertyName, 'rgba(254.999, 254.999, 0, 0.4999)', vendorizedPropName), [255, 255, 0, 0.5], 'conversion of FLOATED rgba integers color (with transparency) (yellow)');
    deepEqual(toNumericValueHooks["color"](dummyElement, propertyName, 'hsla(0, 100%, 50%, 0.5)', vendorizedPropName), [255, 0, 0, 0.5], 'conversion of hsla color (with transparency) (red)');
    deepEqual(toNumericValueHooks["color"](dummyElement, propertyName, 'hsla(0, 99.999%, 49.999%, 0.4999)', vendorizedPropName), [255, 0, 0, 0.5], 'conversion of FLOATED hsla color (with transparency) (red)');
});

test('toStringValueHooks["color"]', function () {
    var dummyElement = null,
        propertyName = 'color',
        vendorizedPropName = 'color';

    strictEqual(toStringValueHooks['color'](dummyElement, [255, 255, 0]), 'rgb(255, 255, 0)', 'rgb color conversion (yellow)');
    strictEqual(toStringValueHooks['color'](dummyElement, [255, 255, 0, 0.5]), 'rgba(255, 255, 0, 0.5)', 'rgb with alpha channel color conversion (yellow, opacity 50%)');
});

// Transform

// Shadow

// Opacity