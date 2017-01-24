const jwtTokenWrapper = token => (delegate, url, config = {}) => {
  const modifiedConfig = { ...config, 'x-access-token': token }
  delegate(url, modifiedConfig)
}

export default jwtTokenWrapper
