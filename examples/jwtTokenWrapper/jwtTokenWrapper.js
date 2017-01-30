const jwtTokenWrapper = token => (delegate, url, config = {}) => {
  const headers = config.headers || {}

  const modifiedConfig = {
    ...config,
    headers: { ...headers, Authorization: `Bearer ${token}` }
  }

  delegate(url, modifiedConfig)
}

export default jwtTokenWrapper
