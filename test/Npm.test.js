const { strictEqual } = require('assert')
const { resolve } = require('path')
const { describe, it } = require('mocha')
const defaults = require('../defaults')
const Npm = require('../lib/Npm')

const examplePackageDir = resolve(__dirname, 'support/example-package')

function createContext ({ cwd = examplePackageDir } = {}) {
  const context = { defaults }

  context.npm = new Npm({ context, cwd })

  return context
}

describe('Npm', () => {
  it('should be a constructor', () => {
    strictEqual(typeof Npm, 'function')
  })

  describe('.load', () => {
    it('should be a method', () => {
      const context = createContext()

      strictEqual(typeof context.npm.load, 'function')
    })

    it('should load the npm config', async () => {
      const context = createContext()

      await context.npm.load()

      strictEqual(typeof context.npm.content, 'object')
    })
  })

  describe('.analyze', () => {
    it('should be a method', () => {
      const context = createContext()

      strictEqual(typeof context.npm.analyze, 'function')
    })

    it('should return an empty error if there are no errors', async () => {
      const context = createContext()

      const errors = await context.npm.analyze()

      strictEqual(errors.length, 0)
    })

    it('should detect missing "test" script', async () => {
      const context = createContext()
      await context.npm.load()
      delete context.npm.content.scripts.test

      const errors = await context.npm.analyze()

      strictEqual(errors.length > 0, true)
    })
  })
})
