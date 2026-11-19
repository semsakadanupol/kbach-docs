---
title: Typography
description: Font, ទំហំ, កម្រិតដិត និងរចនាប័ទ្មអក្សរ, កម្ពស់បន្ទាត់, គម្លាតអក្សរ, ពណ៌អក្សរ, បន្ទាត់លម្អ, ការចុះបន្ទាត់, ការកាត់អក្សរ និងបញ្ជី។
---

## Font family {#font-family}

Theme មានក្រុម font ស្រាប់បី៖ sans, serif និង mono។ Project អាចជំនួស ឬបន្ថែមក្រុម font ផ្ទាល់ខ្លួនក្នុង `kbach.config.js` (មើលនៅ [Spacing, screens និង fonts](/spacing-screens-fonts))។

::classes font-sans font-serif font-mono

```preview
<div class="space-y-2 text-lg text-gray-12 dark:text-white">
  <p class="font-sans">font-sans: One set of classes for every platform.</p>
  <p class="font-serif">font-serif: One set of classes for every platform.</p>
  <p class="font-mono">font-mono: One set of classes for every platform.</p>
</div>
```

## Font size {#font-size}

ទំហំអក្សរនីមួយៗមានកម្ពស់បន្ទាត់ដែលស៊ីគ្នាមកជាមួយ។ បើដាក់ class `leading-*` ក្បែរវា កម្ពស់បន្ទាត់នោះត្រូវជំនួស មិនថាដាក់លំដាប់ណាទេ។ បើចង់កំណត់ទាំងពីរក្នុង class តែមួយ សូមដាក់កម្ពស់បន្ទាត់ក្រោយសញ្ញា `/`៖ `text-sm/6` គឺអក្សរ 14px លើបន្ទាត់ 24px ហើយ `text-lg/tight` ប្រើកម្ពស់បន្ទាត់ tight។

::classes text-xs text-sm text-base text-lg text-xl text-2xl text-3xl text-4xl text-5xl text-6xl text-7xl text-8xl text-9xl text-[15px] text-sm/6 text-lg/tight text-base/[1.75]

```preview
<div class="space-y-1 text-gray-12 dark:text-white">
  <p class="text-sm">text-sm: The quick brown fox</p>
  <p class="text-base">text-base: The quick brown fox</p>
  <p class="text-xl">text-xl: The quick brown fox</p>
  <p class="text-3xl">text-3xl: The quick brown fox</p>
  <p class="text-5xl font-semibold tracking-tight">text-5xl</p>
</div>
```

## Font weight {#font-weight}

បើចង់បានកម្រិតដិតនៅចន្លោះកម្រិតដែលមានឈ្មោះ ដូចជា 550 របស់ variable font សូមសរសេរលេខក្នុងតង្កៀបការ៉េ៖ `font-[550]`។ បើសរសេរឈ្មោះក្នុងតង្កៀប វាក្លាយជាឈ្មោះ font វិញ៖ `font-[Inter]`។

::classes font-thin font-extralight font-light font-normal font-medium font-semibold font-bold font-extrabold font-black font-[550]

```preview
<div class="space-y-1 text-xl text-gray-12 dark:text-white">
  <p class="font-light">font-light: Write the class, get the style</p>
  <p class="font-normal">font-normal: Write the class, get the style</p>
  <p class="font-medium">font-medium: Write the class, get the style</p>
  <p class="font-semibold">font-semibold: Write the class, get the style</p>
  <p class="font-bold">font-bold: Write the class, get the style</p>
  <p class="font-black">font-black: Write the class, get the style</p>
</div>
```

## Font style, smoothing និង stretch {#font-style-smoothing-and-stretch}

::classes italic not-italic antialiased subpixel-antialiased font-stretch-normal font-stretch-condensed font-stretch-expanded font-stretch-50%

## Font variant numeric {#font-variant-numeric}

របៀបបង្ហាញលេខ សម្រាប់ font ដែលគាំទ្រ៖ `tabular-nums` ឱ្យលេខគ្រប់តួមានទទឹងស្មើគ្នា ដូច្នេះលេខក្នុងជួរឈរតម្រង់គ្នាល្អ។

::classes normal-nums ordinal slashed-zero lining-nums oldstyle-nums proportional-nums tabular-nums diagonal-fractions stacked-fractions

```preview
<div class="grid max-w-xs grid-cols-2 gap-6 text-gray-12 dark:text-white">
  <div class="text-right"><p class="mb-1 font-mono text-xs text-gray-7 dark:text-gray-4">proportional</p><p class="proportional-nums">1,111.11</p><p class="proportional-nums">9,999.99</p></div>
  <div class="text-right"><p class="mb-1 font-mono text-xs text-gray-7 dark:text-gray-4">tabular-nums</p><p class="tabular-nums">1,111.11</p><p class="tabular-nums">9,999.99</p></div>
</div>
```

