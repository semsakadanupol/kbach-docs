// Two menus: Products (a dropdown, from md) and the phone menu (below md).
// Esc or a click outside closes them.
const $ = (selector) => document.querySelector(selector);

// --- Products: hidden ↔ shown; the chevron turns through group-aria-expanded:rotate-180
const productsButton = $('#products-button');
const products = $('#products');
function setProducts(open) {
  products.classList.toggle('hidden', !open);
  productsButton.setAttribute('aria-expanded', String(open));
}
productsButton.addEventListener('click', () => setProducts(products.classList.contains('hidden')));

// --- the phone menu: grid-rows-[0fr] ↔ grid-rows-[1fr] (the transition is on the class list)
const menuButton = $('#menu-button');
const menu = $('#mobile-menu');
function setMenu(open) {
  menu.classList.toggle('grid-rows-[0fr]', !open);
  menu.classList.toggle('grid-rows-[1fr]', open);
  menuButton.setAttribute('aria-expanded', String(open));
  $('#menu-icon').setAttribute('d', open ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16');
}
menuButton.addEventListener('click', () =>
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true'),
);

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  setProducts(false);
  setMenu(false);
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('#products, #products-button')) setProducts(false);
});
// wide enough for the links again: the phone menu has nothing to show
matchMedia('(min-width: 768px)').addEventListener('change', (e) => e.matches && setMenu(false));
