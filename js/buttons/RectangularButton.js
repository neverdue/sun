// Copyright 2014-2020, University of Colorado Boulder

/**
 * Visual representation of a rectangular button.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Shape from '../../../kite/js/Shape.js';
import merge from '../../../phet-core/js/merge.js';
import AlignBox from '../../../scenery/js/nodes/AlignBox.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Color from '../../../scenery/js/util/Color.js';
import LinearGradient from '../../../scenery/js/util/LinearGradient.js';
import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import sun from '../sun.js';
import SunConstants from '../SunConstants.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import ButtonNode from './ButtonNode.js';

// constants
const VERTICAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
const HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
const SHADE_GRADIENT_LENGTH = 3; // In screen coords, which are roughly pixels.
const X_ALIGN_VALUES = [ 'center', 'left', 'right' ];
const Y_ALIGN_VALUES = [ 'center', 'top', 'bottom' ];

class RectangularButton extends ButtonNode {

  /**
   * @param {ButtonModel} buttonModel - Model that defines the button's behavior.
   * @param {Property} interactionStateProperty - a Property that is used to drive the visual appearance of the button
   * @param {Object} [options]
   */
  constructor( buttonModel, interactionStateProperty, options ) {

    options = merge( {

      // {Node|null} what appears on the button (icon, label, etc.)
      content: null,

      minWidth: HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH,
      minHeight: VERTICAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH,
      cursor: 'pointer',
      disabledBaseColor: ColorConstants.LIGHT_GRAY,
      xMargin: 8, // should be visibly greater than yMargin, see issue #109
      yMargin: 5,

      // pointer area dilation
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      // pointer area shift, see https://github.com/phetsims/sun/issues/500
      touchAreaXShift: 0,
      touchAreaYShift: 0,
      mouseAreaXShift: 0,
      mouseAreaYShift: 0,

      stroke: undefined, // undefined by default, which will cause a stroke to be derived from the base color
      lineWidth: 0.5, // Only meaningful if stroke is non-null

      // Alignment, relevant only when options minWidth or minHeight are greater than the size of options.content
      xAlign: 'center', // {string} see X_ALIGN_VALUES
      yAlign: 'center', // {string} see Y_ALIGN_VALUES

      // radius applied to all corners unless a corner-specific value is provided
      cornerRadius: 4,

      // {number|null} corner-specific radii
      // If null, the option is ignored.
      // If non-null, it overrides cornerRadius for the associated corner of the button.
      leftTopCornerRadius: null,
      rightTopCornerRadius: null,
      leftBottomCornerRadius: null,
      rightBottomCornerRadius: null,

      // Strategy for controlling the button's appearance, excluding any
      // content.  This can be a stock strategy from this file or custom.  To
      // create a custom one, model it off of the stock strategies defined in
      // this file.
      buttonAppearanceStrategy: RectangularButton.ThreeDAppearanceStrategy,

      // Strategy for controlling the appearance of the button's content based
      // on the button's state.  This can be a stock strategy from this file,
      // or custom.  To create a custom one, model it off of the stock
      // version(s) defined in this file.
      contentAppearanceStrategy: RectangularButton.FadeContentWhenDisabled,

      // pdom
      tagName: 'button',

      // phet-io
      tandem: Tandem.OPTIONAL, // This duplicates the parent option and works around https://github.com/phetsims/tandem/issues/50
      visiblePropertyOptions: { phetioFeatured: true }
    }, options );

    // validate options
    assert && assert( _.includes( X_ALIGN_VALUES, options.xAlign ), 'invalid xAlign: ' + options.xAlign );
    assert && assert( _.includes( Y_ALIGN_VALUES, options.yAlign ), 'invalid yAlign: ' + options.yAlign );

    super( buttonModel, interactionStateProperty, options );

    const content = options.content; // convenience variable

    // Compute the size of the button.
    const buttonWidth = Math.max( content ? content.width + options.xMargin * 2 : 0, options.minWidth );
    const buttonHeight = Math.max( content ? content.height + options.yMargin * 2 : 0, options.minHeight );

    // Create the rectangular part of the button.
    const button = new Path( createButtonShape( buttonWidth, buttonHeight, options ), {
      fill: this.baseColorProperty,
      lineWidth: options.lineWidth,
      pickable: false
    } );
    this.addChild( button );

    // Hook up the strategy that will control the button's appearance.
    const buttonAppearanceStrategy = new options.buttonAppearanceStrategy( button, interactionStateProperty,
      this.baseColorProperty, options );

    // Add the content to the button.
    let alignBox = null;
    if ( content ) {

      // Align content in the button rectangle. Must be disposed since it adds listener to content bounds.
      alignBox = new AlignBox( content, {
        alignBounds: new Bounds2(
          options.xMargin,
          options.yMargin,
          button.width - options.xMargin,
          buttonHeight - options.yMargin
        ),
        xAlign: options.xAlign,
        yAlign: options.yAlign,
        pickable: false // for performance
      } );
      this.addChild( alignBox );
    }

    // Hook up the strategy that will control the content's appearance.
    const contentAppearanceStrategy = new options.contentAppearanceStrategy( content, interactionStateProperty, options );

    // Set pointer areas.
    this.touchArea = button.localBounds
      .dilatedXY( options.touchAreaXDilation, options.touchAreaYDilation )
      .shifted( options.touchAreaXShift, options.touchAreaYShift );
    this.mouseArea = button.localBounds
      .dilatedXY( options.mouseAreaXDilation, options.mouseAreaYDilation )
      .shifted( options.mouseAreaXShift, options.mouseAreaYShift );

    // Mutate with the options after the layout is complete so that width-
    // dependent fields like centerX will work.
    this.mutate( options );

    // @private
    this.disposeRectangularButton = () => {
      buttonAppearanceStrategy.dispose();
      alignBox && alignBox.dispose();
      contentAppearanceStrategy.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeRectangularButton();
    super.dispose();
  }
}

