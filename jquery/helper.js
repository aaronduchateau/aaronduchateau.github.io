$(function () {
  
    $.backstretch("img/aaron_back_2.png");

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
    	$('.slide').hide('slow');
    	$('.' + hold_me).show('slow');
    });

    $(document.body).on('click', '#submitm' ,function()
    {      
       $.ajax({
            url: "//formspree.io/chateauconcept@gmail.com", 
            method: "POST",
            data: {message: $('#message').val(), _replyto: $('#email').val()},
            dataType: "json",
            success: function(data){
              $('#hide-mail').hide(); 
              $('#show-mail').show();
            }
        });
    });
    

});