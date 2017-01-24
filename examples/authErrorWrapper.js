const authErrorWrapper = callback => response => {
  if (response.status === 401 || response.status === 403) {
    callback()
  }
}

export default authErrorWrapper
