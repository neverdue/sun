// Copyright 2020, University of Colorado Boulder

/**
 * Central class for the sun button hierarchy. This type factors out logic that applies to all sun buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import required from '../../../phet-core/js/required.js';
import Node from '../../../scenery/js/nodes/Node.js';
import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import EnabledNode from '../EnabledNode.js';
import sun from '../sun.js';

class ButtonNode extends Node {

  /**
   * @param {ButtonModel} buttonModel
   * @param {Node} buttonBackground - the background of the button (like a circle or rectangle).
   * @param {Property} interactionStateProperty - a Property that is used to drive the visual appearance of the button
   * @param {Object} [options] - this type does not mutate its options, but relies on the subtype to
   */
  constructor( buttonModel, buttonBackground, interactionStateProperty, options ) {

    options = merge( {
      tandem: Tandem.OPTIONAL,

      // Options that will be passed through to the main input listener (PressListener)
      listenerOptions: null,

      // {ColorDef} initial color of the button's background
      baseColor: ColorConstants.LIGHT_BLUE,

      // {string} default cursor
      cursor: 'pointer',

      // TODO: workaround for difficulty in mutate/instrumentation order of sun buttons,
      //  see https://github.com/phetsims/sun/issues/643 or https://github.com/phetsims/sun/issues/515
      phetioLinkEnabledElement: false,

      // Class that determines the button's appearance for the values of interactionStateProperty.
      // See RectangularButton.FlatAppearanceStrategy for an example of the interface required.
      buttonAppearanceStrategy: null // TODO: add a default up here, see https://github.com/phetsims/sun/issues/647

    }, options );

    options.listenerOptions = merge( {
      tandem: options.tandem.createTandem( 'pressListener' )
    }, options.listenerOptions );

    assert && options.enabledProperty && assert( options.enabledProperty === buttonModel.enabledProperty,
      'if options.enabledProperty is provided, it must === buttonModel.enabledProperty' );
    options.enabledProperty = buttonModel.enabledProperty;

    super( options );

    this.initializeEnabledNode( options );

    // @protected
    this.buttonModel = buttonModel;

    // Make the base color into a Property so that the appearance strategy can update itself if changes occur.
    this.baseColorProperty = new PaintColorProperty( options.baseColor ); // @private

    // @private {PressListener}
    this._pressListener = buttonModel.createPressListener( options.listenerOptions );
    this.addInputListener( this._pressListener );

    assert && assert( buttonBackground.fill === null, 'ButtonNode controls the fill for the buttonBackground' );
    buttonBackground.pickable = false;
    buttonBackground.fill = this.baseColorProperty;
    this.addChild( buttonBackground );

    // Hook up the strategy that will control the button's appearance.
    const buttonAppearanceStrategy = new (required( options.buttonAppearanceStrategy ))( buttonBackground, interactionStateProperty,
      this.baseColorProperty, options );

    // @private - define a dispose function
    this.disposeButtonNode = () => {
      this.baseColorProperty.dispose();
      this._pressListener.dispose();
      buttonAppearanceStrategy.dispose && buttonAppearanceStrategy.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeButtonNode();
    super.dispose();
  }

  /**
   * Sets the base color, which is the main background fill color used for the button.
   * @param {Color|String} baseColor
   * @public
   */
  setBaseColor( baseColor ) { this.baseColorProperty.paint = baseColor; }

  set baseColor( baseColor ) { this.setBaseColor( baseColor ); }

  /**
   * Gets the base color for this button.
   * @returns {Color}
   * @public
   */
  getBaseColor() { return this.baseColorProperty.paint; }

  get baseColor() { return this.getBaseColor(); }

  /**
   * Manually click the button, as it would be clicked in response to alternative input. Recommended only for
   * accessibility usages. For the most part, PDOM button functionality should be managed by PressListener, this should
   * rarely be used.
   * @public
   */
  pdomClick() {
    this._pressListener.click();
  }

  /**
   * Is the button currently firing because of accessibility input coming from the PDOM?
   * @public (pdom)
   * @returns {boolean}
   */
  isPDOMClicking() {
    return this._pressListener.pdomClickingProperty.get();
  }
}

EnabledNode.mixInto( ButtonNode );

sun.register( 'ButtonNode', ButtonNode );
export default ButtonNode;