const express = require('express')
const proxy = require('http-proxy-middleware');
const app = express()
const cp = require('child_process')
const path = require('path')
const kill = require('tree-kill')
const Docker = require('dockerode');
const url = require('url')
const retry = require('async-retry')

// /**
//  * Custom proxy for containers
//  */
// var proxyTable = {
//   'localhost:3000/69996eea564b/ui': 'http://localhost:32798'
// };
// var options = {
//   target: 'http://localhost:3000',
//   router: proxyTable
// };
// var myProxy = proxy(options);
// app.use(myProxy); // add the proxy to express

app.get('/', async (req, res) => {
  // spin up a new notebook
  const spawn = cp.spawnSync('docker', ['run', '-d', '-p', '8888', 'psuastro528/notebook'])
  // save to store
  containerId = spawn.stdout.toString().trim()
  res.redirect(`/${containerId}`)
})

app.get('/:containerId/logs', async (req, res) => {
  const { containerId } = req.params
  const logs = getContainerLogs(containerId)
  res.send(logs)
})

app.get('/:containerId/port', async (req, res) => {
  const { containerId } = req.params
  const port = await getContainerPort(containerId)
  res.send(port)
})

app.get('/:containerId/token', async (req, res) => {
  const { containerId } = req.params
  const token = getJupyterToken(containerId)
  res.json(token)
})

app.get('/:containerId', async (req, res) => {
  const { containerId } = req.params
  const port = await getContainerPort(containerId)
  const token = await getJupyterToken(containerId)
  res.redirect(`http://127.0.0.1:${port}/?token=${token}`)
})

const getContainerPort = (container) => {
  return new Promise((res, rej) => {
    const _container = ensureContainerObject(container)
    _container.inspect(function (err, data) {
      if (data) {
        res(data.NetworkSettings.Ports['8888/tcp'][0].HostPort)
      }
    });
  })
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

app.listen(3000, () => console.log(`Example app listening on port ${3000}!`))