## Letter spacing {#letter-spacing}

::classes tracking-tighter tracking-tight tracking-normal tracking-wide tracking-wider tracking-widest tracking-[.2em]

```preview
<div class="space-y-1 text-lg text-gray-12 dark:text-white">
  <p class="tracking-tight">tracking-tight: Kbach for every platform</p>
  <p class="tracking-normal">tracking-normal: Kbach for every platform</p>
  <p class="tracking-widest uppercase text-sm font-semibold">tracking-widest uppercase</p>
</div>
```

## Line height {#line-height}

កម្ពស់បន្ទាត់ដែលមានឈ្មោះ ប្តូរតាមទំហំអក្សរ។ ចំណែកលេខវិញ ប្រើមាត្រដ្ឋានគម្លាត (`leading-6` ស្មើ 24px)។

::classes leading-none leading-tight leading-snug leading-normal leading-relaxed leading-loose leading-4 leading-6 leading-8 leading-[1.1]

```preview
<div class="grid gap-6 text-sm text-gray-8 sm:grid-cols-2 dark:text-gray-3">
  <p class="leading-tight"><b class="font-mono text-gray-12 dark:text-white">leading-tight</b> Kbach writes the CSS for exactly the classes your files use, so the stylesheet stays as small as your design.</p>
  <p class="leading-loose"><b class="font-mono text-gray-12 dark:text-white">leading-loose</b> Kbach writes the CSS for exactly the classes your files use, so the stylesheet stays as small as your design.</p>
</div>
```

## Line clamp {#line-clamp}

កាត់អក្សរចោលបន្ទាប់ពីចំនួនបន្ទាត់ដែលកំណត់ ហើយដាក់សញ្ញា … នៅខាងចុង។

::classes line-clamp-1 line-clamp-2 line-clamp-3 line-clamp-none

```preview
<article class="max-w-sm rounded-xl bg-gray-1 p-4 dark:bg-gray-9">
  <h3 class="font-semibold text-gray-12 dark:text-white">Release notes</h3>
  <p class="mt-1 line-clamp-2 text-sm text-gray-8 dark:text-gray-3">Breakpoints from the theme, max-* variants, nth-* variants, named containers, suggestions for unknown classes, bracket values routed by type, and the Vite plugin reloads kbach.config.js without a restart.</p>
</article>
```

## Text color {#text-color}

ពណ៌ទាំងអស់ក្នុងតារាងពណ៌ មាន 12 កម្រិត៖ 1 ស្រាលបំផុត 12 ដិតបំផុត។ សញ្ញា `/` កំណត់ភាពថ្លា។ តារាងពណ៌ពេញលេញមាននៅ [ពណ៌](/colors)។

::classes text-black text-white text-gray-{1,3,6,9,12} text-sky-{1..12} text-sky-6/50 text-inherit text-current text-transparent

```preview
<div class="space-y-1 text-lg font-medium">
  <p class="text-sky-6">text-sky-6</p>
  <p class="text-violet-7">text-violet-7</p>
  <p class="text-gray-12 dark:text-white">text-gray-12, and dark:text-white</p>
  <p class="text-gray-12/50 dark:text-white/50">text-gray-12/50</p>
</div>
```

## Text align {#text-align}

::classes text-left text-center text-right text-justify text-start text-end

## Text decoration {#text-decoration}

បន្ទាត់លម្អអក្សរ៖ ប្រភេទបន្ទាត់ ពណ៌ រចនាប័ទ្ម កម្រាស់ និងចម្ងាយរវាងអក្សរ និងបន្ទាត់ពីក្រោម។

::classes underline overline line-through no-underline decoration-sky-6 decoration-solid decoration-double decoration-dotted decoration-dashed decoration-wavy decoration-0 decoration-1 decoration-2 decoration-4 decoration-from-font decoration-auto underline-offset-1 underline-offset-2 underline-offset-4 underline-offset-8 underline-offset-auto

```preview
<div class="space-y-2 text-lg text-gray-12 dark:text-white">
  <p><a href="#" class="underline decoration-sky-6 decoration-2 underline-offset-4">underline decoration-sky-6 decoration-2 underline-offset-4</a></p>
  <p class="underline decoration-pink-6 decoration-wavy">decoration-wavy</p>
  <p class="line-through decoration-gray-6">line-through</p>
</div>
```

## Text transform {#text-transform}

::classes uppercase lowercase capitalize normal-case

## Text overflow {#text-overflow}

`truncate` ទុកអក្សរនៅលើបន្ទាត់តែមួយ ហើយដាក់សញ្ញា … នៅចុងពេលអក្សរវែងពេក។ `text-ellipsis` និង `text-clip` កំណត់តែរបៀបបង្ហាញកន្លែងដែលកាត់ប៉ុណ្ណោះ។

