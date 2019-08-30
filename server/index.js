require('dotenv').config()
const express = require('express')
const app = express()
const yaml = require('js-yaml');
const path = require('path')
const fs = require('fs')
const uuid = require('uuid/v1');
const PORT = process.env.PORT || 3000 
const HOST = process.env.HOST || 'docker.localhost'
const redis = require('redis')
const redisClient = redis.createClient(6379, 'redis')

redisClient.on('connect', function() {
  console.log('connected to db')
})
redisClient.on('exit', function() {
  console.log('exited to db')
})

app.get('/', async (req, res) => {
  const path = (req.query.path) ? '/' + req.query.path : ''
  try {
    const id = createNewContainer(req.query)
    const url = `http://${id}.${HOST}${path}`
    // if the user specified redirect
    if (typeof req.query.redirect !== 'undefined') {
      // wait 10 seconds to allow provisioning
      await new Promise((res) => setTimeout(() => res(), 3000) )
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
  newContainer = {
    id,
    image: options.image,
    labels: [
      `traefik.frontend.rule=Host:${id}.${HOST}`,
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
  redisClient.publish('new-container', JSON.stringify(newContainer))
  return id
}

// const getJupyterToken = async (containerId) => {
//   return await retry(bail => {
//     const logs = getContainerLogs(containerId)
//     // regex for the token and get the first match
//     const tokenMatch = /\?token=([\w]*)/g.exec(logs)
//     if (tokenMatch) {
//       return tokenMatch[1]
//     }
//     else {
//       throw new Error('No logs yet')
//     }
//   }, {
//     retries: 50
//   })
// }

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))