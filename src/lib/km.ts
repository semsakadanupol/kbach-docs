// The interface's words in Khmer, keyed by their English text. Page text is
// in content/km/*.md, not here. See KHMER.md for how to write Khmer here.

// prettier-ignore
export const KM: Record<string, string> = {
  // header, menus, footer
  'Docs': 'ឯកសារ',
  'Playground': 'Playground',
  'Home': 'ទំព័រដើម',
  'Search': 'ស្វែងរក',
  'Search the docs': 'ស្វែងរកក្នុងឯកសារ',
  'Search the docs…': 'ស្វែងរកក្នុងឯកសារ…',
  'Search pages and sections': 'ស្វែងរកទំព័រ និងផ្នែក',
  'Popular': 'ពេញនិយម',
  'No results for': 'រកមិនឃើញលទ្ធផលសម្រាប់',
  'Get started': 'ចាប់ផ្តើម',
  'Open navigation': 'បើកម៉ឺនុយ',
  'Close navigation': 'បិទម៉ឺនុយ',
  'Theme': 'រចនាប័ទ្ម',
  'Color theme': 'រចនាប័ទ្ម',
  'Light': 'ភ្លឺ',
  'System': 'តាមប្រព័ន្ធ',
  'Dark': 'ងងឹត',
  'Language': 'ភាសា',
  'Kbach home': 'ទំព័រដើម Kbach',
  'Kbach on GitHub': 'Kbach នៅលើ GitHub',
  'The latest release on npm': 'កំណែចុងក្រោយនៅលើ npm',
  'Skip to content': 'រំលងទៅមាតិកា',
  'Documentation': 'ឯកសារ',
  'Main': 'មេ',
  'Site': 'គេហទំព័រ',
  'Packages': 'កញ្ចប់',
  'VS Code extension': 'VS Code extension',
  'Community': 'សហគមន៍',
  'Report an issue': 'រាយការណ៍បញ្ហា',
  'Copyright': 'រក្សាសិទ្ធិ',
  'Released under the MIT License.': 'ចេញផ្សាយក្រោមអាជ្ញាប័ណ្ណ MIT។',
  'Last updated': 'កែប្រែចុងក្រោយ',
  'Edit this page on GitHub': 'កែទំព័រនេះលើ GitHub',
  'Popular pages': 'ទំព័រពេញនិយម',
  'Style React, React Native and plain HTML with short class names, from one Rust engine.':
    'រចនា React, React Native និង HTML ធម្មតា ដោយឈ្មោះ class ខ្លីៗ ពី Rust engine តែមួយ។',
  'Tailwind CSS is a trademark of Tailwind Labs Inc. Kbach is an independent project and is not affiliated with, sponsored by, or endorsed by Tailwind Labs.':
    'Tailwind CSS ជាពាណិជ្ជសញ្ញារបស់ Tailwind Labs Inc.។ Kbach ជាគម្រោងឯករាជ្យ មិនមានទំនាក់ទំនង មិនទទួលការឧបត្ថម្ភ និងមិនទទួលការគាំទ្រពី Tailwind Labs ឡើយ។',

  // the docs' sections (lib/docs.ts NAV)
  'Getting started': 'ការចាប់ផ្តើម',
  'Core concepts': 'គោលគំនិតសំខាន់ៗ',
  'Platforms': 'Platform',
  'Utilities': 'Utilities',
  'Customization': 'ការប្ដូរតាមបំណង',
  'API reference': 'ឯកសារយោង API',
  'Help': 'ជំនួយ',

  // reference tables (components/ClassTableFrame.tsx)
  'Styles': 'Style',
  'Web only': 'Web only',
  'Does nothing on React Native': 'គ្មានប្រសិទ្ធភាពលើ React Native',
  'None of these classes do anything on React Native.': 'Class ទាំងនេះគ្មានប្រសិទ្ធភាពលើ React Native ទេ។',
  'Show fewer': 'បង្ហាញតិចជាងនេះ',
  'Show all {n} classes': 'បង្ហាញ class ទាំង {n}',

  // the home page's links
  'API': 'API',
  'Start here: what Kbach is, and how to install it': 'ចាប់ផ្តើមនៅទីនេះ៖ Kbach ជាអ្វី និងរបៀបដំឡើងវា',
  'Every class, with its CSS and a live preview': 'Class ទាំងអស់ ជាមួយ CSS និងឧទាហរណ៍ផ្ទាល់',
  'Your colors, spacing and fonts in kbach.config.js': 'ពណ៌ spacing និង fonts របស់អ្នកក្នុង kbach.config.js',
  'React, React Native, the plugins, the CDN script, the CLI': 'React, React Native, plugins, CDN script និង CLI',
  'Try classes in your browser, nothing to install': 'សាកល្បង class ក្នុង browser របស់អ្នក ដោយមិនចាំបាច់ដំឡើងអ្វីទាំងអស់',

  // a page
  'On this page': 'នៅលើទំព័រនេះ',
  'Back to top': 'ត្រឡប់ទៅខាងលើ',
  'Previous': 'មុន',
  'Next': 'បន្ទាប់',
  'Previous and next page': 'ទំព័រមុន និងបន្ទាប់',
  'Page not found': 'រកមិនឃើញទំព័រ',
  "That page doesn't exist, or it moved.": 'ទំព័រនេះមិនមាន ឬបានប្តូរទីតាំងហើយ។',
  'Go to the home page': 'ទៅទំព័រដើម',
  "This page isn't in Khmer yet: here it is in English.": 'ទំព័រនេះមិនទាន់មានជាភាសាខ្មែរនៅឡើយទេ៖ នេះគឺជាកំណែភាសាអង់គ្លេស។',
  'Copy': 'ចម្លង',
  'Copied': 'បានចម្លង',
  'Copy code': 'ចម្លងកូដ',
  'Choose your setup': 'ជ្រើសរើសការរៀបចំរបស់អ្នក',
  'Step': 'ជំហាន',
  'Preview': 'Preview',
  'Code': 'កូដ',
  'Class': 'Class',
  'Properties': 'Properties',
  'Click a swatch to copy its class name. Hover for the hex value.': 'ចុចលើប្រអប់ពណ៌ ដើម្បីចម្លងឈ្មោះពណ៌។ ដាក់ mouse លើវា ដើម្បីមើលតម្លៃ hex។',
  'Copied {cls}': 'បានចម្លង {cls}',

  // the home page (components/Landing.tsx)
  'Open the playground': 'បើក playground',
  'Works with': 'ដំណើរការជាមួយ',
  'Open source': 'Open source',
  'Write a class once.': 'សរសេរ class តែម្តង។',
  'Style web, iOS, Android and HTML.': 'ប្រើបានលើ web, iOS, Android និង HTML។',
  'Kbach styles React, React Native and plain HTML pages with short class names. One Rust engine reads them, so a class means the same thing everywhere.':
    'Kbach រចនា React, React Native និងទំព័រ HTML ធម្មតា ដោយឈ្មោះ class ខ្លីៗ។ Rust engine តែមួយអាន class ទាំងនោះ ដូច្នេះ class នីមួយៗមានន័យដូចគ្នាគ្រប់ទីកន្លែង។',
  'Sets up Vite, Next.js, Expo or React Native: installs the package, adds the plugin, imports the CSS.':
    'រៀបចំ Vite, Next.js, Expo ឬ React Native ឱ្យរួចរាល់៖ ដំឡើង package បន្ថែម plugin ហើយ import CSS ឱ្យអ្នក។',
  'One class, three outputs': 'Class តែមួយ លទ្ធផលបី',
  'A CSS file': 'ឯកសារ CSS',
  'A style object': 'Style object',
  'A script tag': 'Tag script តែមួយ',
  'Written when you build, by the Vite or PostCSS plugin.': 'Plugin របស់ Vite ឬ PostCSS សរសេរឯកសារនេះ ពេលអ្នក build។',
  'Made as the element renders. On a screen 768 wide or more, padding is 40.':
    'Engine បង្កើតវា ពេល element render។ លើអេក្រង់ទទឹង 768 ឡើងទៅ padding ក្លាយជា 40។',
  'The script writes the same CSS into the page as it loads. No build step.':
    'ពេលទំព័របើក script សរសេរ CSS ដដែលនេះចូលក្នុងទំព័រ។ មិនបាច់ build ទេ។',
  'Read a class like a sentence': 'អាន class ដូចអានប្រយោគ',
  'Each word sets one thing. The part before a colon says when it applies; the number says how much.':
    'ពាក្យនីមួយៗកំណត់តែមួយចំណុច។ ផ្នែកនៅមុខសញ្ញា : ប្រាប់ថាប្រើនៅពេលណា ហើយលេខប្រាប់ថាប៉ុន្មាន។',
  '24px of padding on every side': 'Padding 24px ទាំងបួនខាង',
  'Corners rounded by 16px': 'ជ្រុងមូល 16px',
  'A blue background, shade 6 of 12': 'ផ្ទៃខាងក្រោយពណ៌ខៀវ កម្រិតពណ៌ទី 6 ក្នុងចំណោម 12',
  '40px of padding, from 768px wide': 'Padding 40px ចាប់ពីទទឹង 768px ឡើងទៅ',
  'A dark gray background in dark mode': 'ផ្ទៃខាងក្រោយពណ៌ប្រផេះចាស់ ពេលប្រើ dark mode',
  '90% opacity under the pointer': 'Opacity 90% ពេលដាក់ mouse ពីលើ',
  '26 colors, 12 shades each': 'ពណ៌ 26 មួយៗមាន 12 កម្រិត',
  'Shade 1 is the lightest and 12 the darkest: bg-blue-1 to bg-blue-12. The same names work on every platform.':
    'កម្រិតពណ៌ 1 ស្រាលជាងគេ ហើយ 12 ចាស់ជាងគេ៖ ពី bg-blue-1 ដល់ bg-blue-12។ ឈ្មោះដដែលប្រើបានគ្រប់ platform។',
  'See every color': 'មើលពណ៌ទាំងអស់',
  'A wrong class gets a name, not a blank space': 'Class ខុស Kbach ប្រាប់អ្នកភ្លាម',
  'An unknown class would leave an element unstyled, without a word. Kbach says which class, and the one you meant, wherever you work:':
    'Class ដែល engine មិនស្គាល់ ធ្វើឱ្យ element គ្មាន style ដោយគ្មានអ្វីប្រាប់សោះ។ Kbach ប្រាប់ថា class មួយណាខុស និង class ដែលអ្នកចង់សរសេរ នៅគ្រប់កន្លែងដែលអ្នកធ្វើការ៖',
  'The terminal, while npm run dev runs (Vite, Next.js, PostCSS).':
    'Terminal ពេល npm run dev កំពុងដំណើរការ (Vite, Next.js, PostCSS)។',
  'VS Code: completion, hover and a wavy line under the class.':
    'VS Code៖ completion, hover និងបន្ទាត់រលកនៅក្រោម class។',
  'The playground, with Fix all for the most common mistake.':
    'Playground ជាមួយប៊ូតុង Fix all សម្រាប់កំហុសដែលជួបញឹកញាប់ជាងគេ។',
  "AI assistants: npx @kbach/cli ai gives them Kbach's rules.":
    'AI assistant៖ npx @kbach/cli ai ប្រាប់ច្បាប់របស់ Kbach ទៅ AI។',
  'Common mistakes': 'កំហុសដែលជួបញឹកញាប់',
  'Terminal': 'Terminal',
  'Three ways in': 'ចាប់ផ្តើមបានបីវិធី',
  'Vite, Next.js or any PostCSS setup. A plugin writes a real CSS file when you build.':
    'Vite, Next.js ឬ project ណាដែលប្រើ PostCSS។ ពេលអ្នក build, plugin សរសេរឯកសារ CSS ពិតប្រាកដ។',
  'Android, iOS and Expo. A Babel plugin gives each element its style object as it renders.':
    'Android, iOS និង Expo។ Babel plugin ផ្តល់ style object ឱ្យ element នីមួយៗ ពេល element នោះ render។',
  'One script tag from a CDN. No install, no build step, no React.':
    'Tag script តែមួយពី CDN។ មិនបាច់ដំឡើង មិនបាច់ build និងមិនបាច់ React។',
  'Set up React': 'រៀបចំ React',
  'Set up React Native': 'រៀបចំ React Native',
  'Use the script': 'ប្រើ script',
  'Everything in the docs': 'អ្វីៗទាំងអស់ក្នុងឯកសារ',
  'Seven parts, from the first install to the API.': 'ប្រាំពីរផ្នែក ចាប់ពីការដំឡើងដំបូង រហូតដល់ API។',
  'Show {n} more': 'បង្ហាញ {n} ទំព័រទៀត',
  'Start with the introduction': 'ចាប់ផ្តើមពីសេចក្តីផ្តើម',
  'Or try it first:': 'ឬសាកមើលសិនក៏បាន៖',
  'the playground runs the real engine in your browser': 'playground រត់ engine ពិតប្រាកដក្នុង browser របស់អ្នក',

  // the home page's "Works with" map (components/WorksWith.tsx)
  'How Kbach works': 'របៀបដែល Kbach ដំណើរការ',
  'Point at a tool to see how Kbach plugs in.': 'ដាក់ mouse លើឈ្មោះណាមួយ ដើម្បីមើលថា Kbach ដំណើរការជាមួយយ៉ាងណា។',
  'One Rust engine reads every class, for every package.': 'Rust engine តែមួយអាន class ទាំងអស់ ឱ្យគ្រប់ package។',
  'For React on the web: Vite, Next.js or PostCSS.': 'សម្រាប់ React លើ web៖ Vite, Next.js ឬ PostCSS។',
  'For React Native and Expo, on Android and iOS.': 'សម្រាប់ React Native និង Expo លើ Android និង iOS។',
  'For a plain HTML page: one script tag, no build.': 'សម្រាប់ទំព័រ HTML ធម្មតា៖ tag script តែមួយ មិនបាច់ build។',
  'Any React app on the web, through the Vite or PostCSS plugin.':
    'App React ណាក៏បានលើ web តាមរយៈ plugin របស់ Vite ឬ PostCSS។',
  'The PostCSS plugin fills globals.css. npx @kbach/cli init sets it up.':
    'Plugin របស់ PostCSS បំពេញ globals.css។ npx @kbach/cli init រៀបចំឱ្យរួចរាល់។',
  'The Vite plugin writes kbach.css when you build.': 'Plugin របស់ Vite សរសេរ kbach.css ពេលអ្នក build។',
  'Any PostCSS setup: the plugin fills the CSS file that has the Kbach markers.':
    'Project ណាដែលប្រើ PostCSS៖ plugin បំពេញឯកសារ CSS ដែលមានសញ្ញាសម្គាល់របស់ Kbach។',
  'A Babel plugin gives each element its style object as it renders.':
    'Babel plugin ផ្តល់ style object ឱ្យ element នីមួយៗ ពេល element នោះ render។',
  'The same as React Native, Expo Go included.': 'ដូច React Native ដែរ រួមទាំង Expo Go ផង។',
  'One script tag from a CDN writes the CSS in the browser.': 'Tag script តែមួយពី CDN សរសេរ CSS ក្នុង browser។',

  // the VS Code extension box (::extension)
  'Completion, hover and diagnostics for Kbach classes in VS Code.': 'Completion, hover និង diagnostics សម្រាប់ class របស់ Kbach ក្នុង VS Code។',
  'Install in VS Code': 'ដំឡើងក្នុង VS Code',

  // callouts (> [!NOTE] in Markdown)
  'Note': 'ចំណាំ',
  'Tip': 'គន្លឹះ',
  'Important': 'សំខាន់',
  'Warning': 'ការព្រមាន',

  // the cards (::cards in Markdown)
  'React (web)': 'React (web)',
  'React Native': 'React Native',
  'Plain HTML': 'HTML ធម្មតា',
  'Colors': 'ពណ៌',
  'CLI': 'CLI',
  'A Vite or PostCSS plugin writes a real CSS file when you build.': 'Vite ឬ PostCSS plugin សរសេរឯកសារ CSS ពិតប្រាកដមួយ នៅពេលអ្នក build។',
  'The same class names become React Native styles, on Android, iOS and Expo.': 'ឈ្មោះ class ដដែលក្លាយជា style របស់ React Native លើ Android, iOS និង Expo។',
  'One script tag from a CDN. No build step and no React.': 'tag script តែមួយពី CDN។ គ្មានការ build និងគ្មាន React។',
  '26 color families with 12 shades each, plus your own theme colors.': 'ពណ៌ 26 ក្រុម ដែលក្រុមនីមួយៗមាន 12 កម្រិត បូកនឹងពណ៌ theme ផ្ទាល់ខ្លួនរបស់អ្នក។',
  'HTML with Kbach classes and a JS or TS script, running live at any device size.': 'HTML ជាមួយ class របស់ Kbach និង script ជា JS ឬ TS ដែលដំណើរការផ្ទាល់ នៅគ្រប់ទំហំឧបករណ៍។',
  'npx @kbach/cli init sets a project up. doctor checks it.': 'npx @kbach/cli init រៀបចំ project មួយ។ doctor ពិនិត្យវា។',

  // Additional Programming & UI Interface Terms
  'Dashboard': 'ផ្ទាំងគ្រប់គ្រង',
  'Settings': 'ការកំណត់',
  'Profile': 'ប្រវត្តិរូប',
  'Account': 'គណនី',
  'Sign in': 'ចូលគណនី',
  'Log in': 'ចូលគណនី',
  'Sign out': 'ចេញពីគណនី',
  'Log out': 'ចេញពីគណនី',
  'Sign up': 'ចុះឈ្មោះ',
  'Register': 'ចុះឈ្មោះ',
  'Password': 'ពាក្យសម្ងាត់',
  'Username': 'ឈ្មោះអ្នកប្រើប្រាស់',
  'Submit': 'ដាក់ស្នើ',
  'Cancel': 'បោះបង់',
  'Save': 'រក្សាទុក',
  'Delete': 'លុប',
  'Edit': 'កែសម្រួល',
  'Update': 'ធ្វើបច្ចុប្បន្នភាព',
  'Loading...': 'កំពុងដំណើរការ...',
  'Error': 'កំហុស',
  'Success': 'ជោគជ័យ',
  'Info': 'ព័ត៌មាន',
  'Filter': 'តម្រង',
  'Sort': 'តម្រៀប',
  'Clear': 'សម្អាត',
  'Reset': 'កំណត់ឡើងវិញ',
  'Download': 'ទាញយក',
  'Upload': 'ផ្ទុកឡើង',
  'Share': 'ចែករំលែក',
  'Details': 'លម្អិត',
  'View all': 'មើលទាំងអស់',
};
