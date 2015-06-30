$(function () {

  var event = $.Event( "click" );

  $('#col-vis-test').click(function() {
    QUnit.test( "Column Visibility Toggle Test", function( assert ) {
      
      function testVisibility( clickClass, domClass ) {

      	var elementIsVisible = $( domClass ).is(":visible");
		$( clickClass ).trigger( event );
      	var afterIsVisible = $( domClass ).is(":visible");
      	if ( afterIsVisible !== elementIsVisible ) {
      	  return true;
      	} else {
      	  return false;
      	}
      }		
      
      function runToggler( instancer ) {

	    assert.ok( testVisibility(".for-testing-band",".band"), instancer + " toggle Band column filtering" );
	    assert.ok( testVisibility(".for-testing-album",".album"), instancer + " toggle Album column filtering" );
	    assert.ok( testVisibility(".for-testing-discs",".discs"), instancer + " toggle Discs column filtering" );
	    assert.ok( testVisibility(".for-testing-rel-date",".rel-date"), instancer + " toggle Release column filtering" );
	    assert.ok( testVisibility(".for-testing-rec-date",".rec-date"), instancer + " toggle Recording column filtering" );
	    assert.ok( testVisibility(".for-testing-personnel",".personnel"), instancer + " toggle Personnel column filtering" );
	    
	  }

	  runToggler("first");
	  runToggler("second");

	});
  });
});