/* eslint-disable no-unused-expressions */
import fetch from 'isomorphic-fetch'
import { startServer, stopServer } from 'http-status-mock'

import sinonChai from 'sinon-chai'
import sinon from 'sinon'
import chai from 'chai'

import authErrorWrapper from './authErrorWrapper'
import wFetch from '../src/'

chai.should()
chai.use(sinonChai)


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

  it('Should not execute callback on other status', done => {
    let callback = () => {}
    callback = sinon.spy(callback)
    const newFetch = wFetch.wrapResponse(authErrorWrapper(callback))
    newFetch('http://localhost:3000/404')
      .then(() => {
        callback.should.have.not.been.called
        done()
      })
  })

  after(() => stopServer(server))
})
