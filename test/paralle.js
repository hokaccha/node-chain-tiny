var nodeunit = require('nodeunit');
var chain = require('../index');

module.exports = nodeunit.testCase({
  '.parallel(array)': function(t) {
    var r = [];
    chain(function(next) {
      next(null, 'foo');
    })
    .parallel([
      function(val, next) {
        setTimeout(function() {
          t.equal(val, 'foo');
          r.push(1);
          next(null, 1);
        }, 100);
      },
      function(val, next) {
        setTimeout(function() {
          t.equal(val, 'foo');
          r.push(2);
          next(null, 2);
        }, 1)
      }
    ])
    .chain(function(results, next) {
      t.deepEqual(results, [1, 2]);
      t.deepEqual(r, [2, 1]);
      next();
    })
    .end(t.done);
  },
  '.parallel(obj)': function(t) {
    var r = [];
    chain.parallel({
      foo: function(next) {
        setTimeout(function() {
          r.push(1);
          next(null, 1);
        }, 100);
      },
      bar: function(next) {
        setTimeout(function() {
          r.push(2);
          next(null, 2);
        }, 1)
      }
    })
    .chain(function(results, next) {
      t.deepEqual(results, { foo: 1, bar: 2 });
      t.deepEqual(r, [2, 1]);
      next();
    })
    .end(t.done);
  },
  'Chain.parallel()': function(t) {
    var r = [];
    chain(function(next) {
      next(null, 'foo');
    })
    .parallel({
      foo: function(val, next) {
        setTimeout(function() {
          t.equal(val, 'foo');
          r.push(1);
          next(null, 1);
        }, 100);
      },
      bar: function(val, next) {
        setTimeout(function() {
          t.equal(val, 'foo');
          r.push(2);
          next(null, 2);
        }, 1)
      }
    })
    .chain(function(results, next) {
      t.deepEqual(results, { foo: 1, bar: 2 });
      t.deepEqual(r, [2, 1]);
      next();
    })
    .end(t.done);
  }
});
