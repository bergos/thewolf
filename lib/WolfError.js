class WolfError extends Error {
  constructor (message, cause, options) {
    super(message)

    if (cause) {
      this.stack += `\nCaused by: ${cause.stack}`
    }

    Object.entries(options).forEach(([key, value]) => {
      this[key] = value
    })
  }
}

module.exports = WolfError
