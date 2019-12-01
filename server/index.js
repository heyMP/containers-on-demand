//@ts-check
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const uuid = require('uuid/v1')
const PORT = process.env.PORT || 3000 
const cp = require('child_process')
const REGISTRY_WHITELIST = process.env.REGISTRY_WHITELIST || '^(?!.*[\/| ]).*$'
const NETWORK = process.env.NETWORK || null
const validImage = require('./validImage.js')
const url = require('url')

app.use(cors())

app.get('/', async (req, res) => {
  try {
    const { host } = createNewContainer(req.query)
    let url = new URL(`http://${host}`)
    // support path option
    if (typeof req.query.path !== 'undefined') {
      url = new URL(req.query.path, url);
    }
    // if the user specified redirect
    if (typeof req.query.redirect !== 'undefined') {
      // wait 1 second to allow provisioning
      setTimeout(() => res.redirect(url.toString()), 1000)
    }
    // if not just return the url
    else {
      res.send(url.toString())
    }
  } catch (error) {
    res.status(400)
    res.send(error.toString())
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

  // let command = ['run', '-d', '--network', 'containers-on-demand_default']
  let command = [
    'run',
    '-v',
    '/var/run/docker.sock:/var/run/docker.sock',
    'alexellis2/jaas',
    'run'
  ]
  // add image
  command = [...command, '--image', newContainer.image]
  // environment vars
  if (newContainer.environment) {
    newContainer.environment.forEach(env => {
      command = [...command, '-e', env]
    })
  }
  // default network
  if (NETWORK) {
    command = [...command, '--network', NETWORK]
  }
  // additional networks
  if (options.networks) {
    options.networks.split(',').forEach(network => {
      command = [...command, '--network', network]
    })
  }

  // @todo add labels
  // newContainer.labels.forEach(label => {
  //   command = [...command, '-l', label]
  // });

  console.log('command:', command)
  const cpStartContainer = cp.spawnSync('docker', command)
  const output = cpStartContainer.output.toString()
  console.log(output)
  // get the new container id from output
  const newContainerId = /([a-zA-Z0-9]{25})/g.exec(output)[0]
  console.log('newContainerId:', newContainerId)
  // if (newContainer.repo) {
  //   const cpRepo = cp.spawnSync('docker', ['exec', newContainerId, 'git', 'clone', newContainer.repo])
  //   // console.log(cpRepo.output.toString())
  // }
  
  return newContainer
}

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))