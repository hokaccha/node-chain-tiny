/*!
 * chain-tiny
 * Copyright(c) 2011 Kazuhito Hokamura
 * MIT Licensed
 */

/**
 * Constructor. Initialize Chain.
 *
 * @param {Function} fn
 * @return {Object} chain
 * @api public
 */
var Chain = function(fn) {
  if (this instanceof Chain) {
    this.stack = [];
    return this.chain(fn);
  }
  else {
    return new Chain(fn);
  }
};


/**
 * Module version
 */
Chain.version = '0.1.3';


/**
 * Expose
 */
module.exports = Chain;


/**
 * Function push to stack.
 *
 * @param {Function} fn
 * @return {Object} chain
 * @api public
 */
Chain.prototype.chain = function(fn) {
  var self = this;

  if (typeof fn === 'function') {
    self.stack.push(fn);
  }

  return self;
};


/**
 * Execute all functions, in the pushed order.
 *
 * @param {Function} fn
 * @api public
 */
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


/**
 * Iterator function to each item in an array. Array recieved before next function args.
 *
 * @param {Function} fn
 * @return {Object} chain
 * @api public
 */
Chain.prototype.forEach = function(fn) {
  var self = this;

  return self.chain(function(ary, next) {
    var _chain = Chain();
    var results = [];
    ary.forEach(function(val) {
      _chain.chain(function(_next) {
        fn.call(null, val, function(err, result) {
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


/**
 * Iterator function to each item in an array parallel. Array recieved before next function args.
 *
 * @param {Function} fn
 * @return {Object} chain
 * @api public
 */
Chain.prototype.forEachParallel = function(fn) {
  var self = this;

  return self.chain(function(ary, next) {
    var _chain = Chain();
    var q = [];
    ary.forEach(function(val) {
      q.push(function(_next) {
        fn.call(null, val, function(err, result) {
          _next(err, result);
        });
      });
    });

    Chain.parallel(q).end(next);
  });
};


/**
 * 
 * Iterator function to each item in an object (plain hash). Array recieved before next function args.
 *
 * @param {Object} obj
 * @return {Object} chain
 * @api public
 */
Chain.prototype.each = function(fn) {
  var self = this;

  return self.chain(function(obj, next) {
    var _chain = Chain();
    var isArray = Array.isArray(obj);
    var results = isArray ? [] : {};
    Object.keys(obj).forEach(function(key) {
      var val = obj[key];
      _chain.chain(function(_next) {
        fn.call(null, key, val, function(err, result) {
          isArray ? results.push(result) : results[key] = result;
          _next(err);
        });
      });
    });
    _chain.end(function(err) {
      next(err, results);
    });
  });
};


/**
 * 
 * Iterator function to each item in an object (plain hash) parallel. Array recieved before next function args.
 *
 * @param {Object} obj
 * @return {Object} chain
 * @api public
 */
Chain.prototype.eachParallel = function(fn) {
  var self = this;

  return self.chain(function(obj, next) {
    var _chain = Chain();
    var isArray = Array.isArray(obj);
    var q = isArray ? [] : {};
    Object.keys(obj).forEach(function(key) {
      var val = obj[key];
      var _fn = function(_next) {
        fn.call(null, key, val, function(err, result) {
          _next(err, result);
        });
      };
      isArray ? q.push(_fn) : q[key] = _fn;
    });

    Chain.parallel(q).end(next);
  });
};


/**
 * Parallel exec functions.
 *
 * @param {Object} obj
 * @return {Object} chain
 * @api public
 */
Chain.prototype.parallel = function(obj) {
  var self = this;

  return self.chain(function() {
    var next = Array.prototype.slice.call(arguments).pop();
    var count = 0;
    var isArray = Array.isArray(obj);
    var results = isArray ? [] : {};
    var keys = Object.keys(obj);
    keys.forEach(function(key) {
      var fn = obj[key];
      setTimeout(function() {
        fn.call(null, function _next(err, result) {
          if (err) {
            next(err);
          }
          else {
            results[key] = result;
            count++;
            if (count === keys.length) {
              next(null, results);
            }
          }
        });
      }, 0);
    });
  });
};


/**
 * Wait next process during the `time` (ms).
 *
 * @param {time} Int
 * @return {Object} chain
 * @api public
 */
Chain.prototype.wait = function(time) {
  var self = this;

  return self.chain(function() {
    var args = Array.prototype.slice.call(arguments);
    var next = args.pop();
    args.unshift(null);
    setTimeout(function() {
      next.apply(null, args);
    }, time);
  });
};


/**
 * Static method for `.forEach()`.
 *
 * @param {Array} ary
 * @param {Function} fn
 * @return {Object} chain
 * @api public
 */
Chain.forEach = function(ary, fn) {
  return Chain(function(next) {
    next(null, ary);
  }).forEach(fn);
};


/**
 * Static method for `.forEachParallel()`.
 *
 * @param {Array} ary
 * @param {Function} fn
 * @return {Object} chain
 * @api public
 */
Chain.forEachParallel = function(ary, fn) {
  return Chain(function(next) {
    next(null, ary);
  }).forEachParallel(fn);
};


/**
 * Static method for `.each()`.
 *
 * @param {Object} Object
 * @param {Function} fn
 * @return {Object} chain
 * @api public
 */
Chain.each = function(obj, fn) {
  return Chain(function(next) {
    next(null, obj);
  }).each(fn);
};


/**
 * Static method for `.eachParallel()`.
 *
 * @param {Object} Object
 * @param {Function} fn
 * @return {Object} chain
 * @api public
 */
Chain.eachParallel = function(obj, fn) {
  return Chain(function(next) {
    next(null, obj);
  }).eachParallel(fn);
};


/**
 * Static method for `.parallel()`.
 *
 * @param {time} Int
 * @return {Object} chain
 * @api public
 */
Chain.parallel = function(ary) { 
  return Chain().parallel(ary);
};


/**
 * Static method for `.wait()`.
 *
 * @param {time} Int
 * @return {Object} chain
 * @api public
 */
Chain.wait = function(time) {
  return Chain(function(next) { next(null); }).wait(time);
};
