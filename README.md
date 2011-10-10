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

    $ npm install test-tcp

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
      // no exec here
      next(null, 'foo');
    })
    .end(function(err, foo) {
      console.log(foo); // => undefined
      console.log(err); // => Error!
    });

### forEach

    var chain = require('chain-tiny');
    
    // static method
    chain.forEach(['foo', 'bar'], function(i, val, next) {
      setTimeout(function() {
        next(null, i + ':' + val);
      }, 1);
    })
    .end(function(err, results) { // or .chain(results, next)
      console.log(results); // => [ '0:foo', '1:bar' ]
    });
    
    // instance method
    chain(function(next) {
      next(null, ['foo', 'bar']);
    })
    .forEach(function(i, val, next) {
      setTimeout(function() {
        next(null, i + ':' + val);
      }, 1);
    })
    .end(function(err, results) {
      console.log(results); // => [ '0:foo', '1:bar' ]
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

#### Parameters

* callback ( function )

### Chain.prototype.forEach

    .forEach(callback)

Iterator function to each item in an array. Array recieved before next function args.

#### Parameters

* callback ( function )

### Chain.forEach

    chain.forEach(array, callback)

Iterator function to each item in an array.

#### Parameters

* array ( array )
* callback ( function )

## Testing

    $ make test
