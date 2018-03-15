$(function () {
  
    $.backstretch("img/bg_subtle.jpg");

    $('.scroller').click(function() {
    	//alert($( $.attr(this, 'href') ).offset().top);
	    $('html, body').animate({
	        scrollTop: $( $.attr(this, 'href') ).offset().top - 80
	    }, 800);
	    return false;
    });

    $('.trig_change').click(function() {
    	$( '.trig_change' ).removeClass('trig_color');
    	$( this ).addClass('trig_color');
    	var hold_me = $( this ).attr('data-target');
        $('.slide').css('display', 'none');
        $('.' + hold_me).show('fast');
    });

    $('.back-control').click(function() {
        var i = $( this ).attr('data-target');
        window.reloadParticles(i);
    });

    window.reloadParticles = function(i){
        var configArray = [
            './jquery/particleConfig2.json',
            './jquery/particleConfig4.json',
            './jquery/particleConfig5.json'
        ];
        particlesJS.load('particles-js', configArray[i], function(loaded) {
          console.log(loaded);
        });
    };

    window.reloadParticles(0);
});