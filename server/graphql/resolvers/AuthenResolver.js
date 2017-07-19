const { onError } = require('../../errors')

const loginWithFacebook = async ({ context, args }) => {
  const userData = await context.nap
    .willLoginWithFacebook(context, args.accessToken)
    .catch(onError(context))
  const user =
    userData &&
    (await context.nap.willCreateUser(userData).catch(onError(context)))
  return (
    user &&
    context.nap
      .willInstallAndAuthen(args, user, 'facebook')
      .catch(onError(context))
  )
}

const login = async ({ context, args }) => {
  const user = await context.nap
    .willLogin(context, args.email, args.password)
    .catch(onError(context))
  return (
    user &&
    context.nap
      .willInstallAndAuthen(args, user, 'local')
      .catch(onError(context))
  )
}

const signUpWithEmailAndPassword = async ({ context, args }) =>
  context.nap
    .willSignUp(context, args.email, args.password)
    .catch(onError(context))

const signup = async ({ context, args }) =>
  context.nap
    .willSignUp(context, args.record.email, args.record.password, {
      name: args.record.name,
      gender: args.record.gender,
      first_name: args.record.first_name,
      last_name: args.record.last_name,
      birthday: args.record.birthday
    })
    .catch(onError(context))

const logout = async ({ context }) => {
  // Logout from cookie
  context.logout()
  context.session && context.session.destroy()

  // Guard
  if (!context.nap.session) {
    return {
      isLoggedIn: false,
      sessionToken: null
    }
  }

  // Logout
  const { installationId, userId } = context.nap.session
  return context.nap
    .willLogout(installationId, userId, context.token)
    .catch(onError(context))
}

const authen = async ({ context }) => {
  const _noAuthen = {
    isLoggedIn: false,
    sessionToken: null
  }

  // Guard
  if (!context.nap.session) {
    return _noAuthen
  }

  const { installationId, userId } = context.nap.session
  return NAP.Authen
    .findOne({ userId, installationId })
    .catch(err => onError(context)(err) && _noAuthen)
}

const willAuthen = async (
  installationId,
  { _id: userId, verified },
  provider
) => {
  // Base data
  let authenData = {
    isLoggedIn: false,
    installationId,
    userId
  }

  // Create session token
  const { createSessionToken } = require('../../jwt-token')
  const sessionToken = createSessionToken(installationId, userId)

  // Guard by user local verification if has
  const isVerified = provider === 'local' ? verified : true
  if (isVerified) {
    authenData = Object.assign(authenData, {
      isLoggedIn: isVerified,
      loggedInAt: new Date().toISOString(),
      loggedInWith: provider,
      sessionToken
    })
  }

  // Allow to authen
  return NAP.Authen.findOneAndUpdate({ installationId, userId }, authenData, {
    new: true,
    upsert: true
  })
}

module.exports = {
  loginWithFacebook,
  signup,
  signUpWithEmailAndPassword,
  login,
  logout,
  authen,
  willAuthen
}
