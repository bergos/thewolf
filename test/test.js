const { strictEqual } = require('assert')
const { resolve } = require('path')
const { describe, it } = require('mocha')
const TheWolf = require('..')

const examplePackageDir = resolve(__dirname, 'support/example-package')

describe('TheWolf', () => {
  it('should be a constructor', () => {
    strictEqual(typeof TheWolf, 'function')
  })

  describe('.load', () => {
    it('should be a method', () => {
      const wolf = new TheWolf({ cwd: examplePackageDir })

      strictEqual(typeof wolf.load, 'function')
    })

    it('should load the npm config', async () => {
      const wolf = new TheWolf({ cwd: examplePackageDir })

      await wolf.load()

      strictEqual(typeof wolf.context.npm.content, 'object')
    })

    it('should load the Travis config', async () => {
      const wolf = new TheWolf({ cwd: examplePackageDir })

      await wolf.load()

      strictEqual(typeof wolf.context.travis.content, 'object')
    })
  })

  describe('.analyze', () => {
    it('should be a method', () => {
      const wolf = new TheWolf({ cwd: examplePackageDir })

      strictEqual(typeof wolf.analyze, 'function')
    })

    it('should return an empty error if there are no errors', async () => {
      const wolf = new TheWolf({ cwd: examplePackageDir })

      const errors = await wolf.analyze()

      strictEqual(errors.length, 0)
    })
  })
})
