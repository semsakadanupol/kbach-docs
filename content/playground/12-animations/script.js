// Replay: take animate-rise off every card and put it back, so the entrance plays again
// (the delays are their own classes, [animation-delay:60ms] and on, so they stay).
document.querySelector('#replay').addEventListener('click', () => {
  const cards = document.querySelectorAll('#cards > figure');
  cards.forEach((card) => card.classList.remove('motion-safe:animate-rise'));
  void document.body.offsetWidth; // a reflow, so the browser sees the class come back
  cards.forEach((card) => card.classList.add('motion-safe:animate-rise'));
});