::classes truncate text-ellipsis text-clip

```preview
<p class="max-w-56 truncate rounded-lg bg-gray-1 px-3 py-2 text-sm text-gray-12 dark:bg-gray-9 dark:text-white">kbach.config.js was saved and the theme reloaded</p>
```

## Text wrap {#text-wrap}

`text-balance` ធ្វើឱ្យបន្ទាត់ក្នុងចំណងជើងវែងប្រហាក់ប្រហែលគ្នា។ `text-pretty` ជៀសវាងកុំឱ្យមានពាក្យតែមួយនៅម្នាក់ឯងលើបន្ទាត់ចុងក្រោយនៃកថាខណ្ឌ។

::classes text-wrap text-nowrap text-balance text-pretty

```preview
<div class="grid gap-6 sm:grid-cols-2">
  <h3 class="text-xl font-semibold text-gray-12 dark:text-white"><span class="block font-mono text-xs font-normal text-gray-7 dark:text-gray-4">text-wrap</span>One set of classes for React, React Native and plain HTML</h3>
  <h3 class="text-xl font-semibold text-balance text-gray-12 dark:text-white"><span class="block font-mono text-xs font-normal text-gray-7 dark:text-gray-4">text-balance</span>One set of classes for React, React Native and plain HTML</h3>
</div>
```

## Text indent {#text-indent}

::classes indent-0 indent-4 indent-8 -indent-4 indent-[2em]

## Vertical align {#vertical-align}

តម្រឹមមាតិកា inline និងមាតិកាក្នុងក្រឡាតារាង តាមកម្ពស់។

::classes align-baseline align-top align-middle align-bottom align-text-top align-text-bottom align-sub align-super align-[4px]

## Whitespace {#whitespace}

កំណត់ថាដកឃ្លា និងការចុះបន្ទាត់ក្នុង HTML ត្រូវរក្សាទុកឬអត់។

::classes whitespace-normal whitespace-nowrap whitespace-pre whitespace-pre-line whitespace-pre-wrap whitespace-break-spaces

## Word break និង overflow wrap {#word-break-and-overflow-wrap}

កំណត់កន្លែងដែលពាក្យវែងអាចកាត់ចុះបន្ទាត់បាន។ `wrap-break-word` កាត់តែពេលដាក់មិនចុះប៉ុណ្ណោះ ចំណែក `break-all` កាត់ត្រង់ណាក៏បាន។

::classes break-normal break-all break-keep wrap-break-word wrap-anywhere wrap-normal

```preview
<div class="grid max-w-md gap-4 text-sm text-gray-12 sm:grid-cols-2 dark:text-white">
  <p class="w-40 rounded-lg bg-gray-1 p-3 dark:bg-gray-9"><b class="block font-mono text-xs font-normal text-gray-7 dark:text-gray-4">break-normal</b>Ahhhhhhhhhhhhhhhhhhhhhhh</p>
  <p class="w-40 rounded-lg bg-gray-1 p-3 wrap-break-word dark:bg-gray-9"><b class="block font-mono text-xs font-normal text-gray-7 dark:text-gray-4">wrap-break-word</b>Ahhhhhhhhhhhhhhhhhhhhhhh</p>
</div>
```

## Hyphens {#hyphens}

::classes hyphens-none hyphens-manual hyphens-auto

## Lists {#lists}

សញ្ញានៅមុខ item (`list-disc`, `list-decimal`) និងថាតើសញ្ញានោះនៅខាងក្នុង ឬខាងក្រៅអក្សរ។ Reset ដកសញ្ញាទាំងនេះចេញ ដូច្នេះត្រូវដាក់វាវិញ សម្រាប់បញ្ជីណាដែលត្រូវការ។

::classes list-disc list-decimal list-none list-inside list-outside list-image-none

```preview
<div class="grid gap-6 text-sm text-gray-8 sm:grid-cols-2 dark:text-gray-3">
  <ul class="list-disc space-y-1 pl-5 marker:text-sky-6">
    <li>Install the package</li>
    <li>Add the plugin</li>
    <li>Write classes</li>
  </ul>
  <ol class="list-decimal space-y-1 pl-5 marker:font-semibold marker:text-violet-6">
    <li>Install the package</li>
    <li>Add the plugin</li>
    <li>Write classes</li>
  </ol>
</div>
```

## Content (before និង after) {#content-before-and-after}

កំណត់ `content` របស់ pseudo-element `before:` និង `after:`។ សូមប្រើ `_` ជំនួសដកឃ្លា។

::classes content-none content-['→']

```preview
<a href="#" class="font-medium text-sky-7 after:ml-1 after:content-['→'] dark:text-sky-4">Read the docs</a>
```
