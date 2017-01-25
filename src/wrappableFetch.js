const buildResponse = (fetchPromise, wrappers) => wrappers
  .reduce((currentPromise, wrapper) => currentPromise.then(wrapper), fetchPromise)

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
  return promise.then(modifiedArguments => fetch(...modifiedArguments))
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
