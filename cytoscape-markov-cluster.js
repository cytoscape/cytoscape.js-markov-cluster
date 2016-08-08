;(function(){ 'use strict';

  // Implemented from Stijn van Dongen's (author of MCL algorithm) documentation: http://micans.org/mcl/
  // and lecture notes: https://www.cs.ucsb.edu/~xyan/classes/CS595D-2009winter/MCL_Presentation2.pdf

  var defaults = {
    expandFactor: 2,      // affects time of computation and cluster granularity to some extent: M * M
    inflateFactor: 2,     // affects cluster granularity (the greater the value, the more clusters): M(i,j) / E(j)
    multFactor: 1,        // optional self loops for each node. Use a neutral value to improve cluster computations.
    maxIterations: 20,    // maximum number of iterations of the MCL algorithm in a single run
    attributes: [         // attributes/features used to group nodes, ie. similarity values between nodes
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
        row += Number(M[i*n+j]).toFixed(3) + ' ';
      }
      console.log(row);
    }
    console.log('');
  };

  var getSimilarity = function( edge, attributes ) {
    var total = 0;
    for ( var i = 0; i < attributes.length; i++ ) {
      total += attributes[i]( edge );
    }
    return total;
  };

  var addLoops = function( M, n, val ) {
    for (var i = 0; i < n; i++) {
      M[i * n + i] = val;
    }
  };

  var normalize = function( M, n ) {
    var sum;
    for ( var col = 0; col < n; col++ ) {
      sum = 0;
      for ( var row = 0; row < n; row++ ) {
        sum += M[row * n + col];
      }
      for ( var row = 0; row < n; row++ ) {
        M[row * n + col] = M[row * n + col] / sum;
      }
    }
  };

  // TODO: blocked matrix multiplication?
  var mmult = function( A, B, n ) {
    var C = new Array( n * n );

    for ( var i = 0; i < n; i++ ) {
      for ( var j = 0; j < n; j++ ) {
        C[i * n + j] = 0;
      }

      for ( var k = 0; k < n; k++ ) {
        for ( var j = 0; j < n; j++ ) {
          C[i * n + j] += A[i * n + k] * B[k * n + j];
        }
      }
    }
    return C;
  };

  var expand = function( M, n, expandFactor /** power **/ ) {
    var _M = M.slice(0);

    for ( var p = 1; p < expandFactor; p++ ) {
      M = mmult( M, _M, n );
    }
    return M;
  };

  var inflate = function( M, n, inflateFactor /** r **/ ) {
    var _M = new Array( n * n );

    // M(i,j) ^ inflatePower
    for ( var i = 0; i < n * n; i++ ) {
      _M[i] = Math.pow( M[i], inflateFactor );
    }

    normalize( _M, n );

    return _M;
  };

  var hasConverged = function( M, _M, n2, roundFactor ) {
    // Check that both matrices have the same elements (i,j)
    for ( var i = 0; i < n2; i++ ) {
      var v1 = Math.round( M[i] * Math.pow(10, roundFactor) ) / Math.pow(10, roundFactor); // truncate to 'roundFactor' decimal places
      var v2 = Math.round( _M[i] * Math.pow(10, roundFactor) ) / Math.pow(10, roundFactor);

      if ( v1 !== v2 ) {
        return false;
      }
    }
    return true;
  };

  var assign = function( M, n, nodes, cy ) {
    var clusters = [];

    for ( var i = 0; i < n; i++ ) {
      var cluster = [];
      for ( var j = 0; j < n; j++ ) {
        // Row-wise attractors and elements that they attract belong in same cluster
        if ( Math.round( M[i * n + j] * 1000 ) / 1000 > 0 ) {
          cluster.push( nodes[j] );
        }
      }
      if ( cluster.length !== 0 ) {
        clusters.push( cy.collection(cluster) );
      }
    }
    return clusters;
  };

  var isDuplicate = function( c1, c2 ) {
    for (var i = 0; i < c1.length; i++) {
      if (!c2[i] || c1[i].id() !== c2[i].id()) {
        return false;
      }
    }
    return true;
  };

  var removeDuplicates = function( clusters ) {

    for (var i = 0; i < clusters.length; i++) {
      for (var j = 0; j < clusters.length; j++) {
        if (i != j && isDuplicate(clusters[i], clusters[j])) {
          clusters.splice(j, 1);
        }
      }
    }
    return clusters;
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
    var M = new Array( n2 ), _M;
    for ( var i = 0; i < n2; i++ ) {
      M[i] = 0;
    }

    for ( var e = 0; e < edges.length; e++ ) {
      var edge = edges[e];
      var i = id2position[ edge.source().id() ];
      var j = id2position[ edge.target().id() ];

      var sim = getSimilarity( edge, opts.attributes );

      M[i * n + j] += sim; // G should be symmetric and undirected
      M[j * n + i] += sim;
    }

    // Begin Markov cluster algorithm

    // Step 1: Add self loops to each node, ie. add multFactor to matrix diagonal
    addLoops( M, n, opts.multFactor );

    // Step 2: M = normalize( M );
    normalize( M, n );

    var isStillMoving = true;
    var iterations = 0;
    while ( isStillMoving && iterations < opts.maxIterations ) {

      isStillMoving = false;

      // Step 3:
      _M = expand( M, n, opts.expandFactor );

      // Step 4:
      M = inflate( _M, n, opts.inflateFactor );

      // Step 5: check to see if ~steady state has been reached
      if ( ! hasConverged( M, _M, n2, 4 ) ) {
        isStillMoving = true;
      }

      iterations++;
    }

    // Build clusters from matrix
    var clusters = assign( M, n, nodes, cy );

    // Remove duplicate clusters due to symmetry of graph and M matrix
    clusters = removeDuplicates( clusters );

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
