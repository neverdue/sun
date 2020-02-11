// Copyright 2015-2020, University of Colorado Boulder

/**
 * Demonstration of misc sun UI components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const ABSwitch = require( 'SUN/ABSwitch' );
  const AccordionBox = require( 'SUN/AccordionBox' );
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Carousel = require( 'SUN/Carousel' );
  const Checkbox = require( 'SUN/Checkbox' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const ComboBox = require( 'SUN/ComboBox' );
  const ComboBoxItem = require( 'SUN/ComboBoxItem' );
  const DemosScreenView = require( 'SUN/demo/DemosScreenView' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HSlider = require( 'SUN/HSlider' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberSpinner = require( 'SUN/NumberSpinner' );
  const OnOffSwitch = require( 'SUN/OnOffSwitch' );
  const PageControl = require( 'SUN/PageControl' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const StringProperty = require( 'AXON/StringProperty' );
  const sun = require( 'SUN/sun' );
  const sunQueryParameters = require( 'SUN/sunQueryParameters' );
  const Text = require( 'SCENERY/nodes/Text' );
  const timer = require( 'AXON/timer' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const VSlider = require( 'SUN/VSlider' );

  /**
   * @constructor
   */
  function ComponentsScreenView() {
    DemosScreenView.call( this, [

      /**
       * To add a demo, add an object literal here. Each object has these properties:
       *
       * {string} label - label in the combo box
       * {function(Bounds2): Node} createNode - creates the scene graph for the demo
       */
      { label: 'ABSwitch', createNode: demoABSwitch },
      { label: 'Carousel', createNode: demoCarousel },
      { label: 'Checkbox', createNode: demoCheckbox },
      { label: 'ComboBox', createNode: demoComboBox },
      { label: 'HSlider', createNode: demoHSlider },
      { label: 'VSlider', createNode: demoVSlider },
      { label: 'OnOffSwitch', createNode: demoOnOffSwitch },
      { label: 'PageControl', createNode: demoPageControl },
      { label: 'NumberSpinner', createNode: demoNumberSpinner },
      { label: 'AlignGroup', createNode: demoAlignGroup },
      { label: 'AccordionBox', createNode: demoAccordionBox }
    ], {
      selectedDemoLabel: sunQueryParameters.component
    } );
  }

  sun.register( 'ComponentsScreenView', ComponentsScreenView );

  var demoABSwitch = function( layoutBounds ) {

    const property = new StringProperty( 'A' );
    const aNode = new Text( 'A', { font: new PhetFont( 24 ) } );
    const bNode = new Text( 'B', { font: new PhetFont( 24 ) } );

    return new ABSwitch( property, 'A', aNode, 'B', bNode, {
      center: layoutBounds.center
    } );
  };

  // Creates a demo for Carousel
  var demoCarousel = function( layoutBounds ) {

    // create items
    const colors = [ 'red', 'blue', 'green', 'yellow', 'pink', 'white', 'orange', 'magenta', 'purple', 'pink' ];
    const vItems = [];
    const hItems = [];
    colors.forEach( function( color ) {
      vItems.push( new Rectangle( 0, 0, 60, 60, { fill: color, stroke: 'black' } ) );
      hItems.push( new Circle( 30, { fill: color, stroke: 'black' } ) );
    } );

    // vertical carousel
    const vCarousel = new Carousel( vItems, {
      orientation: 'vertical',
      separatorsVisible: true,
      buttonTouchAreaXDilation: 5,
      buttonTouchAreaYDilation: 15,
      buttonMouseAreaXDilation: 2,
      buttonMouseAreaYDilation: 7
    } );

    // horizontal carousel
    const hCarousel = new Carousel( hItems, {
      orientation: 'horizontal',
      buttonTouchAreaXDilation: 15,
      buttonTouchAreaYDilation: 5,
      buttonMouseAreaXDilation: 7,
      buttonMouseAreaYDilation: 2,
      centerX: vCarousel.centerX,
      top: vCarousel.bottom + 50
    } );

    // button that scrolls the horizontal carousel to a specific item
    const itemIndex = 4;
    const hScrollToItemButton = new RectangularPushButton( {
      content: new Text( 'scroll to item ' + itemIndex, { font: new PhetFont( 20 ) } ),
      listener: function() {
        hCarousel.scrollToItem( hItems[ itemIndex ] );
      }
    } );

    // button that sets the horizontal carousel to a specific page number
    const pageNumber = 0;
    const hScrollToPageButton = new RectangularPushButton( {
      content: new Text( 'scroll to page ' + pageNumber, { font: new PhetFont( 20 ) } ),
      listener: function() {
        hCarousel.pageNumberProperty.set( pageNumber );
      }
    } );

    // group the buttons
    const buttonGroup = new VBox( {
      children: [ hScrollToItemButton, hScrollToPageButton ],
      align: 'left',
      spacing: 7,
      left: hCarousel.right + 30,
      centerY: hCarousel.centerY
    } );

    return new Node( {
      children: [ vCarousel, hCarousel, buttonGroup ],
      center: layoutBounds.center
    } );
  };

  var demoCheckbox = function( layoutBounds ) {

    const property = new BooleanProperty( true );
    const enabledProperty = new BooleanProperty( true, { phetioFeatured: true } );

    const checkbox = new Checkbox( new Text( 'My Awesome Checkbox', {
      font: new PhetFont( 30 )
    } ), property, {
      enabledProperty: enabledProperty
    } );

    const enabledCheckbox = new Checkbox( new Text( 'enabled', {
      font: new PhetFont( 20 )
    } ), enabledProperty );

    return new VBox( {
      children: [ checkbox, enabledCheckbox ],
      spacing: 30,
      center: layoutBounds.center
    } );
  };

  // Creates a demo of ComboBox
  var demoComboBox = function( layoutBounds ) {

    const labels = [ 'one', 'two', 'three', 'four', 'five', 'six' ];
    const items = [];
    labels.forEach( function( label ) {
      items.push( new ComboBoxItem( new Text( label, { font: new PhetFont( { size: 20 } ) } ), label ) );
    } );

    const selectedItemProperty = new Property( labels[ 0 ] );

    const listParent = new Node();

    const comboBox = new ComboBox( items, selectedItemProperty, listParent, {
      highlightFill: 'yellow',
      listPosition: 'above'
    } );

    const enabledCheckbox = new Checkbox( new Text( 'enabled', { font: new PhetFont( 20 ) } ), comboBox.enabledProperty );

    const uiComponents = new VBox( {
      children: [ comboBox, enabledCheckbox ],
      spacing: 40,
      center: layoutBounds.center
    } );

    return new Node( { children: [ uiComponents, listParent ] } );
  };

  // Creates a demo for HSlider
  var demoHSlider = function( layoutBounds ) {
    return demoSlider( layoutBounds, 'horizontal' );
  };

  // Creates a demo for VSlider
  var demoVSlider = function( layoutBounds ) {
    return demoSlider( layoutBounds, 'vertical' );
  };

  /**
   * Used by demoHSlider and demoVSlider
   * @param {Bounds2} layoutBounds
   * @param {string} orientation - see Slider orientation option
   * @returns {Node}
   */
  var demoSlider = function( layoutBounds, orientation ) {

    const property = new Property( 0 );
    const range = new Range( 0, 100 );
    const tickLabelOptions = { font: new PhetFont( 16 ) };
    const sliderOptions = {
      trackSize: new Dimension2( 300, 5 ),
      thumbTouchAreaXDilation: 15,
      thumbTouchAreaYDilation: 15,
      thumbMouseAreaXDilation: 5,
      thumbMouseAreaYDilation: 5,
      center: layoutBounds.center,
      enabledProperty: new Property( true )
    };

    let slider = null;
    if ( orientation === 'horizontal' ) {
      slider = new HSlider( property, range, sliderOptions );
    }
    else {
      sliderOptions.trackSize = sliderOptions.trackSize.flipped();
      slider = new VSlider( property, range, sliderOptions );
    }

    // major ticks
    slider.addMajorTick( range.min, new Text( range.min, tickLabelOptions ) );
    slider.addMajorTick( range.getCenter(), new Text( range.getCenter(), tickLabelOptions ) );
    slider.addMajorTick( range.max, new Text( range.max, tickLabelOptions ) );

    // minor ticks
    slider.addMinorTick( range.min + 0.25 * range.getLength() );
    slider.addMinorTick( range.min + 0.75 * range.getLength() );

    // show/hide major ticks
    const majorTicksVisibleProperty = new Property( true );
    majorTicksVisibleProperty.link( function( visible ) {
      slider.majorTicksVisible = visible;
    } );
    const majorTicksCheckbox = new Checkbox( new Text( 'Major ticks visible', { font: new PhetFont( 20 ) } ),
      majorTicksVisibleProperty, {
        left: slider.left,
        top: slider.bottom + 40
      } );

    // show/hide minor ticks
    const minorTicksVisibleProperty = new Property( true );
    minorTicksVisibleProperty.link( function( visible ) {
      slider.minorTicksVisible = visible;
    } );
    const minorTicksCheckbox = new Checkbox( new Text( 'Minor ticks visible', { font: new PhetFont( 20 ) } ),
      minorTicksVisibleProperty, {
        left: slider.left,
        top: majorTicksCheckbox.bottom + 40
      } );

    // enable/disable slider
    const enabledProperty = new Property( true );
    enabledProperty.link( function( enabled ) {
      slider.enabled = enabled;
    } );
    const enabledCheckbox = new Checkbox( new Text( 'Enable slider', { font: new PhetFont( 20 ) } ),
      enabledProperty, {
        left: slider.left,
        top: minorTicksCheckbox.bottom + 40
      } );

    // restrict enabled range of slider
    const restrictedRangeProperty = new Property( false );
    const enabledRangeProperty = new Property( new Range( 0, 100 ) );
    restrictedRangeProperty.link( function( restrictedRange ) {
      enabledRangeProperty.value = restrictedRange ? new Range( 25, 75 ) : new Range( 0, 100 );
    } );
    enabledRangeProperty.link( function( enabledRange ) {
      slider.enabledRange = enabledRange;
    } );
    const enabledRangeCheckbox = new Checkbox( new Text( 'Enable Range [25, 75]', { font: new PhetFont( 20 ) } ),
      restrictedRangeProperty, {
        left: slider.left,
        top: enabledCheckbox.bottom + 40
      } );

    // All of the controls related to the slider
    const controls = new VBox( {
      align: 'left',
      spacing: 30,
      children: [ majorTicksCheckbox, minorTicksCheckbox, enabledCheckbox, enabledRangeCheckbox ]
    } );

    // Position the control based on the orientation of the slider
    const layoutBoxOptions = {
      spacing: 60,
      children: [ slider, controls ],
      center: layoutBounds.center
    };
    let layoutBox = null;
    if ( orientation === 'horizontal' ) {
      layoutBox = new VBox( layoutBoxOptions );
    }
    else {
      layoutBox = new HBox( layoutBoxOptions );
    }

    return layoutBox;
  };

  // Creates a demo for OnOffSwitch
  var demoOnOffSwitch = function( layoutBounds ) {
    return new OnOffSwitch( new Property( true ), {
      size: new Dimension2( 80, 30 ),
      thumbTouchAreaXDilation: 10,
      thumbTouchAreaYDilation: 10,
      thumbMouseAreaXDilation: 5,
      thumbMouseAreaYDilation: 5,
      center: layoutBounds.center
    } );
  };

  // Creates a demo for PageControl
  var demoPageControl = function( layoutBounds ) {

    // create items
    const colors = [ 'red', 'blue', 'green', 'yellow', 'pink', 'white', 'orange', 'magenta', 'purple', 'pink' ];
    const items = [];
    colors.forEach( function( color ) {
      items.push( new Rectangle( 0, 0, 100, 100, { fill: color, stroke: 'black' } ) );
    } );

    // carousel
    const carousel = new Carousel( items, {
      orientation: 'horizontal',
      itemsPerPage: 3
    } );

    // page control
    const pageControl = new PageControl( carousel.numberOfPages, carousel.pageNumberProperty, {
      orientation: 'horizontal',
      interactive: true,
      dotRadius: 10,
      dotSpacing: 18,
      dotTouchAreaDilation: 8,
      dotMouseAreaDilation: 4,
      currentPageFill: 'white',
      currentPageStroke: 'black',
      centerX: carousel.centerX,
      top: carousel.bottom + 10
    } );

    return new Node( {
      children: [ carousel, pageControl ],
      center: layoutBounds.center
    } );
  };

  // Creates a demo for NumberSpinner
  var demoNumberSpinner = function( layoutBounds ) {

    const valueProperty = new Property( 0 );
    const valueRangeProperty = new Property( new Range( -5, 5 ) );
    const enabledProperty = new Property( true );

    // options for all spinners
    const spinnerOptions = {
      enabledProperty: enabledProperty,
      touchAreaXDilation: 20,
      touchAreaYDilation: 10,
      mouseAreaXDilation: 10,
      mouseAreaYDilation: 5,
      decimalPlaces: 1,
      deltaValue: 0.1,
      backgroundMinWidth: 100,
      xMargin: 10
    };

    // Demonstrate each value of options.arrowsPosition
    const spinnerLeftRight = new NumberSpinner( valueProperty, valueRangeProperty, merge( {}, spinnerOptions, {
      arrowsPosition: 'leftRight',
      valuePattern: '{{value}} bottles of beer on the wall'
    } ) );
    const spinnerTopBottom = new NumberSpinner( valueProperty, valueRangeProperty, merge( {}, spinnerOptions, {
      arrowsPosition: 'topBottom',
      arrowsScale: 0.65
    } ) );
    const spinnerBothRight = new NumberSpinner( valueProperty, valueRangeProperty, merge( {}, spinnerOptions, {
      arrowsPosition: 'bothRight',
      yMargin: 10,
      valueAlign: 'right'
    } ) );
    const spinnerBothBottom = new NumberSpinner( valueProperty, valueRangeProperty, merge( {}, spinnerOptions, {
      arrowsPosition: 'bothBottom',
      backgroundFill: 'pink',
      backgroundStroke: 'red',
      backgroundLineWidth: 3,
      arrowButtonFill: 'lightblue',
      arrowButtonStroke: 'blue',
      arrowButtonLineWidth: 0.2,
      valueAlign: 'left'
    } ) );

    const enabledCheckbox = new Checkbox( new Text( 'enabled', { font: new PhetFont( 20 ) } ), enabledProperty );

    return new VBox( {
      children: [ spinnerTopBottom, spinnerBothRight, spinnerBothBottom, spinnerLeftRight, enabledCheckbox ],
      spacing: 40,
      center: layoutBounds.center
    } );
  };

  var demoAlignGroup = function( layoutBounds ) {
    function highlightWrap( node ) {
      const rect = Rectangle.bounds( node.bounds, { fill: 'rgba(0,0,0,0.25)' } );
      node.on( 'bounds', function() {
        rect.setRectBounds( node.bounds );
      } );
      return new Node( {
        children: [
          rect,
          node
        ]
      } );
    }

    const iconGroup = new AlignGroup();
    const iconRow = new HBox( {
      spacing: 10,
      children: _.range( 1, 10 ).map( function() {
        const randomRect = new Rectangle( 0, 0, phet.joist.random.nextDouble() * 60 + 10, phet.joist.random.nextDouble() * 60 + 10, {
          fill: 'black'
        } );
        timer.addListener( function() {
          if ( phet.joist.random.nextDouble() < 0.02 ) {
            randomRect.rectWidth = phet.joist.random.nextDouble() * 60 + 10;
            randomRect.rectHeight = phet.joist.random.nextDouble() * 60 + 10;
          }
        } );
        return new AlignBox( randomRect, {
          group: iconGroup,
          margin: 5
        } );
      } ).map( highlightWrap )
    } );

    const panelGroup = new AlignGroup( { matchVertical: false } );

    function randomText() {
      const text = new Text( 'Test', { fontSize: 20 } );
      timer.addListener( function() {
        if ( phet.joist.random.nextDouble() < 0.03 ) {
          let string = '';
          while ( phet.joist.random.nextDouble() < 0.94 && string.length < 20 ) {
            string += ( phet.joist.random.nextDouble() + '' ).slice( -1 );
          }
          text.text = string;
        }
      } );
      return text;
    }

    const panelRow = new VBox( {
      spacing: 10,
      children: [
        new Panel( new AlignBox( randomText(), { group: panelGroup } ) ),
        new Panel( new AlignBox( new VBox( {
          spacing: 3,
          children: [
            randomText(),
            randomText()
          ]
        } ), { group: panelGroup } ) )
      ]
    } );

    return new VBox( {
      spacing: 20,
      children: [ iconRow, panelRow ],
      center: layoutBounds.center
    } );
  };

  var demoAccordionBox = function( layoutBounds ) {
    const randomRect = new Rectangle( 0, 0, 100, 50, { fill: 'red' } );

    const resizeButton = new RectangularPushButton( {
      content: new Text( 'Resize', { font: new PhetFont( 20 ) } ),
      listener: function() {
        randomRect.rectWidth = 50 + phet.joist.random.nextDouble() * 150;
        randomRect.rectHeight = 50 + phet.joist.random.nextDouble() * 150;
        box.center = layoutBounds.center;
      }
    } );

    var box = new AccordionBox( new VBox( {
      spacing: 10,
      children: [
        resizeButton,
        randomRect
      ]
    } ), {
      resize: true,
      center: layoutBounds.center
    } );

    return box;
  };

  return inherit( DemosScreenView, ComponentsScreenView );
} );