/**
 * Convenience function for creating the shape of the button, done to avoid code duplication
 * @param {number} width
 * @param {number} height
 * @param {Object} config - RectangularButton config, containing values related to radii of button corners
 * @returns {Shape}
 */
function createButtonShape( width, height, config ) {
  assert && assert( typeof config.cornerRadius === 'number', 'cornerRadius is required' );
  return Shape.roundedRectangleWithRadii( 0, 0, width, height, {
    topLeft: config.leftTopCornerRadius !== null ? config.leftTopCornerRadius : config.cornerRadius,
    topRight: config.rightTopCornerRadius !== null ? config.rightTopCornerRadius : config.cornerRadius,
    bottomLeft: config.leftBottomCornerRadius !== null ? config.leftBottomCornerRadius : config.cornerRadius,
    bottomRight: config.rightBottomCornerRadius !== null ? config.rightBottomCornerRadius : config.cornerRadius
  } );
}

/**
 * Strategy for making a button look 3D-ish by using gradients that create the appearance of highlighted and shaded
 * edges.  The gradients are set up to make the light source appear to be in the upper left.
 * @param {Node} button
 * @param {Property.<String>} interactionStateProperty
 * @param {Property.<Color>} baseColorProperty
 * @param {Object} [options]
 * @constructor
 * @public
 */
