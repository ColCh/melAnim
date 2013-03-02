jQuery(function () {
    // настройки для аяксового загрузчика
    var loaderOptions = {
        path: "./pages/", // путь к каталогу со страницами
        pageAttr: "data-page", // имя атрибута, где хранится имя страницы
        postFix: ".html", // расширение для файла
        container: "#content" // селектор, куда сохранится html
    };

    // класс активного элемента меню
    var activeClass = 'active';

    // предыдущий активный пункт меню (селектор)
    var previousItem;

    // обработка клика по ссылке и инициализация события запроса на загрузку
    $('body').on("click", ".page-loader", loaderOptions, function (e) {
        var data = e.data;
        var $target = $(e.target);

        previousItem && $(previousItem).removeClass(activeClass);

        !$target.attr('id') && $target.attr('id', 'loader-' + 1e4 * Math.random() | 0);
        previousItem = $target.attr('id');

        $target.addClass(activeClass);

        var src = data.path + $target.attr(data.pageAttr) + data.postFix;
        $('body').trigger("requestpageload", [ e.data.container, src ]);

        e.preventDefault();
    });
});

$(function () {
    // обработка поступающих запросов загрузки страницы
    $('body').on("requestpageload", function (e, container, src) {
        $(container).load(src);
    });
});