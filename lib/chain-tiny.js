var Chain = function(fn) {
  if (this instanceof Chain) {
    this.stack = [];
    return this.chain(fn);
  }
  else {
    return new Chain(fn);
  }
};

Chain.prototype.chain = function(fn) {
  var self = this;

  if (typeof fn === 'function') {
    self.stack.push(fn);
  }

  return self;
};

Chain.prototype.end = function(fn) {
  var self = this;

  (function next() {
    var args = Array.prototype.slice.call(arguments);
    var err = args.shift() || null;
    if (err || !self.stack.length) {
      if (typeof fn === 'function') {
        args.unshift(err);
        fn.apply(null, args);
      }
    }
    else {
      args.push(next);
      self.stack.shift().apply(null, args);
    }
  })();
};

Chain.prototype.forEach = function(fn) {
  var self = this;

  return self.chain(function(ary, next) {
    var _chain = Chain();
    var results = [];
    ary.forEach(function(val, i) {
      _chain.chain(function(_next) {
        fn(i, val, function(err, result) {
          results.push(result);
          _next(err);
        });
      });
    });
    _chain.end(function(err) {
      next(err, results);
    });
  });
};

Chain.forEach = function(ary, fn) {
  return Chain(function(next) {
    next(null, ary);
  }).forEach(fn);
};

module.exports = Chain;
