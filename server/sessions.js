//@ts-check
const cookieParser = require("cookie-parser");
const uuid = require("uuid/v1");
const { getContainerHost } = require('./docker.js')
const SESSIONS = process.env.SESSIONS || true;

let instances = []

module.exports = app => {
  if (SESSIONS) {
    // add the cookie parser
    app.use(cookieParser());
    // implement the middleware
    app.use((req, res, next) => {
      console.log(JSON.stringify(req.cookies))
      // create the md5 hash of the unique portions of the request
      res.header("Access-Control-Allow-Origin", req.get('origin'))
      res.header("Access-Control-Allow-Credentials", true)
      const sessionID = req.cookies.CODID || uuid()
      req.session = sessionID

      // if we don't have a cookie then set one
      if (typeof req.cookies.CODID === 'undefined') {
        res.cookie('CODID', sessionID, {
          httpOnly: true,
          domain: `cod.docker.localhost`,
          path: '/'
        })
      }
      else {
        // if there is an existing cookie then check if we have existing instances
        const slug = req.slug
        console.log(slug)
        console.log(instances)
        const existingInstance = instances.find(
          i => i.slug === slug && i.session === sessionID
        );
        if (existingInstance) {
          getContainerHost(existingInstance.containerID)
          console.log('existingInstance:', existingInstance)
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
          slug: next.value.req.slug
        }]
      }
    })

    // if we do have a CODID then lets try to retrieve it
    // const existingInstance = instances.find(
    //   i => i.request === request && i.session === sessionID
    // );
    // console.log('existingInstance:', existingInstance)

    // if (!existingInstance) {
    //   instances = [...instances, sessionID]
    // }
  }
};

// server_1         | {
//   server_1         |   image: 'heymp/notebook',
//   server_1         |   host: 'demo.docker.localhost',
//   server_1         |   port: '8888',
//   server_1         |   repo: 'https://github.com/PsuAstro528/lab1-start.git',
//   server_1         |   path: 'notebooks/lab1-start/ex1.ipynb'
//   server_1         | }
