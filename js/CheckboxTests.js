// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for Checkbox
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Node from '../../scenery/js/nodes/Node.js';
import phetioAPITest from '../../tandem/js/phetioAPITest.js';
import Checkbox from './Checkbox.js';
import CheckboxAPI from './CheckboxAPI.js';

QUnit.module( 'Checkbox' );

QUnit.test( 'Checkbox PhET-iO API validation', assert => {
  phetioAPITest( assert, new CheckboxAPI(), 'checkbox',

    tandem => new Checkbox( new Node(), new BooleanProperty( false, {
      tandem: tandem.createTandem( 'checkboxValueProperty' )
    } ), { tandem: tandem } ) );
} );