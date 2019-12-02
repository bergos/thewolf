const { readFile } = require('fs')
const { resolve } = require('path')
const { promisify } = require('util')
const yaml = require('js-yaml')
const { difference, get } = require('lodash')
const WolfError = require('./WolfError')

class Travis {
  constructor ({ context, cwd }) {
    this.context = context
    this.path = resolve(cwd, '.travis.yml')

    this.content = null
  }

  async load () {
    let raw = null

    try {
      raw = await promisify(readFile)(this.path)
    } catch (err) {
      return [new WolfError('Travis config is missing', err, { path: this.path })]
    }

    try {
      this.content = yaml.safeLoad(raw.toString())
    } catch (err) {
      return [new WolfError('could not parse Travis config', err, { path: this.path })]
    }

    return []
  }

  async analyze () {
    const errors = []

    if (!this.content) {
      return errors
    }

    if (get(this.content, 'language') !== 'node_js') {
      errors.push(new WolfError('language must be node_js', null, { path: this.path }))
    }

    if (!get(this.content, 'node_js')) {
      errors.push(new WolfError('node_js missing', null, { path: this.path }))
    }

    const npmVersions = this.context.npm.nodeVersions()
    const travisVersions = this.content.node_js

    const plusVersion = difference(npmVersions, travisVersions)
    const minusVersion = difference(travisVersions, npmVersions)

    if (plusVersion.length !== 0) {
      errors.push(new WolfError(`Defined versions are not covered in package.json or LTS: ${plusVersion}`, null, { path: this.path }))
    }

    if (minusVersion.length !== 0) {
      errors.push(new WolfError(`package.json or LTS covers versions which are not defined: ${minusVersion}`, null, { path: this.path }))
    }

    return errors
  }
}

module.exports = Travis
