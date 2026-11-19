---
title: Quick start
description: Build a profile card one step at a time, and learn the basic ideas of Kbach on the way. About ten minutes.
---

You'll build this card, one step at a time:

```preview
<div class="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-3 dark:bg-gray-10 dark:ring-gray-8">
  <div class="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
    <div class="grid size-16 shrink-0 place-items-center rounded-full bg-amber-5 text-2xl font-bold text-white">S</div>
    <div class="min-w-0 flex-1">
      <p class="text-lg font-semibold text-gray-12 dark:text-white">Sokha Chan</p>
      <p class="text-sm text-gray-7 dark:text-gray-4">Designer in Phnom Penh</p>
    </div>
    <button class="rounded-lg bg-blue-6 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-7">Follow</button>
  </div>
</div>
```

Install Kbach first ([Installation](/installation)). The code below is React for the web. At the end you'll see what changes for React Native and for a plain HTML page.

## 1. Start with plain content {#start-with-plain-content}

No classes yet: just the content, with the browser's default look.

```tsx title="ProfileCard.tsx"
export function ProfileCard() {
  return (
    <div>
      <div>S</div>
      <div>
        <p>Sokha Chan</p>
        <p>Designer in Phnom Penh</p>
      </div>
      <button>Follow</button>
    </div>
  );
}
```

```preview
<div>
  <div>S</div>
  <div>
    <p>Sokha Chan</p>
    <p>Designer in Phnom Penh</p>
  </div>
  <button>Follow</button>
</div>
```

## 2. Make it a card {#make-it-a-card}

Give the outer box a white background, space inside, rounded corners and a shadow. Each class does one of those things:

```tsx {3}
export function ProfileCard() {
  return (
    <div className="max-w-md rounded-2xl bg-white p-6 shadow-lg">
```

```preview
<div class="max-w-md rounded-2xl bg-white p-6 shadow-lg">
  <div>S</div>
  <div>
    <p>Sokha Chan</p>
    <p>Designer in Phnom Penh</p>
  </div>
  <button>Follow</button>
</div>
```

| Class | What it does |
| :-- | :-- |
| `max-w-md` | The card is at most 28rem (448px) wide |
| `rounded-2xl` | Rounds the corners by 16px |
| `bg-white` | A white background |
| `p-6` | 24px of space on every side, inside the card |
| `shadow-lg` | A large, soft shadow under it |

Spacing numbers count in steps of 4px: `p-1` is 4px, `p-4` is 16px, `p-6` is 24px. The same numbers work for margins, gaps, widths and heights.

## 3. Put things in a row {#put-things-in-a-row}

`flex` lines the children up in a row. `items-center` centers them from top to bottom, and `gap-4` puts 16px between them.

```tsx {2}
<div className="max-w-md rounded-2xl bg-white p-6 shadow-lg">
  <div className="flex items-center gap-4">
    <div>S</div>
    <div className="flex-1">…</div>
    <button>Follow</button>
  </div>
</div>
```

`flex-1` on the middle part lets it take all the space that's left, which pushes the button to the right edge.

```preview
<div class="max-w-md rounded-2xl bg-white p-6 shadow-lg">
  <div class="flex items-center gap-4">
    <div>S</div>
    <div class="flex-1">
      <p>Sokha Chan</p>
      <p>Designer in Phnom Penh</p>
    </div>
    <button>Follow</button>
  </div>
</div>
```

## 4. Style the text and the avatar {#style-the-text-and-the-avatar}

```tsx
<div className="grid size-16 place-items-center rounded-full bg-amber-5 text-2xl font-bold text-white">S</div>
<div className="flex-1">
  <p className="text-lg font-semibold text-gray-12">Sokha Chan</p>
  <p className="text-sm text-gray-7">Designer in Phnom Penh</p>
</div>
```

- `size-16` makes the avatar 64px wide and 64px tall, `rounded-full` turns it into a circle, and `grid place-items-center` puts the letter in the middle.
- `text-lg` and `text-sm` set the text size, `font-semibold` and `font-bold` how heavy it is.
- `bg-amber-5`, `text-gray-12` and `text-gray-7` are colors. Every color has 12 shades, from `1` (lightest) to `12` (darkest). See [Colors](/colors).

```preview
<div class="max-w-md rounded-2xl bg-white p-6 shadow-lg">
  <div class="flex items-center gap-4">
    <div class="grid size-16 place-items-center rounded-full bg-amber-5 text-2xl font-bold text-white">S</div>
    <div class="flex-1">
      <p class="text-lg font-semibold text-gray-12">Sokha Chan</p>
      <p class="text-sm text-gray-7">Designer in Phnom Penh</p>
    </div>
    <button>Follow</button>
  </div>
</div>
```

