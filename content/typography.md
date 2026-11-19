---
title: Typography
description: Font family, size, weight and style, line height, letter spacing, text color, decoration, wrapping, truncation and lists.
---

## Font family

Three stacks come with the theme: sans, serif and mono. A project can replace them or add its own in `kbach.config.js` (see [Spacing, screens, fonts](/spacing-screens-fonts)).

::classes font-sans font-serif font-mono

```preview
<div class="space-y-2 text-lg text-gray-12 dark:text-white">
  <p class="font-sans">font-sans: One set of classes for every platform.</p>
  <p class="font-serif">font-serif: One set of classes for every platform.</p>
  <p class="font-mono">font-mono: One set of classes for every platform.</p>
</div>
```

## Font size

Each size sets a line height to go with it. A `leading-*` class next to it overrides that line height, whatever their order. To set both in one class, put the line height after a slash: `text-sm/6` is 14px text on a 24px line, and `text-lg/tight` uses the tight multiplier.

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

## Font weight

For a weight between the named ones, such as a variable font's 550, write the number in brackets: `font-[550]`. A name in brackets is a family instead: `font-[Inter]`.

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

## Font style, smoothing and stretch

::classes italic not-italic antialiased subpixel-antialiased font-stretch-normal font-stretch-condensed font-stretch-expanded font-stretch-50%

## Font variant numeric

Number styles for fonts that have them: `tabular-nums` gives every digit the same width, so columns of numbers line up.

::classes normal-nums ordinal slashed-zero lining-nums oldstyle-nums proportional-nums tabular-nums diagonal-fractions stacked-fractions

```preview
<div class="grid max-w-xs grid-cols-2 gap-6 text-gray-12 dark:text-white">
  <div class="text-right"><p class="mb-1 font-mono text-xs text-gray-7 dark:text-gray-4">proportional</p><p class="proportional-nums">1,111.11</p><p class="proportional-nums">9,999.99</p></div>
  <div class="text-right"><p class="mb-1 font-mono text-xs text-gray-7 dark:text-gray-4">tabular-nums</p><p class="tabular-nums">1,111.11</p><p class="tabular-nums">9,999.99</p></div>
</div>
```

## Letter spacing

::classes tracking-tighter tracking-tight tracking-normal tracking-wide tracking-wider tracking-widest tracking-[.2em]

```preview
<div class="space-y-1 text-lg text-gray-12 dark:text-white">
  <p class="tracking-tight">tracking-tight: Kbach for every platform</p>
  <p class="tracking-normal">tracking-normal: Kbach for every platform</p>
  <p class="tracking-widest uppercase text-sm font-semibold">tracking-widest uppercase</p>
</div>
```

## Line height

Named heights scale with the font size; numbers are on the spacing scale (`leading-6` is 24px).

::classes leading-none leading-tight leading-snug leading-normal leading-relaxed leading-loose leading-4 leading-6 leading-8 leading-[1.1]

```preview
<div class="grid gap-6 text-sm text-gray-8 sm:grid-cols-2 dark:text-gray-3">
  <p class="leading-tight"><b class="font-mono text-gray-12 dark:text-white">leading-tight</b> Kbach writes the CSS for exactly the classes your files use, so the stylesheet stays as small as your design.</p>
  <p class="leading-loose"><b class="font-mono text-gray-12 dark:text-white">leading-loose</b> Kbach writes the CSS for exactly the classes your files use, so the stylesheet stays as small as your design.</p>
</div>
```

## Line clamp

Cuts text off after a number of lines, with an ellipsis.

::classes line-clamp-1 line-clamp-2 line-clamp-3 line-clamp-none

```preview
<article class="max-w-sm rounded-xl bg-gray-1 p-4 dark:bg-gray-9">
  <h3 class="font-semibold text-gray-12 dark:text-white">Release notes</h3>
  <p class="mt-1 line-clamp-2 text-sm text-gray-8 dark:text-gray-3">Breakpoints from the theme, max-* variants, nth-* variants, named containers, suggestions for unknown classes, bracket values routed by type, and the Vite plugin reloads kbach.config.js without a restart.</p>
</article>
```

## Text color

Every color in the palette, in 12 shades: 1 the lightest, 12 the darkest. A slash sets the opacity. See [Colors](/colors) for the whole palette.

::classes text-black text-white text-gray-{1,3,6,9,12} text-sky-{1..12} text-sky-6/50 text-inherit text-current text-transparent

