[![Build Status](https://travis-ci.org/ptitFicus/YAFA.svg?branch=master)](https://travis-ci.org/ptitFicus/YAFA)
[![Coverage Status](https://coveralls.io/repos/github/ptitFicus/YAFA/badge.svg?branch=master)](https://coveralls.io/github/ptitFicus/YAFA?branch=master)
[![npm version](https://badge.fury.io/js/yafa.svg)](https://badge.fury.io/js/yafa)
[![devDependencies Status](https://david-dm.org/ptitFicus/YAFA/dev-status.svg)](https://david-dm.org/ptitFicus/YAFA?type=dev)
# YAFA
YAFA (Yet Another Fetch alternative) is a super simple library that allow to "wrap" fetch requests and responses.

## Request wrappers
```js
const requestWrapper = (delegate, url, ...rest) => {
  return delegate(`${url}-wrapped`, ...rest)
}

const wrappedFetch = fetch.wrapRequest(requestWrapper)

// fetch will be called with 'http://some-url-wrapped'
// as first argument
wrappedFetch('http://some-url')
```

A request wrapper takes every arguments given to fetch call, preceded by a callback function (named `delegate` in the above example). This callback function should be called as if it was the real fetch function (i.e. with modified parameters).


```js
const requestWrapper = (delegate, url, ...rest) => {
  return delegate(`${url}-wrapped`, ...rest)
}

const anotherRequestWrapper = (delegate, url, ...rest) => {
  return delegate(`${url}-wrappedAnotherTime`, ...rest)
}

// fetch will be called with
// 'http://some-url-wrapped-wrappedAnotherTime'
// as first argument
const wrappedFetch = fetch.wrapRequest(requestWrapper)
                          .wrapRequest(anotherRequestWrapper)


wrappedFetch('http://some-url')
```
## Response wrappers

```js
const responseWrapper = response => response.replace.split('e').join('a')

const newFetch = fetch.wrapResponse(responseWrapper)

// Every occurrence of 'e' has been replace
// by a 'a' in the response
newFetch().then(response => console.log(response))
```

In response wrapper, the modified response should be returned by the wrapper.

As request wrappers, response wrappers can be chained.

```js
const responseWrapper = response => response.replace.split('e').join('a')
const responseWrapper2 = response => response.replace.split('a').join('i')

const newFetch = fetch.wrapResponse(responseWrapper)
                      .wrapResponse(responseWrapper2)

// Every occurrence of 'e' and 'a' has been replace
// by a 'i' in the response
newFetch().then(response => console.log(response))
```

## Real world examples

### JWT token request wrapper

Common practice when using JWT is to store token in localStorage/sessionStorage.
Below is an example of request wrapper that retrieve token in local storage and join it to any future request.

```js
const jwtTokenWrapper = (delegate, url, config = {}) => {
  const headers = config.headers || {}
  const token = sessionStorage.getItem('token')

  const modifiedConfig = {
    ...config,
    headers: { ...headers, Authorization: `Bearer ${token}` }
  }

  delegate(url, modifiedConfig)
}

const newFetch = fetch.wrapRequest(jwtTokenWrapper)

newtFetch('http://some-url-with-jwt-auth')
```

### JSON response parser

When retrieving a response from a REST call, it is often needed to convert response to JSON.
This response wrapper allow you to factorize that code.

```js
const jsonResponseWrapper = response => response.json()

const newFetch = fetch.wrapResponse(jsonResponseWrapper)

newFetch('http://some-url-that-return-json')
  .then(response => {
    // Process JSON data
  })
```