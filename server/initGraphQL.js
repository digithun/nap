const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const { apolloUploadExpress } = require('apollo-upload-server')
const { bigquery_service_endpoint, is_optics_enabled } = require('./config')
const OpticsAgent = require('optics-agent')

// isomorphic-fetch
require('es6-promise').polyfill()
require('isomorphic-fetch')

const init = ({ graphiql_enabled: graphiql, port, e_wallet_enabled }, app) => {
  // Custom GraphQL
  NAP.expose = {
    extendModel: require('./graphql').extendModel,
    setBuildGraphqlSchema: require('./graphql').setBuildGraphqlSchema,
    FileType: require('./graphql/types/File'),
    getFile: require('./graphql').getFile
  }

  if (fs.existsSync(path.resolve(__dirname, '../graphql/setup.js'))) {
    require('../graphql/setup')
  }

  // Upload
  const multer = require('multer')
  const upload = multer({ dest: './.tmp' })

  // CORS
  const cors = require('cors')
  app.use(cors())

  // Helmet
  const helmet = require('helmet')
  app.use(helmet())

  // GraphQL
  const graphqlHTTP = require('express-graphql')

  const { buildSchema } = require('./graphql')

  const { authenticate } = require('./jwt-token')
  const schema = is_optics_enabled ? OpticsAgent.instrumentSchema(buildSchema()) : buildSchema()
is_optics_enabled && app.use(OpticsAgent.middleware())

// attach middleware
if (bigquery_service_endpoint) {
  const { insertQuery, initMiddleWare } = require('../bigquery/queryCollection')
  app.all('/bigQuery/insert', (req, res) => insertQuery(req, res))
  app.use(initMiddleWare())
}

const initEWallet = (req, res, next) => {
  if (e_wallet_enabled) {
    req.ewallet = global.NAP.EWallet.getEWallet(req.token)
  }
  next()
}

app.use(
    '/graphql',
    bodyParser.json(),
    // upload.array('files'),
    apolloUploadExpress(),
    authenticate,
    initEWallet,
    graphqlHTTP(() => ({
      schema,
      graphiql,
      formatError: ({ message, stack }) => ({
        message: message,
        stack: !message.match(/[NOSTACK]/i) ? stack.split('\n') : null,
      }),
    }))
  )

  // Status  
  debug.info(`GraphQL :`, graphiql ? `http://localhost:${port}/graphql` : 'N/A')
}

module.exports = init
