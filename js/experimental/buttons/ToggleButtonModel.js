// Copyright 2002-2014, University of Colorado Boulder

/**
 * Basic model for a push button, intended to be added as an input listener to
 * any Scenery node in order to allow it to behave as a button.
 *
 * IMPORTANT USAGE NOTES:
 * - The node to which this is added should not be made non-pickable when
 *   the disabled state is entered, or subsequent states may not be correct.
 * - Generally speaking, only one of these should be added to a given node.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var DownUpListener = require( 'SCENERY/input/DownUpListener' );
  var Property = require( 'AXON/Property' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonModel = require( 'SUN/experimental/buttons/ButtonModel' );

  /**
   * @param {Object} options
   * @constructor
   */
  function ToggleButtonModel( options ) {
    var self = this;
    options = _.extend(
      {
        toggleOnDown: false
      }, options );

    //Property that keeps track of whether the button is up (untoggled) or down (toggled)
    this.buttonStateUp = new Property( true );

    ButtonModel.call( this, {

      down: function( event, trail ) {
        if ( self.downPointer === null ) {
          self.downPointer = event.pointer;
        }
        if ( self.buttonEnabled && event.pointer === self.downPointer ) {
          self.interactionState.value = 'pressed';
          if ( options.toggleOnDown ) {
            self.buttonStateUp.toggle();
          }
        }
      },

      up: function( event, trail ) {
        if ( self.buttonEnabled ) {
          self.interactionState.value = self.overPointer === null ? 'idle' :
                                        self.buttonStateUp.value ? 'pressed' :
                                        'over';
          if ( !options.toggleOnDown && self.downPointer === event.pointer && self.overPointer === event.pointer ) {
            // Toggle the model
            self.buttonStateUp.toggle();
          }
        }
        if ( event.pointer === self.downPointer ) {
          self.downPointer = null;
        }
      }
    } );
  }

  return inherit( ButtonModel, ToggleButtonModel, {
  } );
} );