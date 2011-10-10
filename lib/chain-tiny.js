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

Chain.prototype.forEach = function(ary, fn) {
  var self = this;
  var args = [];
  
  ary.forEach(function(val, i) {
    self.chain(function() {
      var _args = Array.prototype.slice.call(arguments);
      var next = _args.pop();
      fn(val, next);
      if (i !== 0) args.push(_args.length < 2 ? _args[0] : _args);
    });
  });

  self.chain(function() {
    var _args = Array.prototype.slice.call(arguments);
    var next = _args.pop();
    args.push(_args.length < 2 ? _args[0] : _args);
    next(null, args);
  });

  return self;
};

Chain.forEach = function(ary, fn) {
  return Chain().forEach(ary, fn);
};

module.exports = Chain;
