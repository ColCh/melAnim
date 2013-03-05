jQuery(function () {
    // настройки для аяксового загрузчика
    var loaderOptions = {
        path: "", // путь к каталогу со страницами
        pageAttr: "href", // имя атрибута, где хранится имя страницы
        postFix: "", // расширение для файла
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
        var $listItem = $target.parents("li");

        previousItem && $(previousItem).removeClass(activeClass);

        !$listItem.attr('id') && $listItem.attr('id', 'loader-' + 1e4 * Math.random() | 0);
        previousItem = $listItem.attr('id');

        $listItem.addClass(activeClass);

        var src = data.path + $target.attr(data.pageAttr) + data.postFix;
        $('body').trigger("requestpageload", [ e.data.container, src + ' ' + e.data.container ]);

        e.preventDefault();
    });
});

$(function () {
    // обработка поступающих запросов загрузки страницы
    $('body').on("requestpageload", function (e, container, src) {
        $(container).load(src, function () {
            window.PR.prettyPrint();
        });
    });
});