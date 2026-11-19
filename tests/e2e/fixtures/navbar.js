const menu = document.getElementById('menu');
const panel = document.getElementById('panel');

menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  panel.classList.toggle('opacity-0', !open);
  panel.classList.toggle('opacity-100', open);
});
