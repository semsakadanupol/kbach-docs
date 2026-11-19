interface Step {
  text: string;
  done: boolean;
}

const steps: Step[] = [
  { text: 'Install the package', done: true },
  { text: 'Add the plugin', done: true },
  { text: 'Write your first class', done: false },
  { text: 'Try dark mode', done: false },
  { text: 'Ship it', done: false },
];
const list = document.getElementById('list') as HTMLUListElement;
const progress = document.getElementById('progress') as HTMLDivElement;

function render(): void {
  list.innerHTML = '';
  for (const s of steps) {
    const li = document.createElement('li');
    li.textContent = s.text;
    li.className = s.done ? 'text-gray-6 line-through' : 'text-gray-12';
    list.append(li);
  }
  progress.style.width = Math.round((steps.filter((s) => s.done).length / steps.length) * 100) + '%';
}

render();
