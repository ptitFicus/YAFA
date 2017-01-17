const buildResponse = (fetchPromise, wrappers) => {
  return fetchPromise.then(fetchResponse => {
    return wrappers.reduce((response, wrapper) => {
      return wrapper(response)
    }, fetchResponse)
  })
}

const executeWrappedRequest = (requestArguments, wrappers) => {
  let localArguments = requestArguments

  wrappers.forEach(wrapper => {
    wrapper(
      (...args) => { localArguments = [...args] },
      ...localArguments
    )
  })
  return fetch(...localArguments)
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
