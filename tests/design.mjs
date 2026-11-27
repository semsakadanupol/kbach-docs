// The Inspector's Design tab logic (src/playground/design.ts): which class each control owns,
// and what a change takes out and puts in. Node runs the TypeScript file as it is (type
// stripping), so this needs no build. (No browser.)
import { CONTROLS, STATES, applyChange, changeFor, currentClass } from '../src/playground/design.ts';

let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const control = (id) => CONTROLS.flatMap((g) => g.controls).find((c) => c.id === id);
const state = (id) => STATES.find((s) => s.id === id);
// stands in for the engine: a color is <utility>-<family>-<shade>, white, black, or a config name
const isColor = (cls) => /^(?:text|bg|border)-(?:[a-z]+-\d{1,2}|white|black|brand)(?:\/\d+)?$/.test(cls);

const card = ['rounded-xl', 'bg-violet-7', 'hover:bg-violet-8', 'bg-clip-text', 'bg-linear-to-r', 'px-4', 'text-sm', 'text-white', 'dark:bg-violet-5', 'md:hover:bg-violet-9'];

// a background color: the color only, never bg-clip-text or bg-linear-to-r
let c = changeFor(card, control('bg-color'), state('base'), 'bg-rose-6', isColor);
check(JSON.stringify(c) === JSON.stringify({ remove: ['bg-violet-7'], add: ['bg-rose-6'] }), 'a background color replaces the color only, not bg-clip-text or bg-linear-to-r ' + JSON.stringify(c));
// the same control on hover: hover:bg-…, and md:hover:bg-… is left alone
c = changeFor(card, control('bg-color'), state('hover'), 'bg-rose-7', isColor);
check(JSON.stringify(c) === JSON.stringify({ remove: ['hover:bg-violet-8'], add: ['hover:bg-rose-7'] }), 'on Hover it writes hover:bg-…, leaving md:hover:bg-… alone ' + JSON.stringify(c));
// text size and text color are different controls
check(currentClass(card, control('font-size'), state('base'), isColor) === 'text-sm' && currentClass(card, control('text-color'), state('base'), isColor) === 'text-white', 'text-sm is the size, text-white the color');
c = changeFor(card, control('font-size'), state('base'), 'text-lg', isColor);
check(JSON.stringify(c) === JSON.stringify({ remove: ['text-sm'], add: ['text-lg'] }), 'a new size replaces text-sm and keeps text-white ' + JSON.stringify(c));
// clearing, and a control with nothing yet
c = changeFor(card, control('px'), state('base'), null, isColor);
check(JSON.stringify(c) === JSON.stringify({ remove: ['px-4'], add: [] }), 'clearing padding x takes px-4 out ' + JSON.stringify(c));
c = changeFor(card, control('shadow'), state('base'), 'shadow-lg', isColor);
check(JSON.stringify(c) === JSON.stringify({ remove: [], add: ['shadow-lg'] }), 'a control with no class yet just adds one ' + JSON.stringify(c));
// rounded-xl is the corners, not some other rounded- class
check(currentClass(['rounded-t-lg', 'rounded-xl'], control('radius'), state('base'), isColor) === 'rounded-xl', 'corners: rounded-xl, not rounded-t-lg');
// dark state reads dark:bg-violet-5
check(currentClass(card, control('bg-color'), state('dark'), isColor) === 'bg-violet-5', 'Dark reads dark:bg-violet-5');
// applyChange keeps the order and puts new classes at the end
check(applyChange(['a', 'b', 'c'], ['b'], ['d']).join(' ') === 'a c d', 'applyChange keeps the order, new ones at the end');

console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
