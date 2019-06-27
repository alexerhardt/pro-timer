'use strict';

const $mainView = document.querySelector('.main-view');
const $settingsView = document.querySelector('.settings-view');
const $toggleViewButton = document.querySelectorAll('.toggle-btn');

const VIEWS = { main: 0, settings: 1 };
let selectedView = VIEWS.main;

$toggleViewButton.forEach(($button) => {
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
    console.log('start clicked');
    this.timer = setInterval(() => {
      this.seconds++;
      this.render();
    }, 1000);
  }

  stop() {
    console.log('stop clicked');
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  render() {
    document.querySelector('.counter').innerHTML = `${this.seconds}`;
  }
}

let c = new Counter();
document.querySelector('.start-btn').addEventListener('click', () => {
  c.start();
});

document.querySelector('.stop-btn').addEventListener('click', () => {
  c.stop();
});
