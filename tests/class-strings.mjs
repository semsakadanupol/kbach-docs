// Which strings in a classList call the editor treats as classes (src/playground/classStrings.ts).
// Node runs the TypeScript file as it is. (No browser.)
import { classListOpen, classListStrings, cnStrings, isValueString } from '../src/playground/classStrings.ts';

let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const texts = (method, args) => classListStrings(method, args).map((s) => s.text);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

check(same(texts('add', "'a', 'b c'"), ['a', 'b c']), 'add: every string argument');
// regression: the second argument of toggle is true or false, never a class
check(same(texts('toggle', "'dark', mode === 'dark' || (mode === 'system' && system.matches"), ['dark']), "toggle: only the first argument (mode === 'system' is not a class)");
check(same(texts('toggle', "on ? 'a' : 'b'"), []), 'an expression argument is not read');
check(same(texts('remove', "...from"), []) && same(texts('remove', "'x', ...rest"), ['x']), 'remove: the strings before a spread');
check(same(texts('replace', "'old', 'new'"), ['old', 'new']) && same(texts('contains', "'a', 'b'"), ['a']), 'replace: two, contains: one');
// where each string's text starts, for the editor's marks
const args = "  'hidden',  'flex'";
check(classListStrings('add', args).every((s) => args.slice(s.at, s.at + s.text.length) === s.text), 'each string says where its text starts');

// cn() / clsx(): every string but values (regression: 'added' and 'bg-' were flagged as classes)
const cn = (args) => cnStrings(args).map((s) => s.text);
check(same(cn("'truncate', bag === 'added' && 'motion-safe:animate-rise'"), ['truncate', 'motion-safe:animate-rise']), "cn: a compared string ('added') is a value");
check(same(cn("'rounded-xl', 'bg-' + name, picked.shade >= 6 ? 'text-white' : 'text-zinc-11'"), ['rounded-xl', 'text-white', 'text-zinc-11']), "cn: a joined string ('bg-' + name) is a value");
check(isValueString('mode !== ', '') && isValueString('', ' + x') && !isValueString('cn(', ', b'), 'isValueString: before a comparison or a +, not after a comma');

// the cursor
check(classListOpen("el.classList.add('bg-ro") === 'bg-ro', 'typing in add: a class');
check(classListOpen("el.classList.toggle('dark', mode === 'sys") === null, "typing in toggle's second argument: not a class");
check(classListOpen("el.classList.add('a', 'b', 'text-") === 'text-', 'a later string in add: a class');
check(classListOpen("el.classList.contains('a', 'b") === null, "contains' second argument: not a class");

console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
