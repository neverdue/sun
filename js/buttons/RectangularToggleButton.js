// Copyright 2014-2015, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a property between 2 values.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var sun = require( 'SUN/sun' );
  var ToggleButtonInteractionStateProperty = require( 'SUN/buttons/ToggleButtonInteractionStateProperty' );
  var ToggleButtonModel = require( 'SUN/buttons/ToggleButtonModel' );
  var Tandem = require( 'TANDEM/Tandem' );

  // phet-io modules
  var TToggleButton = require( 'ifphetio!PHET_IO/types/sun/buttons/TToggleButton' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property - axon Property that can be either valueOff or valueOn
   * @param {Object} [options]
   * @constructor
   */
  function RectangularToggleButton( valueOff, valueOn, property, options ) {

    Tandem.validateOptions( options ); // The tandem is required when brand==='phet-io'

    // @public (phet-io)
    this.toggleButtonModel = new ToggleButtonModel( valueOff, valueOn, property, options );
    RectangularButtonView.call( this, this.toggleButtonModel, new ToggleButtonInteractionStateProperty( this.toggleButtonModel ), options );

    TToggleButton && options && options.tandem && options.tandem.addInstance( this, TToggleButton( property.elementType ) );
  }

  sun.register( 'RectangularToggleButton', RectangularToggleButton );

  return inherit( RectangularButtonView, RectangularToggleButton, {

    // @public
    dispose: function() {
      //TODO implement this, see sun#212
    }
  } );
} );