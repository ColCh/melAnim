    var

        /**
         * Префикс к разным строкам, которые не могут начинаться с числа
         * @type {string}
         * @const
         * */
        mel = "melAnimation",

        /**
         * Шорткат для document
         * @type {Document}
         * @const
         * */
        doc = window.document,

        /**
         * Правильная undefined.
         * @type {undefined}
         * @const
         */
        undefined,

        /**
         * Разрешить ли вывод отладочных сообщений
         * @type {boolean}
         * @const
         */
        ENABLE_DEBUG = true,

        /**
         * Шорткат для объекта отладочного вывода
         * @inheritDoc
         */
        console = window.console,

        /**
         * Шорткат для корневого элемента html
         * для делегирования событий анимации.
         * @const
         */
        rootElement = doc.documentElement,

        /**
         * Стиль, где можно смотреть CSS-свойства
         * @type {CSSStyleDeclaration}
         * @const
         */
        dummy = rootElement.style,

        /**
         * Вендорный префикс к текущему браузеру
         * @type {string}
         */
        prefix,

        /**
         * Вендорный префикс к текущему браузеру в нижнем регистре
         * @type {string}
         */
        lowPrefix,

        /**
         * Регвыр для выделения численного значения и размерности у значений CSS свойств
         * @type {RegExp}
         * @const
         */
        cssNumericValueReg = /(-?\d*\.?\d+)(.*)/,

        /**
         * Инкремент для генерации уникальной строки
         * @type {number}
         */
        animCount = 0,

        /**
         * Пустая функция
         * @const
         */
        noop = function () {},

        /**
         * Регвыр для временной функции CSS кубической кривой Безье
         * @type {RegExp}
         * @const
         */
        cubicBezierReg = /^cubic-bezier\(((?:\s*\d*\.?\d+\s*,\s*){3}\d*\.?\d+\s*)\)$/i,

        /**
         * Регвыр для временной функции CSS лестничной функции
         * @type {RegExp}
         * @const
         */
        stepsReg = /^steps\((\d+(?:,\s*(?:start|end))?)\)$/i,

        /**
         * Свой тег <style> для возможности CSS3 анимаций
         * Используется так же в анимации на JavaScript для ускорения.
         * @type {HTMLStyleElement}
         * @const
         */
        style = doc.getElementsByTagName("head")[0].parentNode.appendChild(doc.createElement("style")),

        /**
         * Каскадная таблица из тега <style>
         * @type {CSSStyleSheet}
         * @const
         */
        stylesheet = style.sheet || style.styleSheet;
