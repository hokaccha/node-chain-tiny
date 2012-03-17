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
      console.log(results); // => [2, 1]
    });

chain:

    var chain = require('chain-tiny');
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
      console.log(results); // => [2, 1]
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

chain:

    var chain = require('chain-tiny');

    chain(function(next) {
      next(null, { foo: 'bar', hoge: 'fuga'});
    })
    .each(function(key, val, next) {
      setTimeout(function() {
        next(null, key + ':' + val);
      }, 1);
    })
    .end(function(err, results) { // or .chain(results, next)
      console.log(results); // => { foo: 'foo:bar', hoge: 'hoge:fuga' }
    });

parallel:

    var chain = require('chain-tiny');

    chain.eachParallel({ foo: 'bar', hoge: 'fuga'}, function(key, val, next) {
      setTimeout(function() {
        next(null, key + ':' + val);
      }, 1);
    })
    .end(function(err, results) { // or .chain(results, next)
      console.log(results); // => { foo: 'foo:bar', hoge: 'hoge:fuga' }
    });

Array:

    var chain = require('chain-tiny');

    chain.eachParallel(['foo', 'bar'], function(key, val, next) {
      setTimeout(function() {
        next(null, key + ':' + val);
      }, 1);
    })
    .end(function(err, results) { // or .chain(results, next)
      console.log(results); // => [ '0:foo', '1:bar' ]
    });
