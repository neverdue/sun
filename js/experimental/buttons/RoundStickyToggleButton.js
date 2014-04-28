// Copyright 2002-2014, University of Colorado Boulder

/**
 * A circular toggle button that switches the value of a boolean property.  It
 * sticks in the down position when pressed, popping back up when pressed
 * again.
 *
 * This class inherits from RoundButtonView instead of using composition to
 * simplify the logic for the options (and potentially performance improvements
 * since there will be fewer nodes in the scene graph).
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundButtonView = require( 'SUN/experimental/buttons/RoundButtonView' );
  var BooleanRoundStickyToggleButton = require( 'SUN/experimental/buttons/BooleanRoundStickyToggleButton' );
  var ToggleProperty = require( 'AXON/ToggleProperty' );

  function RoundStickyToggleButton( valueA, valueB, property, options ) {
    options = _.extend( {
      toggleOnDown: true
    }, options );

    BooleanRoundStickyToggleButton.call( this, new ToggleProperty( valueA, valueB, property ), options );
  }

  return inherit( RoundButtonView, RoundStickyToggleButton );
} );