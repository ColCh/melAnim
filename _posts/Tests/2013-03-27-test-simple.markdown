---
layout: default
title: Основные свойства
category: Демки
---
# Тест свойств #

Здесь будет показан тест основных свойств и варианты их использования:

* `duration` --- продолжительность анимации
* `easing` --- временная функция всей анимации
* `complete` --- обработчик завершения анимации
{: .unstyled}

Анимация теперь будет создаваться  с помощью конструктора. То же самое можно сделать и с помощью вызова `melAnim`.

## Содержание ##

* table of contents
{:toc}

## Тест ##

{% capture test_html %}{% include Tests/animate-simple/index.html %}{% endcapture %}
{% capture test_js %}{% include Tests/animate-simple/script.js %}{% endcapture %}
{% capture test_css %}{% include Tests/animate-simple/style.css %}{% endcapture %}

<!-- CSS теста -->
<style>{{ test_css }}</style>


<div class="testcase-wrap">
    {{ test_html }}
</div>

<!-- скрипт, начинающий тест -->
<script>
    $("body").on("teststart", function (e, myElement) {
        {{ test_js }}
    });
</script>

# Исходный код для этого примера #

## HMTL ##

<div class="code html">
    {% highlight html linenos %}{{ test_html }}{% endhighlight %}
</div>

## JavaScript ##

<div class="code js">
    {% highlight javascript linenos %}{{ test_js }}{% endhighlight %}
</div>

## CSS ##

<div class="code css">
    {% highlight css %}{{ test_css }}{% endhighlight %}
</div>