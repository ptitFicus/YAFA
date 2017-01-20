'use strict';

var _sinonChai = require('sinon-chai');

var _sinonChai2 = _interopRequireDefault(_sinonChai);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _wrappableFetch = require('./wrappableFetch');

var _wrappableFetch2 = _interopRequireDefault(_wrappableFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chai2.default.use(_sinonChai2.default);

var fetchResponse = 'fake';

beforeEach(function () {
  global.fetch = function () {
    return Promise.resolve(fetchResponse);
  };

  _sinon2.default.spy(global, 'fetch');
});

describe('Internal mechanism', function () {
  it('Should call vanilla fetch', function () {
    var callUrl = 'aaa';
    (0, _wrappableFetch2.default)(callUrl);

    (0, _chai.expect)(global.fetch).to.have.been.calledWith(callUrl);
  });
});

describe('Request wrapper', function () {
  it('Single wrapper argument modifications are applied ', function () {
    var wAText = 'wrappedByA';
    var callUrl = 'fake-url';

    var wrapperA = function wrapperA(delegate, url) {
      for (var _len = arguments.length, rest = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        rest[_key - 2] = arguments[_key];
      }

      return delegate.apply(undefined, [url + wAText].concat(rest));
    };

    var newFetch = _wrappableFetch2.default.wrapRequest(wrapperA);
    newFetch(callUrl);
    (0, _chai.expect)(global.fetch).to.have.been.calledWith('' + callUrl + wAText);
  });

  it('Multiple Wrapper argument modifications are applied in the correct order', function () {
    var wAText = 'wrappedByA';
    var wBText = 'wrappedByB';
    var calledUrl = 'fake-url';

    var wrapperA = function wrapperA(delegate, url) {
      for (var _len2 = arguments.length, rest = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        rest[_key2 - 2] = arguments[_key2];
      }

      delegate.apply(undefined, [url + wAText].concat(rest));
    };
    var wrapperB = function wrapperB(delegate, url) {
      for (var _len3 = arguments.length, rest = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        rest[_key3 - 2] = arguments[_key3];
      }

      delegate.apply(undefined, [url + wBText].concat(rest));
    };

    var newFetch = _wrappableFetch2.default.wrapRequest(wrapperA).wrapRequest(wrapperB);
    newFetch(calledUrl);

    (0, _chai.expect)(global.fetch).to.have.been.calledWith('' + calledUrl + wAText + wBText);
  });

  it('A throw in a wrapper should be propagate', function () {
    var wrapper = function wrapper() {
      throw new Error('Fake error');
    };

    var newFetch = _wrappableFetch2.default.wrapRequest(wrapper);

    (0, _chai.expect)(function () {
      newFetch('url');
    }).to.throw();
  });
});

describe('Response wrapper', function () {
  it('Single wrapper response modifications are applied', function () {
    var wrapperAText = 'wrappedByA';

    var wrapperA = function wrapperA(response) {
      return response + wrapperAText;
    };

    var newFetch = _wrappableFetch2.default.wrapResponse(wrapperA);

    var resp = newFetch();

    return resp.then(function (response) {
      return (0, _chai.expect)(response).to.equal('' + fetchResponse + wrapperAText);
    });
  });

  it('Multiple wrapper response modifications are applied in the correct order', function () {
    var wrapperAText = 'wrappedByA';
    var wrapperBText = 'wrappedByB';

    var wrapperA = function wrapperA(response) {
      return response + wrapperAText;
    };
    var wrapperB = function wrapperB(response) {
      return response + wrapperBText;
    };

    var newFetch = _wrappableFetch2.default.wrapResponse(wrapperA).wrapResponse(wrapperB);

    var resp = newFetch();

    return resp.then(function (response) {
      return (0, _chai.expect)(response).to.equal('' + fetchResponse + wrapperAText + wrapperBText);
    });
  });

  it('Error thrown in a wrapper should be propagated', function () {
    var errMsg = 'Fake error';
    var wrapper = function wrapper() {
      throw new Error(errMsg);
    };

    var newFetch = _wrappableFetch2.default.wrapResponse(wrapper);

    return newFetch().catch(function (err) {
      return (0, _chai.expect)(err.message).to.equal(errMsg);
    });
  });
});