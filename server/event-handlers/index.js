const bodyParser = require('body-parser')
const Joi = require('joi')

const ewalletPayloadSchema = Joi.object().keys({
  userId: Joi.string()
})

function ewalletHandlers (event, context) {
  if (event.type === 'ewallet/topup') {
    const schemaError = Joi.validate(event.payload, ewalletPayloadSchema).error
    if (schemaError !== null) {
      console.error('got schemaError', schemaError)
      return
    }
    context.nap.userEventHookService({
      type: `ewallet/topup`,
      user: { _id: event.payload.userId },
      payload: event.payload
    })
  }
}

module.exports = function initEventHandler (config, app) {
  app.post('/event',
    bodyParser.json(),
    function (req, res, next) {
      if (req.header('x-api-key') !== process.env.EVENT_SERVICE_API_KEY) {
        res.status(403).end()
      } else {
        next()
      }
    },
    async function (req, res) {
      ewalletHandlers(req.body, req)
      res.send()
    }
  )
}