## 5. Make the button respond {#make-the-button-respond}

A class with `hover:` in front of it only applies while the pointer is over the element. This button turns a darker blue on hover, and `transition-colors` makes the change smooth:

```tsx
<button className="rounded-lg bg-blue-6 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-7">
  Follow
</button>
```

```preview
<button class="rounded-lg bg-blue-6 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-7">Follow</button>
```

`hover:` is a **variant**: a word in front of a class that says *when* it applies. There are variants for focus, for disabled elements, for screen sizes and for dark mode. See [Variants](/variants).

## 6. Fit small screens {#fit-small-screens}

On a phone, a row is too narrow. Stack the card instead, and only use a row from 640px up:

```tsx
<div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
```

`flex-col` stacks the children. `sm:flex-row` says "from the `sm` screen size (640px) and wider, use a row". Classes without a screen prefix apply on every screen, and a prefix makes a class win from that width up. That's why you style the small screen first, then add what changes on bigger ones.

```preview
<div class="max-w-md rounded-2xl bg-white p-6 shadow-lg">
  <div class="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
    <div class="grid size-16 shrink-0 place-items-center rounded-full bg-amber-5 text-2xl font-bold text-white">S</div>
    <div class="min-w-0 flex-1">
      <p class="text-lg font-semibold text-gray-12">Sokha Chan</p>
      <p class="text-sm text-gray-7">Designer in Phnom Penh</p>
    </div>
    <button class="rounded-lg bg-blue-6 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-7">Follow</button>
  </div>
</div>
```

Make your browser window narrower than 640px to see it stack, or try it in the [Playground](/playground), which can show a phone-sized screen.

## 7. Add dark mode {#add-dark-mode}

`dark:` applies a class only in dark mode. Give the card a dark background and light text there:

```tsx
<div className="max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-10">
  …
  <p className="text-lg font-semibold text-gray-12 dark:text-white">Sokha Chan</p>
  <p className="text-sm text-gray-7 dark:text-gray-4">Designer in Phnom Penh</p>
```

Switch this site's theme (the sun and moon at the top) to see it. By default dark mode follows the device's setting. To add your own switch, see [Dark mode](/dark-mode).

The card at the top of this page is the finished result.

## On React Native and in plain HTML {#on-react-native-and-in-plain-html}

The classes stay the same. What changes is the element names:

```tsx tab="React Native" title="ProfileCard.tsx"
import { Pressable, Text, View } from 'react-native';

export function ProfileCard() {
  return (
    <View className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-10">
      <View className="flex-row items-center gap-4">
        <View className="size-16 items-center justify-center rounded-full bg-amber-5">
          <Text className="text-2xl font-bold text-white">S</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-12 dark:text-white">Sokha Chan</Text>
          <Text className="text-sm text-gray-7 dark:text-gray-4">Designer in Phnom Penh</Text>
        </View>
        <Pressable className="rounded-lg bg-blue-6 px-4 py-2 active:bg-blue-7">
          <Text className="text-sm font-semibold text-white">Follow</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

```html tab="Plain HTML" title="index.html"
<div class="max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-10">
  <div class="flex items-center gap-4">
    <div class="grid size-16 place-items-center rounded-full bg-amber-5 text-2xl font-bold text-white">S</div>
    <div class="flex-1">
      <p class="text-lg font-semibold text-gray-12 dark:text-white">Sokha Chan</p>
      <p class="text-sm text-gray-7 dark:text-gray-4">Designer in Phnom Penh</p>
    </div>
    <button class="rounded-lg bg-blue-6 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-7">Follow</button>
  </div>
</div>
```

Three things are different on React Native:

- Text must be inside a `<Text>`, so the text classes go on `Text`, not on `View`.
- A `View` is already a column, so a row is `flex-row` (on the web, `flex` makes a row).
- There's no grid, so the avatar centers its letter with `items-center justify-center`. On a touch screen there's no hover either: `active:` styles a `Pressable` while it's pressed.

In plain HTML the attribute is `class` instead of `className`, and everything else is the same.

## What you learned {#what-you-learned}

- Each class does one thing, and you combine them on the element.
- Spacing and sizes count in steps of 4px.
- Colors have 12 shades, from `1` (lightest) to `12` (darkest).
- A variant like `hover:`, `sm:` or `dark:` says when a class applies.

Next, read [How Kbach works](/how-it-works) to see what happens to your classes, or browse the [Utilities](/layout) to find the class for anything you want to do.
