const { onError } = require('../../errors')
const { willGetUserFromSession } = require('../../../server/authen-sessions')

const willReadUser = async ({ context }) => {
  const user = await willGetUserFromSession(context).catch(onError(context))
  return user
}

const unlinkFromFacebook = async ({ context }) => {
  const user = await willGetUserFromSession(context).catch(onError(context))
  return context.nap.willUnlinkFromFacebook(user).catch(onError(context))
}

const linkWithFacebook = async ({ args, context }) => {
  const user = await willGetUserFromSession(context).catch(onError(context))
  const token = args.accessToken
  const profile = await context.nap.willGetFacebookProfile(context, token).catch(onError(context))
  return context.nap.willLinkWithFacebook(user, profile, token).catch(onError(context))
}

const updateEmail = async ({ args, context }) => {
  const user = await willGetUserFromSession(context).catch(onError(context))
  const { email } = args
  return context.nap.willUpdateEmail(user, email).catch(onError(context))
}

const updatePassword = async ({ args, context }) => {
  const user = await willGetUserFromSession(context).catch(onError(context))
  const { password, new_password } = args
  return context.nap.willUpdatePassword(user, password, new_password).catch(onError(context))
}

const forget = async ({ context, args }) => context.nap.willResetPasswordViaEmail(context, args.email).catch(onError(context))

const updatePasswordByToken = async ({ context, args }) => context.nap.willUpdatePasswordByToken(args.token, args.password).catch(onError(context))
const updateEmailByToken = async ({ context, args }) => context.nap.willVerifyEmailByToken(args.token, args.password).catch(onError(context))

const changeEmail = async ({ context, args }) => {
  const user = await willGetUserFromSession(context).catch(onError(context))
  const { email } = args
  return context.nap.willSendVerificationForUpdateEmail(user, email).catch(onError(context))
}

const deleteUser = async ({ args, context }) => {
  const user = await willGetUserFromSession(context).catch(onError(context))
  // Guard null user
  if (!user) onError(context)(require('../../errors/codes').AUTH_INVALID_USER_TOKEN)
  const { password } = args
  return context.nap.willDeleteUser(user, password).catch(onError(context))
}

module.exports = {
  user: willReadUser,
  linkWithFacebook,
  unlinkFromFacebook,
  updateEmail,
  updateEmailByToken,
  forget,
  updatePassword,
  updatePasswordByToken,
  changeEmail,
  deleteUser
}
