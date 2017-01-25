import sinonChai from 'sinon-chai'
import sinon from 'sinon'
import chai, { expect } from 'chai'

import fetch from './wrappableFetch'

chai.use(sinonChai)

describe('Tewt with mocked fetch', () => {
  const fetchResponse = 'fake'
  const fetchBackup = global.fetch


  before(() => {
    global.fetch = () => Promise.resolve(fetchResponse)

    sinon.spy(global, 'fetch')
  })

  describe('Internal mechanism', () => {
    it('Should call vanilla fetch', done => {
      const callUrl = 'aaa'
      fetch(callUrl)
      .then(() => {
        expect(global.fetch).to.have.been.calledWith(callUrl)
        done()
      })
    })
  })


  describe('Request wrapper', () => {
    it('Single wrapper argument modifications are applied ', done => {
      const wAText = 'wrappedByA'
      const callUrl = 'fake-url'

      const wrapperA = (delegate, url, ...rest) => {
        return delegate(url + wAText, ...rest)
      }

      const newFetch = fetch.wrapRequest(wrapperA)
      newFetch(callUrl)
      .then(() => {
        expect(global.fetch).to.have.been.calledWith(`${callUrl}${wAText}`)
        done()
      })
    })

    it('Multiple Wrapper argument modifications are applied in the correct order', done => {
      const wAText = 'wrappedByA'
      const wBText = 'wrappedByB'
      const calledUrl = 'fake-url'

      const wrapperA = (delegate, url, ...rest) => {
        delegate(url + wAText, ...rest)
      }
      const wrapperB = (delegate, url, ...rest) => {
        delegate(url + wBText, ...rest)
      }

      const newFetch = fetch.wrapRequest(wrapperA)
                            .wrapRequest(wrapperB)
      newFetch(calledUrl)
      .then(() => {
        expect(global.fetch).to.have.been.calledWith(`${calledUrl}${wAText}${wBText}`)
        done()
      })
    })

    it('A throw in a wrapper should be propagate', done => {
      const errMsg = 'Fake error'
      const wrapper = () => {
        throw new Error(errMsg)
      }

      const newFetch = fetch.wrapRequest(wrapper)

      newFetch()
      .catch((err) => {
        expect(err.message).to.equals(errMsg)
        done()
      })
    })

    it('Wrapper are applied in the correct order even with one of them being asynchronous', done => {
      const wAText = 'wrappedByA'
      const wBText = 'wrappedByB'
      const calledUrl = 'fake-url'

      const wrapperA = (delegate, url, ...rest) => {
        setTimeout(() => delegate(url + wAText, ...rest), 100)
      }
      const wrapperB = (delegate, url, ...rest) => {
        delegate(url + wBText, ...rest)
      }

      const newFetch = fetch.wrapRequest(wrapperA)
                            .wrapRequest(wrapperB)
      newFetch(calledUrl)
        .then(() => {
          expect(global.fetch).to.have.been.calledWith(`${calledUrl}${wAText}${wBText}`)
          done()
        })
    })
  })

  describe('Response wrapper', () => {
    it('Single wrapper response modifications are applied', () => {
      const wrapperAText = 'wrappedByA'

      const wrapperA = (response) => response + wrapperAText

      const newFetch = fetch.wrapResponse(wrapperA)

      const resp = newFetch()

      return resp.then(response =>
        expect(response).to.equal(`${fetchResponse}${wrapperAText}`)
      )
    })

    it('Multiple wrapper response modifications are applied in the correct order', () => {
      const wrapperAText = 'wrappedByA'
      const wrapperBText = 'wrappedByB'

      const wrapperA = (response) => response + wrapperAText
      const wrapperB = (response) => response + wrapperBText

      const newFetch = fetch.wrapResponse(wrapperA).wrapResponse(wrapperB)

      const resp = newFetch()

      return resp.then(response =>
        expect(response).to.equal(`${fetchResponse}${wrapperAText}${wrapperBText}`)
      )
    })

    it('Multiple wrapper response modifications are applied in the correct order even when one of them is asynchronous', done => {
      const wrapperAText = 'wrappedByA'
      const wrapperBText = 'wrappedByB'

      const wrapperA = (response) => new Promise(
          resolve => setTimeout(resolve(response + wrapperAText), 100)
        )
      const wrapperB = (response) => response + wrapperBText

      const newFetch = fetch.wrapResponse(wrapperA).wrapResponse(wrapperB)

      const resp = newFetch()

      resp.then(response => {
        expect(response).to.equal(`${fetchResponse}${wrapperAText}${wrapperBText}`)
        done()
      })
    })

    it('Error thrown in a wrapper should be propagated', () => {
      const errMsg = 'Fake error'
      const wrapper = () => {
        throw new Error(errMsg)
      }

      const newFetch = fetch.wrapResponse(wrapper)

      return newFetch().catch(err => expect(err.message).to.equal(errMsg))
    })
  })

  after(() => global.fetch = fetchBackup)
})

