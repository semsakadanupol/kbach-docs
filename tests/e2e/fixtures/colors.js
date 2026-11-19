// The swatches and the card's class are built here, at runtime: their CSS
// follows once the page uses them.
const families = ['gray', 'rose', 'sky', 'emerald'];
const card = document.getElementById('card');
const shadeInput = document.getElementById('shade');
const box = document.getElementById('families');
let family = 'sky';
let shade = 6;

function paint() {
  card.className = 'h-24 rounded-xl bg-' + family + '-' + shade;
}

for (const f of families) {
  const b = document.createElement('button');
  b.title = f;
  b.className = 'size-8 rounded-full bg-' + f + '-6';
  b.addEventListener('click', () => {
    family = f;
    paint();
  });
  box.append(b);
}
shadeInput.addEventListener('input', () => {
  shade = Number(shadeInput.value) || 6;
  paint();
});
paint();
