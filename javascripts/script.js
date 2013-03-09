jQuery(function () {
    // настройки для аяксового загрузчика
    var loaderOptions = {
        path: "", // путь к каталогу со страницами
        pageAttr: "href", // имя атрибута, где хранится имя страницы
        postFix: "", // расширение для файла
        container: "#content" // селектор, куда сохранится html
    };

    // класс для определения уже подсвеченных блоков
    var HIGHLIGHTED_CLASS = 'highlighted';

    // класс активного элемента меню
    var activeClass = 'active';

    // предыдущий активный пункт меню (селектор)
    var previousItem;

    // обработка клика по ссылке и инициализация события запроса на загрузку
    $('body').on("click", ".page-loader", loaderOptions, function (e) {
        var data = e.data;
        var $target = $(e.target);
        var $listItem = $target.parents("li");
        var currentItem;

        currentItem = $listItem.attr('id') || $listItem.attr('id', 'loader-' + (1e4 * Math.random() | 0)).attr('id');

        if (previousItem !== currentItem) {

            previousItem && $(previousItem).removeClass(activeClass);
            previousItem =currentItem;

            $listItem.addClass(activeClass);

            var src = data.path + $target.attr(data.pageAttr) + data.postFix;
            $('body').trigger("requestpageload", [ e.data.container, src ]);

            history.pushState( null, null, this.href );

        }

        e.preventDefault();
    });

    // обработка нажатий на кнопки назад\врепёд.
    $( window ).bind( "popstate", function( e ) {
        var returnLocation = history.location || document.location;

        var target = $(previousItem);

        var event = jQuery.Event("click", {
            target: target
        });

        $('body').trigger("click", event);

    });

    // обработка поступающих запросов загрузки страницы
    $('body').on("requestpageload", function (e, container, src) {
        $.ajax({
            url: src,
            success: function (data) {
                data = $(data);
                var title = data.filter('title').text();
                document.title = title;
                data = $(container, data);
                $('pre:not(.' + HIGHLIGHTED_CLASS + ')', data).each(function(i, block) {
                    $(block).addClass(HIGHLIGHTED_CLASS);
                    hljs.highlightBlock(block);
                });
                $(container).html(data.html());
            }
        });
    });

    if (hljs) {
        hljs.tabReplace = '<span class="code-indent">\t</span>';
        $('pre:not(.' + HIGHLIGHTED_CLASS + ')').each(function(i, block) {
            $(block).addClass(HIGHLIGHTED_CLASS);
            hljs.highlightBlock(block);
        });
    }

});

