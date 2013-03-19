var animation = new melAnim.Animation(myElement);

animation.propAt("width", "60%");
animation.duration("3s");
animation.easing("ease-out");

animation.onComplete(function () {
    myElement.style.backgroundColor = "green";
});

animation.start();