// Copyright 2014-2015, University of Colorado Boulder

/**
 * A rectangular push button.  This is the file in which the appearance and behavior are brought together.
 *
 * This class inherits from RectangularButtonView, which contains all of the code that defines the button's appearance,
 * and adds the button's behavior by hooking up a button model.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PushButtonInteractionStateProperty = require( 'SUN/buttons/PushButtonInteractionStateProperty' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Object} [options] - All of the general Scenery node options can be
   * used, see Node.js or the Scenery documentation. In addition, the
   * following options are available. Note that there is no automated process
   * to keep these up to date, so keep that in mind when using these (and
   * please fix any errors you notice!).
   *
   * All of these values have defaults, so only specify them when needed.
   *
   *    buttonAppearanceStrategy:   Object that controls how the button's appearance changes as the user interacts with it
   *    baseColor:                  The color for the main portion of the button, other colors for highlights and shadows will be based off of this
   *    content:                    The node to display on the button, can be null for a blank button
   *    contentAppearanceStrategy:  Object that controls how the content node's appearance changes as the user interacts with the button
   *    cornerRadius:               Just like the usual option for a rectangular shape
   *    disabledBaseColor:          The color for the main portion of the button when disabled, other colors for highlights and shadows will be based of of this
   *    fireOnDown:                 Boolean that controls whether the listener function(s) are fired when the button is pressed down instead of when released
   *    leftBottomCornerRadius:     Radius of bottom left corner, overrides cornerRadius
   *    leftTopCornerRadius:        Radius of top left corner, overrides cornerRadius
   *    listener:                   Function that is called when this button is fired
   *    minHeight:                  Minimum height for the button, not needed unless a fixed height beyond that of the content is desired
   *    minWidth:                   Minimum width for the button, not needed unless a fixed width beyond that of the content is desired
   *    rightBottomCornerRadius:    Radius of bottom right corner, overrides cornerRadius
   *    rightTopCornerRadius:       Radius of top right corner, overrides cornerRadius
   *    xMargin:                    Margin between the content and the edge in the x (i.e. horizontal) direction
   *    yMargin:                    Margin between the content and the edge in the y (i.e. vertical) direction
   *    xTouchExpansion:            Amount of space beyond the left and right edges where the button will sense touch events
   *    yTouchExpansion:            Amount of space beyond the top and bottom edges where the button will sense touch events
   *
   * @constructor
   */
  function RectangularPushButton( options ) {

    options = _.extend( {
      accessibleDescription: '', // invisible description for a11y
      accessibleLabel: '', // invisible label for a11y
      tandem: null,
      accessibleContent: {
        createPeer: function( accessibleInstance ) {
          return new RectangularPushButtonAccessiblePeer( accessibleInstance, options.accessibleDescription, options.accessibleLabel, options.listener );
        }
      }
    }, options );

    // Safe to pass through options to the PushButtonModel like "fireOnDown".  Other scenery options will be safely ignored.
    this.buttonModel = new PushButtonModel( options ); // @public, listen only
    RectangularButtonView.call( this, this.buttonModel, new PushButtonInteractionStateProperty( this.buttonModel ), options );

    // Tandem support
    // Give it a novel name to reduce the risk of parent or child collisions
    // @public (tandem)
    this.rectangularPushButtonTandem = options.tandem;
    this.rectangularPushButtonTandem && this.rectangularPushButtonTandem.addInstance( this );
  }

  inherit( RectangularButtonView, RectangularPushButton, {

    // @public
    dispose: function() {
      this.buttonModel.dispose();
      RectangularButtonView.prototype.dispose.call( this );
      this.rectangularPushButtonTandem && this.rectangularPushButtonTandem.removeInstance( this );
    },

    // @public
    addListener: function( listener ) {
      this.buttonModel.addListener( listener );
    },

    // @public
    removeListener: function( listener ) {
      this.buttonModel.removeListener( listener );
    }
  },

  // statics 
  {
    /**
     * Extend the accessible peer of RectangularPushButton to add custom accessibility attributes in subtypes.
     * 
     * @param {AccessibleInstance} accessibleInstance
     * @param {string} buttonDescription
     * @param {string} buttonLabel
     * @param {function} listener
     * @returns {ScreenViewAccessiblePeer}
     * @constructor
     * @public
     */
    RectangularPushButtonAccessiblePeer: function( accessibleInstance, buttonDescription, buttonLabel, listener ) {
      return new RectangularPushButtonAccessiblePeer( accessibleInstance, buttonDescription, buttonLabel, listener );
    }
  } 
  );

  sun.register( 'RectangularPushButton', RectangularPushButton );

  /**
   * Create the accessible peer which represents the RectangularPushButton in the parallel DOM.
   *
   * @param {AccessibleInstance} accessibleInstance
   * @param {string} buttonDescription - invisible auditory description for a11y
   * @param {string} buttonLabel - invisible label for a11y
   * @param {function} listener - the listener function called on press for this RectangularPushButton
   * @constructor
   * @private
   */
  function RectangularPushButtonAccessiblePeer( accessibleInstance, buttonDescription, buttonLabel, listener ) {
    this.initialize( accessibleInstance, buttonDescription, buttonLabel, listener );
  }

  inherit( AccessiblePeer, RectangularPushButtonAccessiblePeer, {

    /**
     * Initialized dom elements and its attributes for the screen view in the parallel DOM.
     *
     * @param {AccessibleInstance} accessibleInstance
     * @param {string} buttonDescription - invisible auditory description for a11y
     * @param {string} buttonLabel - invisible label for a11y
     * @param {function} listener - the listener function called on press for this RectangularPushButton
     * @public (a11y)
     */
    initialize: function( accessibleInstance, buttonDescription, buttonLabel, listener ) {
      var trail = accessibleInstance.trail;
      var uniqueId = trail.getUniqueId();
                    
      /*
       * The content should look like the following in the parallel DOM:
       *  <button tabindex="0" aria-describedby="rectangular-button-description">buttonLabel</button>
       *  <p id="rectangular-button-description">buttonDescription.</p>
       */
      this.domElement = document.createElement( 'button' ); // @protected
      this.domElement.innerText = buttonLabel;
      this.domElement.tabIndex = '0';

      // create the description element
      var descriptionElement = document.createElement( 'p' );
      descriptionElement.innerText = buttonDescription;
      descriptionElement.id = 'rectangular-button-description-' + uniqueId;
      this.domElement.setAttribute( 'aria-describedby', descriptionElement.id );

      // structure the elements
      this.domElement.appendChild( descriptionElement );

      // fire on click event
      this.domElement.addEventListener( 'click', function() {
        listener();
      } );

      this.initializeAccessiblePeer( accessibleInstance, this.domElement );

    }
  } );
  return RectangularPushButton;
} );