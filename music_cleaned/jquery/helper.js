$(function () {

    var loaderGraphic = '<img src="img/ajax-loader.gif" class="small-loader"/>';
    var numOfVisibleRows, typingTimer, cleanRecordingDate, cleanReleaseDate;
    
    // displays the current count of the result set
    function rowCountDisplay( render ) {
      if( render ) {
        setTimeout(function() {
          numOfVisibleRows = $('tbody tr:visible').length;
          $('#count-holder').html(numOfVisibleRows);
        }, 500);
      } else {
        $('#count-holder').html(loaderGraphic);
      }
    }

    // cleans up dates shown and searched
    function sanatizeDate( datePassed, humanReadable ) {
      var splitDate = datePassed.split('/');
      if ( splitDate[0].length < 2 ) {
        splitDate[0] = "0" + splitDate[0];
      }
      if ( splitDate[1].length < 2 ) {
        splitDate[1] = "0" + splitDate[1];
      }
      if ( splitDate[2] < 50 ) {
        splitDate[2] = "20" + splitDate[2];
      } else {
        splitDate[2] = "19" + splitDate[2];
      }
      if ( humanReadable ) {
        return splitDate[0] + '/' + splitDate[1] + '/' + splitDate[2];
      } else {
        return splitDate[2] + splitDate[0] + splitDate[1];  
      }
    }

    // show the loader briefly
    rowCountDisplay(false);

    // ***cross origin enabled through .htaccess file on aaronduchateau.com, select privileges only  
    $.get( "http://www.aaronduchateau.com/music_cleaned/get_data.php", function( data ) {
        response = $.parseJSON(data);
        // animate and populate page
        dataLoaded(response);
    });
    
    
    function dataLoaded(myJSON) {

      //get the size of viewport to determine animation height
      var viewportHeight = $(window).height();
      var myHeight = viewportHeight - 200;

      $( ".slide" ).animate({
        opacity: 1.0,
        height: myHeight + "px"
      }, 800, function() {
        // animation complete, show result count
        rowCountDisplay(true);
      });

      $.each(myJSON, function(i, item) {

        // check recording date for value
        if ( item.recording_date ) {
          cleanRecordingDate = sanatizeDate(item.recording_date, false);
          item.recording_date = sanatizeDate(item.recording_date, true);
        } else {
          cleanRecordingDate = 0;
          item.recording_date = "-"
        }
        // check release date for value
        if ( item.release_date ) {
          cleanReleaseDate = sanatizeDate(item.release_date, false);
          item.release_date = sanatizeDate(item.release_date, true);
        } else {
          cleanReleaseDate = 0;
        }

        // append new data to table
        $('<tr>').append(
        $('<td class="band">').html('<span class="real-filter">' + item.group + '</span>'),
        $('<td class="album">').html('<a href="' + item.wiki_link + '" target="_blank">' + '<span class="real-filter">' + item.title + '</span></a>'),
        $('<td class="discs">').html('<span class="real-filter">' + item.no_of_discs + '</span>'),
        $('<td class="rel-date">').html(item.release_date + '<span class="real-filter hide">' + cleanReleaseDate + '</span>'),
        $('<td class="rec-date">').html(item.recording_date + '<span class="real-filter hide">' + cleanRecordingDate + '</span>'),
        $('<td class="personnel">').html(item.fullname)).appendTo('#music_table');

      });

    }


    ////////////////////////////////////////////////////////////////////////////////
    // start: search code, with timer cancelation to listen for user typing activity
    ////////////////////////////////////////////////////////////////////////////////
    $("#searcher").keyup(function(){

      rowCountDisplay(false);
      $('tbody tr').hide();
      $('#loader-container').show();
      clearTimeout(typingTimer);
      typingTimer = setTimeout(doneTyping, 1000);

    });

    $('#searcher').keydown(function(){
        clearTimeout(typingTimer);
    });

    function doneTyping () {
      rowCountDisplay(true);
      var term = $("#searcher").val();
      $('#loader-container').hide('fast');
      $("td").filter(function() {
        return $(this).text().indexOf(term) !== -1;
      }).parent().show('fast');
    }
    ////////////////////////////////////////////////////////////////////////////////
    // end: search code, with timer cancelation to listen for user typing activity
    ////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////
    // start: sorting function, interacts with jquery.sortelements.js and jquery.ui
    ////////////////////////////////////////////////////////////////////////////////
    var table = $('#music_table');
    
    $('#band_header, #album_header, #discs_header, #release_header, #recorded_header').wrapInner('<span title="sort this column"/>').each(function(){
            
      var th = $(this);
      var inverse = true;
      
      th.click(function(){
        var thIndex = th.index();

        // below log proves that index is updated correctly after re-ordering takes place
        //console.log(thIndex);

        table.find('td').filter(function(){
            
          return $(this).index() === thIndex;
            
        }).sortElements(function(a, b){ 

          //make sure we are filtering by the correct dom element, important for dates
          var c = [a][0].children[0];
          var d = [b][0].children[0];
          return $.text([c]) > $.text([d]) ?
              inverse ? -1 : 1
              : inverse ? 1 : -1;
            
        }, function(){
            
            // parentNode is the element we want to move
            return this.parentNode; 
            
        });
        
        inverse = !inverse;
              
      });
            
    });
    ////////////////////////////////////////////////////////////////////////////////
    // end: sorting function
    ////////////////////////////////////////////////////////////////////////////////
 
    ////////////////////////////////////////////////////////////////////////////////
    // start: dragging function, interacts with library jquery.dragtable.js
    ////////////////////////////////////////////////////////////////////////////////
    $('table').each(function(){
  
      $(this).dragtable({

          placeholder: 'dragtable-col-placeholder test3',
          items: 'thead th:not( .notdraggable ):not( :has( .dragtable-drag-handle ) ), .dragtable-drag-handle',
          appendTarget: $(this).parent(),
          scroll: true

        });

    });
    ////////////////////////////////////////////////////////////////////////////////
    // end: dragging function
    ////////////////////////////////////////////////////////////////////////////////
  
    //add our cool background photo
    $.backstretch("img/kingcrimson5.jpg");

    //logic to hide columns from modal
    $('.hide-cols').click(function() {

      var col = $( this ).attr('data-attr');
      if ( $(col).is(":visible") ) {
        $( col ).css('display','none');
        $( this ).prev( ".vis-indic" ).css( "opacity", 0.3 );
      } else {
        $( col ).css('display','');
        $( this ).prev( ".vis-indic" ).css( "opacity", 1 );
      }

    });

});



