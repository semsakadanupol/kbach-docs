const list = document.getElementById('toasts');

// a toast leaves 4 seconds after it came
function toast(text) {
  const li = document.createElement('li');
  li.className = 'rounded-lg bg-gray-12 px-4 py-2 text-sm text-white shadow-lg';
  li.textContent = text;
  list.append(li);
  setTimeout(() => li.remove(), 4000);
}

toast('Saved');
document.getElementById('doctor').addEventListener('click', () => toast('All good'));
