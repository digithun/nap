const willAuthenWithPassport = (strategy, req) =>
  new Promise((resolve, reject) => {
    const passport = require('passport')
    // @ts-ignore
    passport.authenticate(strategy, (err, payload) => {
      // Error?
      if (err) {
        return reject(err)
      }

      // Will find someone that has this email and update token
      const user = NAP.User.findOneAndUpdate(
        {
          email: payload.email
        },
        payload,
        { new: true, upsert: true }
      )

      // User?
      return user ? resolve(user) : reject(require('./errors/codes').AUTH_PASSPORT_FAILED)
    })(req)
  })

const willGetProfileWithPassport = (strategy, req) =>
  new Promise((resolve, reject) => {
    const passport = require('passport')
    // @ts-ignore
    passport.authenticate(strategy, (err, payload) => {
      // Error?
      if (err) {
        return reject(err)
      }

      // Payload?
      return payload ? resolve(payload) : reject(require('./errors/codes').AUTH_PASSPORT_FAILED)
    })(req)
  })

module.exports = { willAuthenWithPassport, willGetProfileWithPassport }
