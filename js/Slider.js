// Copyright 2018, University of Colorado Boulder

/**
 * Slider, with support for horizontal and vertical orientations. By default, the slider is constructed in the
 * horizontal orientation, then adjusted if the vertical orientation was specified.
 *
 * Note: This type was originally named HSlider, renamed in https://github.com/phetsims/sun/issues/380.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessibleSlider = require( 'SUN/accessibility/AccessibleSlider' );
  var InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var FocusHighlightFromNode = require( 'SCENERY/accessibility/FocusHighlightFromNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var PropertyIO = require( 'AXON/PropertyIO' );
  var RangeIO = require( 'DOT/RangeIO' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var SliderIO = require( 'SUN/SliderIO' );
  var SliderThumb = require( 'SUN/SliderThumb' );
  var SliderTrack = require( 'SUN/SliderTrack' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Util = require( 'DOT/Util' );

  // ifphetio
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );

  // constants
  var VERTICAL_ROTATION = -Math.PI / 2;

  /**
   * @param {Property.<number>} valueProperty
   * @param {{min:number, max:number}|Range} range
   * @param {Object} [options]
   * @constructor
   */
  function Slider( valueProperty, range, options ) {

    var self = this;

    options = _.extend( {

      orientation: 'horizontal', // 'horizontal'|'vertical'

      // track
      trackSize: new Dimension2( 100, 5 ),
      trackFillEnabled: 'white',
      trackFillDisabled: 'gray',
      trackStroke: 'black',
      trackLineWidth: 1,
      trackCornerRadius: 0,

      // {Node} optional thumb, replaces the default.
      // Client is responsible for highlighting, disabling and pointer areas.
      // The thumb is positioned based on its center and hence can have its origin anywhere
      thumbNode: null,

      // Options for the default thumb, ignored if thumbNode is set
      thumbSize: new Dimension2( 22, 45 ),
      thumbFillEnabled: 'rgb(50,145,184)',
      thumbFillHighlighted: 'rgb(71,207,255)',
      thumbFillDisabled: '#F0F0F0',
      thumbStroke: 'black',
      thumbLineWidth: 1,
      thumbYOffset: 0, // center of the thumb is vertically offset by this amount from the center of the track
      thumbCenterLineStroke: 'white',
      thumbTouchAreaXDilation: 11,
      thumbTouchAreaYDilation: 11,
      thumbMouseAreaXDilation: 0,
      thumbMouseAreaYDilation: 0,

      // ticks
      tickLabelSpacing: 6,
      majorTickLength: 25,
      majorTickStroke: 'black',
      majorTickLineWidth: 1,
      minorTickLength: 10,
      minorTickStroke: 'black',
      minorTickLineWidth: 1,

      // other
      cursor: 'pointer',
      startDrag: function() {}, // called when a drag sequence starts
      endDrag: function() {}, // called when a drag sequence ends
      constrainValue: function( value ) { return value; }, // called before valueProperty is set

      enabledProperty: null, // see below
      enabledRangeProperty: null, // see below

      // phet-io
      tandem: Tandem.required,
      phetioType: SliderIO
    }, options );

    assert && assert( options.orientation === 'horizontal' || options.orientation === 'vertical',
      'invalid orientation: ' + options.orientation );
    this.orientation = options.orientation; // @private

    assert && assert( options.rotation === undefined,
      'Slider specifies rotation based on orientation' );
    if ( options.orientation === 'vertical' ) {
      options.rotation = VERTICAL_ROTATION;
    }

    Node.call( this );

    var ownsEnabledProperty = !options.enabledProperty;
    var ownsEnabledRangeProperty = !options.enabledRangeProperty;

    // phet-io, Assign default options that need tandems.
    options.enabledProperty = options.enabledProperty || new Property( true, {
      tandem: options.tandem.createTandem( 'enabledProperty' ),
      phetioType: PropertyIO( BooleanIO )
    } );

    // controls the portion of the slider that is enabled
    options.enabledRangeProperty = options.enabledRangeProperty || new Property( range, {
      tandem: options.tandem.createTandem( 'enabledRangeProperty' ),
      phetioType: PropertyIO( RangeIO )
    } );

    // @public
    this.enabledProperty = options.enabledProperty;
    this.enabledRangeProperty = options.enabledRangeProperty;

    // @private options needed by prototype functions that add ticks
    this.tickOptions = _.pick( options, 'tickLabelSpacing',
      'majorTickLength', 'majorTickStroke', 'majorTickLineWidth',
      'minorTickLength', 'minorTickStroke', 'minorTickLineWidth' );

    // @private ticks are added to these parents, so they are behind the knob
    this.majorTicksParent = new Node();
    this.minorTicksParent = new Node();
    this.addChild( this.majorTicksParent );
    this.addChild( this.minorTicksParent );

    // @private mapping between value and track position
    this.valueToPosition = new LinearFunction( range.min, range.max, 0, options.trackSize.width, true /* clamp */ );

    // @private track
    this.track = new SliderTrack( valueProperty, this.valueToPosition, {

      // propagate options that are specific to SliderTrack
      size: options.trackSize,
      fillEnabled: options.trackFillEnabled,
      fillDisabled: options.trackFillDisabled,
      stroke: options.trackStroke,
      lineWidth: options.trackLineWidth,
      cornerRadius: options.trackCornerRadius,
      enabledProperty: options.enabledProperty,
      startDrag: options.startDrag,
      endDrag: options.endDrag,
      constrainValue: options.constrainValue,

      // phet-io
      tandem: options.tandem.createTandem( 'track' )
    } );
    this.track.centerX = this.valueToPosition( ( range.max + range.min ) / 2 );

    // The thumb of the slider
    var thumb = options.thumbNode || new SliderThumb( this.enabledProperty, {

      // propagate options that are specific to SliderThumb
      size: options.thumbSize,
      fillEnabled: options.thumbFillEnabled,
      fillHighlighted: options.thumbFillHighlighted,
      fillDisabled: options.thumbFillDisabled,
      stroke: options.thumbStroke,
      lineWidth: options.thumbLineWidth,
      centerLineStroke: options.thumbCenterLineStroke,
      tandem: options.tandem.createTandem( 'thumb' )
    } );

    // Dilate the local bounds horizontally so that it extends beyond where the thumb can reach.  This prevents layout
    // asymmetry when the slider thumb is off the edges of the track.  See https://github.com/phetsims/sun/issues/282
    this.track.localBounds = this.track.localBounds.dilatedX( thumb.width / 2 );

    // Add the track
    this.addChild( this.track );

    // do this outside of options hash, so that it applied to both default and custom thumbs
    thumb.centerY = this.track.centerY + options.thumbYOffset;
    this.addChild( thumb );

    // touchArea for the default thumb. If a custom thumb is provided, the client is responsible for its touchArea.
    if ( !options.thumbNode && ( options.thumbTouchAreaXDilation || options.thumbTouchAreaYDilation ) ) {
      thumb.touchArea = thumb.localBounds.dilatedXY( options.thumbTouchAreaXDilation, options.thumbTouchAreaYDilation );
    }

    // mouseArea for the default thumb. If a custom thumb is provided, the client is responsible for its mouseArea.
    if ( !options.thumbNode && ( options.thumbMouseAreaXDilation || options.thumbMouseAreaYDilation ) ) {
      thumb.mouseArea = thumb.localBounds.dilatedXY( options.thumbMouseAreaXDilation, options.thumbMouseAreaYDilation );
    }

    // update value when thumb is dragged
    var clickXOffset = 0; // x-offset between initial click and thumb's origin
    var thumbInputListener = new SimpleDragHandler( {

      tandem: options.tandem.createTandem( 'thumbInputListener' ),

      allowTouchSnag: true,

      start: function( event, trail ) {
        if ( self.enabledProperty.get() ) {
          options.startDrag();
          var transform = trail.subtrailTo( self ).getTransform();

          // Determine the offset relative to the center of the thumb
          clickXOffset = transform.inversePosition2( event.pointer.point ).x - thumb.centerX;
        }
      },

      drag: function( event, trail ) {
        if ( self.enabledProperty.get() ) {
          var transform = trail.subtrailTo( self ).getTransform(); // we only want the transform to our parent
          var x = transform.inversePosition2( event.pointer.point ).x - clickXOffset;
          var newValue = self.valueToPosition.inverse( x );

          valueProperty.set( options.constrainValue( newValue ) );
        }
      },

      end: function() {
        if ( self.enabledProperty.get() ) {
          options.endDrag();
        }
      }
    } );
    thumb.addInputListener( thumbInputListener );

    // @public (read-only) {Boolean} - flag that indicates whether the thumb is currently being dragged
    this.thumbDragging = false;
    var thumbDraggingListener = thumbInputListener.isDraggingProperty.linkAttribute( this, 'thumbDragging' );

    // enable/disable
    var enabledObserver = function( enabled ) {
      self.cursor = self.enabledProperty.get() ? options.cursor : 'default';
      if ( !enabled ) {
        if ( thumbInputListener.dragging ) { thumbInputListener.endDrag(); }
      }
      self.pickable = enabled;
    };
    this.enabledProperty.link( enabledObserver ); // must be unlinked in disposeSlider

    // a11y - custom focus highlight that surrounds and moves with the thumb
    this.focusHighlight = new FocusHighlightFromNode( thumb );

    // update thumb location when value changes
    var valueObserver = function( value ) {
      thumb.centerX = self.valueToPosition( value );
      self.focusHighlight.centerX = thumb.centerX;
    };
    valueProperty.link( valueObserver ); // must be unlinked in disposeSlider

    // when the enabled range changes, the value to position linear function must change as well
    var enabledRangeObserver = function( enabledRange ) {

      assert && assert( enabledRange.min >= range.min && enabledRange.max <= range.max, 'enabledRange is out of range' );

      var initialValueToPosition = new LinearFunction( range.min, range.max, 0, options.trackSize.width, true /* clamp */ );
      var min = initialValueToPosition( enabledRange.min );
      var max = initialValueToPosition( enabledRange.max );

      // update the geometry of the enabled track
      self.track.updateEnabledTrackWidth( min, max );

      // update the function that maps value to position for the track and the slider
      self.valueToPosition = new LinearFunction( enabledRange.min, enabledRange.max, min, max, true /* clamp */ );
      self.track.valueToPosition = self.valueToPosition;

      // clamp the value to the enabled range if it changes
      valueProperty.set( Util.clamp( valueProperty.value, enabledRange.min, enabledRange.max ) );
    };
    this.enabledRangeProperty.link( enabledRangeObserver ); // needs to be unlinked in dispose function

    this.mutate( options );

    // @private Called by dispose
    this.disposeSlider = function() {
      thumb.dispose && thumb.dispose(); // in case a custom thumb is provided via options.thumbNode that doesn't implement dispose
      self.track.dispose();
      self.disposeAccessibleSlider(); // dispose accessibility
      valueProperty.unlink( valueObserver );
      ownsEnabledRangeProperty && self.enabledRangeProperty.dispose();
      ownsEnabledProperty && self.enabledProperty.dispose();
      thumbInputListener.isDraggingProperty.unlinkAttribute( thumbDraggingListener );
      thumbInputListener.dispose();
    };

    // mix accessible slider functionality into Slider
    this.initializeAccessibleSlider( valueProperty, this.enabledRangeProperty, this.enabledProperty,
      _.extend( {}, options, {
        ariaOrientation: options.orientation
      } ) );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'Slider', this );
  }

  sun.register( 'Slider', Slider );

  inherit( Node, Slider, {

    // @public - ensures that this object is eligible for GC
    dispose: function() {
      this.disposeSlider();
      Node.prototype.dispose.call( this );
    },

    /**
     * Adds a major tick mark.
     * @param {number} value
     * @param {Node} [label] optional
     * @public
     */
    addMajorTick: function( value, label ) {
      this.addTick( this.majorTicksParent, value, label,
        this.tickOptions.majorTickLength, this.tickOptions.majorTickStroke, this.tickOptions.majorTickLineWidth );
    },

    /**
     * Adds a minor tick mark.
     * @param {number} value
     * @param {Node} [label] optional
     * @public
     */
    addMinorTick: function( value, label ) {
      this.addTick( this.minorTicksParent, value, label,
        this.tickOptions.minorTickLength, this.tickOptions.minorTickStroke, this.tickOptions.minorTickLineWidth );
    },

    /*
     * Adds a tick mark above the track.
     * @param {Node} parent
     * @param {number} value
     * @param {Node} [label] optional
     * @param {number} length
     * @param {number} stroke
     * @param {number} lineWidth
     * @private
     */
    addTick: function( parent, value, label, length, stroke, lineWidth ) {
      var labelX = this.valueToPosition( value );
      // ticks
      var tick = new Path( new Shape()
          .moveTo( labelX, this.track.top )
          .lineTo( labelX, this.track.top - length ),
        { stroke: stroke, lineWidth: lineWidth } );
      parent.addChild( tick );
      // label
      if ( label ) {

        // For a vertical slider, rotate labels opposite the rotation of the slider, so that they appear as expected.
        if ( this.orientation === 'vertical' ) {
          label.rotation = -VERTICAL_ROTATION;
        }
        parent.addChild( label );
        label.centerX = tick.centerX;
        label.bottom = tick.top - this.tickOptions.tickLabelSpacing;
        label.pickable = false;
      }
    },

    // @public
    setEnabled: function( enabled ) { this.enabledProperty.value = enabled; },
    set enabled( value ) { this.setEnabled( value ); },

    // @public
    getEnabled: function() { return this.enabledProperty.value; },
    get enabled() { return this.getEnabled(); },

    // @public
    setEnabledRange: function( enabledRange ) { this.enabledRangeProperty.value = enabledRange; },
    set enabledRange( range ) { this.setEnabledRange( range ); },

    // @public
    getEnabledRange: function() { return this.enabledRangeProperty.value; },
    get enabledRange() { return this.getEnabledRange(); },

    // @public - Sets visibility of major ticks.
    setMajorTicksVisible: function( visible ) {
      this.majorTicksParent.visible = visible;
    },
    set majorTicksVisible( value ) { this.setMajorTicksVisible( value ); },

    // @public - Gets visibility of major ticks.
    getMajorTicksVisible: function() {
      return this.majorTicksParent.visible;
    },
    get majorTicksVisible() { return this.getMajorTicksVisible(); },

    // @public - Sets visibility of minor ticks.
    setMinorTicksVisible: function( visible ) {
      this.minorTicksParent.visible = visible;
    },
    set minorTicksVisible( value ) { this.setMinorTicksVisible( value ); },

    // @public - Gets visibility of minor ticks.
    getMinorTicksVisible: function() {
      return this.minorTicksParent.visible;
    },
    get minorTicksVisible() { return this.getMinorTicksVisible(); }
  } );

  // mix accessibility into Slider
  AccessibleSlider.mixInto( Slider );

  return Slider;
} );
