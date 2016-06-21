;(function(){ 'use strict';

  var defaults = {
    expandFactor: 2,
    inflateFactor: 2,
    multFactor: 1,
    maxIterations: 10
  };

  var setOptions = function( opts, options ) {
    for (var i in defaults) { opts[i] = defaults[i]; }
    for (var i in options)  { opts[i] = options[i];  }
  };

  var hasConverged = function( M, iterations ) {

  };

  var markovCluster = function( options ) {
    var eles = this;
    var cy = this.cy();

    // Set parameters of algorithm:
    setOptions( opts, options );

    // Begin Markov cluster algorithm
    var clusters = [];

    // Step 1: M = addDiagonal( M, multFactor );

    // Step 2: M = normalize( M );

    var isStillMoving = true;
    var iterations = 0;

    while ( isStillMoving && iterations < opts.maxIterations ) {

      isStillMoving = false;

      // Step 3: M = inflate( M, inflateFactor );

      // Step 4: M = expand ( M, expandFactor );

      isStillMoving = hasConverged( M, iterations );

      iterations++;
    }

    return clusters;
  };

  // registers the extension on a cytoscape lib ref
  var register = function( cytoscape ){

    if( !cytoscape ){ return; } // can't register if cytoscape unspecified

    // main entry point
    cytoscape( 'collection', 'markovCluster', markovCluster );

  };

  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-markov-cluster', function(){
      return register;
    });
  }

  if( typeof cytoscape !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
    register( cytoscape );
  }

})();
