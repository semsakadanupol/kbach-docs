# Translating the docs into Khmer

The Khmer site is `/km/…`. A page's Khmer text is `content/km/<slug>.md`, the
same file name as the English one in `content/`. Every page is translated. A
page that has no Khmer file (a new English page, say) shows the English page,
with a note in Khmer that says so. The interface's words (header, sidebar,
buttons) are in `src/lib/km.ts` (`KM`). The playground's own buttons are still
English, so the Khmer playground page names them in English too.

**When you change an English page, change its Khmer page too.**
`node tests/e2e/khmer-content.mjs` (no browser, a second) compares every
Khmer page with its English one and fails on anything that drifted: a section
id missing (a new `##` heading not translated yet), a code block or preview
that differs by one character, a different set of links, tabs or blocks.

## Type

Khmer is set in two fonts, hosted in `public/fonts` (their Khmer letters
only), and styled in `src/styles/khmer.css`: Kantumruy Pro for text (beside Geist,
a sans), Noto Serif Khmer for headings (beside Fraunces, a serif):

- `size-adjust: 103%`: the two scripts share a line, so they're matched by
  eye: a Khmer consonant's body (ក ម ន) about 1.2× an English lowercase letter
  and under an English capital. (At 115% it was as tall as a capital, and the
  English beside it looked small.)
- Headings: Noto Serif Khmer at `size-adjust: 77%`. Fraunces's lowercase is
  small (0.44em, Geist's is 0.54em), so the Khmer is matched to it the same way:
  its body about 1.2× Fraunces's lowercase. (Kantumruy in the headings stood
  1.43× the Latin beside it, a sans beside a serif.)
- Page text is 17px instead of 16px, Khmer and English alike: Khmer reads
  small at 16px. Headings, the sidebar and labels keep their sizes.
