var nodeunit = require('nodeunit');
var chain = require('../index');

module.exports = nodeunit.testCase({
  '.forEach()': function(t) {
    var start = Date.now();  
    chain(function(next) {
      next(null, ['foo', 'bar']);
    })
    .forEach(function(val, next) {
      setTimeout(function() {
        next(null, val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], 'foo');
      t.equal(results[1], 'bar');
      t.ok(Date.now() - start >= 190);
      t.done();
    })
    .end(t.done);
  },
  '.forEachParallel()': function(t) {
    var start = Date.now();
    chain(function(next) {
      next(null, ['foo', 'bar']);
    })
    .forEachParallel(function(val, next) {
      setTimeout(function() {
        next(null, val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], 'foo');
      t.equal(results[1], 'bar');
      t.ok(Date.now() - start < 190);
      next();
    })
    .end(t.done);
  },
  'Chain.forEach()': function(t) {
    var start = Date.now();
    chain.forEach(['foo', 'bar'], function(val, next) {
      setTimeout(function() {
        next(null, val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], 'foo');
      t.equal(results[1], 'bar');
      t.ok(Date.now() - start >= 190);
      next();
    })
    .end(t.done);
  },
  'Chain.forEachParallel()': function(t) {
    var start = Date.now();
    chain.forEachParallel(['foo', 'bar'], function(val, next) {
      setTimeout(function() {
        next(null, val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], 'foo');
      t.equal(results[1], 'bar');
      t.ok(Date.now() - start < 190);
      next();
    })
    .end(t.done);
  }
});
