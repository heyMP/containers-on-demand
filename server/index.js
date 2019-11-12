//@ts-check
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const uuid = require('uuid/v1')
const { Photon } = require("@generated/photon");
const photon = new Photon();
const PORT = process.env.PORT || 3000 
const cp = require('child_process')
const REGISTRY_WHITELIST = process.env.REGISTRY_WHITELIST || '^(?!.*[\/| ]).*$'
const validImage = require('./validImage.js')

app.use(cors())
photon.connect()

app.get('/', async (req, res) => {
  try {
    const { host } = createNewContainer(req.query)
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
  const id = uuid()
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

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))