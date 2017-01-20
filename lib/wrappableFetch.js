"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var buildResponse = function buildResponse(fetchPromise, wrappers) {
  return fetchPromise.then(function (fetchResponse) {
    return wrappers.reduce(function (response, wrapper) {
      return wrapper(response);
    }, fetchResponse);
  });
};

var executeWrappedRequest = function executeWrappedRequest(requestArguments, wrappers) {
  var localArguments = requestArguments;

  wrappers.forEach(function (wrapper) {
    wrapper.apply(undefined, [function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      localArguments = [].concat(args);
    }].concat(_toConsumableArray(localArguments)));
  });
  return fetch.apply(undefined, _toConsumableArray(localArguments));
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