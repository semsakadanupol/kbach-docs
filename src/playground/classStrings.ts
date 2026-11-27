// Which strings in a classList call are class names (the editor's checks, completion and hover,
// in KbachEditor.tsx). Only the arguments that ARE strings count, and only where the method
// takes classes:
//
//   el.classList.add('a', 'b')                    a, b
//   el.classList.toggle('dark', mode === 'dark')  dark (the second argument is true or false)
//   el.classList.toggle(on ? 'a' : 'b')           nothing (an expression, not a class)
//
// Before 2026-11-26 every quoted string between the parentheses counted, so `mode === 'system'`
// in a toggle's second argument was flagged as an unknown class (tests/class-strings.mjs).

/**
 * Whether a string literal, given the code just before and just after it, is a value and not
 * a class list: compared (`bag === 'added'`) or joined into a longer string (`'bg-' + name`).
 * In cn() / clsx() arguments every other string is classes.
 */
export function isValueString(before: string, after: string): boolean {
  return /(?:[!=]==?|\+)\s*$/.test(before) || /^\s*(?:[!=]==?|\+)/.test(after);
}

/** The class strings among cn() / clsx() arguments: every string literal but values (isValueString). */
export function cnStrings(args: string): ClassString[] {
  const out: ClassString[] = [];
  for (const m of args.matchAll(/(["'`])((?:(?!\1)[^\\]|\\.)*)\1/g)) {
    if (isValueString(args.slice(0, m.index), args.slice(m.index! + m[0].length))) continue;
    out.push({ text: m[2], at: m.index! + 1 });
  }
  return out;
}

/** A string literal argument: its text and where the text starts in `args`. */
export interface ClassString {
  text: string;
  at: number;
}

/** How many leading arguments are classes, per method (toggle: just its first). */
const CLASS_ARGS: Record<string, number> = { add: Infinity, remove: Infinity, replace: 2, contains: 1, toggle: 1 };

/**
 * The class strings in a classList call's argument text (what's between its parentheses).
 * Reads the leading arguments while each one is a whole string literal; stops at the first
 * argument that isn't.
 */
export function classListStrings(method: string, args: string): ClassString[] {
  const max = CLASS_ARGS[method] ?? 0;
  const out: ClassString[] = [];
  const re = /\s*(["'`])((?:(?!\1)[^\\]|\\.)*)\1\s*(,|$)/y;
  let m: RegExpExecArray | null;
  while (out.length < max && (m = re.exec(args))) {
    out.push({ text: m[2], at: m.index + m[0].indexOf(m[1]) + 1 });
    if (m[3] !== ',') break;
  }
  return out;
}

/**
 * The cursor's class text inside a classList call, when the text before it ends inside one of the
 * call's class arguments; null otherwise. `before` is the document up to the cursor.
 */
export function classListOpen(before: string): string | null {
  const m = /classList\.(add|remove|toggle|replace|contains)\(([^()]*)$/.exec(before);
  if (!m) return null;
  // the arguments so far: whole strings and commas, then the open one
  const open = /^((?:\s*(["'`])(?:(?!\2)[^\\]|\\.)*\2\s*,)*)\s*(["'`])((?:(?!\3)[^\\]|\\.)*)$/.exec(m[2]);
  if (!open) return null;
  const done = (open[1].match(/,/g) ?? []).length;
  return done < (CLASS_ARGS[m[1]] ?? 0) ? open[4] : null;
}
