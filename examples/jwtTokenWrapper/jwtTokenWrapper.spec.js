/* eslint-disable no-unused-expressions */
import sinonChai from 'sinon-chai'
import sinon from 'sinon'
import chai, { expect } from 'chai'

import jwtTokenWrapper from './jwtTokenWrapper'
import wFetch from '../../src/'

chai.use(sinonChai)

describe('JWT token wrapper', () => {
  before(() => {
    global.fetch = () => Promise.resolve('')

    sinon.spy(global, 'fetch')
  })

  it('Token should be added to final parameters', done => {
    const token = 'akzlhflekjfbreg42er1gre0gre52gre'
    const url = 'http://my-url.com'
    const newFetch = wFetch.wrapRequest(jwtTokenWrapper(token))

    newFetch(url)
    .then(() => {
      expect(global.fetch).to.have.been.calledWith(url, { headers: { Authorization: `Bearer ${token}` } })
      done()
    })
  })
})
