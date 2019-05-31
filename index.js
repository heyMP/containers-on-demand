require('dotenv').config()
const express = require('express')
const cookieSession = require('cookie-session')
// const proxy = require('http-proxy-middleware');
const app = express()
const cp = require('child_process')
// const path = require('path')
// const kill = require('tree-kill')
const Docker = require('dockerode');
const retry = require('async-retry')
const PORT = process.env.PORT || 3000

app.use(cookieSession({
  name: 'session',
  keys: ['SECRIT1', 'SECRIT2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.get('/', async (req, res) => {
  let container = ''
  // first look for the session
  if (!req.session || !req.session.container) {
    // spin up a new notebook
    const spawn = cp.spawnSync('docker', ['run', '-d', '-p', '8888', 'psuastro528/notebook'])
    // save to store
    const output = spawn.stdout.toString().trim()
    const containerId = /[a-zA-Z0-9_.]{64}/g.exec(output)[0]
    // update the users session
    req.session.container = containerId
    // redirect to the jupyter notebook
    container = containerId
    // if the user specified a repo then clone it in
    if (req.query.repo) {
      cp.spawnSync('docker', ['exec', containerId, 'git', 'clone', req.query.repo])
    }
  }
  // if there is an outstanding session then use that one
  else {
    container = req.session.container
  }
  const port = getContainerExposedPort(container, '8888')
  if (!port) {
    res.redirect('/new')
  }
  const token = await getJupyterToken(container)
  // redirect to active container
  res.redirect(`http://127.0.0.1:${port}/${req.query.path || ''}?token=${token}`)
})

app.get('/new', async (req, res) => {
  req.session.container = null
  res.redirect(`${req.url.replace('/new', '/')}`)
})

app.get('/logout', async (req, res) => {
  req.session.container = null
  req.session = null
  res.send('logged out')
})

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

const getContainerExposedPort = (container, port) => {
  const spawn = cp.spawnSync('docker', ['port', container, port])
  const output = spawn.output.toString().trim()
  return /[0-9]{4,}/g.exec(output)[0]
}

const ensureContainerObject = (container) => {
  if (typeof container === 'string') {
    var docker = new Docker();
    return docker.getContainer(container)
  }
  return container
}

const getContainerLogs = (containerId) => {
  const spawn = cp.spawnSync('docker', ['logs', containerId])
  return spawn.output.toString()
}

const getJupyterToken = async (containerId) => {
  return await retry(bail => {
    const logs = getContainerLogs(containerId)
    // regex for the token and get the first match
    const tokenMatch = /\?token=([\w]*)/g.exec(logs)
    if (tokenMatch) {
      return tokenMatch[1]
    }
    else {
      throw new Error('No logs yet')
    }
  }, {
    retries: 50
  })
}

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))