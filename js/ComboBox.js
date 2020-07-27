// Copyright 2013-2020, University of Colorado Boulder

/**
 * Scenery-based combo box. Composed of a button and a popup 'list box' of items. ComboBox has no interaction of its
 * own, all interaction is handled by its subcomponents. The list box is displayed when the button is pressed, and
 * dismissed when an item is selected, the user clicks on the button, or the user clicks outside the list. The list
 * can be displayed either above or below the button.
 *
 * The supporting classes are:
 *
 * ComboBoxItem - items provided to ComboBox constructor
 * ComboBoxButton - the button
 * ComboBoxListBox - the list box
 * ComboBoxListItemNode - an item in the list box
 *
 * For info on ComboBox UI design, including a11y, see https://github.com/phetsims/sun/blob/master/doc/ComboBox.md
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Vector2 from '../../dot/js/Vector2.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../phet-core/js/merge.js';
import PDOMPeer from '../../scenery/js/accessibility/pdom/PDOMPeer.js';
import Display from '../../scenery/js/display/Display.js';
import Node from '../../scenery/js/nodes/Node.js';
import EventType from '../../tandem/js/EventType.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import ComboBoxButton from './ComboBoxButton.js';
import ComboBoxIO from './ComboBoxIO.js';
import ComboBoxListBox from './ComboBoxListBox.js';
import sun from './sun.js';

// const
const LIST_POSITION_VALUES = [ 'above', 'below' ]; // where the list pops up relative to the button
const ALIGN_VALUES = [ 'left', 'right', 'center' ]; // alignment of item on button and in list

class ComboBox extends Node {

  /**
   * @param {ComboBoxItem[]} items
   * @param {Property} property
   * @param {Node} listParent node that will be used as the list's parent, use this to ensure that the list is in front of everything else
   * @param {Object} [options] object with optional properties
   * @constructor
   */
  constructor( items, property, listParent, options ) {

    // See https://github.com/phetsims/sun/issues/542
    assert && assert( listParent.maxWidth === null,
      'ComboBox is responsible for scaling listBox. Setting maxWidth for listParent may result in buggy behavior.' );

    options = merge( {

      align: 'left', // see ALIGN_VALUES
      listPosition: 'below', // see LIST_POSITION_VALUES
      labelNode: null, // {Node|null} optional label, placed to the left of the combo box
      labelXSpacing: 10, // horizontal space between label and combo box
      enabledProperty: null, // {BooleanProperty|null} default will be provided if null
      disabledOpacity: 0.5, // {number} opacity used to make the control look disabled, 0-1
      cornerRadius: 4, // applied to button, listBox, and item highlights
      highlightFill: 'rgb( 245, 245, 245 )', // {Color|string} highlight behind items in the list

      // Margins around the edges of the button and listbox when highlight is invisible.
      // Highlight margins around the items in the list are set to 1/2 of these values.
      // These values must be > 0.
      xMargin: 12,
      yMargin: 8,

      // button
      buttonFill: 'white', // {Color|string}
      buttonStroke: 'black', // {Color|string}
      buttonLineWidth: 1,
      buttonTouchAreaXDilation: 0,
      buttonTouchAreaYDilation: 0,
      buttonMouseAreaXDilation: 0,
      buttonMouseAreaYDilation: 0,

      // list
      listFill: 'white', // {Color|string}
      listStroke: 'black', // {Color|string}
      listLineWidth: 1,

      // {Playable|null} - Sound generators for when combo box is opened, closed with no change, and/or closed with a
      // changed selection.  If set to `null` the default sound will be used, use Playable.NO_SOUND to disable.
      openedSoundPlayer: null,
      closedNoChangeSoundPlayer: null,
      selectionChangedSoundPlayer: null,

      // pdom
      accessibleName: null, // the a11y setter for this is overridden, see below
      helpText: null, // the a11y setter for this is overridden, see below

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioType: ComboBoxIO,
      phetioEventType: EventType.USER
    }, options );

    // Use this pattern so that passed in phetioComponentOptions are not blown away.
    PhetioObject.mergePhetioComponentOptions( { visibleProperty: { phetioFeatured: true } }, options );

    // validate option values
    assert && assert( options.xMargin > 0 && options.yMargin > 0,
      'margins must be > 0, xMargin=' + options.xMargin + ', yMargin=' + options.yMargin );
    assert && assert( options.disabledOpacity > 0 && options.disabledOpacity < 1,
      'invalid disabledOpacity: ' + options.disabledOpacity );
    assert && assert( _.includes( LIST_POSITION_VALUES, options.listPosition ),
      'invalid listPosition: ' + options.listPosition );
    assert && assert( _.includes( ALIGN_VALUES, options.align ),
      'invalid align: ' + options.align );

    super();

    this.items = items; // @private
    this.listPosition = options.listPosition; // @private

    // optional label
    if ( options.labelNode !== null ) {
      this.addChild( options.labelNode );
    }

    // @private button that shows the current selection
    this.button = new ComboBoxButton( property, items, {
      align: options.align,
      arrowDirection: ( options.listPosition === 'below' ) ? 'down' : 'up',
      cornerRadius: options.cornerRadius,
      xMargin: options.xMargin,
      yMargin: options.yMargin,
      baseColor: options.buttonFill,
      stroke: options.buttonStroke,
      lineWidth: options.buttonLineWidth,
      touchAreaXDilation: options.buttonTouchAreaXDilation,
      touchAreaYDilation: options.buttonTouchAreaYDilation,
      mouseAreaXDilation: options.buttonMouseAreaXDilation,
      mouseAreaYDilation: options.buttonMouseAreaYDilation,

      // pdom - accessibleName and helpText are set via overridden functions on the prototype. See below.

      // phet-io
      tandem: options.tandem.createTandem( 'button' )
    } );
    this.addChild( this.button );

    // put optional label to left of button
    if ( options.labelNode ) {
      this.button.left = options.labelNode.right + options.labelXSpacing;
      this.button.centerY = options.labelNode.centerY;
    }

    // @private the popup list box
    this.listBox = new ComboBoxListBox( property, items,
      this.hideListBox.bind( this ), // callback to hide the list box
      this.button.focus.bind( this.button ), // callback to transfer focus to button
      options.tandem.createTandem( 'listBox' ), {
        align: options.align,
        highlightFill: options.highlightFill,
        xMargin: options.xMargin,
        yMargin: options.yMargin,
        cornerRadius: options.cornerRadius,
        fill: options.listFill,
        stroke: options.listStroke,
        lineWidth: options.listLineWidth,
        visible: false,

        // sound generation
        openedSoundPlayer: options.openedSoundPlayer,
        closedNoChangeSoundPlayer: options.closedNoChangeSoundPlayer,
        selectionChangedSoundPlayer: options.selectionChangedSoundPlayer,

        // pdom
        // the list box is aria-labelledby its own label sibling
        ariaLabelledbyAssociations: [ {
          otherNode: this.button,
          otherElementName: PDOMPeer.LABEL_SIBLING,
          thisElementName: PDOMPeer.PRIMARY_SIBLING
        } ]
      } );
    listParent.addChild( this.listBox );
    this.listParent = listParent; // @private

    // The listBox is not a child Node of ComboBox and, as a result, listen to opacity of the ComboBox and keep
    // the listBox in sync with them. See https://github.com/phetsims/sun/issues/587
    this.opacityProperty.link( opacity => { this.listBox.opacityProperty.value = opacity; } );

    this.mutate( options );

    // Clicking on the button toggles visibility of the list box
    this.button.addListener( () => {
      this.listBox.visibleProperty.value = !this.listBox.visibleProperty.value;
    } );

    //TODO sun#462 integrate this with above button listener, to eliminate order dependency
    // Handle button clicks, for a11y
    this.button.addInputListener( {
      click: () => {
        if ( this.listBox.visible ) {
          this.listBox.focus();
        }
      }
    } );

    // @private the display that clickToDismissListener is added to, because the scene may change, see sun#14
    this.display = null;

    // @private Clicking anywhere other than the button or list box will hide the list box.
    this.clickToDismissListener = {
      down: event => {

        // Ignore if we click over the button, since the button will handle hiding the list.
        if ( !( event.trail.containsNode( this.button ) || event.trail.containsNode( this.listBox ) ) ) {
          this.hideListBox();
        }
      }
    };

    // @private - (PDOM) when focus leaves the ComboBoxListBox, it should be closed. This could happen from keyboard
    // or from other screen reader controls (like VoiceOver gestures)
    this.dismissWithFocusListener = focus => {
      if ( focus && !focus.trail.containsNode( this.listBox ) ) {
        this.hideListBox();
      }
    };
    Display.focusProperty.link( this.dismissWithFocusListener );

    // So we know whether we can dispose of the enabledProperty and its tandem
    const ownsEnabledProperty = !options.enabledProperty;

    // @public Provide a default if not specified
    this.enabledProperty = options.enabledProperty || new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'enabledProperty' ),
      phetioFeatured: true
    } );

    // enable/disable the combo box
    const enabledObserver = enabled => {
      this.pickable = enabled;
      this.opacity = enabled ? 1.0 : options.disabledOpacity;
      this.button.setAccessibleAttribute( 'aria-disabled', !enabled );
    };
    this.enabledProperty.link( enabledObserver );

    this.listBox.localBoundsProperty.lazyLink( () => this.moveListBox() );

    this.listBox.visibleProperty.link( ( visible, wasVisible ) => {
      if ( visible ) {

        // show the list box
        this.scaleListBox();
        this.listBox.moveToFront();
        this.moveListBox();

        // manage clickToDismissListener
        assert && assert( !this.display, 'unexpected display' );
        this.display = this.getUniqueTrail().rootNode().getRootedDisplays()[ 0 ];
        this.display.addInputListener( this.clickToDismissListener );
      }
      else {

        // manage clickToDismissListener
        if ( this.display && this.display.hasInputListener( this.clickToDismissListener ) ) {
          this.display.removeInputListener( this.clickToDismissListener );
          this.display = null;
        }
      }
    } );

    // @private for use via PhET-iO, see https://github.com/phetsims/sun/issues/451
    // This is not generally controlled by the user, so it is not reset when the Reset All button is pressed.
    this.displayOnlyProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'displayOnlyProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'disables interaction with the ComboBox and ' +
                           'makes it appear like a display that shows the current selection'
    } );
    this.displayOnlyProperty.link( displayOnly => {
      this.hideListBox();
      this.button.setDisplayOnly( displayOnly );
      this.pickable = !displayOnly;
    } );

    this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // @private called by dispose
    this.disposeComboBox = () => {

      if ( this.display && this.display.hasInputListener( this.clickToDismissListener ) ) {
        this.display.removeInputListener( this.clickToDismissListener );
      }

      if ( ownsEnabledProperty ) {
        this.enabledProperty.dispose();
      }
      else {
        this.enabledProperty.unlink( enabledObserver );
      }

      Display.focusProperty.unlink( this.dismissWithFocusListener );

      // dispose of subcomponents
      this.listBox.dispose();
      this.button.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ComboBox', this );
  }

  // @public - Provide dispose() on the prototype for ease of subclassing.
  dispose() {
    this.disposeComboBox();
    Node.prototype.dispose.call( this );
  }

  // @public
  setEnabled( enabled ) { this.enabledProperty.value = enabled; }

  set enabled( value ) { this.setEnabled( value ); }

  // @public
  getEnabled() { return this.enabledProperty.value; }

  get enabled() { return this.getEnabled(); }

  /**
   * Instead of setting accessibleName on ComboBox, forward accessibleName setter to the button
   * @param {string} accessibleName
   * @override
   */
  set accessibleName( accessibleName ) {

    // set labelContent here instead of accessibleName because of ComboBoxButton implementation -- see that file for more details
    this.button.labelContent = accessibleName;
  }

  /**
   * Instead of setting accessibleName on ComboBox, forward helpText setter to the button
   * @param {string} helpText
   * @override
   */
  set helpText( helpText ) { this.button.helpText = helpText; }

  /**
   * Shows the list box.
   * @public
   */
  showListBox() {
    this.listBox.visibleProperty.value = true;
  }

  /**
   * Hides the list box.
   * @public
   */
  hideListBox() {
    this.listBox.visibleProperty.value = false;
  }

  /**
   * Because the button and list box have different parents (and therefore different coordinate frames)
   * they may be scaled differently. This method scales the list box so that items on the button and in
   * the list appear to be the same size.
   * @private
   */
  scaleListBox() {
    const buttonScale = this.button.localToGlobalBounds( this.button.localBounds ).width / this.button.localBounds.width;
    const listBoxScale = this.listBox.localToGlobalBounds( this.listBox.localBounds ).width / this.listBox.localBounds.width;

    // To support an empty list box due to PhET-iO customization, see https://github.com/phetsims/sun/issues/606
    if ( Number.isFinite( listBoxScale ) ) {
      this.listBox.scale( buttonScale / listBoxScale );
    }
  }

  /**
   * Handles the coordinate transform required to make the list box pop up near the button.
   * @private
   */
  moveListBox() {
    if ( this.listPosition === 'above' ) {
      const pButtonGlobal = this.localToGlobalPoint( new Vector2( this.button.left, this.button.top ) );
      const pButtonLocal = this.listParent.globalToLocalPoint( pButtonGlobal );
      this.listBox.left = pButtonLocal.x;
      this.listBox.bottom = pButtonLocal.y;
    }
    else {
      const pButtonGlobal = this.localToGlobalPoint( new Vector2( this.button.left, this.button.bottom ) );
      const pButtonLocal = this.listParent.globalToLocalPoint( pButtonGlobal );
      this.listBox.left = pButtonLocal.x;
      this.listBox.top = pButtonLocal.y;
    }
  }
}

sun.register( 'ComboBox', ComboBox );
export default ComboBox;