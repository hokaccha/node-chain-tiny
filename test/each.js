var nodeunit = require('nodeunit');
var chain = require('../index');

module.exports = nodeunit.testCase({
  '.each()': function(t) {
    var start = Date.now();
    chain(function(next) {
      next(null, { foo: 'bar', hoge: 'fuga' });
    })
    .each(function(key, val, next) {
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.foo, 'foo/bar');
      t.equal(results.hoge, 'hoge/fuga');
      t.ok(Date.now() - start >= 190 );
      next();
    })
    .end(t.done);
  },
  '.eachParallel()': function(t) {
    var start = Date.now();
    chain(function(next) {
      next(null, { foo: 'bar', hoge: 'fuga'});
    })
    .eachParallel(function(key, val, next) {
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.foo, 'foo/bar');
      t.equal(results.hoge, 'hoge/fuga');
      t.ok( Date.now() - start < 190 );
      next();
    })
    .end(t.done);
  },
  'Chain.each()': function(t) {
    var start = Date.now();
    chain.each({ foo: 'bar', hoge: 'fuga' }, function(key, val, next) {
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.foo, 'foo/bar');
      t.equal(results.hoge, 'hoge/fuga');
      t.ok( Date.now() - start >= 190 );
      next();
    })
    .end(t.done);
  },
  'Chain.eachParallel()': function(t) {
    var start = Date.now();
    chain.eachParallel({ foo: 'bar', hoge: 'fuga'}, function(key, val, next) {
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.foo, 'foo/bar');
      t.equal(results.hoge, 'hoge/fuga');
      t.ok( Date.now() - start < 190 );
      next();
    })
    .end(t.done);
  },
});
