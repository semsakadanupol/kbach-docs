---
title: Utility classes
description: How Kbach class names are built, so you can read any of them, guess the one you need, and use values the built-in scales don't have.
---

## One class, one job {#the-idea}

Each Kbach class does one small thing. `p-6` adds padding, `rounded-xl` rounds the corners, `shadow-lg` adds a shadow. These are called **utility classes**. You style an element by putting the ones you need on it:

```preview
<div class="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5 max-w-md dark:bg-gray-10 dark:ring-white/10">
  <div class="grid size-12 shrink-0 place-items-center rounded-xl bg-linear-to-br from-amber-4 to-orange-6 text-xl font-bold text-white">K</div>
  <div class="min-w-0">
    <p class="font-semibold text-gray-12 dark:text-white">New message</p>
    <p class="truncate text-sm text-gray-7 dark:text-gray-4">Your build finished in 1.2 seconds, with no warnings.</p>
  </div>
  <span class="ml-auto rounded-full bg-emerald-2 px-2.5 py-1 text-xs font-medium text-emerald-9 dark:bg-emerald-10 dark:text-emerald-2">Done</span>
</div>
```

None of these are custom classes. Change one, and only that one thing changes. This keeps styles easy to change, because a class can't affect anything other than the element it's on, and there's no stylesheet that grows forever.

## How a class name is built {#how-a-class-name-is-built}

Most classes are a **utility** and a **value**, joined by a dash:

| Class | Utility | Value | Means |
| :-- | :-- | :-- | :-- |
| `p-4` | `p` (padding) | `4` | 16px of padding on every side |
| `px-4` | `px` (padding, left and right) | `4` | 16px on the left and right |
| `mt-2` | `mt` (margin, top) | `2` | 8px of margin above |
| `text-lg` | `text` (text size) | `lg` | Large text |
| `bg-blue-6` | `bg` (background) | `blue-6` | Blue, shade 6 |
| `rounded-xl` | `rounded` (corners) | `xl` | Extra-large rounding |

Some classes are a single word: `flex`, `hidden`, `italic`, `underline`, `truncate`.

Short names you'll see a lot: `p` padding and `m` margin, with `x` (left and right), `y` (top and bottom), `t` top, `r` right, `b` bottom, `l` left. `w` is width, `h` height, `bg` background.

## Numbers count in steps of 4px {#the-spacing-scale}

On spacing and sizing classes, each step of a number is 4px (0.25rem):

| Class | Size |
| :-- | :-- |
| `p-0.5` | 2px |
| `p-1` | 4px |
| `p-2` | 8px |
| `p-4` | 16px |
| `p-6` | 24px |
| `p-8` | 32px |
| `p-px` | 1px |

The same scale works for margin (`m-`), the space between items (`gap-`), width and height (`w-`, `h-`, `size-`), positions (`top-`, `inset-`) and movement (`translate-`). A minus sign in front makes a value negative: `-mt-2` pulls an element 8px up.

Widths also take fractions and words: `w-1/2` is half, `w-full` is 100%.

Border, ring and outline widths are different: their number is in pixels. `border-2` is a 2px border.

## Values the scale doesn't have {#arbitrary-values}

When you need an exact value, put it in square brackets:

```html
<div class="w-[22rem] mt-[3px] bg-[#c7a25d] text-[22px]"></div>
```

A class name can't contain a space, so write an underscore where the value needs one: `grid-cols-[1fr_2fr]` becomes `grid-template-columns: 1fr 2fr`.

On the web, a value can be any CSS: `calc()`, `min()`, `max()`, `clamp()` and `var()` work, as in `w-[calc(100%-2rem)]`. For a CSS variable there's a shorter form in parentheses: `p-(--gap)` is the same as `p-[var(--gap)]`.

On React Native, a bracket value must be in `px` or `rem`. See [React Native](/react-native#values-in-brackets).

### When a value could mean two things {#type-hints}

Some utilities set a different thing depending on the value. Kbach looks at the value to decide: `text-[22px]` is a text size, but `text-[#c7a25d]` is a text color. When it can't tell, as with a CSS variable, add a **type hint** before the value:

```html
<p class="text-[length:var(--title-size)] text-[color:var(--title-color)]"></p>
<div class="bg-[image:var(--hero)]"></div>
```

The hints are `color`, `length`, `image`, `url`, `position`, `size`, `number` and `percentage`. They work in parentheses too: `text-(length:--title-size)`.

## A CSS property with no class {#arbitrary-properties}

On the web, for a CSS property that has no utility, write the whole declaration in square brackets:

```html
<div class="[mask-type:luminance] [overflow-wrap:anywhere]"></div>
```

## Making a class win {#important}

Put `!` before or after a class to make it `!important`, so it wins over other styles:

```html
<p class="!p-4">Always 16px of padding.</p>
<p class="p-4!">The same.</p>
```

## See-through colors {#opacity}

A slash and a number after a color sets how solid it is, from `0` (invisible) to `100` (solid): `bg-black/50`, `text-blue-6/80`, `border-white/10`. See [Colors](/colors#opacity).

## Classes that add up {#combining-utilities-that-share-a-property}

Some classes look like they'd replace each other, but add up instead. You don't have to think about their order:

- `shadow-*` and `ring-*` (a solid outline) draw together.
- `translate-*`, `rotate-*`, `scale-*` and `skew-*` combine: `rotate-6 scale-110` both apply.
- `blur-*`, `brightness-*` and the other filters combine.
- `duration-*` and `ease-*` change any `transition-*`, written before or after it.

```preview
<div class="flex flex-wrap items-center gap-6">
  <div class="size-20 rounded-2xl bg-white shadow-lg ring-2 ring-sky-5 ring-offset-4 dark:bg-gray-10 dark:ring-offset-gray-12"></div>
  <div class="size-20 rounded-2xl bg-sky-5 rotate-6 scale-110 skew-x-3"></div>
  <div class="size-20 rounded-2xl bg-linear-to-br from-sky-4 to-indigo-7 blur-[1px] brightness-110 saturate-150"></div>
</div>
```

## Finding the class you need {#finding-the-class-you-need}

The [Utilities](/layout) pages list every class by topic, with the CSS it makes and a live preview. Search (<kbd>Ctrl</kbd> <kbd>K</kbd>) finds a page by any word, and the [VS Code extension](/editor-setup) suggests classes as you type.
