var nodeunit = require('nodeunit');
var chain = require('../index');

module.exports = nodeunit.testCase({
  'expose': function(t) {
    t.equal(typeof chain, 'function');
    t.ok(/^\d+\.\d+\.\d+/.test(chain.version));
    t.done();
  },
  'instance': function(t) {
    t.ok(chain() instanceof chain);
    t.ok(new chain instanceof chain);
    t.done();
  },
  'chain': function(t) {
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
  'args': function(t) {
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
  'error': function(t) {
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
  },
  'forEach': function(t) {
    var start = Date.now();  
    chain(function(next) {
      next(null, ['foo', 'bar']);
    })
    .forEach(function(key, val, next) {
      setTimeout(function() {
        next(null, key + ':' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], '0:foo');
      t.equal(results[1], '1:bar');
      t.ok(Date.now() - start >= 190);
      t.done();
    })
    .end(t.done);
  },
  'Chain.forEach': function(t) {
    var start = Date.now();
    chain.forEach(['foo', 'bar'], function(key, val, next) {
      setTimeout(function() {
        next(null, key + ':' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], '0:foo');
      t.equal(results[1], '1:bar');
      t.ok(Date.now() - start >= 190);
      next();
    })
    .end(t.done);
  },
  'forEachParallel': function(t) {
    var start = Date.now();
    chain(function(next) {
      next(null, ['foo', 'bar']);
    })
    .forEachParallel(function(key, val, next) {
      setTimeout(function() {
        next(null, key + ':' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], '0:foo');
      t.equal(results[1], '1:bar');
      t.ok(Date.now() - start < 190);
      next();
    })
    .end(t.done);
  },
  'Chain.forEachParallel': function(t) {
    var start = Date.now();
    chain.forEachParallel(['foo', 'bar'], function(key, val, next) {
      setTimeout(function() {
        next(null, key + ':' + val);
      }, 100);
    })
    .chain(function(results, next) {
      t.equal(results.length, 2);
      t.equal(results[0], '0:foo');
      t.equal(results[1], '1:bar');
      t.ok(Date.now() - start < 190);
      next();
    })
    .end(t.done);
  },
  'parallel(array)': function(t) {
    var r = [];
    chain(function(next) {
      next(null, 'foo');
    })
    .parallel([
      function(next) {
        setTimeout(function() {
          r.push(1);
          next(null, 1);
        }, 100);
      },
      function(next) {
        setTimeout(function() {
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
  'parallel(obj)': function(t) {
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
  wait: function(t) {
    var start = Date.now();
    chain(function(next) {
      next(null, 'foo', 'bar');
    })
    .wait(100)
    .chain(function(foo, bar, next) {
      t.equal(foo, 'foo');
      t.equal(bar, 'bar');
      t.ok(Date.now() - start >= 90);
      next();
    })
    .end(function(err) {
      t.equal(err, null);
      t.done();
    });
  },
  'Chain.wait': function(t) {
    var start = Date.now();
    chain
    .wait(100)
    .chain(function(next) {
      t.ok(Date.now() - start >= 90);
      next();
    })
    .end(function(err) {
      t.equal(err, null);
      t.done();
    });
  },
  'each': function(t) {
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
  'eachParallel': function(t) {
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
  'Chain.each': function(t) {
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
  'Chain.eachParallel': function(t) {
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
