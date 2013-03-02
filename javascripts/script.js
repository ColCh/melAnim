jQuery(function () {
    // настройки для аяксового загрузчика
    var loaderOptions = {
        path: "./pages/", // путь к каталогу со страницами
        pageAttr: "data-page", // имя атрибута, где хранится имя страницы
        postFix: ".html", // расширение для файла
        container: "#content" // селектор, куда сохранится html
    };

    $('body').on("click", ".page-loader", loaderOptions, function (e) {
        var data = e.data;
        var src = data.path + $(e.target).attr(data.pageAttr) + data.postFix;
        $('body').trigger("requestpageload", [ e.data.container, src ]);
        e.preventDefault();
    });
});

$(function () {
    // обработка поступающих запросов загрузки страницы
    $('body').on("requestpageload", function (e, container, src) {
        $(e.target).load(src);
    });
});