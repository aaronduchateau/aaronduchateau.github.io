/* Classic helper — archive copy. Content images are local; page plate is CSS (light). */
$(function () {
  $(".scroller").click(function () {
    var href = $.attr(this, "href");
    if (!href || href.charAt(0) !== "#") return true;
    var $target = $(href);
    if (!$target.length) return true;
    $("html, body").animate(
      { scrollTop: $target.offset().top - 80 },
      800,
    );
    return false;
  });

  $(".trig_change").click(function () {
    $(".trig_change").removeClass("trig_color");
    $(this).addClass("trig_color");
    var hold_me = $(this).attr("data-target");
    $(".slide").hide("slow");
    $("." + hold_me).show("slow");
  });

  $(document.body).on("click", "#submitm", function () {
    $("#hide-mail").hide();
    $("#show-mail").show();
  });
});
