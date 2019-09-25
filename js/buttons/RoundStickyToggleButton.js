// Copyright 2014-2019, University of Colorado Boulder

/**
 * A round toggle button that switches the value of a property that can take on valueUp or valueDown.  It
 * sticks in the down position when pressed, popping back up when pressed
 * again.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const commonSoundPlayers = require( 'TAMBO/commonSoundPlayers' );
  const inherit = require( 'PHET_CORE/inherit' );
  const RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  const StickyToggleButtonInteractionStateProperty = require( 'SUN/buttons/StickyToggleButtonInteractionStateProperty' );
  const StickyToggleButtonModel = require( 'SUN/buttons/StickyToggleButtonModel' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );
  const ToggleButtonIO = require( 'SUN/buttons/ToggleButtonIO' );

  /**
   * @param {Object} valueUp value when the toggle is in the 'up' position
   * @param {Object} valueDown value when the toggle is in the 'down' position
   * @param {Property} property axon property that can be either valueUp or valueDown.
   * @param {Object} [options]
   * @constructor
   */
  function RoundStickyToggleButton( valueUp, valueDown, property, options ) {

    options = _.extend( {

      // turn off default sound, since this type will do its own sound generation
      soundPlayer: null,

      // sounds to be played on toggle transitions,
      valueUpSound: commonSoundPlayers.stepForwardButton,
      valueDownSound: commonSoundPlayers.stepBackwardButton,

      tandem: Tandem.required,
      phetioType: ToggleButtonIO

    }, options );

    // @private (read-only)
    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const toggleButtonModel = new StickyToggleButtonModel( valueUp, valueDown, property, options );
    const stickyToggleButtonInteractionStateProperty = new StickyToggleButtonInteractionStateProperty( toggleButtonModel );
    RoundButtonView.call( this, toggleButtonModel, stickyToggleButtonInteractionStateProperty, options );

    // sound generation
    function playSounds() {
      if ( property.value === valueDown && options.valueDownSound ) {
        options.valueDownSound.play();
      }
      else if ( property.value === valueUp && options.valueUpSound ) {
        options.valueUpSound.play();
      }
    }

    this.buttonModel.produceSoundEmitter.addListener( playSounds );

    // @private - dispose items specific to this instance
    this.disposeRoundStickyToggleButton = function() {
      this.buttonModel.produceSoundEmitter.removeListener( playSounds );
      toggleButtonModel.dispose();
      stickyToggleButtonInteractionStateProperty.dispose();
    };
  }

  sun.register( 'RoundStickyToggleButton', RoundStickyToggleButton );

  return inherit( RoundButtonView, RoundStickyToggleButton, {
    dispose: function() {
      this.disposeRoundStickyToggleButton();
      RoundButtonView.prototype.dispose.call( this );
    }
  } );
} );