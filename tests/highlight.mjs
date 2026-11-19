// The docs' code highlighter on its tricky cases (run: npm run test). Node loads the .ts file itself.
const { highlight } = await import('../src/markdown/highlight.ts');
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const tokens = (code, lang) => highlight(code, lang).flat();
const typeOf = (code, lang, text) => tokens(code, lang).filter((t) => t.text.includes(text)).map((t) => t.type + ':' + JSON.stringify(t.text));

const rn = [
  "import { Text, View, Pressable } from 'react-native';",
  '',
  'export default function App() {',
  '  return (',
  '    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-12">',
  '      <Text className="text-2xl font-bold text-gray-12 dark:text-white">Hello from Kbach</Text>',
  '      <Pressable className="mt-6 rounded-xl bg-blue-6 px-5 py-3 active:bg-blue-7">',
  '        <Text className="font-semibold text-white">Press me</Text>',
  '      </Pressable>',
  '    </View>',
  '  );',
  '}',
].join('\n');
const all = tokens(rn, 'tsx');
const fromTokens = all.filter((t) => /\bfrom\b/.test(t.text));
check(fromTokens[0].type === 'keyword' && fromTokens[1].type === 'plain' && fromTokens[1].text.includes('Hello from Kbach'), 'the import "from" is a keyword; "Hello from Kbach" is plain text ' + JSON.stringify(fromTokens));
check(all.some((t) => t.type === 'plain' && t.text === 'Press me'), 'Press me is plain text');
check(all.filter((t) => t.type === 'tag').map((t) => t.text).join(' ') === '<View > <Text > </Text > <Pressable > <Text > </Text > </Pressable > </View >', 'every tag part is a tag: ' + all.filter((t) => t.type === 'tag').map((t) => t.text).join(' '));
check(all.filter((t) => t.type === 'attr').length === 4 && all.filter((t) => t.type === 'string').length === 5, 'four className attributes, their four strings and the import path');
check(typeOf(rn, 'tsx', 'App').join() === 'fn:"App"', 'App() is a function name');

// an arrow's > is punctuation, not a tag
const arrow = 'const f = (e) => setMode(e.target.value);';
check(!tokens(arrow, 'ts').some((t) => t.type === 'tag'), 'an arrow (=>) has no tag in it');
// a TypeScript type argument is not a tag, and the code after it is still code
const generic = 'const ref = useRef<HTMLDivElement>(null);\nconst x = useState<string>("a");';
const g = tokens(generic, 'tsx');
check(!g.some((t) => t.type === 'tag') && g.some((t) => t.type === 'keyword' && t.text === 'const' ) && g.filter((t) => t.type === 'keyword' && t.text === 'const').length === 2 && g.some((t) => t.type === 'string'), 'useRef<HTMLDivElement> is not a tag, and the next line is still code');
// a comparison
check(!tokens('if (a.length<b) return;', 'ts').some((t) => t.type === 'tag'), 'a<b is a comparison');
// an expression inside an attribute, with an arrow and braces
const attr = '<button onClick={() => { setOpen(!open) }}>Open {count} items</button>';
const at = tokens(attr, 'jsx');
check(at.filter((t) => t.type === 'tag').map((t) => t.text).join(' ') === '<button > </button >', 'a braced arrow inside an attribute does not end the tag: ' + at.filter((t) => t.type === 'tag').map((t) => t.text).join(' '));
check(at.some((t) => t.type === 'fn' && t.text === 'setOpen') && at.some((t) => t.type === 'plain' && t.text.includes('Open ')) && at.some((t) => t.type === 'plain' && t.text.includes(' items')), 'code inside {} is code, the text around it is text');
// a fragment, nested elements, a self-closing tag, then code again
const frag = 'return (\n  <>\n    <Logo />\n    <p>Import it from npm</p>\n  </>\n);\nconst done = true;';
const fr = tokens(frag, 'tsx');
check(fr.some((t) => t.type === 'plain' && t.text.includes('Import it from npm')) && fr.some((t) => t.type === 'keyword' && t.text === 'true'), 'a fragment with text, then code after it: ' + fr.filter((t) => t.type !== 'plain').map((t) => t.type + ':' + t.text).join(' '));
// HTML: an apostrophe in text is text; attributes and strings inside tags are still colored
const html = '<p class="p-4">Don\'t worry, it\'s fine</p>\n<a href="/x">Go</a>';
const h = tokens(html, 'html');
check(h.some((t) => t.type === 'plain' && t.text.includes("Don't worry, it's fine")) && h.filter((t) => t.type === 'string').length === 2 && h.filter((t) => t.type === 'attr').length === 2, 'HTML: apostrophes in text stay text; the two attributes and their strings are colored');
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
