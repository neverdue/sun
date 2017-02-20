// Copyright 2014-2015, University of Colorado Boulder

/**
 * Basic model for a push button, including over/down/enabled properties.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var CallbackTimer = require( 'SUN/CallbackTimer' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function PushButtonModel( options ) {

    options = _.extend( {

      fireOnDown: false, // true: fire on pointer down; false: fire on pointer up if pointer is over button
      listener: null, // {function} convenience for adding 1 listener, no args

      // fire-on-hold feature
      fireOnHold: false, // is the fire-on-hold feature enabled?
      fireOnHoldDelay: 400, // start to fire continuously after pressing for this long (milliseconds)
      fireOnHoldInterval: 100 // fire continuously at this interval (milliseconds)
    }, options );

    var self = this;

    // Tandem.indicateUninstrumentedCode();  // see https://github.com/phetsims/phet-io/issues/986
    // Buttons are already instrumented, I don't know whether the button models also need to be.  Maybe not?  But
    // if we want to see in the data stream when the user mouses over a button, this would be valuable

    ButtonModel.call( this, options );

    // @public (phet-io) support for the phet-io data stream
    this.startedCallbacksForFiredEmitter = new Emitter();

    // @public (phet-io) support for the phet-io data stream
    this.endedCallbacksForFiredEmitter = new Emitter();

    this.listeners = []; // @private
    if ( options.listener !== null ) {
      this.listeners.push( options.listener );
    }

    // Create a timer to handle the optional fire-on-hold feature.
    // When that feature is enabled, calling this.fire is delegated to the timer.
    if ( options.fireOnHold ) {
      this.timer = new CallbackTimer( {
        callback: this.fire.bind( this ),
        delay: options.fireOnHoldDelay,
        interval: options.fireOnHoldInterval
      } );
    }

    // Point down
    this.downProperty.link( function( down ) {
      if ( down ) {
        if ( self.enabledProperty.get() ) {
          if ( options.fireOnDown ) {
            self.fire();
          }
          if ( self.timer ) {
            self.timer.start();
          }
        }
      }
      else {
        var fire = ( !options.fireOnDown && self.overProperty.get() && self.enabledProperty.get() ); // should the button fire?
        if ( self.timer ) {
          self.timer.stop( fire );
        }
        else if ( fire ) {
          self.fire();
        }
      }
    } );

    // Stop the timer when the button is disabled.
    this.enabledProperty.link( function( enabled ) {
      if ( !enabled && self.timer ) {
        self.timer.stop( false ); // Stop the timer, don't fire if we haven't already
      }
    } );
  }

  sun.register( 'PushButtonModel', PushButtonModel );

  return inherit( ButtonModel, PushButtonModel, {

    // @public
    dispose: function() {
      this.listeners.length = 0;
      if ( this.timer ) {
        this.timer.dispose();
        this.timer = null;
      }
      ButtonModel.prototype.dispose.call( this );
    },

    /**
     * Adds a listener. If already a listener, this is a no-op.
     * @param {function} listener - function called when the button is pressed, no args
     * @public
     */
    addListener: function( listener ) {
      if ( this.listeners.indexOf( listener ) === -1 ) {
        this.listeners.push( listener );
      }
    },

    /**
     * Removes a listener. If not a listener, this is a no-op.
     * @param {function} listener
     * @public
     */
    removeListener: function( listener ) {
      var i = this.listeners.indexOf( listener );
      if ( i !== -1 ) {
        this.listeners.splice( i, 1 );
      }
    },

    /**
     * Fires all listeners.
     * @public (phet-io, a11y)
     */
    fire: function() {
      this.startedCallbacksForFiredEmitter.emit();
      var copy = this.listeners.slice( 0 );
      copy.forEach( function( listener ) {
        listener();
      } );
      this.endedCallbacksForFiredEmitter.emit();
    }
  } );
} );