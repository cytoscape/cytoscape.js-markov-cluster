;(function(){ 'use strict';

  var defaults = {
    expandFactor: 2,      //
    inflateFactor: 2,     //
    multFactor: 1,        // self loops for each node
    maxIterations: 10,    //
    attributes: [
        function(edge) {
          return 1;
        }
    ]
  };

  var setOptions = function( opts, options ) {
    for (var i in defaults) { opts[i] = defaults[i]; }
    for (var i in options)  { opts[i] = options[i];  }
  };

  var printMatrix = function( M ) { // used for debugging purposes only
    var n = Math.sqrt(M.length);
    for ( var i = 0; i < n; i++ ) {
      var row = '';
      for ( var j = 0; j < n; j++ ) {
        row += M[i*n+j] + ' ';
      }
      console.log(row);
    }
  };

  var getSimilarity = function( edge, attributes ) {
    var total = 0;
    for ( var i = 0; i < attributes.length; i++ ) {
      total += attributes[i]( edge );
    }
    return total;
  };

  var hasConverged = function( M, iterations ) {

  };

  var markovCluster = function( options ) {
    var nodes = this.nodes();
    var edges = this.edges();
    var cy = this.cy();
    var opts = {};

    // Set parameters of algorithm:
    setOptions( opts, options );

    // Map each node to its position in node array
    var id2position = {};
    for( var i = 0; i < nodes.length; i++ ){
      id2position[ nodes[i].id() ] = i;
    }

    // Generate stochastic matrix M from input graph G (should be symmetric/undirected)
    var n = nodes.length, n2 = n * n;
    var M = new Array( n2 );
    for (var i = 0; i < n2; i++) {
      M[i] = 0;
    }

    for ( var e = 0; e < edges.length; e++ ) {
      var edge = edges[e];
      var i = id2position[ edge.source().id() ];
      var j = id2position[ edge.target().id() ];
      M[i * n + j] += getSimilarity( edge, opts.attributes ); // G should be symmetric and undirected
    }
    //printMatrix( M );
    //debugger;

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
