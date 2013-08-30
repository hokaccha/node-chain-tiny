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
Chain.version = '0.2.2';


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
      self.stack.shift().apply({ next: next }, args);
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
Chain.prototype.each = function(obj, fn) {
  var self = this;

  if (typeof obj === 'function') {
    fn = obj;
    obj = null;
  }

  return self.chain(function(_obj) {
    obj = obj || _obj;
    var _chain = Chain();
    var origNext = this.next;
    var isArray = Array.isArray(obj);
    var results = isArray ? [] : {};
    Object.keys(obj).forEach(function(key) {
      var val = obj[key];
      _chain.chain(function(_next) {
        function next(err, result) {
          if (isArray) {
            results.push(result);
          }
          else {
            results[key] = result;
          }
          _next(err);
        }

        fn.call({ next: next }, val, key, next);
      });
    });
    _chain.end(function(err) {
      origNext(err, results);
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
Chain.prototype.eachParallel = function(obj, fn) {
  var self = this;

  if (typeof obj === 'function') {
    fn = obj;
    obj = null;
  }

  return self.chain(function(_obj) {
    obj = obj || _obj;
    var origNext = this.next;
    var isArray = Array.isArray(obj);
    var q = isArray ? [] : {};

    Object.keys(obj).forEach(function(key) {
      var val = obj[key];

      function _fn(_next) {
        function next(err, result) {
          _next(err, result);
        }

        fn.call({ next: next }, val, key, next);
      }

      if (isArray) {
        q.push(_fn);
      }
      else {
        q[key] = _fn;
      }
    });

    Chain.parallel(q).end(origNext);
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
    var origNext = args.pop();
    var count = 0;
    var isArray = Array.isArray(obj);
    var results = isArray ? [] : {};
    var keys = Object.keys(obj);
    keys.forEach(function(key) {
      process.nextTick(function() {
        var fn = obj[key];

        function next(err, result) {
          if (err) {
            origNext(err);
          }
          else {
            results[key] = result;
            count++;
            if (count === keys.length) {
              origNext(null, results);
            }
          }
        }

        fn.apply({ next: next }, args.concat(next));
      });
    });
  });
};


/**
 * Static method for `.each()`.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @return {Object} chain
 * @api public
 */
Chain.each = function(obj, fn) {
  return Chain().each(obj, fn);
};


/**
 * Static method for `.eachParallel()`.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @return {Object} chain
 * @api public
 */
Chain.eachParallel = function(obj, fn) {
  return Chain().eachParallel(obj, fn);
};


/**
 * Static method for `.parallel()`.
 *
 * @param {Object} obj
 * @return {Object} chain
 * @api public
 */
Chain.parallel = function(obj) { 
  return Chain().parallel(obj);
};