- Line height: Khmer stacks vowels and subscript consonants above and below
  the line. Its ink reaches 0.94em above the baseline and 0.28em below
  (ស្ត្រី, ឡើង), 1.22em in all, where a Latin line needs 0.95em. So it gets
  more room than English, and the bigger the type, the less extra it needs:
  1.85× for running text, 1.7× for lead paragraphs (18px and up: a page's
  description, the hero's text), 1.4× for section headings, 1.5× for smaller
  ones, and 1.25× for headings in the display font (the hero, page titles):
  Noto Serif Khmer's marks reach 1.05em at its 77%.
- No letter-spacing: it pulls a Khmer cluster's parts apart.

All three apply to `lang="km"` only, so an English page shown on the Khmer
site (one not translated yet, marked `lang="en"`) keeps the English settings.

## Rules

- **Code never changes**: class names, code blocks, previews, file names,
  package names, commands, config keys, and `inline code`.
- **Every heading keeps its English id**, written after it:
  `## Kbach ជាអ្វី {#what-kbach-is}`. Links like `/installation#add-the-plugin`
  then work in both languages. (The id is the English heading, lower case,
  words joined with `-`.)
- **Links stay as they are** (`/colors`, `/installation?tab=html`): on a Khmer
  page they go to the Khmer page by themselves.
- **Technical words stay in English** where Khmer has no settled word for them:
  developers read and say them in English, and a coined Khmer word would only
  make them look it up. Everyday words are Khmer.
- Sentences end with `។`. Lists of names keep their commas.

## Write Khmer, not translated English

The user's rule (2026-11-17): **don't translate word by word.** Khmer is
built differently from English, and a sentence that follows the English
one word for word reads wrong, and is sometimes plainly wrong. Read the
English paragraph, understand what it means, then write that meaning the
way a Khmer developer would explain it to another. The section ids, code
and links must match the English page (`tests/e2e/khmer-content.mjs`);
the sentences don't have to.

Habits that give away a translation, and what to write instead:

- **The passive (ត្រូវបាន).** English uses it a lot; Khmer much less.
  Say who does it: not "CSS ត្រូវបានសរសេរទៅក្នុងឯកសារ" but
  "plugin សរសេរ CSS ចូលក្នុងឯកសារ".
- **មួយ for every "a" or "an".** Khmer only counts when the number
  matters. Not "class មួយធ្វើការងារមួយ" but "class នីមួយៗមានតួនាទីតែមួយ";
  not "ជាមួយ variant មួយ" but "ជាមួយ variant".
- **របស់វា, ពួកវា, វា for every "its", "they", "it".** Leave the
  pronoun out when it's clear who is meant, or name the thing again.
- **English idioms taken literally:** a class "wins" (ឈ្នះ) →
  "យកមកប្រើ" / "មានអាទិភាពជាង"; the engine "returns" (ផ្តល់មកវិញ) →
  "engine បង្កើត…" / "បានលទ្ធផល…"; "does one job" (ធ្វើការងារមួយ) →
  "មានតួនាទីតែមួយ"; "works out of the box" → "ប្រើបានភ្លាម".
- **Long chains of ដែល.** Break a long English sentence into two or three
  short Khmer ones.
- **English order.** Put the topic first, then what's said about it,
  and the condition before the result: "បើ… នោះ…", "លើទូរស័ព្ទ class
  ទាំងនេះមិនដំណើរការទេ".

Tone: clear and polite, the way a good Khmer teacher explains to a
student: "អ្នក" for the reader, "សូម" before an instruction, never stiff
government Khmer and never chatty slang.

## Glossary

Kept in English (written as is, in Latin letters, inside Khmer sentences):

class, utility, utility class, variant, plugin, component, element, hook,
props, prop, config, build, runtime, engine, breakpoint, dark mode, light mode,
theme, palette, preview, playground, CDN, script, string, style object,
selector, media query, container query, viewport, layout, spacing, padding,
margin, border, shadow, opacity, gradient, animation, transition, transform,
filter, flexbox, grid, font, token, API, CLI, package, project, editor,
browser, extension, completion, hover, diagnostics, dependency, bundle,
web, native, React, React Native, Expo, Vite, Next.js, PostCSS, Tailwind CSS,
VS Code, npm, pnpm, yarn, bun

Khmer:

| English | Khmer |
| :-- | :-- |
| install | ដំឡើង |
| installation | ការដំឡើង |
| set up / setup | រៀបចំ / ការរៀបចំ |
| introduction | សេចក្តីផ្តើម |
| color | ពណ៌ |
| shade (of a color) | កម្រិតពណ៌ |
| page | ទំព័រ |
| file | ឯកសារ |
| docs, documentation | ឯកសារ |
| example | ឧទាហរណ៍ |
| step | ជំហាន |
| option | ជម្រើស |
| settings | ការកំណត់ |
| customization | ការប្ដូរតាមបំណង |
| reference | ឯកសារយោង |
| search | ស្វែងរក |
| copy | ចម្លង |
| run | ដំណើរការ |
| write | សរសេរ |
| read | អាន |
| plain HTML | HTML ធម្មតា |
| source (code) | កូដប្រភព |
| problem / fix | បញ្ហា / ដំណោះស្រាយ |
| text | អក្សរ |
| size | ទំហំ |
| width / height | ទទឹង / កម្ពស់ |
| screen | អេក្រង់ |
| light / dark (the modes) | ភ្លឺ / ងងឹត |
| default | លំនាំដើម |
| scale (the spacing scale) | មាត្រដ្ឋាន |
| fraction / percentage | ប្រភាគ / ភាគរយ |
| square brackets | តង្កៀបការ៉េ |
| children | children (kept: it's the React word) |
| row / column | ជួរដេក / ជួរឈរ |
| background | ផ្ទៃខាងក្រោយ |
| warning / error | ការព្រមាន / កំហុស |
| upgrade | upgrade (kept) |
| troubleshooting | ការដោះស្រាយបញ្ហា |
| type (in a table) | ប្រភេទ |
| optional | មិនបង្ខំ |
| help (the section) | ជំនួយ |
| quick start | ចាប់ផ្តើមរហ័ស |
| how it works | របៀបដែលវាដំណើរការ |
| FAQ | សំណួរញឹកញាប់ |
| phone | ទូរស័ព្ទ |
| shadow | ស្រមោល (the effect); `shadow` stays for the class |
| see-through | ថ្លា |
| square brackets / parentheses | តង្កៀបការ៉េ / វង់ក្រចក |
| platform, Web only (the table mark) | kept in English |

Utility pages keep their CSS property headings in English (`## Flex direction`,
`## Object fit និង position`): they name the classes on the page.
