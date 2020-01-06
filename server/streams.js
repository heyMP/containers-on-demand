const { Observable, Subject } = require('rxjs')
const Docker = require("dockerode");
const docker = new Docker();

/**
 * Observable stream of raw docker events
 */
const eventsStream = new Observable(subscriber => {
  docker.getEvents({}, (err, data) => {
    if (data) {
      data.on("data", data => {
        try {
          const event = JSON.parse(data.toString());
          subscriber.next(event)
        } catch(error) {
          console.error(error)
        }
      });
    }
  });
});

const hooksStream = new Subject()

module.exports.eventsStream = eventsStream
module.exports.hooksStream = hooksStream