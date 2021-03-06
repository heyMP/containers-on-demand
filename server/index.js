// @ts-check
const express = require("express");
const app = express();
const cors = require("cors");
const uuid = require("uuid/v1");
const PORT = process.env.PORT || 3000;
const cp = require("child_process");
const REGISTRY_WHITELIST = process.env.REGISTRY_WHITELIST || ".*";
const NETWORK = process.env.NETWORK;
const validImage = require("./validImage.js");
const HOST = process.env.HOST || "docker.localhost";
const ORIGINS = process.env.ORIGINS || "http://demo.docker.localhost";
const { eventsStream } = require('./streams.js');
const { Observable, Subject } = require('rxjs');
const slug = require('./slug.js');
const cleanup = require("./cleanup.js");

// CORS
app.use(cors({
  // support whitelist urls
  origin: ORIGINS,
  // support sessions
  credentials: true
}));
// Add unique slugs
app.use(slug);
// Create Hooks Stream
app['hooks'] = new Subject()
// Plug in Sessions
require('./sessions.js')(app)
// start event stream immediately 
eventsStream.subscribe(res => res)

app.get("/", async (req, res) => {
  try {
    let host = null
    // if we have an existing host then use that
    if (typeof req.codExistingInstanceHost !== "undefined") {
      host = req.codExistingInstanceHost
    }
    else {
      const newContainer = await createNewContainer(req);
      host = newContainer.host
    }
    let url = new URL(`http://${host}`);
    // support path option
    if (typeof req.query.path !== "undefined") {
      url = new URL(req.query.path, url);
    }
    // if the user specified redirect
    if (typeof req.query.redirect !== "undefined") {
      res.redirect(url.toString())
    }
    // if not just return the url
    else {
      res.status(200);
      res.send(url.toString());
    }
  } catch (error) {
    console.log('error:', error)
    res.status(400);
    res.send(error.toString());
  }
});

const createNewContainer = async (req) => {
  // Get document, or throw exception on error
  const id = uuid();
  const host = `${id}.${HOST}`;
  const options = req.query

  if (!options.image) {
    throw new Error("Image request not found");
  }

  // validate user requested image.
  if (!validImage(options.image, REGISTRY_WHITELIST)) {
    throw new Error("Requested image not whitelisted.");
  }

  let newContainer = {
    id,
    image: options.image,
    host,
    labels: [
      `traefik.frontend.rule=Host:${host}`,
      `created=${new Date().getTime()}`
    ]
  };
  if (options.port) {
    newContainer.labels = [
      ...newContainer.labels,
      `traefik.port=${options.port}`,
      `traefik.frontend.headers.customFrameOptionsValue=allow-from ${options.host}`,
      `traefik.frontend.headers.contentSecurityPolicy=frame-ancestors self ${options.host}`
    ];
  }
  // Basic Auth
  if (options.basicAuth) {
    const getHashedPassword = (username, password) => {
      const spawn = cp.spawnSync("htpasswd", ["-nb", username, password]);
      return spawn.stdout.toString().trim();
    };
    // explod the csv basic auth
    const basicAuthArry = options.basicAuth
      .split(",")
      .map(i => i.split(":"))
      .map(i => getHashedPassword(...i));
    // add each auth to traefik
    newContainer.labels = [
      ...newContainer.labels,
      `traefik.frontend.auth.basic.users=${basicAuthArry.join(",")}`
    ];
  }
  if (options.env) {
    newContainer["environment"] = options.env.split(",");
  }
  if (options.repo) {
    newContainer["repo"] = options.repo;
  }
  let command = ["run", "-d", "-l", "com.heymp.cod"];
  if (NETWORK) {
    command = [...command, "--network", NETWORK]
  }
  newContainer.labels.forEach(label => {
    command = [...command, "-l", label];
  });
  if (newContainer.environment) {
    newContainer.environment.forEach(env => {
      command = [...command, "-e", env];
    });
  }
  if (options.networks) {
    options.networks.split(",").forEach(network => {
      command = [...command, "--network", network];
    });
  }
  if (options.healthcheck) {
    command = [ ...command, "--health-cmd", options.healthcheck]
  }

  command = [...command, newContainer.image];
  const cpStartContainer = cp.spawnSync("docker", command);
  console.log('start')
  const output = cpStartContainer.output.toString();
  console.log('stop')
  const newContainerId = /([a-zA-Z0-9]{64})/g.exec(output)[0];
  // wait for the healthy event to come through before moving on.
  await containerStatusCheck({
    id: newContainerId,
    status: "health_status: healthy"
  });
  // // add delay for to allow for provisioning.
  // setTimeout(() => {return}, 2000);
  // send out hooks
  app['hooks'].next({
    hook: 'containerCreated',
    value: {
      id: newContainerId,
      host,
      req
    }
  })
  if (newContainer.repo) {
    const cpRepo = cp.spawnSync("docker", [
      "exec",
      newContainerId,
      "git",
      "clone",
      newContainer.repo
    ]);
  }

  return newContainer;
};

/**
 * Return a Promise once the container meets the status check.
 * @param {*} status
 */
const containerStatusCheck = ({ id, status }) =>
  new Promise((resolve, reject) => 
    eventsStream.subscribe({
      next(event) {
        if (event.status === status && event.id === id) {
          // pause 1 second to for sure let it setup
          setTimeout(() => {
            resolve(event)
          }, 1000)
        }
      }
    })
  );

/**
 * Run cleanup every minute
 */
setInterval(() => {
  cleanup();
}, 60000)

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
module.exports.app = app