cytoscape-markov-cluster
================================================================================

![Screenshot of clusters returned from Markov Cluster algorithm](./demo-img.png?raw=true "Screenshot of clusters returned from Markov Cluster algorithm")

A Markov Cluster (MCL) algorithm for Cytoscape.js.

*Zoe Xi, for Google Summer of Code.*


## Dependencies

 * Cytoscape.js >= 2.6.12


## Usage instructions

Download the library:
 * via npm: `npm install cytoscape-markov-cluster`,
 * via bower: `bower install cytoscape-markov-cluster`, or
 * via direct download in the repository.

`require()` the library as appropriate for your project:

CommonJS:
```js
var cytoscape = require('cytoscape');
var markovCluster = require('cytoscape-markov-cluster');

markovCluster( cytoscape ); // register extension
```

AMD:
```js
require(['cytoscape', 'cytoscape-markov-cluster'], function( cytoscape, markovCluster ){
  markovCluster( cytoscape ); // register extension
});
```

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed.


## API

```js
var clusters = cy.elements().markovCluster({
    expandFactor: 2,        // affects time of computation and cluster granularity to some extent: M * M
    inflateFactor: 2,       // affects cluster granularity (the greater the value, the more clusters): M(i,j) / E(j)
    multFactor: 1,          // optional self loops for each node. Use a neutral value to improve cluster computations.
    maxIterations: 10,      // maximum number of iterations of the MCL algorithm in a single run
    attributes: [           // attributes/features used to group nodes, ie. similarity values between nodes
        function(edge) {
            return edge.data('weight');
        }
        // ... and so on
     ]
});

```


## Publishing instructions

This project is set up to automatically be published to npm and bower.  To publish:

1. Set the version number environment variable: `export VERSION=1.2.3`
1. Publish: `gulp publish`
1. If publishing to bower for the first time, you'll need to run `bower register cytoscape-markov-cluster https://github.com/cytoscape/cytoscape.js-markov-cluster.git`
