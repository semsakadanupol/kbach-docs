---
title: Variants
description: Make a class apply only at certain times, such as on hover, on wide screens or in dark mode, by putting a word in front of it.
---

## How variants work {#how-variants-work}

A class normally applies all the time. A **variant** is a word with a colon, put in front of a class, that says *when* it applies:

```html
<button class="bg-blue-6 hover:bg-blue-7 md:px-6 dark:bg-blue-5">Save</button>
```

Read it like this: the background is `blue-6`; **on hover** it's `blue-7`; **from medium screens up** the side padding is `px-6`; **in dark mode** the background is `blue-5`. The class after the colon is an ordinary class, and any class can take any variant.

You can chain variants. Each one is another condition, and all of them must be true: `dark:hover:bg-blue-4` applies on hover in dark mode. Their order doesn't matter: `dark:md:hover:bg-blue-4` and `hover:md:dark:bg-blue-4` mean the same thing. The one exception is `*:` and `**:`; see [Children](#children-has-and-in).

`hover:` applies only on a device that can hover. On a touch screen a tap would otherwise leave the hover style stuck until the next tap. The same goes for `group-hover:` and `peer-hover:`.

## When two classes set the same thing {#which-class-wins}

The order you write classes in doesn't matter. A class with a variant wins over the same class without one, and between two variants, the one further down this list wins:

1. No variant
2. Position among siblings: `first:`, `last:`, `odd:`, `even:`, `nth-*`
3. `open:` and `inert:`
4. `hover:`, `focus:`, `focus-visible:`, `focus-within:`, `active:`, then the form states and `aria-*`
5. `has-*`, `not-*`, `data-*`, `before:`, `after:` and the other pseudo-elements, `*:`
6. `group-*`, `peer-*` and `in-*`
7. `dark:`
8. `motion-safe:`, `motion-reduce:`, `print:` and the other media queries
9. Screen sizes, smallest first, then `max-*`, container queries and `supports-*`
10. `starting:`

A class with several variants takes the place of the one furthest down the list. When two classes are at the same place, their next variant decides: `dark:active:bg-blue-8` wins over `dark:hover:bg-blue-7` while the button is pressed, just as `active:` wins over `hover:`.

This matters most for `motion-safe:`, which sits low in the list:

```html
<!-- motion-safe: sits lower than active:, so the spin keeps going while pressed -->
<button class="motion-safe:hover:animate-spin active:animate-none">Save</button>

<!-- with the same motion-safe:, active: wins and the spin stops -->
<button class="motion-safe:hover:animate-spin motion-safe:active:animate-none">Save</button>
```

