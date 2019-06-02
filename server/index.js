require('dotenv').config()
const express = require('express')
const app = express()
const cp = require('child_process')
const Docker = require('dockerode');
const retry = require('async-retry')
const yaml = require('js-yaml');
const path = require('path')
const fs = require('fs')
const uuid = require('uuid/v1');
const PORT = process.env.PORT || 3000 
const HOST = process.env.HOST || 'docker.localhost'

app.get('/', async (req, res) => {
  const id = createNewContainer() 
  await new Promise(r => setTimeout(() => r(), 7000))
  res.redirect(`http://${id}.${HOST}`)
})

const createNewContainer = () => {
  // Get document, or throw exception on error
  const id = uuid()
  let compose = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'docker-compose-dynamic-containers.yml'), 'utf8'));
  let newContainer = {}
  newContainer = {
    image: 'psuastro528/notebook',
    labels: [ `traefik.frontend.rule=Host:${id}.${HOST}` , "traefik.port=8888"],
  }
  compose.services[id] = newContainer
  fs.writeFileSync(path.join(__dirname, 'docker-compose-dynamic-containers.yml'), yaml.safeDump(compose), 'utf8')
  return id
}

// app.get('/rstudio', async (req, res) => {
//   const spawn = cp.spawnSync('docker', ['run', '-d', '-p', '8787', '-e', 'DISABLE_AUTH=true', 'rocker/rstudio'])
//   // save to store
//   const output = spawn.output.toString().trim()
//   const containerId = /[a-zA-Z0-9_.]{64}/g.exec(output)[0]
//   // get port
//   const port = getContainerExposedPort(containerId, '8787')
//   // redirect to the jupyter notebook
//   res.redirect(`http://localhost:${port}`)
// })

// const ensureContainerObject = (container) => {
//   if (typeof container === 'string') {
//     var docker = new Docker();
//     return docker.getContainer(container)
//   }
//   return container
// }

// const getContainerLogs = (containerId) => {
//   const spawn = cp.spawnSync('docker', ['logs', containerId])
//   return spawn.output.toString()
// }

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