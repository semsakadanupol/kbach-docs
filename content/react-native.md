---
title: React Native
description: How Kbach works in a React Native or Expo app, which engine runs on each device, and exactly which classes work on a phone.
---

On React Native, Kbach is the package `@kbach/react-native`. To set it up, follow [Installation](/installation?tab=react-native).

## How it works {#how-it-works}

React Native has no CSS. Each element gets a style object instead, like `{ padding: 16, borderRadius: 12 }`. Kbach's Babel plugin makes `className` work on React Native elements, and when an element renders, its classes are turned into that style object.

```tsx
<View className="rounded-xl bg-white p-4 shadow-md">
  <Text className="text-lg font-semibold text-gray-12">Hello</Text>
</View>
```

Because classes are worked out while the app runs, a class built from pieces works fine: `className={'bg-' + color + '-6'}`. There's nothing to scan and nothing to set up for it.

## Which engine runs {#which-engine-runs}

| Where the app runs | Engine |
| :-- | :-- |
| Android: a development build, a release build, or React Native CLI | The Rust engine, through a native module. The app must be rebuilt once after installing |
| iOS, in any kind of build | A JavaScript version of the engine |
| Expo Go | The same JavaScript version (Expo Go can't load native modules) |
| Expo Web | The web engine, writing real CSS. Everything that works on the web works here |

The JavaScript version gives the same result as the Rust engine for everyday classes. Where it falls short is listed [below](#ios-and-expo-go).

## What works on a phone {#what-works-on-a-phone}

- **Layout with flexbox:** `flex-row`, `flex-col`, `flex-1`, `flex-wrap`, `items-*`, `justify-*`, `self-*`, `content-*`, `gap-*`, `grow`, `shrink`, `basis-*`. A `View` is a column by default, so use `flex-row` for a row.
- **Spacing:** `p-*`, `px-*`, `pt-*` and the rest, `m-*` and `mx-auto`, with negative margins.
- **Sizes:** `w-*`, `h-*`, `size-*`, `min-*` and `max-*`, in steps, fractions (`w-1/2`) or `full`, and `aspect-*`.
- **Position:** `absolute`, `relative`, `inset-*`, `top-*` and the other sides, `z-*`.
- **Colors:** `bg-*`, `text-*` and `border-*`, with opacity (`bg-black/50`).
- **Borders:** widths, colors, `rounded-*` (also per side and per corner), and `border-solid`, `border-dashed`, `border-dotted`.
- **Shadows:** `shadow-*`, which gives a shadow on iOS and an elevation on Android.
- **Text:** `text-sm` and the other sizes, `font-*` weights, `italic`, `leading-6` and the other numbered line heights, `text-left`, `text-center`, `text-right`, `text-justify`, `underline`, `line-through`, `uppercase`, `lowercase`, `capitalize`, and letter spacing in pixels (`tracking-[1px]`).
- **Transforms:** `translate-*`, `rotate-*`, `scale-*`, `skew-*`.
- **Other:** `opacity-*`, `hidden`, `overflow-hidden`, `overflow-scroll`, `backface-hidden`.

## What doesn't {#what-doesnt-work}

These classes are valid, and work on the web and on Expo Web, but on a phone they do nothing, without an error:

| Group | Classes | On a phone, instead |
| :-- | :-- | :-- |
| Grid and other layouts | `grid`, `grid-cols-*`, `col-span-*`, `float-*`, `columns-*`, `order-*` | Nest `flex-row` and `flex-col` views |
| Space between children | `space-x-*`, `space-y-*`, `divide-*` | `gap-*`, and borders on the children |
| Screen units | `h-screen`, `w-screen`, `min-h-screen`, `*-dvh` | `flex-1`, or `useWindowDimensions()` |
| Content sizes | `w-fit`, `w-min`, `w-max` | `self-start`, so the view isn't stretched across its parent and fits its content |
| Text that cuts off | `truncate`, `line-clamp-*` | The `numberOfLines` prop on `Text` |
| Relative text spacing | `tracking-tight` and the other named letter spacings, `leading-tight` and the other named line heights | `tracking-[1px]`, `leading-6` |
| Effects | gradients (`bg-linear-*`), `blur-*` and the other filters, `backdrop-*`, `mix-blend-*`, masks, `ring-*`, shadow colors (`shadow-sky-6`), `text-shadow-*`, `inset-shadow-*` | A library such as expo-linear-gradient for gradients |
| Motion | `transition-*`, `duration-*`, `ease-*`, `animate-*` | React Native's `Animated`, or Reanimated |
| Browser-only things | `cursor-*`, `select-*`, `pointer-events-*`, `scroll-*`, `snap-*`, `touch-*`, `resize-*`, `appearance-*`, `accent-*`, `caret-*`, `sr-only`, tables, lists, `fill-*`, `stroke-*` | Props on the component, such as `pointerEvents`, or `fill` on react-native-svg |
| Writing direction | `ps-*`, `pe-*`, `ms-*`, `me-*`, `rounded-s-*`, `border-s` | The left and right versions (`pl-*`, `ml-*`) |

You don't have to remember this table. In the [Utilities](/layout) reference, every class that does nothing on a phone is marked **Web only**. That mark comes from running the class through the engine, so it's always up to date. The [VS Code extension](/editor-setup) also underlines these classes in a React Native project.

## Variants {#variants}

`dark:`, the screen sizes (`md:`), `active:` (while a `Pressable` is pressed), `hover:` (only with a mouse), `focus:`, `disabled:` and the `data-` and `aria-` variants work. `group-*`, `peer-*`, `before:` and most others don't, because a phone app has no CSS selectors. See [Variants on React Native](/variants#on-react-native).

## Values in brackets {#values-in-brackets}

React Native measures everything in plain numbers, so a value in brackets must be in `px` or `rem` (1rem is 16px):

- `text-[20px]`, `p-[1.5rem]` and `w-[300px]` work.
- `p-[calc(16px+8px)]` works: Kbach does the math, and it becomes 24.
- `w-[calc(100%-3rem)]`, `w-[min(50%,20rem)]` and `w-[clamp(16rem,50%,32rem)]` work for width and height. Kbach measures the element's parent first, then sizes it.
- Values in `em`, `vw` or `vh` are dropped, with a warning while you develop.

As everywhere, write an underscore instead of a space: `w-[calc(100%_-_3rem)]`.

## Fonts {#fonts}

`font-sans`, `font-serif` and `font-mono` name fonts for the web that phones don't have, so on a phone they do nothing. To use a font in your app, load it (for example with `expo-font`), then name it in `kbach.config.js`:

```js title="kbach.config.js"
export default {
  extend: {
    fontFamily: {
      sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
  },
};
```

On a phone only the first name, `Inter`, is used, so the same config works on the web and in the app. See [Spacing, screens and fonts](/spacing-screens-fonts#fonts).

## On iOS and Expo Go {#ios-and-expo-go}

The JavaScript version of the engine handles everything listed in [What works on a phone](#what-works-on-a-phone), with these exceptions:

- `object-*` classes (`object-cover`, `object-contain`) do nothing. Use the `resizeMode` prop on `Image`.
- The smallest named widths (`w-3xs`, `w-2xs`, `w-xs`, and the same names on `min-w-`, `max-w-` and `basis-`) do nothing. Use a number instead: `w-80` is 320px.
- There are no warnings for mistyped classes.

## Warnings while you develop {#warnings}

In an Android development build, a class that matches nothing prints a warning once, in the Metro terminal, with the class you probably meant: `bg-blue-500 → did you mean bg-blue-6?`. Classes that are valid but do nothing on a phone stay quiet, because they're not mistakes.

## Related {#related}

- [Dark mode](/dark-mode#react-native): saving the user's choice with AsyncStorage.
- [React Native API](/react-native-api): `resolveStyle`, dynamic tokens, and components for Expo Web.
