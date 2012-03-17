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
Chain.version = '0.2.1';


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
    var args = Array.prototype.slice.call(arguments);
    var next = args.pop();
    var count = 0;
    var isArray = Array.isArray(obj);
    var results = isArray ? [] : {};
    var keys = Object.keys(obj);
    keys.forEach(function(key) {
      var fn = obj[key];
      process.nextTick(function() {
        fn.apply(null, args.concat(function _next(err, result) {
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
        }));
      });
    });
  });
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
