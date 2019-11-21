//@ts-check
require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const uuid = require('uuid/v1')
const { Photon } = require("@generated/photon");
const photon = new Photon();
const PORT = process.env.PORT || 3000 
const cp = require('child_process')
const REGISTRY_WHITELIST = process.env.REGISTRY_WHITELIST || '^(?!.*[\/| ]).*$'
const validImage = require('./validImage.js')
const jwt = require("jsonwebtoken");
const HAXCMS_OAUTH_JWT_SECRET = process.env.HAXCMS_OAUTH_JWT_SECRET || "1598559ab3894f59bde1f42638c4cf9e";
const _ = require('lodash')
const md5 = require("md5")
const COD_AUTH_REQUIRED = process.env.COD_AUTH_REQUIRED || false;
const { ApolloServer, gql, AuthenticationError } = require("apollo-server-express");

app.use(cors())
app.use(bodyParser())
photon.connect()

/**
 * Allow calls from web components with cookies
 */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  next();
});

/**
 * Pick out the user if it was sent to us via JWT
 */
app.use(async (req, res, next) => {
  try {
    if (typeof req.headers.authorization !== "undefined") {
      const access_token = req.headers.authorization.split(" ")[1];
      const user = jwt.verify(access_token, HAXCMS_OAUTH_JWT_SECRET);
      req.user = user
      next()
    }
  } catch (error) {
    if (COD_AUTH_REQUIRED) {
      throw new AuthenticationError(error);
    }
  }
  next()
});

app.all('/', async (req, res) => {
  let host = null
  try {
    // assemble the params assembles query params then whatever was
    // set in the body of the request
    let params = { ...req.query, ...req.body }
    // first check if the user has an existing container with that
    // slug
    if (_.has(req, 'user.name')) {
      const name = req.user.name
      const slug = (_.has(params, 'slug')) ?  `${params.slug}` : md5(`${JSON.stringify(params)}`)
      params = {...params, slug }

      // check to see if this container exists
      const user = await getUser({ name })
      const container = await getUserContainer({ name, slug })
    }
    else {
      // if we don't have a slug then just make one up
      if (!_.has(params, 'slug')) {
        params = {...params, slug: uuid()}
      }
      const { host } = createNewContainer(params)
    }

    const url = `http://${host}`
    // if the user specified redirect
    if (typeof req.query.redirect !== 'undefined') {
      // wait 1 second to allow provisioning
      setTimeout(() => res.redirect(url), 1000)
    }
    // if not just return the url
    else {
      res.send(url)
    }
  } catch (error) {
    res.status(400)
    res.send(error.toString())
  }
})

app.get('/users', async (req, res) => {
  try {
    const users = await photon.users.findMany({
      include: { containers: true }
    })
    res.json(users)
  } catch (error) {
  }
})

const createNewContainer = (options) => {
  // Get document, or throw exception on error
  const id = (options.slug) ? options.slug : uuid()
  const host = `${id}.${options.host}`

  if (!options.image) {
    throw new Error('Image request not found')
  }

  // validate user requested image.
  if (!validImage(options.image, REGISTRY_WHITELIST)) {
    throw new Error('Requested image not whitelisted.')
  }

  let newContainer = {
    id,
    image: options.image,
    host,
    labels: [
      `traefik.frontend.rule=Host:${host}`,
      `created=${new Date().getTime()}`
    ]
  }
  if (options.port) {
    newContainer.labels = [
      ...newContainer.labels,
      `traefik.port=${options.port}`,
      `traefik.frontend.headers.customFrameOptionsValue=allow-from ${options.host}`,
      `traefik.frontend.headers.contentSecurityPolicy=frame-ancestors self ${options.host}`
    ]
  }
  // Basic Auth
  if (options.basicAuth) {
    const getHashedPassword = (username, password) => {
      const spawn = cp.spawnSync('htpasswd', ['-nb', username, password])
      return spawn.stdout.toString().trim()
    }
    // explod the csv basic auth
    const basicAuthArry = options.basicAuth
      .split(',')
      .map(i => i.split(':'))
      .map(i => getHashedPassword(...i))
    // add each auth to traefik
    newContainer.labels = [
      ...newContainer.labels,
      `traefik.frontend.auth.basic.users=${basicAuthArry.join(',')}`
    ]
  }
  if (options.env) {
    newContainer['environment'] = options.env.split(',')
  }
  if (options.repo) {
    newContainer['repo'] = options.repo
  }

  let command = ['run', '-d', '--network', 'containers-on-demand_default']
  newContainer.labels.forEach(label => {
    command = [...command, '-l', label]
  });
  if (newContainer.environment) {
    newContainer.environment.forEach(env => {
      command = [...command, '-e', env]
    })
  }
  if (options.networks) {
    options.networks.split(',').forEach(network => {
      command = [...command, '--network', network]
    })
  }

  command = [...command, newContainer.image]
  // console.log('command:', command)
  const cpStartContainer = cp.spawnSync('docker', command)
  const output = cpStartContainer.output.toString()
  // console.log(output)
  // get the new container id from output
  const newContainerId = /([a-zA-Z0-9]{64})/g.exec(output)[0]
  if (newContainer.repo) {
    const cpRepo = cp.spawnSync('docker', ['exec', newContainerId, 'git', 'clone', newContainer.repo])
    // console.log(cpRepo.output.toString())
  }
  
  return newContainer
}

const getUser = async ({ name }) => {
  try {
    const user = await photon.users.findOne({
      where: { name }
    })
    return user
  } catch(error) {
    const user = await photon.users.create({
      data: { name }
    })
    return user
  }
}

const getUserContainer = async ({ name, slug }) => {
  try {
    const containers = await photon.users.findOne({
      where: { name }
    }).containers()
    const container = containers.find(c => c.slug === slug)
    return (container) ? container : null
  } catch(error) {
    return null
  }
}

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))