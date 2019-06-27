'use strict';
const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');

const $mainView = document.querySelector('.main-view');
const $settingsView = document.querySelector('.settings-view');
const $toggleViewButtons = document.querySelectorAll('.toggle-btn');

const VIEWS = { main: 0, settings: 1 };
let selectedView = VIEWS.main;

$toggleViewButtons.forEach(($button) => {
  $button.addEventListener('click', () => {
    if (selectedView === VIEWS.main) {
      $mainView.classList.add('hidden');
      $settingsView.classList.remove('hidden');
      selectedView = VIEWS.settings;
    } else {
      $settingsView.classList.add('hidden');
      $mainView.classList.remove('hidden');
      selectedView = VIEWS.main;
    }
  });
});

class Counter {
  seconds = 0;
  timer;

  start() {
    if (!this.timer) {
      this.timer = setInterval(() => {
        this.seconds++;
        this.render();
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
      this.seconds = 0;
      this.timer = undefined;
      this.render();
    }
  }

  render() {
    const m = moment.duration(this.seconds * 1000).format('HH : mm : ss', {
      trim: false,
    });
    document.querySelector('.counter').innerHTML = m;
  }
}

let c = new Counter();
document.querySelector('.start-btn').addEventListener('click', () => {
  c.start();
});

document.querySelector('.stop-btn').addEventListener('click', () => {
  c.stop();
});

document.querySelector('.reset-btn').addEventListener('click', () => {
  c.reset();
});


