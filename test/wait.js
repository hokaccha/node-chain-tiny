var nodeunit = require('nodeunit');
var chain = require('../index');

module.exports = nodeunit.testCase({
  '.wait()': function(t) {
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
  'Chain.wait()': function(t) {
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
  }
});
