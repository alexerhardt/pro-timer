const $first = document.querySelector('.main-view');
const $second = document.querySelector('.settings-view');

$first.addEventListener('click', () => {
  $first.classList.add('hidden');
  $second.classList.remove('hidden');
});