RectangularButton.ThreeDAppearanceStrategy = function( button,
                                                       interactionStateProperty,
                                                       baseColorProperty,
                                                       options ) {

  const buttonWidth = button.width;
  const buttonHeight = button.height;

  // compute color stops for gradient, see issue #148
  assert && assert( buttonWidth >= HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH );
  assert && assert( buttonHeight >= VERTICAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH );
  const verticalHighlightStop = Math.min( VERTICAL_HIGHLIGHT_GRADIENT_LENGTH / buttonHeight, 1 );
  const verticalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonHeight, 0 );
  const horizontalHighlightStop = Math.min( HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH / buttonWidth, 1 );
  const horizontalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonWidth, 0 );

  const transparentWhite = new Color( 255, 255, 255, 0.7 );

  // Color properties
  // TODO https://github.com/phetsims/sun/issues/553 missing "Property" suffix for all PaintColorProperty names
  const baseBrighter7 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.7 } );
  const baseBrighter5 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.5 } );
  const baseBrighter2 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.2 } );
  const baseDarker3 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.3 } );
  const baseDarker4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );
  const baseDarker5 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.5 } );
  const disabledBase = new PaintColorProperty( options.disabledBaseColor );
  const disabledBaseBrighter7 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: 0.7 } );
  const disabledBaseBrighter5 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: 0.5 } );
  const disabledBaseBrighter2 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: 0.2 } );
  const disabledBaseDarker3 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: -0.3 } );
  const disabledBaseDarker4 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: -0.4 } );
  const disabledBaseDarker5 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: -0.5 } );
  const baseTransparent = new DerivedProperty( [ baseColorProperty ], color => color.withAlpha( 0 ) );
  const disabledBaseTransparent = new DerivedProperty( [ disabledBase ], color => color.withAlpha( 0 ) );

  // Create the gradient fills used for various button states
  const upFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
    .addColorStop( 0, baseBrighter7 )
    .addColorStop( verticalHighlightStop, baseColorProperty )
    .addColorStop( verticalShadowStop, baseColorProperty )
    .addColorStop( 1, baseDarker5 );

  const upFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
    .addColorStop( 0, transparentWhite )
    .addColorStop( horizontalHighlightStop, baseTransparent )
    .addColorStop( horizontalShadowStop, baseTransparent )
    .addColorStop( 1, baseDarker5 );

  const overFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
    .addColorStop( 0, baseBrighter7 )
    .addColorStop( verticalHighlightStop, baseBrighter5 )
    .addColorStop( verticalShadowStop, baseBrighter5 )
    .addColorStop( 1, baseDarker5 );

  const overFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
    .addColorStop( 0, transparentWhite )
    .addColorStop( horizontalHighlightStop / 2, new Color( 255, 255, 255, 0 ) )
    .addColorStop( horizontalShadowStop, baseTransparent )
    .addColorStop( 1, baseDarker3 );

  const downFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
    .addColorStop( 0, baseBrighter7 )
    .addColorStop( verticalHighlightStop * 0.67, baseDarker3 )
    .addColorStop( verticalShadowStop, baseBrighter2 )
    .addColorStop( 1, baseDarker5 );

  const disabledFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
    .addColorStop( 0, disabledBaseBrighter7 )
    .addColorStop( verticalHighlightStop, disabledBaseBrighter5 )
    .addColorStop( verticalShadowStop, disabledBaseBrighter5 )
    .addColorStop( 1, disabledBaseDarker5 );

  const disabledFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
    .addColorStop( 0, disabledBaseBrighter7 )
    .addColorStop( horizontalHighlightStop, disabledBaseTransparent )
    .addColorStop( horizontalShadowStop, disabledBaseTransparent )
    .addColorStop( 1, disabledBaseDarker5 );

  const disabledPressedFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
    .addColorStop( 0, disabledBaseBrighter7 )
    .addColorStop( verticalHighlightStop * 0.67, disabledBaseDarker3 )
    .addColorStop( verticalShadowStop, disabledBaseBrighter2 )
    .addColorStop( 1, disabledBaseDarker5 );

  // strokes filled in below
  let enabledStroke;
  let disabledStroke;

  if ( options.stroke === null ) {
    // The stroke was explicitly set to null, so the button should have no stroke.
    enabledStroke = null;
    disabledStroke = null;
  }
  else if ( typeof ( options.stroke ) === 'undefined' ) {
    // No stroke was defined, but it wasn't set to null, so default to a stroke based on the base color of the
    // button.  This behavior is a bit unconventional for Scenery nodes, but it makes the buttons look much better.
    enabledStroke = baseDarker4;
    disabledStroke = disabledBaseDarker4;
  }
  else {
    enabledStroke = options.stroke;
    disabledStroke = disabledBaseDarker4;
  }

  // Create the overlay that is used to add shading to left and right edges of the button.
  const overlayForHorizGradient = new Path( createButtonShape( buttonWidth, buttonHeight, options ), {
    lineWidth: options.lineWidth,
    pickable: false
  } );
  button.addChild( overlayForHorizGradient );

  button.cachedPaints = [
    upFillVertical, overFillVertical, downFillVertical, disabledFillVertical, disabledPressedFillVertical,
    disabledStroke
  ];

  overlayForHorizGradient.cachedPaints = [
    upFillHorizontal, overFillHorizontal, disabledFillHorizontal, enabledStroke, disabledStroke
  ];

  // Function for updating the button's appearance based on the current interaction state.
  function updateAppearance( interactionState ) {

    switch( interactionState ) {

      case ButtonInteractionState.IDLE:
        button.fill = upFillVertical;
        overlayForHorizGradient.stroke = enabledStroke;
        overlayForHorizGradient.fill = upFillHorizontal;
        break;

      case ButtonInteractionState.OVER:
        button.fill = overFillVertical;
        overlayForHorizGradient.stroke = enabledStroke;
        overlayForHorizGradient.fill = overFillHorizontal;
        break;

      case ButtonInteractionState.PRESSED:
        button.fill = downFillVertical;
        overlayForHorizGradient.stroke = enabledStroke;
        overlayForHorizGradient.fill = overFillHorizontal;
        break;

      case ButtonInteractionState.DISABLED:
        button.fill = disabledFillVertical;
        button.stroke = disabledStroke;
        overlayForHorizGradient.stroke = disabledStroke;
        overlayForHorizGradient.fill = disabledFillHorizontal;
        break;

      case ButtonInteractionState.DISABLED_PRESSED:
        button.fill = disabledPressedFillVertical;
        button.stroke = disabledStroke;
        overlayForHorizGradient.stroke = disabledStroke;
        overlayForHorizGradient.fill = disabledFillHorizontal;
        break;

      default:
        throw new Error( 'unsupported interactionState: ' + interactionState );
    }
  }

  // Do the initial update explicitly, then lazy link to the properties.  This keeps the number of initial updates to
  // a minimum and allows us to update some optimization flags the first time the base color is actually changed.
  interactionStateProperty.link( updateAppearance );

  this.dispose = () => {
    if ( interactionStateProperty.hasListener( updateAppearance ) ) {
      interactionStateProperty.unlink( updateAppearance );
    }

    baseTransparent.dispose();
    disabledBaseTransparent.dispose();
    disabledBase.dispose();
    baseBrighter7.dispose();
    baseBrighter5.dispose();
    baseBrighter2.dispose();
    baseDarker3.dispose();
    baseDarker4.dispose();
    baseDarker5.dispose();
    disabledBaseBrighter7.dispose();
    disabledBaseBrighter5.dispose();
    disabledBaseBrighter2.dispose();
    disabledBaseDarker3.dispose();
    disabledBaseDarker4.dispose();
    disabledBaseDarker5.dispose();
  };
};