```preview
<div class="space-y-1 text-lg font-medium">
  <p class="text-sky-6">text-sky-6</p>
  <p class="text-violet-7">text-violet-7</p>
  <p class="text-gray-12 dark:text-white">text-gray-12, and dark:text-white</p>
  <p class="text-gray-12/50 dark:text-white/50">text-gray-12/50</p>
</div>
```

## Text align

::classes text-left text-center text-right text-justify text-start text-end

## Text decoration

The line itself, its color, style, thickness, and how far below the text an underline sits.

::classes underline overline line-through no-underline decoration-sky-6 decoration-solid decoration-double decoration-dotted decoration-dashed decoration-wavy decoration-0 decoration-1 decoration-2 decoration-4 decoration-from-font decoration-auto underline-offset-1 underline-offset-2 underline-offset-4 underline-offset-8 underline-offset-auto

```preview
<div class="space-y-2 text-lg text-gray-12 dark:text-white">
  <p><a href="#" class="underline decoration-sky-6 decoration-2 underline-offset-4">underline decoration-sky-6 decoration-2 underline-offset-4</a></p>
  <p class="underline decoration-pink-6 decoration-wavy">decoration-wavy</p>
  <p class="line-through decoration-gray-6">line-through</p>
</div>
```

## Text transform

::classes uppercase lowercase capitalize normal-case

## Text overflow

`truncate` keeps text on one line and ends it with an ellipsis. `text-ellipsis` and `text-clip` only set how the cut looks.

::classes truncate text-ellipsis text-clip

```preview
<p class="max-w-56 truncate rounded-lg bg-gray-1 px-3 py-2 text-sm text-gray-12 dark:bg-gray-9 dark:text-white">kbach.config.js was saved and the theme reloaded</p>
```

## Text wrap

`text-balance` evens out line lengths in headings; `text-pretty` avoids a lone word on the last line of a paragraph.

::classes text-wrap text-nowrap text-balance text-pretty

```preview
<div class="grid gap-6 sm:grid-cols-2">
  <h3 class="text-xl font-semibold text-gray-12 dark:text-white"><span class="block font-mono text-xs font-normal text-gray-7 dark:text-gray-4">text-wrap</span>One set of classes for React, React Native and plain HTML</h3>
  <h3 class="text-xl font-semibold text-balance text-gray-12 dark:text-white"><span class="block font-mono text-xs font-normal text-gray-7 dark:text-gray-4">text-balance</span>One set of classes for React, React Native and plain HTML</h3>
</div>
```

## Text indent

::classes indent-0 indent-4 indent-8 -indent-4 indent-[2em]

## Vertical align

Lines up inline and table-cell content.

::classes align-baseline align-top align-middle align-bottom align-text-top align-text-bottom align-sub align-super align-[4px]

## Whitespace

How spaces and line breaks in the HTML are kept.

::classes whitespace-normal whitespace-nowrap whitespace-pre whitespace-pre-line whitespace-pre-wrap whitespace-break-spaces

## Word break and overflow wrap

Where a long word may break. `wrap-break-word` breaks it only when it wouldn't fit; `break-all` breaks anywhere.

::classes break-normal break-all break-keep wrap-break-word wrap-anywhere wrap-normal

```preview
<div class="grid max-w-md gap-4 text-sm text-gray-12 sm:grid-cols-2 dark:text-white">
  <p class="w-40 rounded-lg bg-gray-1 p-3 dark:bg-gray-9"><b class="block font-mono text-xs font-normal text-gray-7 dark:text-gray-4">break-normal</b>Ahhhhhhhhhhhhhhhhhhhhhhh</p>
  <p class="w-40 rounded-lg bg-gray-1 p-3 wrap-break-word dark:bg-gray-9"><b class="block font-mono text-xs font-normal text-gray-7 dark:text-gray-4">wrap-break-word</b>Ahhhhhhhhhhhhhhhhhhhhhhh</p>
</div>
```

## Hyphens

::classes hyphens-none hyphens-manual hyphens-auto

## Lists

The marker (`list-disc`, `list-decimal`), and whether it sits inside or outside the text. The reset removes list markers, so add one back where a list should show it.

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

## Content (before and after)

Sets the `content` of `before:` and `after:` pseudo-elements. Use an underscore for a space.

::classes content-none content-['→']

```preview
<a href="#" class="font-medium text-sky-7 after:ml-1 after:content-['→'] dark:text-sky-4">Read the docs</a>
```
