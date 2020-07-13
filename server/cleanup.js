/**
 * Clean up containers dynamically
 */
const cp = require("child_process");
const dJSON = require("dirty-json");
const moment = require("moment");
const MAX_CONTAINER_AGE = process.env.MAX_CONTAINER_AGE || 0.5;

module.exports = () => {
  const spawn = cp.spawnSync("docker", [
    "ps",
    "-a",
    "--format={{json .}},",
    "--filter",
    "label=com.heymp.cod",
  ]);
  const output = `[${spawn.output.toString()}]`;
  const containers = dJSON.parse(output);

  if (typeof containers === "object" && containers.length > 0) {
    containers.forEach((container) => {
      const date = Date.parse(container.CreatedAt);
      const older = moment(date).isBefore(
        moment().subtract(MAX_CONTAINER_AGE, "hours")
      );
      // if it's older than max container age
      if (older) {
        cp.spawnSync("docker", ["rm", container.ID]);
      }
    });
  }
};
