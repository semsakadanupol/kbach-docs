/**
 * Brace expansion for class lists in Markdown, so a page can list a scale in
 * one line: "p-{0,px,1..4}" → p-0 p-px p-1 p-2 p-3 p-4. A range counts in
 * whole numbers; several braces in one word multiply out.
 */
export function expandClasses(spec: string): string[] {
  const out: string[] = [];
  for (const word of spec.trim().split(/\s+/)) if (word) out.push(...expandWord(word));
  return [...new Set(out)];
}

function expandWord(word: string): string[] {
  const open = word.indexOf('{');
  if (open < 0) return [word];
  const close = word.indexOf('}', open);
  if (close < 0) return [word];
  const head = word.slice(0, open);
  const tail = word.slice(close + 1);
  const options = word
    .slice(open + 1, close)
    .split(',')
    .flatMap((part) => {
      const range = /^(-?\d+)\.\.(-?\d+)$/.exec(part);
      if (!range) return [part];
      const [a, b] = [Number(range[1]), Number(range[2])];
      const step = a <= b ? 1 : -1;
      const nums: string[] = [];
      for (let n = a; step > 0 ? n <= b : n >= b; n += step) nums.push(String(n));
      return nums;
    });
  return options.flatMap((o) => expandWord(head + o + tail));
}
