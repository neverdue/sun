// Copyright 2018-2020, University of Colorado Boulder

/**
 * enum of the possible interaction states for the radio buttons
 * @author John Blanco
 */

import sun from '../sun.js';

const RadioButtonInteractionState = {

  // the button is selected
  SELECTED: 'SELECTED',

  // the button is deselected
  DESELECTED: 'DESELECTED',

  // a pointer is over the button, but it is not being pressed and is not selected
  OVER: 'OVER',

  // the button is being pressed by the user
  PRESSED: 'PRESSED'
};

// verify that enum is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( RadioButtonInteractionState ); }

sun.register( 'RadioButtonInteractionState', RadioButtonInteractionState );

export default RadioButtonInteractionState;