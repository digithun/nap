const initNextRoute = (app, nextjs) => {
  // Next exist?
  if (!nextjs) {
    // Silently fail
    debug.info(`NextJS  : N/A`)
    return
  }

  // Custom routes
  try {
    require('../routes')(app, nextjs)
  } catch (err) {
    // Never mind.
    debug.info('NextJS  : No custom routes found')
  }

  // Handler
  const handler = nextjs.getRequestHandler()

  // Authen.reset
  app.get('/auth/reset/*', (req, res) => {
    const { parse } = require('url')
    const pathMatch = require('path-match')

    const route = pathMatch()
    const match = route('/auth/reset/:token')
    const { pathname, query } = parse(req.url, true)
    const params = match(pathname)

    if (params === false) {
      handler(req, res)
      return
    }

    nextjs.render(req, res, '/auth/reset', Object.assign(params, query))
  })

  // Default catch-all handler to allow Next.js to handle all other routes
  app.all('*', (req, res) => handler(req, res))
}

// Graceful Shutdown Server
const gracefulShutdown = (server, signal) => {
  console.log(`Received kill signal (${signal}), shutting down gracefully.`)
  server.close(() => {
    console.log('Closed out remaining connections.')
    process.exit()
  })
}

const init = ({ base_url }, app, nextjs) =>
  new Promise((resolve, reject) => {
    // Next exist?
    initNextRoute(app, nextjs)

    // Server
    const { URL } = require('url')
    const port = new URL(base_url).port
    const server = app.listen(port, err => {
      if (err) return reject(err)

      debug.info(`Express : ${base_url}`)
      resolve(app)
    })

    // Graceful server shutdown
    // listen for TERM signal .e.g. kill
    process.on('SIGTERM', () => {
      gracefulShutdown(server, 'SIGTERM')
    })

    // listen for TERM signal .e.g. Ctrl-C
    process.on('SIGINT', () => {
      gracefulShutdown(server, 'SIGINT')
    })
  })

module.exports = init
