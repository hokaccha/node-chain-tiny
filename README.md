# node-chain-tiny

A simple control flow library.

The problem which this library solves is the nest and error handling of callback.

For exsample.

    asyncFunc1(function(err, result1) {
      if (err) return callback(err);
      // do something
      asyncFunc2(function(err, result2) {
        if (err) return callback(err);
        // do something
        asyncFunc3(function(err, result3) {
          if (err) return callback(err);
          // do something
          callback(null, result);
        });
      });
    });

This code becomes like this by using chain-tiny. 

    chain(function(next) {
      asyncFunc1(next);
    })
    .chain(function(result1, next) {
      // do something
      asyncFunc2(next);
    })
    .chain(function(result2, next) {
      // do something
      asyncFunc3(next);
    })
    .end(function(err, result3) {
      // do something
      callback(err, result);
    });

## Install

    $ npm install chain-tiny

## Usage

### simple

    var chain = require('chain-tiny');
    
    chain(function(next) {
      setTimeout(function() {
        next(null, 'foo');
      }, 100);
    })
    .chain(function(foo, next) {
      console.log(foo); // => foo
      setTimeout(function() {
        next(null, 'bar', 'baz');
      }, 1);
    })
    .end(function(err, bar, baz) {
      console.log(bar); // => bar
      console.log(baz); // => baz
    });

### error handling

    var chain = require('chain-tiny');
    
    chain(function(next) {
      next('Error!');
    })
    .chain(function(next) {
      // not pass here
      next(null, 'foo');
    })
    .end(function(err, foo) {
      console.log(foo); // => undefined
      console.log(err); // => Error!
    });

### parallel

    var chain = require('chain-tiny');
    
    var results = [];
    chain.parallel({
      foo: function(next) {
        setTimeout(function() {
          results.push(1);
          next(null, 1);
        }, 100);
      },
      bar: function(next) {
        setTimeout(function() {
          results.push(2);
          next(null, 2);
        }, 1)
      }
    })
    .end(function(err, res) {
      console.log(res); // => { foo: 1, bar: 2 }
      console.log(r); // => [2, 1]
    });
    
    // chain
    var results = [];
    chain(function(next) {
      // do something
      next();
    })
    .parallel({
      foo: function(next) {
        setTimeout(function() {
          results.push(1);
          next(null, 1);
        }, 100);
      },
      bar: function(next) {
        setTimeout(function() {
          results.push(2);
          next(null, 2);
        }, 1)
      }
    })
    .end(function(err, res) {
      console.log(res); // => { foo: 1, bar: 2 }
      console.log(r); // => [2, 1]
    });

### forEach

    var chain = require('chain-tiny');
    
    chain.forEach(['foo', 'bar'], function(i, val, next) {
      setTimeout(function() {
        next(null, i + ':' + val);
      }, 1);
    })
    .end(function(err, results) { // or .chain(results, next)
      console.log(results); // => [ '0:foo', '1:bar' ]
    });
    
    // chain
    chain(function(next) {
      next(null, ['foo', 'bar']);
    })
    .forEach(function(i, val, next) {
      setTimeout(function() {
        next(null, i + ':' + val);
      }, 1);
    })
    .end(function(err, results) { // or .chain(results, next)
      console.log(results); // => [ '0:foo', '1:bar' ]
    });
    
    // parallel
    chain.forEachParallel(['foo', 'bar'], function(i, val, next) {
      setTimeout(function() {
        next(null, i + ':' + val);
      }, 1);
    })
    .end(function(err, results) { // or .chain(results, next)
      console.log(results); // => [ '0:foo', '1:bar' ]
    });

### each

    var chain = require('chain-tiny');
    
    chain.each({ foo: 'bar', hoge: 'fuga'}, function(key, val, next) {
      setTimeout(function() {
        next(null, key + ':' + val);
      }, 1);
    })
    .end(function(err, results) { // or .chain(results, next)
      console.log(results); // => { foo: 'foo:bar', hoge: 'hoge:fuga' }
    });
    
    // chain
    chain(function(next) {
      next(null, { foo: 'bar', hoge: 'fuga'});
    })
    .forEach(function(key, val, next) {
      setTimeout(function() {
        next(null, key + ':' + val);
      }, 1);
    })
    .end(function(err, results) { // or .chain(results, next)
      console.log(results); // => { foo: 'foo:bar', hoge: 'hoge:fuga' }
    });
    
    // parallel
    chain.eachParallel({ foo: 'bar', hoge: 'fuga'}, function(key, val, next) {
      setTimeout(function() {
        next(null, key + ':' + val);
      }, 1);
    })
    .end(function(err, results) { // or .chain(results, next)
      console.log(results); // => { foo: 'foo:bar', hoge: 'hoge:fuga' }
    });

### wait

    var chain = require('chain-tiny');
    
    chain(function(next) {
      next(null, 'foo', 'bar');
    })
    .wait(100) // wait 100ms
    .chain(function(foo, bar, next) {
      t.equal(foo, 'foo');
      t.equal(bar, 'bar');
      next();
    })
    .end(function(err) {
      //...
    });

## Functions

### Chain

    chain(callback)

Constructor. Same these.

    chain(fn);
    chain().chain(fn);

#### Parameters

* callback ( optional function )

### Chain.prototype.chain

    .chain(callback)

This method only push stack. The function pushed to stack is executed when end() is called.

#### Parameters

* callback ( function )

### Chain.prototype.end

    .end(callback)

Execute all functions, in the pushed order.

### Chain.prototype.parallel

    .parallel(obj)

Parallel exec functions.

#### Parameters

* obj ( Plain Object or Array )

#### Parameters

* callback ( function )

### Chain.prototype.forEach

    .forEach(callback)

Iterator function to each item in an array. Array recieved before next function args.

#### Parameters

* callback ( function )

### Chain.prototype.forEachParallel

    .forEachParallel(callback)

Parallel iterator function to each item in an array. Array recieved before next function args.

#### Parameters

* callback ( function )

### Chain.prototype.each

    .each(callback)

 * Iterator function to each item in an object (plain hash). Array recieved before next function args.

#### Parameters

* callback ( function )

### Chain.prototype.eachParallel

    .eachParallel(callback)

 * Iterator function to each item in an object (plain hash) parallel. Array recieved before next function args.

#### Parameters

* callback ( function )

### Chain.prototype.wait

    .wait(time)

 * Wait next process during the `time` (ms).

#### Parameters

* time ( int )

`time` is milli second.

### Chain.parallel

    chain.parallel(obj)

Static method for `.parallel()`

#### Parameters

* obj ( Plain Object or Array )

### Chain.forEach

    chain.forEach(array, callback)

Static method for `.forEach()`

#### Parameters

* array ( array )
* callback ( function )

### Chain.forEachParallel

    chain.forEachParallel(array, callback)

Static method for `.forEachParallel()`

#### Parameters

* array ( array )
* callback ( function )

### Chain.each

    chain.each(obj, callback)

Static method for `.each()`

#### Parameters

* object ( object )
* callback ( function )

### Chain.forEachParallel

    chain.eachParallel(object, callback)

Static method for `.eachParallel()`

#### Parameters

* object ( object )
* callback ( function )

### Chain.wait

    chain.wait(time)

Static method for `.wait()`

#### Parameters

* time ( int )

`time` is milli second.

## Testing

    $ make test
