const { GenericError } = require('./index.js')

module.exports = {
  get NAP_INVALID_ARGUMENT () {
    return new GenericError('nap/invalid-argument', 'An invalid argument was provided. ')
  },
  get NAP_INVALID_SESSION_TOKEN () {
    return new GenericError('nap/invalid-session-token', 'Invalid sessionToken provide. ')
  },
  get NAP_SESSION_NOT_FOUND () {
    return new GenericError('nap/session-not-found', 'NAP session not found. ')
  },
  get NAP_INSTALLATION_NOT_FOUND () {
    return new GenericError('nap/installation-not-found', 'NAP session not found. ')
  }
}
