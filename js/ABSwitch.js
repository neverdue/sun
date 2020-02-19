// Copyright 2014-2020, University of Colorado Boulder

/**
 * ABSwitch is a control for switching between 2 choices, referred to as 'A' & 'B'.
 * Choice 'A' is to the left of the switch, choice 'B' is to the right.
 * This decorates ToggleSwitch with labels.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const Line = require( 'SCENERY/nodes/Line' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PressListener = require( 'SCENERY/listeners/PressListener' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );
  const ToggleSwitch = require( 'SUN/ToggleSwitch' );

  // constants

  // Uses opacity as the default method of indicating whether a {Node} label is {boolean} enabled.
  const DEFAULT_SET_ENABLED = ( label, enabled ) => {
    label.opacity = enabled ? 1.0 : 0.5;
  };

  class ABSwitch extends Node {

    /**
     * @param {Property.<*>} property stores the value of the current choice
     * @param {*} valueA value for choice 'A'
     * @param {Node} labelA label for choice 'A'
     * @param {*} valueB value for choice 'B'
     * @param {Node} labelB label for choice 'B'
     * @param {Object} [options]
     */
    constructor( property, valueA, labelA, valueB, labelB, options ) {

      // PhET-iO requirements
      assert && assert( labelA.tandem, 'labelA must have a tandem' );
      assert && assert( labelB.tandem, 'labelB must have a tandem' );

      // default option values
      options = merge( {

        // options passed to ToggleSwitch
        toggleSwitchOptions: null,

        // {number} space between labels and switch
        xSpacing: 8,

        // if true, centerX will be at the centerX of the ToggleSwitch
        centerOnButton: false,

        // {function( Node, boolean )} method of making the labels look disabled
        setEnabled: DEFAULT_SET_ENABLED,

        // phet-io
        tandem: Tandem.REQUIRED
      }, options );

      super();

      const toggleSwitch = new ToggleSwitch( property, valueA, valueB, merge( {
        tandem: options.tandem.createTandem( 'toggleSwitch' )
      }, options.toggleSwitchOptions ) );

      // rendering order
      this.addChild( toggleSwitch );
      this.addChild( labelA );
      this.addChild( labelB );

      // layout: 'A' on the left, 'B' on the right
      labelA.right = toggleSwitch.left - options.xSpacing;
      labelA.centerY = toggleSwitch.centerY;
      labelB.left = toggleSwitch.right + options.xSpacing;
      labelB.centerY = toggleSwitch.centerY;

      // add a horizontal strut that will cause the 'centerX' of this node to be at the center of the button
      if ( options.centerOnButton ) {
        const additionalWidth = Math.abs( labelA.width - labelB.width );
        const strut = new Line( 0, 0, this.width + additionalWidth, 0 );
        this.addChild( strut );
        strut.moveToBack();
        if ( labelA.width < labelB.width ) {
          strut.left = labelA.left - ( additionalWidth / 2 );
        }
        else {
          strut.left = labelA.left;
        }
      }

      const propertyListener = value => {
        if ( options.setEnabled ) {
          options.setEnabled( labelA, value === valueA );
          options.setEnabled( labelB, value === valueB );
        }
      };
      property.link( propertyListener ); // unlink on dispose

      // click on labels to select
      const pressListenerA = new PressListener( {
        release: () => { property.value = valueA; },
        tandem: labelA.tandem.createTandem( 'pressListener' )
      } );
      labelA.addInputListener( pressListenerA ); // removeInputListener on dispose

      const pressListenerB = new PressListener( {
        release: () => { property.value = valueB; },
        tandem: labelB.tandem.createTandem( 'pressListener' )
      } );
      labelB.addInputListener( pressListenerB ); // removeInputListener on dispose

      // @private - for dispose
      this.disposeABSwitch = () => {
        property.unlink( propertyListener );
        toggleSwitch.dispose();
        labelA.removeInputListener( pressListenerA );
        labelB.removeInputListener( pressListenerB );
        pressListenerA.dispose();
        pressListenerB.dispose();
      };

      this.mutate( options );

      // support for binder documentation, stripped out in builds and only runs when ?binder is specified
      assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ABSwitch', this );
    }

    /**
     * Make eligible for garbage collection.
     * @public
     * @override
     */
    dispose() {
      this.disposeABSwitch();
      super.dispose();
    }
  }

  return sun.register( 'ABSwitch', ABSwitch );
} );