/**
 * Strategy for buttons that look flat, i.e. no shading or highlighting, but that change color on mouseover, press,
 * etc.
 *
 * @param {Node} button
 * @param {Property.<boolean>} interactionStateProperty
 * @param {Property.<Color>} baseColorProperty
 * @param {Object} [options]
 * @constructor
 * @public
 */
RectangularButton.FlatAppearanceStrategy = function( button, interactionStateProperty, baseColorProperty, options ) {

  // Color properties
  const baseBrighter4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.4 } );
  const baseDarker4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );
  const disabledBaseDarker4 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: -0.4 } );

  // fills used for various button states
  const upFill = baseColorProperty;
  const overFill = baseBrighter4;
  const downFill = baseDarker4;
  const disabledFill = options.disabledBaseColor;
  const disabledPressedFillVertical = disabledFill;

  let enabledStroke;
  let disabledStroke;

  if ( options.stroke === null ) {
    // The stroke was explicitly set to null, so the button should have no stroke.
    enabledStroke = null;
    disabledStroke = null;
  }
  else if ( typeof ( options.stroke ) === 'undefined' ) {
    // No stroke was defined, but it wasn't set to null, so default to a stroke based on the base color of the
    // button.  This behavior is a bit unconventional for Scenery nodes, but it makes the buttons look much better.
    enabledStroke = baseDarker4;
    disabledStroke = disabledBaseDarker4;
  }
  else {
    enabledStroke = options.stroke;
    disabledStroke = disabledBaseDarker4;
  }

  button.cachedPaints = [
    upFill, overFill, downFill, disabledFill, disabledPressedFillVertical,
    enabledStroke, disabledStroke
  ];

  function updateAppearance( interactionState ) {
    switch( interactionState ) {

      case ButtonInteractionState.IDLE:
        button.fill = upFill;
        button.stroke = enabledStroke;
        break;

      case ButtonInteractionState.OVER:
        button.fill = overFill;
        button.stroke = enabledStroke;
        break;

      case ButtonInteractionState.PRESSED:
        button.fill = downFill;
        button.stroke = enabledStroke;
        break;

      case ButtonInteractionState.DISABLED:
        button.fill = disabledFill;
        button.stroke = disabledStroke;
        break;

      case ButtonInteractionState.DISABLED_PRESSED:
        button.fill = disabledPressedFillVertical;
        button.stroke = disabledStroke;
        break;

      default:
        throw new Error( 'unsupported interactionState: ' + interactionState );
    }
  }

  interactionStateProperty.link( updateAppearance );

  this.dispose = () => {
    if ( interactionStateProperty.hasListener( updateAppearance ) ) {
      interactionStateProperty.unlink( updateAppearance );
    }

    baseBrighter4.dispose();
    baseDarker4.dispose();
    disabledBaseDarker4.dispose();
  };
};

/**
 * Basic strategy for controlling content appearance, fades the content by making it transparent when disabled.
 *
 * @param {Node|null} content
 * @param {Property} interactionStateProperty
 * @constructor
 * @public
 */
RectangularButton.FadeContentWhenDisabled = function( content, interactionStateProperty ) {

  // update the opacity when the state changes
  function updateOpacity( state ) {
    if ( content ) {
      content.opacity = state === ButtonInteractionState.DISABLED ||
                        state === ButtonInteractionState.DISABLED_PRESSED ? SunConstants.DISABLED_OPACITY : 1;
    }
  }

  interactionStateProperty.link( updateOpacity );

  // add dispose function to unlink listener
  this.dispose = () => {
    if ( interactionStateProperty.hasListener( updateOpacity ) ) {
      interactionStateProperty.unlink( updateOpacity );
    }
  };
};

sun.register( 'RectangularButton', RectangularButton );
export default RectangularButton;