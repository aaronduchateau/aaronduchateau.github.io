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
       $('#hide-mail').hide(); 
       $('#show-mail').show();
       var name_2 = $('#message').val();
       var email_2 = $('#email').val();

       $.post("doit.php", {thing: name_2, thing_2: email_2, submit: '765'}, function(data){
        //alert(data);
        });
    });
    

});