`disabled:` always wins over the other states, and a class marked `!` (see [Making a class win](/utility-classes#important)) wins over all of them.

## States {#states}

```preview
<button class="rounded-lg bg-indigo-6 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-7 hover:-translate-y-0.5 active:translate-y-0 active:bg-indigo-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-6">
  Hover, press and tab to me
</button>
```

| Variant | When |
| :-- | :-- |
| `hover:` `focus:` `focus-visible:` `focus-within:` `active:` `visited:` | The usual interaction states |
| `disabled:` `enabled:` `checked:` `indeterminate:` `required:` `optional:` `read-only:` | Form element states |
| `valid:` `invalid:` `user-valid:` `user-invalid:` `in-range:` `out-of-range:` `placeholder-shown:` `autofill:` | Validation |
| `first:` `last:` `only:` `odd:` `even:` `first-of-type:` `last-of-type:` `empty:` | Position among siblings |
| `open:` `target:` `fullscreen:` `popover-open:` `inert:` | Element states |
| `nth-[3n+1]:` `nth-last-[2]:` `nth-of-type-[odd]:` | Any `:nth-child()` formula |

`not-` turns a state around: `not-first:mt-4` adds a top margin to every child but the first.

`open:` matches an open `<details>` or `<dialog>` and an open popover. `inert:` matches an inert element and everything inside it.

```preview
<ul class="max-w-xs divide-y divide-gray-3 rounded-xl border border-gray-3 bg-white dark:divide-gray-9 dark:border-gray-9 dark:bg-gray-11">
  <li class="px-4 py-3 text-sm text-gray-11 odd:bg-gray-1 dark:text-gray-3 dark:odd:bg-gray-10">Odd rows are tinted</li>
  <li class="px-4 py-3 text-sm text-gray-11 odd:bg-gray-1 dark:text-gray-3 dark:odd:bg-gray-10">by odd:</li>
  <li class="px-4 py-3 text-sm text-gray-11 odd:bg-gray-1 dark:text-gray-3 dark:odd:bg-gray-10">with no extra markup</li>
  <li class="px-4 py-3 text-sm font-semibold text-gray-11 last:text-indigo-6 dark:text-gray-3 dark:last:text-indigo-4">and last: colors this one</li>
</ul>
```

## Screen sizes {#responsive}

Screen-size variants are **mobile first**: `md:flex` means "from 768px up". Write the small-screen style without a prefix, then override it at larger sizes.

| Variant | From |
| :-- | :-- |
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

```html
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">...</div>
```

To apply something **below** a breakpoint, use `max-`: `max-md:hidden` hides an element under 768px. Combine the two for a range: `md:max-xl:flex` applies from 768px up to 1280px. `min-md:` is the same as `md:`, if you like the range spelled out.

For a one-off width, use `min-[900px]:` or `max-[900px]:`. You can change the widths, or add your own breakpoints such as `tablet:` or `3xl:`, in [kbach.config.js](/spacing-screens-fonts#screens).

## Dark mode

`dark:` applies in dark mode. By default it follows the system setting. To add a toggle, see [Dark mode](/dark-mode).

```html
<div class="bg-white text-gray-12 dark:bg-gray-12 dark:text-gray-1">...</div>
```

## Styling from a parent: group

Mark a parent with `group`, then use `group-hover:`, `group-focus:` and the other `group-*` variants on its children:

```preview
<a href="#" class="group flex max-w-sm items-center gap-4 rounded-xl border border-gray-3 bg-white p-4 transition hover:border-amber-5 hover:shadow-md dark:border-gray-9 dark:bg-gray-11">
  <span class="grid size-10 place-items-center rounded-lg bg-amber-1 text-amber-8 transition group-hover:bg-amber-5 group-hover:text-white dark:bg-amber-10 dark:text-amber-3">→</span>
  <span>
    <span class="block font-semibold text-gray-12 dark:text-white">Hover the whole card</span>
    <span class="block text-sm text-gray-7 transition group-hover:translate-x-1 dark:text-gray-4">The icon and this text react</span>
  </span>
</a>
```

When groups are nested, name them: `group/item` on the parent and `group-hover/item:underline` on the child.

Any state of the parent works after `group-`, not only hover and focus: `group-data-open:`, `group-aria-expanded:`, `group-has-checked:`, `group-nth-2:`, `group-has-[...]:` or `group-[.is-open]:`. `peer-` takes the same.

## Styling from a sibling: peer

Mark an element with `peer`, then style a **later** sibling with `peer-checked:`, `peer-focus:`, `peer-invalid:` and so on:

```preview
<label class="flex cursor-pointer items-center gap-3">
  <input type="checkbox" class="peer sr-only" />
  <span class="relative h-6 w-11 rounded-full bg-gray-4 transition-colors peer-checked:bg-emerald-6 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-4 dark:bg-gray-8 dark:peer-checked:bg-emerald-5 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"></span>
  <span class="text-sm font-medium text-gray-11 peer-checked:text-emerald-7 dark:text-gray-3 dark:peer-checked:text-emerald-4">Click to switch</span>
</label>
```

## Children: has, *, and in

- `has-[input:checked]:` styles an element when it contains something that matches. For a state, name it: `has-checked:` is any checked descendant, `has-focus-visible:` any focused one.
- `*:` styles every direct child: `*:p-2`. `**:` reaches all descendants.
- `in-focus:` styles an element when an ancestor matches the state.

A variant written after `*:` is a condition on the children: `*:first:pt-0` is the first child, and `*:hover:bg-gray-2` is whichever child is hovered. Written before it, the condition is on the parent: `hover:*:bg-gray-2` styles every child while the parent is hovered.

```preview
<label class="flex max-w-sm items-center gap-3 rounded-xl border border-gray-3 p-4 transition has-[input:checked]:border-indigo-6 has-[input:checked]:bg-indigo-1 dark:border-gray-9 dark:has-[input:checked]:bg-indigo-11">
  <input type="radio" name="plan" class="size-4 accent-indigo-6" />
  <span class="text-sm font-medium text-gray-11 dark:text-gray-2">The card highlights when its radio is checked</span>
</label>
```

## Data and ARIA attributes

```html
<div data-open class="data-open:rotate-180">...</div>
<div data-state="open" class="data-[state=open]:rotate-180">...</div>
<button aria-expanded="true" class="aria-expanded:bg-gray-2">...</button>
<th aria-sort="ascending" class="aria-[sort=ascending]:font-bold">...</th>
```

`aria-checked:`, `aria-disabled:`, `aria-expanded:`, `aria-hidden:`, `aria-pressed:`, `aria-readonly:`, `aria-required:`, `aria-selected:` and `aria-busy:` are built in. `data-open:` matches an element that has a `data-open` attribute at all. For a value, or any other ARIA attribute, write it in brackets.

Put `not-` in front to match the opposite: `not-data-open:`, `not-first:`, `not-hover:`.

## Pseudo-elements

`before:` and `after:` add generated content. Kbach fills in `content: ""` for you, so `after:absolute after:inset-0` is enough to draw an overlay.

```preview
<p class="relative inline-block text-lg font-semibold text-gray-12 after:absolute after:-bottom-1 after:left-0 after:h-1 after:w-full after:rounded-full after:bg-linear-to-r after:from-amber-4 after:to-rose-5 dark:text-white">An underline drawn with after:</p>
```

Also available: `placeholder:`, `selection:`, `marker:`, `file:`, `first-line:`, `first-letter:`, `backdrop:` and `details-content:`.

`marker:` and `selection:` also apply inside the element, so `marker:text-blue-6` on a `<ul>` colors the bullets of its items.

## Media and feature queries

| Variant | When |
| :-- | :-- |
| `motion-safe:` `motion-reduce:` | The user's reduced-motion setting |
| `contrast-more:` `contrast-less:` | The user's contrast setting |
| `print:` | When printing |
| `forced-colors:` `inverted-colors:` | Forced colors (Windows high contrast) or inverted colors |
| `noscript:` | JavaScript is off |
| `portrait:` `landscape:` | Screen orientation |
| `pointer-fine:` `pointer-coarse:` `pointer-none:` `any-pointer-fine:` `any-pointer-coarse:` `any-pointer-none:` | Mouse, touch, or no pointer |
| `supports-[display:grid]:` `supports-grid:` | `@supports`: a declaration, or whether a property exists at all |
| `starting:` | `@starting-style`, for enter transitions |
| `rtl:` `ltr:` | Text direction |

Put `not-` in front of one to flip it: `not-print:`, `not-forced-colors:`, `not-dark:`, `not-md:`, `not-supports-[display:grid]:`.

## Container queries

Mark a parent with `@container`, then size children by the parent's width instead of the window's:

```html
<div class="@container">
  <div class="flex flex-col @min-[28rem]:flex-row">...</div>
</div>
```

The sizes are the container scale, which is smaller than the screen breakpoints:

| Variant | From | Variant | From |
| :-- | :-- | :-- | :-- |
| `@3xs:` | 16rem (256px) | `@xl:` | 36rem (576px) |
| `@2xs:` | 18rem (288px) | `@2xl:` | 42rem (672px) |
| `@xs:` | 20rem (320px) | `@3xl:` | 48rem (768px) |
| `@sm:` | 24rem (384px) | `@4xl:` | 56rem (896px) |
| `@md:` | 28rem (448px) | `@5xl:` | 64rem (1024px) |
| `@lg:` | 32rem (512px) | `@6xl:` | 72rem (1152px) |
|  |  | `@7xl:` | 80rem (1280px) |

`@max-md:` applies below a size. For any other width, use `@min-[...]:` or `@max-[...]:`.

`@container` tracks the parent's width. Use `@container-size` when children also need its height, for the `cqh` and `cqb` units: `h-[50cqb]` is half the container's height.

When containers are nested, name the one you mean: `@container/sidebar` on the parent, then `@min-[20rem]/sidebar:` on a child. The name picks that ancestor, however deep the child is.

```html
<aside class="@container/sidebar">
  <div class="@container">
    <p class="hidden @min-[20rem]/sidebar:block">Shown when the sidebar is at least 20rem wide</p>
  </div>
</aside>
```

## Anything else: arbitrary variants

Write a selector in brackets, with `&` standing for the element:

```html
<ul class="[&>li]:mt-2 [&_a]:underline [.dark_&]:text-white"></ul>
```

`[&>li]:mt-2` styles direct `li` children, `[&_a]:` styles links anywhere inside, and `[.dark_&]:` applies when an ancestor has the `dark` class.

A media, feature or container query works the same way, written out after its `@`: `[@media(min-resolution:2dppx)]:`, `[@supports(selector(:has(a)))]:`, `[@container(min-width:300px)]:`.

## On React Native {#on-react-native}

A phone app has no CSS, so React Native can't use most of the variants above. These work:

| Variant | On React Native it means |
| :-- | :-- |
| `dark:` | The phone (or your app) is in dark mode |
| `sm:` `md:` `lg:` `xl:` `2xl:`, your own screen sizes, `max-md:`, `min-[500px]:` | The app window is at least (or, with `max-`, less than) that wide. Widths in brackets must be in `px` or `rem` |
| `active:` | A `Pressable` is being pressed |
| `hover:` | A mouse or trackpad pointer is over the element. On a touch screen it never applies |
| `focus:` | The element has focus |
| `disabled:` | The element has the `disabled` prop |
| `data-[state=open]:`, `aria-selected:` and the other `data-` and `aria-` variants | The element has that `data-` or `aria-` prop |

`not-` works in front of `dark:` and the screen sizes: `not-dark:`, `not-md:`.

`disabled:`, `data-` and `aria-` look only at the element's **own** props. On `<Pressable disabled><Text className="disabled:text-gray-5">`, the `Text` has no `disabled` prop, so nothing happens. Give it to the `Text` too: `<Text disabled className="disabled:text-gray-5">`.

Everything else on this page does nothing on React Native, without an error: `group-*`, `peer-*`, `has-*`, `in-*`, `*:` and `**:`, the position states (`first:`, `odd:` and the rest), the form states other than `disabled:`, `before:`, `after:` and the other pseudo-elements, the media and feature queries, container queries and arbitrary variants. They all work on Expo Web, which uses the web engine.

When two classes set the same thing, the one with more variants that apply wins, whatever order you write them in: `dark:bg-black bg-white` is black in dark mode, the same as on the web.
