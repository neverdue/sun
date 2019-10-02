// Copyright 2014-2019, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a property between 2 values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const commonSoundPlayers = require( 'TAMBO/commonSoundPlayers' );
  const inherit = require( 'PHET_CORE/inherit' );
  const RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );
  const ToggleButtonInteractionStateProperty = require( 'SUN/buttons/ToggleButtonInteractionStateProperty' );
  const ToggleButtonIO = require( 'SUN/buttons/ToggleButtonIO' );
  const ToggleButtonModel = require( 'SUN/buttons/ToggleButtonModel' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property - axon Property that can be either valueOff or valueOn
   * @param {Object} [options]
   * @constructor
   */
  function RectangularToggleButton( valueOff, valueOn, property, options ) {

    options = _.extend( {

      // {Playable} - sounds to be played on toggle transitions
      valueOffSound: commonSoundPlayers.stepForwardButton,
      valueOnSound: commonSoundPlayers.stepBackwardButton,

      // tandem support
      tandem: Tandem.required,
      phetioType: ToggleButtonIO
    }, options );

    // @public (phet-io)
    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    this.toggleButtonModel = new ToggleButtonModel( valueOff, valueOn, property, options );
    const toggleButtonInteractionStateProperty = new ToggleButtonInteractionStateProperty( this.toggleButtonModel );
    RectangularButtonView.call( this, this.toggleButtonModel, toggleButtonInteractionStateProperty, options );

    this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // sound generation
    const playSounds = () => {
      if ( property.value === valueOff && options.valueOffSound ) {
        options.valueOffSound.play();
      }
      else if ( property.value === valueOn && options.valueOnSound ) {
        options.valueOnSound.play();
      }
    };
    this.buttonModel.produceSoundEmitter.addListener( playSounds );

    // @private
    this.disposeRectangularToggleButton = () => {
      this.buttonModel.produceSoundEmitter.removeListener( playSounds );
      toggleButtonInteractionStateProperty.dispose();
    };
  }

  sun.register( 'RectangularToggleButton', RectangularToggleButton );

  return inherit( RectangularButtonView, RectangularToggleButton, {

    /**
     * @public
     */
    dispose: function() {
      this.disposeRectangularToggleButton();
      RectangularButtonView.prototype.dispose && RectangularButtonView.prototype.dispose.call( this );
    }
  } );
} );