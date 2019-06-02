const fs = require('fs')
const path = require('path')
const cp = require('child_process')

fs.watchFile(path.join(__dirname, '../', 'docker-compose-dynamic-containers.yml'), (curr, prev) => {
  console.log('file changed')
  const spawn = cp.spawnSync('docker-compose', ['-f', 'docker-compose.yml', '-f', 'docker-compose-dynamic-containers.yml', 'up', '-d', '--remove-orphans'], {
    cwd: path.join(__dirname, '../')
  })

  console.log(spawn)
})