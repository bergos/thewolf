const defaults = require('./defaults')
const Npm = require('./lib/Npm')
const Travis = require('./lib/Travis')

class TheWolf {
  constructor ({ cwd = process.cwd() } = {}) {
    this.cwd = cwd

    this.loaded = false

    this.context = { defaults }
    this.context.npm = new Npm({ context: this.context, cwd: this.cwd })
    this.context.travis = new Travis({ context: this.context, cwd: this.cwd })
  }

  async load () {
    if (this.loaded) {
      return []
    }

    const errors = []
      .concat(await this.context.npm.load())
      .concat(await this.context.travis.load())

    this.loaded = true

    return errors
  }

  async analyze () {
    const errors = []
      .concat(await this.load())
      .concat(await this.context.npm.analyze())
      .concat(await this.context.travis.analyze())

    return errors
  }

  static analyze (options) {
    const wolf = new TheWolf()

    return wolf.analyze(options)
  }
}

module.exports = TheWolf
