// Copyright 2002-2013, University of Colorado Boulder

/**
 * Button with text on a rectangle.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangleButton = require( 'SUN/RectangleButton' );
  var Text = require( 'SCENERY/nodes/Text' );

  function TextButton( text, callback, options ) {

    options = _.extend( {
      textFill: 'black',
      textFillDisabled: 'rgb(175,175,175)'
    }, options );

    //TODO sun#24, apply options to both TextButton and Text will cause problems for options like x,y,scale,...
    var textNode = new Text( text, options );

    RectangleButton.call( this, textNode, callback, options );

    // enable/disable the pieces that are specific to this subtype
    this._enabled.link( function( enabled ) {
      textNode.fill = enabled ? options.textFill : options.textFillDisabled;
    } );
  }

  inherit( RectangleButton, TextButton );

  return TextButton;
} );
