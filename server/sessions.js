//@ts-check
const cookieParser = require("cookie-parser");
const uuid = require("uuid/v1");
const SESSIONS = process.env.SESSIONS || true;
const HOST = process.env.HOST || 'docker.localhost';

let instances = []

module.exports = app => {
  if (SESSIONS) {
    // add the cookie parser
    app.use(cookieParser());
    // implement the middleware
    app.use(async (req, res, next) => {
      // create the md5 hash of the unique portions of the request
      res.header("Access-Control-Allow-Origin", req.get('origin'))
      res.header("Access-Control-Allow-Credentials", true)
      const sessionID = req.cookies.CODID || uuid()
      req.session = sessionID

      // if we don't have a cookie then set one
      if (typeof req.cookies.CODID === 'undefined') {
        res.cookie('CODID', sessionID, {
          httpOnly: true,
          domain: `${HOST}`,
          path: '/'
        })
      }
      else {
        const sessions = sessionsEnabled(req)
        if (sessions) {
          // if there is an existing cookie then check if we have existing instances
          const slug = req.slug
          const existingInstance = instances.find(
            i => i.slug === slug && i.session === sessionID
          );
          if (existingInstance) {
            req.codExistingInstanceHost = existingInstance.host
          }
        }
      }

      next();
    });

    // start listening to hooks
    app.hooks.subscribe(next => {
      if (next.hook === 'containerCreated') {
        instances = [...instances, {
          containerID: next.value.id,
          session: next.value.req.session,
          slug: next.value.req.slug,
          host: next.value.host
        }]
      }
    })

  }
};

const sessionsEnabled = (req) => {
  let sessions = true
  if (typeof req.query !== 'undefined') {
    if (typeof req.query.sessions !== 'undefined') {
      sessions = req.query.sessions
    }
  }
  return sessions
}