[![Build Status](https://travis-ci.org/ptitFicus/YAFA.svg?branch=master)](https://travis-ci.org/ptitFicus/YAFA)
[![Coverage Status](https://coveralls.io/repos/github/ptitFicus/YAFA/badge.svg?branch=master)](https://coveralls.io/github/ptitFicus/YAFA?branch=master)
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

// Every occurence of 'e' has been replace
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

// Every occurence of 'e' and 'a' has been replace
// by a 'i' in the response
newFetch().then(response => console.log(response))
```
