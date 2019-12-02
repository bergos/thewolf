const { readFile } = require('fs')
const { resolve } = require('path')
const { promisify } = require('util')
const { get } = require('lodash')
const semver = require('semver')
const WolfError = require('./WolfError')

class Npm {
  constructor ({ context, cwd }) {
    this.context = context
    this.path = resolve(cwd, 'package.json')

    this.content = null
  }

  async load () {
    let raw = null

    try {
      raw = await promisify(readFile)(this.path)
    } catch (err) {
      return [new WolfError('npm config is missing', err, { path: this.path })]
    }

    try {
      this.content = JSON.parse(raw.toString())
    } catch (err) {
      return [new WolfError('could not parse npm config', err, { path: this.path })]
    }

    return []
  }

  async analyze () {
    const errors = []

    if (!this.content) {
      return errors
    }

    if (!get(this.content, 'scripts.test')) {
      errors.push(new WolfError('script "test" is missing', null, { path: this.path }))
    }

    if (!get(this.content, 'devDependencies.standard')) {
      errors.push(new WolfError('dev dependency "standard" is missing', null, { path: this.path }))
    }

    if (!(get(this.content, 'scripts.test') || '').includes('standard')) {
      errors.push(new WolfError('script "test" does not run "standard"', null, { path: this.path }))
    }

    if (!get(this.content, 'devDependencies.mocha')) {
      errors.push(new WolfError('dev dependency "mocha" is missing', null, { path: this.path }))
    }

    if (!(get(this.content, 'scripts.test') || '').includes('mocha')) {
      errors.push(new WolfError('script "test" does not run "mocha"', null, { path: this.path }))
    }

    if (get(this.content, 'engines.node')) {
      const nodeVersions = this.nodeVersions()

      const deprecated = this.context.defaults.node.deprecated.some(version => nodeVersions.includes(version))
      const lts = this.context.defaults.node.lts.every(version => nodeVersions.includes(version))

      if (!deprecated && lts) {
        errors.push(
          new WolfError('engines.node not needed if all LTS versions are supported', null, { path: this.path }))
      }
    }

    return errors
  }

  nodeVersions () {
    if (!get(this.content, 'engines.node')) {
      return this.context.defaults.node.lts
    }

    return [
      ...this.context.defaults.node.deprecated,
      ...this.context.defaults.node.lts
    ].filter(version => {
      return semver.satisfies(semver.coerce(version), this.content.engines.node)
    })
  }
}

module.exports = Npm
