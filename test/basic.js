var nodeunit = require('nodeunit');
var chain = require('../index');

module.exports = nodeunit.testCase({
  instance: function(t) {
    t.ok(chain() instanceof chain);
    t.ok(new chain instanceof chain);
    t.done();
  },
  method: function(t) {
    var _chain = chain();
    t.equal(typeof _chain.chain, 'function');
    t.equal(typeof _chain.forEach, 'function');
    t.equal(typeof _chain.end, 'function');
    t.equal(typeof chain.forEach, 'function');
    t.done();
  },
  chain: function(t) {
    var results = [];
    chain(function(next) {
      setTimeout(function() {
        results.push(1);
        next();
      }, 100);
    })
    .chain(function(next) {
      setTimeout(function() {
        results.push(2);
        next();
      }, 1);
    })
    .end(function(err) {
      t.deepEqual(err, null);
      t.deepEqual(results, [1, 2]);
      t.done();
    });
  },
  'chain args': function(t) {
    chain(function(next) {
      next(null, 'foo');
    })
    .chain(function(foo, next) {
      t.equal(foo, 'foo');
      next(null, 'bar', 'baz');
    })
    .end(function(err, bar, baz) {
      t.deepEqual(err, null);
      t.equal(bar, 'bar');
      t.equal(baz, 'baz');
      t.done();
    });
  },
  'chain error': function(t) {
    chain(function(next) {
      next('error!');
    })
    .chain(function(next) {
      t.ok(false, 'this should not pass');
    })
    .end(function(err) {
      t.equal(err, 'error!');
      t.done();
    });
  }
});
