var nodeunit = require('nodeunit');
var chain = require('../index');

module.exports = nodeunit.testCase({
  '.each() object': function(t) {
    var start = Date.now();
    chain(function(next) {
      next(null, { foo: 'bar', hoge: 'fuga' });
    })
    .each(function(val, key, next) {
      t.equal(this.next, next);
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.foo, 'foo/bar');
      t.equal(results.hoge, 'hoge/fuga');
      t.ok(Date.now() - start >= 190 );
      next(null, { a: 'b' });
    })
    .each({ foo: 'bar', hoge: 'fuga' }, function(val, key, next) {
      t.equal(this.next, next);
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.foo, 'foo/bar');
      t.equal(results.hoge, 'hoge/fuga');
      next();
    })
    .end(t.done);
  },
  '.each() array': function(t) {
    var start = Date.now();
    chain(function(next) {
      next(null, ['foo', 'bar']);
    })
    .each(function(val, key, next) {
      t.equal(this.next, next);
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], '0/foo');
      t.equal(results[1], '1/bar');
      t.ok(Date.now() - start >= 190 );
      next(null, [1, 2]);
    })
    .each(['foo', 'bar'], function(val, key, next) {
      t.equal(this.next, next);
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], '0/foo');
      t.equal(results[1], '1/bar');
      next();
    })
    .end(t.done);
  },
  '.eachParallel() object': function(t) {
    var start = Date.now();
    chain(function(next) {
      next(null, { foo: 'bar', hoge: 'fuga'});
    })
    .eachParallel(function(val, key, next) {
      t.equal(this.next, next);
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.foo, 'foo/bar');
      t.equal(results.hoge, 'hoge/fuga');
      t.ok( Date.now() - start < 190 );
      next(null, { a: 'b', c: 'd' });
    })
    .eachParallel({ foo: 'bar', hoge: 'fuga'}, function(val, key, next) {
      t.equal(this.next, next);
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.foo, 'foo/bar');
      t.equal(results.hoge, 'hoge/fuga');
      next();
    })
    .end(t.done);
  },
  '.eachParallel() array': function(t) {
    var start = Date.now();
    chain(function(next) {
      next(null, ['foo', 'bar']);
    })
    .eachParallel(function(val, key, next) {
      t.equal(this.next, next);
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], '0/foo');
      t.equal(results[1], '1/bar');
      t.ok( Date.now() - start < 190 );
      next(null, [1, 2]);
    })
    .eachParallel(['foo', 'bar'], function(val, key, next) {
      t.equal(this.next, next);
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], '0/foo');
      t.equal(results[1], '1/bar');
      next();
    })
    .end(t.done);
  },
  'Chain.each() object': function(t) {
    var start = Date.now();
    chain.each({ foo: 'bar', hoge: 'fuga' }, function(val, key, next) {
      t.equal(this.next, next);
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
  'Chain.each() array': function(t) {
    var start = Date.now();
    chain.each(['foo', 'bar'], function(val, key, next) {
      t.equal(this.next, next);
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], '0/foo');
      t.equal(results[1], '1/bar');
      t.ok( Date.now() - start >= 190 );
      next();
    })
    .end(t.done);
  },
  'Chain.eachParallel() object': function(t) {
    var start = Date.now();
    chain.eachParallel({ foo: 'bar', hoge: 'fuga'}, function(val, key, next) {
      t.equal(this.next, next);
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
  'Chain.eachParallel() array': function(t) {
    var start = Date.now();
    chain.eachParallel(['foo', 'bar'], function(val, key, next) {
      t.equal(this.next, next);
      setTimeout(function() {
        next(null, key + '/' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], '0/foo');
      t.equal(results[1], '1/bar');
      t.ok( Date.now() - start < 190 );
      next();
    })
    .end(t.done);
  }
});
