import fetch from 'isomorphic-fetch'
import { startServer, stopServer } from 'http-status-mock'

import authErrorWrapper from './authErrorWrapper'
import wFetch from '../src/'


describe('Auth error wrapper', () => {
  let server
  before(() => {
    global.fetch = fetch
    server = startServer()
  })

  it('Should execute callback on 401 status', done => {
    const newFetch = wFetch.wrapResponse(authErrorWrapper(done))
    newFetch('http://localhost:3000/401')
  })

  it('Should execute callback on 403 status', done => {
    const newFetch = wFetch.wrapResponse(authErrorWrapper(done))
    newFetch('http://localhost:3000/403')
  })

  after(() => stopServer(server))
})
