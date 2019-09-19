// Copyright 2014-2019, University of Colorado Boulder

/**
 * Model for a toggle button that sticks when pushed down and pops up when pushed a second time. Unlike other general
 * sun models, 'sticky' implies a specific type of user-interface component, a button that is either popped up or
 * pressed down.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ButtonModel = require( 'SUN/buttons/ButtonModel' );
  const Emitter = require( 'AXON/Emitter' );
  const EventType = require( 'TANDEM/EventType' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Property = require( 'AXON/Property' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Object} valueUp value when the toggle is in the 'up' position
   * @param {Object} valueDown value when the toggle is in the 'down' position
   * @param {Property} valueProperty axon property that can be either valueUp or valueDown.  Would have preferred to call this `property` but it would clash with the property function name.
   * @param {Object} [options]
   * @constructor
   */
  function StickyToggleButtonModel( valueUp, valueDown, valueProperty, options ) {
    const self = this;

    options = _.extend( {
      tandem: Tandem.required
    }, options );

    // @private
    this.valueUp = valueUp;
    this.valueDown = valueDown;
    this.valueProperty = valueProperty;
    this.toggledEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'toggledEmitter' ),
      phetioDocumentation: 'Emits when the button is toggled',
      phetioEventType: EventType.USER
    } );

    const toggleListener = function() {
      assert && assert( self.valueProperty.value === self.valueUp || self.valueProperty.value === self.valueDown,
        'unrecognized value: ' + self.valueProperty.value );

      self.valueProperty.value = self.valueProperty.value === self.valueUp ? self.valueDown : self.valueUp;
    };
    this.toggledEmitter.addListener( toggleListener );

    ButtonModel.call( this, options );

    // When the user releases the toggle button, it should only fire an event if it is not during the same action in
    // which they pressed the button.  Track the state to see if they have already pushed the button.
    //
    // Note: Does this need to be reset when the simulation does "reset all"?  I (Sam Reid) can't find any negative
    // consequences in the user interface of not resetting it, but maybe I missed something. Or maybe it would be safe
    // to reset it anyway.
    this.pressedWhileDownProperty = new Property( false ); // @private

    // If the button is up and the user presses it, show it pressed and toggle the state right away.  When the button is
    // released, pop up the button (unless it was part of the same action that pressed the button down in the first
    // place).
    const downListener = function( down ) {
      if ( self.enabledProperty.get() && self.overProperty.get() ) {
        if ( down && valueProperty.value === valueUp ) {
          self.toggle();
          self.pressedWhileDownProperty.set( false );
        }
        if ( !down && valueProperty.value === valueDown ) {
          if ( self.pressedWhileDownProperty.get() ) {
            self.toggle();
          }
          else {
            self.pressedWhileDownProperty.set( true );
          }
        }
      }

      //Handle the case where the pointer moved out then up over a toggle button, so it will respond to the next press
      if ( !down && !self.overProperty.get() ) {
        self.pressedWhileDownProperty.set( true );
      }
    };

    this.downProperty.link( downListener );

    // if the valueProperty is set externally to user interaction, update the buttonModel
    // downProperty so the model stays in sync
    const valuePropertyListener = function( value ) {
      self.downProperty.set( value === valueDown );
    };
    valueProperty.link( valuePropertyListener );

    // make the button ready to toggle when enabled
    const enabledPropertyOnListener = function( enabled ) {
      if ( enabled ) {
        self.pressedWhileDownProperty.set( true );
      }
    };
    this.enabledProperty.link( enabledPropertyOnListener );

    // @private - dispose items specific to this instance
    this.disposeToggleButtonModel = function() {
      self.downProperty.unlink( downListener );
      self.enabledProperty.unlink( enabledPropertyOnListener );
      valueProperty.unlink( valuePropertyListener );
      self.toggledEmitter.removeListener( toggleListener );
    };
  }

  sun.register( 'StickyToggleButtonModel', StickyToggleButtonModel );

  return inherit( ButtonModel, StickyToggleButtonModel, {

    // @public
    dispose: function() {
      this.disposeToggleButtonModel();
      ButtonModel.prototype.dispose.call( this );
    },

    // @public
    toggle: function() {
      this.toggledEmitter.emit();
    }
  } );
} );