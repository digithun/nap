const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const willDecodeSessionToken = promisify(jwt.verify)

const decodeToken = (token) => {
  const { jwt_secret } = require('./config')
  // Guard : Require jwt_secret
  if (typeof jwt_secret === 'undefined' || !jwt_secret) throw new Error('Missing JWT_SECRET')
  return willDecodeSessionToken(token, jwt_secret)
}

const authenticate = (req, res, next) => {
  // Guard : Ignore empty token
  const { token } = req
  if (typeof token === 'undefined' || !token) {
    req.nap.session = null
    next()
    return null
  }

  // Attach sessions
  return decodeToken(token)
    .then(decoded => {
      req.nap.session = decoded
      next()
    })
    .catch(err => {
      req.nap.session = null
      next()
    })
}

const createSessionToken = (installationId, userId) => {
  const { sessions_ttl, jwt_secret } = require('./config')
  const jwt = require('jsonwebtoken')
  const expires = +new Date() + sessions_ttl
  const createdAt = new Date().toISOString()
  const expireAt = new Date(expires).toISOString()

  const sessionToken = jwt.sign(
    {
      installationId,
      userId,
      createdAt,
      expireAt
    },
    jwt_secret
  )

  return sessionToken
}

module.exports = {
  authenticate,
  createSessionToken,
  willDecodeSessionToken,
  decodeToken
}
