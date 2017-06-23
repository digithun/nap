// Helper
const dev = process.env.NODE_ENV !== 'production'

const config = {
  // Environments
  dev,

  // Passport
  mailgun_api_key: process.env.MAILGUN_API_KEY,
  mailgun_domain: process.env.MAILGUN_DOMAIN,

  // Services
  redis_url: process.env.REDIS_URI || 'redis://redis',
  mongo_url: process.env.MONGODB_URI || 'mongodb://mongo/graphql',
  port: parseInt(process.env.PORT || '0') || 3000,

  // Security
  cookie_secret: process.env.COOKIE_SECRET || 'foo',
  jwt_secret: process.env.JWT_SECRET || 'foo',

  passport_disabled: parseInt(process.env.PASSPORT_DISABLED || '0') === 1,
  graphql_disabled: parseInt(process.env.GRAPHQL_SERVER_DISABLED || '0') === 1,
  graphiql_enabled: process.env.GRAPHIQL_ENABLED !== undefined ? parseInt(process.env.GRAPHIQL_ENABLED || '0') === 1 : dev,

  mubsub: process.env.MUBSUB_URI,
  mubsub_enabled: process.env.MUBSUB_URI !== undefined && !!process.env.MUBSUB_URI,

  e_wallet_api: process.env.E_WALLET_API,
  e_wallet_enabled: process.env.E_WALLET_API !== undefined && !!process.env.E_WALLET_API,

  // appolo optics
  is_optics_enabled: parseInt(process.env.IS_OPTICS_ENABLED || '0') === 1,

  // BigQuery
  bigquery_service_endpoint: process.env.BIGQUERY_SERVICE_ENDPOINT || null
}

module.exports = config
