// Copyright 2018, University of Colorado Boulder

/**
 * General dialog type. Migrated from Joist on 4/10/2018
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrea Lin (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const AccessibilityUtil = require( 'SCENERY/accessibility/AccessibilityUtil' );
  const AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const DialogIO = require( 'SUN/DialogIO' );
  const Display = require( 'SCENERY/display/Display' );
  const FullScreen = require( 'SCENERY/util/FullScreen' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  const Panel = require( 'SUN/Panel' );
  const Path = require( 'SCENERY/nodes/Path' );
  const RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const Shape = require( 'KITE/Shape' );
  const sun = require( 'SUN/sun' );
  const SunA11yStrings = require( 'SUN/SunA11yStrings' );
  const Tandem = require( 'TANDEM/Tandem' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const closeString = SunA11yStrings.close.value;

  // constants
  const CLOSE_BUTTON_WIDTH = 14;

  /**
   * @param {Node} content - The content to display inside the dialog (not including the title)
   * @param {Object} [options]
   * @constructor
   */
  function Dialog( content, options ) {

    options = _.extend( {

      /* Margins and spacing:
       ____________________________________________________________________________
      |                                     |                          |           |
      |                                     |                          closeButton |
      |                                     topMargin                  TopMargin   |
      |                                     |                         _|___        |
      |                  ___________________|____________________    |     |       |
      |--------l--------|                                        |-x-|  X  |---c---|
      |        e        |   Title                                | S |_____|   l   |
      |        f        |________________________________________| P           o   |
      |        t        |   |                                    | a           s   |
      |        M        |   ySpacing                             | c           e   |
      |        a        |___|____________________________________| i           B   |
      |        r        |                                        | n           u   |
      |        g        |   Content                              | g           t   |
      |        i        |                                        |             t   |
      |        n        |                                        |             o   |
      |                 |                                        |             n   |
      |                 |                                        |             R   |
      |                 |                                        |             i   |
      |                 |                                        |             g   |
      |                 |                                        |             h   |
      |                 |                                        |             M   |
      |                 |________________________________________|             a   |
      |                                     |                                  r   |
      |                                     |                                  g   |
      |                                     bottomMargin                       i   |
      |                                     |                                  n   |
      |_____________________________________|______________________________________|
       */

      xSpacing: 10, // {number} how far the title and content is placed to the left of the close button
      ySpacing: 10, // {number} vertical space between title and content
      topMargin: 15, // {number} margin above content, or above title if provided
      bottomMargin: 15, // {number} margin below content
      leftMargin: null, // {number|null} margin to the left of the content.  If null, this is computed so that we have
      // the same margins on the left and right of the content.
      closeButtonTopMargin: 10, // {number} margin above the close button
      closeButtonRightMargin: 10, // {number} margin to the right of the close button

      // more Dialog-specific options
      modal: true, // {boolean} modal dialogs prevent interaction with the rest of the sim while open

      // {Node|null} Title to be displayed at top. For a11y, make sure that its primary sibling has an accessible name
      title: null,
      titleAlign: 'center', // horizontal alignment of the title: {string} left, right or center

      // {function} which sets the dialog's position in global coordinates. called as
      // layoutStrategy( dialog, simBounds, screenBounds, scale )
      layoutStrategy: Dialog.DEFAULT_LAYOUT_STRATEGY,

      // close button options
      closeButtonListener: () => this.hide(),
      closeButtonTouchAreaXDilation: 0,
      closeButtonTouchAreaYDilation: 0,
      closeButtonMouseAreaXDilation: 0,
      closeButtonMouseAreaYDilation: 0,

      // {function|null} called after the dialog is shown, see https://github.com/phetsims/joist/issues/478
      showCallback: null,

      // {function|null} called after the dialog is hidden, see https://github.com/phetsims/joist/issues/478
      hideCallback: null,

      // pass through to Panel options
      cornerRadius: 10, // {number} radius of the dialog's corners
      resize: true, // {boolean} whether to resize if content's size changes
      fill: 'white', // {string|Color}
      stroke: 'black', // {string|Color}
      backgroundPickable: true,
      tandem: Tandem.optional,
      phetioType: DialogIO,
      phetioReadOnly: false, // default to false so it can pass it through to the close button
      phetioState: false, // default to false so it can pass it through to the close button

      // a11y options
      tagName: 'div',
      ariaRole: 'dialog',
      focusOnCloseNode: null // {Node} receives focus on close, if null focus returns to element that had focus on open
    }, options );

    assert && assert( options.xMargin === undefined, 'Dialog sets xMargin' );
    options.xMargin = 0;
    assert && assert( options.yMargin === undefined, 'Dialog sets yMargin' );
    options.yMargin = 0;

    // if left margin is specified in options, use it. otherwise, set it to make the left right gutters symmetrical
    if ( options.leftMargin === null ) {
      options.leftMargin = options.xSpacing + CLOSE_BUTTON_WIDTH + options.closeButtonRightMargin;
    }

    // @private (read-only)
    this.isModal = options.modal;

    // @private
    this.showCallback = options.showCallback;
    this.hideCallback = options.hideCallback;

    // see https://github.com/phetsims/joist/issues/293
    assert && assert( this.isModal, 'Non-modal dialogs not currently supported' );

    // @protected - whether the dialog is showing
    this.isShowing = false;

    // create close button
    const closeButton = new CloseButton( {

      iconLength: CLOSE_BUTTON_WIDTH,
      listener: () => {
        options.closeButtonListener();

        // if listener was fired because of accessibility
        if ( closeButton.buttonModel.isA11yClicking() ) {
          this.focusActiveElement();
        }
      },

      // phet-io
      tandem: options.tandem.createTandem( 'closeButton' ),
      phetioReadOnly: options.phetioReadOnly, // match the readOnly of the Dialog
      phetioState: options.phetioState, // match the state transfer of the Dialog

      // a11y
      tagName: 'button',
      innerContent: closeString
    } );

    // touch/mouse areas for the close button
    closeButton.touchArea = closeButton.bounds.dilatedXY(
      options.closeButtonTouchAreaXDilation,
      options.closeButtonTouchAreaYDilation
    );
    closeButton.mouseArea = closeButton.bounds.dilatedXY(
      options.closeButtonMouseAreaXDilation,
      options.closeButtonMouseAreaYDilation
    );

    // @private (a11y)
    this.closeButton = closeButton;

    // Align content, title, and close button using spacing and margin options

    // align content and title (if provided) vertically
    const contentAndTitle = new VBox( {
      children: options.title ? [ options.title, content ] : [ content ],
      spacing: options.ySpacing,
      align: options.titleAlign
    } );

    // add topMargin, bottomMargin, and leftMargin
    const contentAndTitleWithMargins = new AlignBox( contentAndTitle, {
      topMargin: options.topMargin,
      bottomMargin: options.bottomMargin,
      leftMargin: options.leftMargin
    } );

    // add closeButtonTopMargin and closeButtonRightMargin
    const closeButtonWithMargins = new AlignBox( closeButton, {
      topMargin: options.closeButtonTopMargin,
      rightMargin: options.closeButtonRightMargin
    } );

    // create content for Panel
    const dialogContent = new HBox( {
      children: [ contentAndTitleWithMargins, closeButtonWithMargins ],
      spacing: options.xSpacing,
      align: 'top'
    } );

    Panel.call( this, dialogContent, options );

    const sim = window.phet.joist.sim;

    // @private
    this.updateLayout = () =>
      options.layoutStrategy( this, sim.boundsProperty.value, sim.screenBoundsProperty.value, sim.scaleProperty.value );

    this.updateLayout();

    // @private
    this.sim = sim;

    // a11y - set the order of content, close button first so remaining content can be read from top to bottom
    // with virtual cursor
    this.accessibleOrder = [ closeButton, options.title, content ].filter( node => node !== undefined );

    // a11y - set the aria-labelledby relation so that whenever focus enters the dialog the title is read
    if ( options.title && options.title.tagName ) {
      this.addAriaLabelledbyAssociation( {
        thisElementName: AccessiblePeer.PRIMARY_SIBLING,
        otherNode: options.title,
        otherElementName: AccessiblePeer.PRIMARY_SIBLING
      } );
    }

    // must be removed on dispose
    this.sim.resizedEmitter.addListener( this.updateLayout );

    // @private (a11y) - the active element when the dialog is shown, tracked so that focus can be restored on close
    this.activeElement = options.focusOnCloseNode || null;

    // a11y - close the dialog when pressing "escape"
    const escapeListener = {
      keydown: event => {
        const domEvent = event.domEvent;

        if ( domEvent.keyCode === KeyboardUtil.KEY_ESCAPE ) {
          domEvent.preventDefault();
          this.hide();
          this.focusActiveElement();
        }
        else if ( domEvent.keyCode === KeyboardUtil.KEY_TAB && FullScreen.isFullScreen() ) {

          // prevent a particular bug in Windows 7/8.1 Firefox where focus gets trapped in the document
          // when the navigation bar is hidden and there is only one focusable element in the DOM
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=910136
          const activeId = Display.focus.trail.getUniqueId();
          const noNextFocusable = AccessibilityUtil.getNextFocusable().id === activeId;
          const noPreviousFocusable = AccessibilityUtil.getPreviousFocusable().id === activeId;

          if ( noNextFocusable && noPreviousFocusable ) {
            domEvent.preventDefault();
          }
        }
      }
    };
    this.addInputListener( escapeListener );

    // @private - to be called on dispose()
    this.disposeDialog = () => {
      this.sim.resizedEmitter.removeListener( this.updateLayout );
      this.removeInputListener( escapeListener );

      closeButton.dispose();

      // remove dialog content from scene graph, but don't dispose because Panel
      // needs to remove listeners on the content in its dispose()
      dialogContent.removeAllChildren();
      dialogContent.detach();
    };
  }

  sun.register( 'Dialog', Dialog );

  // @private
  Dialog.DEFAULT_LAYOUT_STRATEGY = ( dialog, simBounds, screenBounds, scale ) => {

    // The size is set in the Sim.topLayer, but we need to update the location here
    dialog.center = simBounds.center.times( 1.0 / scale );
  };

  inherit( Panel, Dialog, {

    // @public
    show: function() {
      if ( !this.isShowing ) {
        window.phet.joist.sim.showPopup( this, this.isModal );
        this.isShowing = true;

        // a11y - store the currently active element before hiding all other accessible content
        // so that the active element isn't blurred
        this.activeElement = this.activeElement || Display.focusedNode;
        this.setAccessibleViewsVisible( false );

        // In case the window size has changed since the dialog was hidden, we should try layout out again.
        // See https://github.com/phetsims/joist/issues/362
        this.updateLayout();

        // Do this last
        this.showCallback && this.showCallback();
      }
    },

    /**
     * Hide the dialog.  If you create a new dialog next time you show(), be sure to dispose this
     * dialog instead.
     * @public
     */
    hide: function() {
      if ( this.isShowing ) {

        window.phet.joist.sim.hidePopup( this, this.isModal );
        this.isShowing = false;

        // a11y - when the dialog is hidden, make all ScreenView content visible to assistive technology
        this.setAccessibleViewsVisible( true );

        // Do this last
        this.hideCallback && this.hideCallback();
      }
    },

    /**
     * Make eligible for garbage collection.
     * @public
     */
    dispose: function() {
      this.hide();
      this.disposeDialog();
      Panel.prototype.dispose.call( this );
    },

    /**
     * Hide or show all accessible content related to the sim ScreenViews, navigation bar, and alert content. Instead
     * of using setVisible, we have to remove the subtree of accessible content from each view element in order to
     * prevent an IE11 bug where content remains invisible in the accessibility tree, see
     * https://github.com/phetsims/john-travoltage/issues/247
     *
     * @param {boolean} visible
     */
    setAccessibleViewsVisible: function( visible ) {
      for ( let i = 0; i < this.sim.screens.length; i++ ) {
        this.sim.screens[ i ].view.accessibleVisible = visible;
      }
      this.sim.navigationBar.accessibleVisible = visible;
      this.sim.homeScreen && this.sim.homeScreen.view.setAccessibleVisible( visible );

      // workaround for a strange Edge bug where this child of the navigation bar remains visible,
      // see https://github.com/phetsims/a11y-research/issues/30
      if ( this.sim.navigationBar.keyboardHelpButton ) {
        this.sim.navigationBar.keyboardHelpButton.accessibleVisible = visible;
      }
    },

    /**
     * If there is an active element, focus it.  Should almost always be called after the Dialog has been closed.
     *
     * @public
     * @a11y
     */
    focusActiveElement: function() {
      this.activeElement && this.activeElement.focus();
    },

    /**
     * Place keyboard focus on the close button, useful when opening the dialog with an accessibility interaction.
     * @public
     */
    focusCloseButton: function() {
      this.closeButton.focus();
    }
  } );


  /**
   * The close button for Dialog
   * A flat x
   *
   * @param {Object} [options] - see RectangularPushButton
   * @constructor
   */
  function CloseButton( options ) {
    options = _.extend( {
      iconLength: 7,
      baseColor: 'transparent',
      buttonAppearanceStrategy: RectangularButtonView.FlatAppearanceStrategy,
      xMargin: 0,
      yMargin: 0,
      listener: null // {function} called when the button is pressed
    }, options );

    // close button shape, an 'X'
    const closeButtonShape = new Shape()
      .moveTo( -options.iconLength / 2, -options.iconLength / 2 )
      .lineTo( options.iconLength / 2, options.iconLength / 2 )
      .moveTo( options.iconLength / 2, -options.iconLength / 2 )
      .lineTo( -options.iconLength / 2, options.iconLength / 2 );

    assert && assert( !options.content, 'Dialog.CloseButton sets content' );

    options.content = new Path( closeButtonShape, {
      stroke: 'black',
      lineCap: 'round',
      lineWidth: 2
    } );

    RectangularPushButton.call( this, options );
  }

  sun.register( 'Dialog.CloseButton', CloseButton );
  inherit( RectangularPushButton, CloseButton );

  return Dialog;
} );