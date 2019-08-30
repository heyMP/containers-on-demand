const fs = require('fs')
const path = require('path')
const cp = require('child_process')
const redis = require('redis')
const redisClient = redis.createClient(6379, 'redis')

redisClient.on('connect', function() {
  console.log('connected to db')
})
redisClient.on('exit', function() {
  console.log('exited to db')
})

redisClient.subscribe('new-container', function(err) {
  if (err) throw new Error('Could not subscribe to new-container.')
  console.log('Subscribed to new-container')
})

redisClient.on('message', function (channel, message) {
  const newContainer = JSON.parse(message)
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
  const cpStartContainer = cp.spawnSync('docker', command)
  const output = cpStartContainer.output.toString()
  // get the new container id from output
  const newContainerId = /([A-Za-b0-9])\w+/g.exec(output)[0]
  if (newContainer.repo) {
    const cpRepo = cp.spawnSync('docker', ['exec', newContainerId, 'git', 'clone', newContainer.repo])
  }
})

// fs.watchFile(path.join(__dirname, '../', 'docker-compose-dynamic-containers.yml'), (curr, prev) => {
//   console.log('file changed')
//   const spawn = cp.spawnSync('docker-compose', ['-f', 'docker-compose.yml', '-f', 'docker-compose-dynamic-containers.yml', 'up', '-d', '--remove-orphans'], {
//     cwd: path.join(__dirname, '../')
//   })
//   console.log(spawn.output.toString())
// })