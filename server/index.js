require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const uuid = require('uuid/v1')
const PORT = process.env.PORT || 3000 
const cp = require('child_process')

app.use(cors())

app.get('/', (req, res) => {
  try {
    const { host } = createNewContainer(req.query)
    const url = `http://${host}`
    // if the user specified redirect
    if (typeof req.query.redirect !== 'undefined') {
      // wait 10 seconds to allow provisioning
      res.redirect(url)
    }
    // if not just return the url
    else {
      res.send(url)
    }
  } catch (error) {
    res.send(error)
  }
})

const createNewContainer = (options) => {
  // Get document, or throw exception on error
  const id = uuid()
  const host = `${id}.${options.host}`
  newContainer = {
    id,
    image: options.image,
    host,
    labels: [
      `traefik.frontend.rule=Host:${host}`,
      `created=${new Date().getTime()}`
    ]
  }
  if (options.port) {
    newContainer.labels = [...newContainer.labels, `traefik.port=${options.port}`]
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
  command = [...command, newContainer.image]
  console.log('command:', command)
  const cpStartContainer = cp.spawnSync('docker', command)
  const output = cpStartContainer.output.toString()
  console.log(output)
  // get the new container id from output
  const newContainerId = /([a-zA-Z0-9]{64})/g.exec(output)[0]
  if (newContainer.repo) {
    const cpRepo = cp.spawnSync('docker', ['exec', newContainerId, 'git', 'clone', newContainer.repo])
    console.log(cpRepo.output.toString())
  }
  
  return newContainer
}

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))