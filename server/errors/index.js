class GenericError extends Error {
  constructor (code, message) {
    super(message)
    this.code = code
  }
}

const _COMMON_ERRORS = {
  403: 'Forbidden',
  501: 'Server error'
}

const _push = (req, { code, message }) => req.nap.errors.push({ code, message })

const onError = req => (...args) => {
  // Error('foo')
  if (args[0] instanceof Error) {
    _push(req, new GenericError(0, args[0].message))
    return null
  }

  // 'foo'
  if (typeof args[0] === 'string') {
    _push(req, new GenericError(0, args[0]))
    return null
  }

  // 403, 'foo'
  if (typeof args[0] === 'number' && typeof args[1] === 'string') {
    _push(req, new GenericError(args[0], args[1]))
    return null
  }

  // 403
  if (typeof args[0] === 'number' && args.length === 1) {
    _push(req, new GenericError(args[0], _COMMON_ERRORS[args[0]] || ''))
    return null
  }

  return null
}

const guard = (arg, msg) => {
  const is = require('is_js')
  if (!arg) {
    throw new Error('Required : Object e.g. { foo }')
  }
  if (is.not.existy(Object.values(arg)[0])) {
    throw new GenericError(0, msg || `Required : ${Object.keys(arg)[0]}`)
  }

  return false
}

module.exports = {
  GenericError,
  WAIT_FOR_EMAIL_VERIFICATION_ERROR: new GenericError(
    181,
    'Email has been sent and wait for verification'
  ),
  onError,
  guard
}