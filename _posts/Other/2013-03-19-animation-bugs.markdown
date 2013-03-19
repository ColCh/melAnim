---
layout: default
title: Баги CSS анимации
category: Разное
---
# Баги CSS анимации #

На этой странице будут показаны баги *CSS анимаций* с запускаемыми примерами кода.

# Содержание #

* table of contents
{:toc}

# Баг разных форматов #

## Описание ##

Заключается в том, что при указании относительного или абсолютного значения анимация перестаёт проигрываться при условии, что у элемента установлен другой формат значения для этого же свойства.

Этому багу подвержена **Opera 12.14 - на движке Presto**, и, может быть, другие её версии.

В последних версиях *FireFox*, *Chromium* всё в порядке. **Internet Explorer НЕ ОТТЕСТИРОВАН**{: class=text-error}

{% capture test_html %}{% include Tests/animate-crossdimension/index.html %}{% endcapture %}
{% capture test_js %}{% include Tests/animate-crossdimension/script.js %}{% endcapture %}
{% capture test_css %}{% include Tests/animate-crossdimension/style.css %}{% endcapture %}

Наведите указателем мыши на квадрат, чтобы проиграть тест --- квадрат должен плавно изменить ширину до конца блока, в который обёрнут.

Снизу должен быть *квадрат* --- не прямоугольник.

## Запускаемый пример ##

<!-- CSS теста -->
<div>
    <style>{{ test_css }}</style>
</div>

<div class="testcase-wrap">
    {{ test_html }}
</div>

## Исходный код для этого примера ##

### HMTL ###

<div class="code html">
    {% highlight html %}{{ test_html }}{% endhighlight %}
</div>

### JavaScript ###

<div class="code js">
    {% highlight javascript %}{{ test_js }}{% endhighlight %}
</div>

### CSS ###

Ниже приведён *CSS* для этого теста.

Обратите внимание на значение свойства `width` в блоке ключевых кадров, и в правиле для самого элемента --- в блоке
ключевых кадров указано относительное значение `100%`, а в правиле для элемента --- абсолютное `50px`


<div class="code css">
    {% highlight css %}{{ test_css }}{% endhighlight %}
</div>
