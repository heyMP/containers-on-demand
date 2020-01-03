const Docker = require("dockerode");
const docker = new Docker();

const getContainerHost = async (options) => {
  const { id } = options
  if (typeof id !== 'undefined') {
    const container = await docker.getContainer(id)
    console.log(container)
  }
}
module.exports.getContainerHost = getContainerHost