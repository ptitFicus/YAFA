const buildResponse = (fetchPromise, wrappers) => {
  return fetchPromise.then(fetchResponse => {
    return wrappers.reduce((response, wrapper) => {
      return wrapper(response)
    }, fetchResponse)
  })
}

const promisifyWrapper = (wrapper, args) => {
  return new Promise(resolve => {
    wrapper((...modifiedArguments) => resolve(modifiedArguments), ...args)
  })
}

const executeWrappedRequest = (requestArguments, wrappers) => {
  let promise = Promise.resolve(requestArguments)

  wrappers.forEach(
    wrapper => promise = promise.then(currentArguments => {
      return promisifyWrapper(wrapper, currentArguments)
    })
  )

  return promise.then(modifiedArguments => {
    return fetch(...modifiedArguments)
  })
}

const fetchFatcory = (requestWrappers, responseWrappers) => {
  const res = (...args) => buildResponse(
    executeWrappedRequest([...args], requestWrappers),
    responseWrappers)

  res.wrapRequest = (func) => fetchFatcory([...requestWrappers, func], responseWrappers)

  res.wrapResponse = (func) => fetchFatcory(requestWrappers, [...responseWrappers, func])

  return res;
}

export default fetchFatcory([], [])
