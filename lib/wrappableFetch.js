"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var buildResponse = function buildResponse(fetchPromise, wrappers) {
  return wrappers.reduce(function (currentPromise, wrapper) {
    return currentPromise.then(wrapper);
  }, fetchPromise);
};

var promisifyWrapper = function promisifyWrapper(wrapper, args) {
  return new Promise(function (resolve) {
    wrapper.apply(undefined, [function () {
      for (var _len = arguments.length, modifiedArguments = Array(_len), _key = 0; _key < _len; _key++) {
        modifiedArguments[_key] = arguments[_key];
      }

      return resolve(modifiedArguments);
    }].concat(_toConsumableArray(args)));
  });
};

var executeWrappedRequest = function executeWrappedRequest(requestArguments, wrappers) {
  var promise = Promise.resolve(requestArguments);

  wrappers.forEach(function (wrapper) {
    return promise = promise.then(function (currentArguments) {
      return promisifyWrapper(wrapper, currentArguments);
    });
  });
  return promise.then(function (modifiedArguments) {
    return fetch.apply(undefined, _toConsumableArray(modifiedArguments));
  });
};

var fetchFatcory = function fetchFatcory(requestWrappers, responseWrappers) {
  var res = function res() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return buildResponse(executeWrappedRequest([].concat(args), requestWrappers), responseWrappers);
  };

  res.wrapRequest = function (func) {
    return fetchFatcory([].concat(_toConsumableArray(requestWrappers), [func]), responseWrappers);
  };

  res.wrapResponse = function (func) {
    return fetchFatcory(requestWrappers, [].concat(_toConsumableArray(responseWrappers), [func]));
  };

  return res;
};

exports.default = fetchFatcory([], []);