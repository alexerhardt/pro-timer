const moment = require('moment');

module.exports = class Counter {
  constructor(renderFunction, eventHandlers) {
    this.startDate = undefined;
    this.seconds = 0;
    this.timer = undefined;
    this.render = renderFunction;
    this.eventHandlers = eventHandlers;
  }

  // TODO: Need to fix this logic; it does not allow restarts
  start() {
    if (!this.timer) {
      this.startDate = moment.now();
      this.eventHandlers.onStart();
      this.timer = setInterval(() => {
        this.seconds++;
        this.render(this.seconds);
      }, 1000);
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  reset() {
    if (this.timer) {
      this.stop();
      this.startDate = undefined;
      this.seconds = 0;
      this.timer = undefined;
      this.render(this.seconds);
      this.eventHandlers.onReset();
    }
  }
};
