const { Observable } = require('rxjs')
const Docker = require("dockerode");
const docker = new Docker();

/**
 * Observable stream of raw docker events
 */
const eventsStream = new Observable(subscriber => {
  docker.getEvents({}, (err, data) => {
    if (data) {
      data.on("data", data => {
        const event = JSON.parse(data.toString());
        subscriber.next(event)
      });
    }
  });
});

module.exports.eventsStream = eventsStream