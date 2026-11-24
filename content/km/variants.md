---
title: Variants
description: ធ្វើឱ្យ class ប្រើតែនៅពេលជាក់លាក់ ដូចជាពេល hover, លើអេក្រង់ធំ ឬក្នុង dark mode ដោយដាក់ពាក្យមួយនៅពីមុខវា។
---

## Variant ដំណើរការយ៉ាងដូចម្តេច {#how-variants-work}

ជាធម្មតា class ប្រើគ្រប់ពេល។ **Variant** គឺជាពាក្យដែលមានសញ្ញា `:` ដាក់នៅពីមុខ class ដើម្បីប្រាប់ថា class នោះប្រើ *ពេលណា*៖

```html
<button class="bg-blue-6 hover:bg-blue-7 md:px-6 dark:bg-blue-5">Save</button>
```

អានបែបនេះ៖ ផ្ទៃខាងក្រោមជា `blue-6`, **ពេល hover** ប្តូរទៅ `blue-7`, **ចាប់ពីអេក្រង់មធ្យមឡើងទៅ** padding ឆ្វេងស្តាំជា `px-6`, ហើយ **ក្នុង dark mode** ផ្ទៃខាងក្រោមជា `blue-5`។ ពីក្រោយសញ្ញា `:` គឺជា class ធម្មតា ហើយ class ណាក៏ដាក់ variant ណាក៏បាន។

អ្នកអាចដាក់ variant ច្រើនបន្តគ្នា។ Variant នីមួយៗជាលក្ខខណ្ឌមួយ ហើយលក្ខខណ្ឌទាំងអស់ត្រូវតែពិត៖ `dark:hover:bg-blue-4` ប្រើពេល hover ក្នុង dark mode។ លំដាប់មិនសំខាន់ទេ៖ `dark:md:hover:bg-blue-4` និង `hover:md:dark:bg-blue-4` មានន័យដូចគ្នា។ មានតែ `*:` និង `**:` ទេដែលខុសពីនេះ សូមមើល [Children](#children-has-and-in)។

`hover:` ប្រើតែលើឧបករណ៍ដែលអាច hover បានប៉ុណ្ណោះ។ បើមិនដូច្នេះទេ លើអេក្រង់ប៉ះ ការប៉ះម្តងនឹងធ្វើឱ្យ style hover ជាប់គាំង រហូតដល់ប៉ះម្តងទៀត។ `group-hover:` និង `peer-hover:` ក៏ដូចគ្នា។

## ពេល class ពីរកំណត់របស់ដូចគ្នា {#which-class-wins}

លំដាប់ដែលអ្នកសរសេរ class មិនសំខាន់ទេ។ Class ដែលមាន variant ឈ្នះ class ដូចគ្នាដែលគ្មាន variant ហើយរវាង variant ពីរ variant ដែលនៅខាងក្រោមជាងក្នុងបញ្ជីនេះឈ្នះ៖

1. គ្មាន variant
2. ទីតាំងក្នុងចំណោម element ជិតខាង៖ `first:`, `last:`, `odd:`, `even:`, `nth-*`
3. `open:` និង `inert:`
4. `hover:`, `focus:`, `focus-visible:`, `focus-within:`, `active:` បន្ទាប់មកស្ថានភាព form និង `aria-*`
5. `has-*`, `not-*`, `data-*`, `before:`, `after:` និង pseudo-element ផ្សេងៗ, `*:`
6. `group-*`, `peer-*` និង `in-*`
7. `dark:`
8. `motion-safe:`, `motion-reduce:`, `print:` និង media query ផ្សេងៗ
9. ទំហំអេក្រង់ ពីតូចទៅធំ បន្ទាប់មក `max-*`, container query និង `supports-*`
10. `starting:`

Class ដែលមាន variant ច្រើន យកកន្លែងរបស់ variant ដែលនៅខាងក្រោមបំផុតក្នុងបញ្ជី។ ពេល class ពីរនៅកន្លែងដូចគ្នា variant បន្ទាប់របស់វាជាអ្នកសម្រេច៖ `dark:active:bg-blue-8` ឈ្នះ `dark:hover:bg-blue-7` ពេលចុចប៊ូតុង ដូចដែល `active:` ឈ្នះ `hover:` ដែរ។

រឿងនេះសំខាន់ជាងគេចំពោះ `motion-safe:` ព្រោះវានៅខាងក្រោមក្នុងបញ្ជី៖

```html
<!-- motion-safe: sits lower than active:, so the spin keeps going while pressed -->
<button class="motion-safe:hover:animate-spin active:animate-none">Save</button>

<!-- with the same motion-safe:, active: wins and the spin stops -->
<button class="motion-safe:hover:animate-spin motion-safe:active:animate-none">Save</button>
```

`disabled:` ឈ្នះស្ថានភាពផ្សេងទៀតជានិច្ច ហើយ class ដែលមាន `!` (សូមមើល [ឱ្យ class មួយមានអាទិភាព](/utility-classes#important)) ឈ្នះទាំងអស់។

## ស្ថានភាព {#states}

```preview
<button class="rounded-lg bg-indigo-6 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-7 hover:-translate-y-0.5 active:translate-y-0 active:bg-indigo-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-6">
  Hover, press and tab to me
</button>
```

| Variant | ប្រើពេល |
| :-- | :-- |
| `hover:` `focus:` `focus-visible:` `focus-within:` `active:` `visited:` | ស្ថានភាពធម្មតាពេលអ្នកប្រើធ្វើអន្តរកម្ម |
| `disabled:` `enabled:` `checked:` `indeterminate:` `required:` `optional:` `read-only:` | ស្ថានភាពរបស់ element ក្នុង form |
| `valid:` `invalid:` `user-valid:` `user-invalid:` `in-range:` `out-of-range:` `placeholder-shown:` `autofill:` | ការផ្ទៀងផ្ទាត់ទិន្នន័យ |
| `first:` `last:` `only:` `odd:` `even:` `first-of-type:` `last-of-type:` `empty:` | ទីតាំងក្នុងចំណោម element ជាប់គ្នា |
| `open:` `target:` `fullscreen:` `popover-open:` `inert:` | ស្ថានភាពរបស់ element |
| `nth-[3n+1]:` `nth-last-[2]:` `nth-of-type-[odd]:` | រូបមន្ត `:nth-child()` ណាក៏បាន |

`not-` បញ្ច្រាសស្ថានភាព៖ `not-first:mt-4` ដាក់ margin ខាងលើឱ្យ element ខាងក្នុងទាំងអស់ លើកលែងតែទីមួយ។

`open:` ត្រូវនឹង `<details>` ឬ `<dialog>` ដែលកំពុងបើក និង popover ដែលកំពុងបើក។ `inert:` ត្រូវនឹង element ដែល inert និងអ្វីៗទាំងអស់នៅខាងក្នុងវា។

```preview
<ul class="max-w-xs divide-y divide-gray-3 rounded-xl border border-gray-3 bg-white dark:divide-gray-9 dark:border-gray-9 dark:bg-gray-11">
  <li class="px-4 py-3 text-sm text-gray-11 odd:bg-gray-1 dark:text-gray-3 dark:odd:bg-gray-10">Odd rows are tinted</li>
  <li class="px-4 py-3 text-sm text-gray-11 odd:bg-gray-1 dark:text-gray-3 dark:odd:bg-gray-10">by odd:</li>
  <li class="px-4 py-3 text-sm text-gray-11 odd:bg-gray-1 dark:text-gray-3 dark:odd:bg-gray-10">with no extra markup</li>
  <li class="px-4 py-3 text-sm font-semibold text-gray-11 last:text-indigo-6 dark:text-gray-3 dark:last:text-indigo-4">and last: colors this one</li>
</ul>
```

## ទំហំអេក្រង់ {#responsive}

Variant ទំហំអេក្រង់គិត **ពីទូរស័ព្ទជាមុន**៖ `md:flex` មានន័យថា "ចាប់ពី 768px ឡើងទៅ"។ សរសេរ style សម្រាប់អេក្រង់តូចដោយគ្មានពាក្យពីមុខ រួចបន្ថែមអ្វីដែលត្រូវប្តូរសម្រាប់អេក្រង់ធំ។

| Variant | ចាប់ពី |
| :-- | :-- |
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

```html
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">...</div>
```

បើចង់ឱ្យប្រើតែ **ក្រោម** ទំហំណាមួយ សូមប្រើ `max-`៖ `max-md:hidden` លាក់ element ពេលអេក្រង់តូចជាង 768px។ ប្រើទាំងពីររួមគ្នា ដើម្បីបានចន្លោះ៖ `md:max-xl:flex` ប្រើចាប់ពី 768px រហូតដល់ក្រោម 1280px។ `min-md:` ដូចគ្នានឹង `md:` សម្រាប់អ្នកដែលចង់សរសេរឱ្យច្បាស់។

បើត្រូវការទទឹងពិសេសតែម្តង សូមប្រើ `min-[900px]:` ឬ `max-[900px]:`។ អ្នកអាចប្តូរទទឹងទាំងនេះ ឬបន្ថែមទំហំថ្មីដូចជា `tablet:` ឬ `3xl:` បានក្នុង [kbach.config.js](/spacing-screens-fonts#screens)។

## Dark mode {#dark-mode}

`dark:` ប្រើក្នុង dark mode។ ជាលំនាំដើម វាប្តូរតាមការកំណត់របស់ប្រព័ន្ធ។ បើចង់ដាក់ប៊ូតុងប្តូរ មើលនៅ [Dark mode](/dark-mode)។

```html
<div class="bg-white text-gray-12 dark:bg-gray-12 dark:text-gray-1">...</div>
```

## រចនាតាម parent៖ group {#styling-from-a-parent-group}

ដាក់ `group` លើ parent រួចប្រើ `group-hover:`, `group-focus:` និង variant `group-*` ផ្សេងទៀតលើ element ខាងក្នុង៖

```preview
<a href="#" class="group flex max-w-sm items-center gap-4 rounded-xl border border-gray-3 bg-white p-4 transition hover:border-amber-5 hover:shadow-md dark:border-gray-9 dark:bg-gray-11">
  <span class="grid size-10 place-items-center rounded-lg bg-amber-1 text-amber-8 transition group-hover:bg-amber-5 group-hover:text-white dark:bg-amber-10 dark:text-amber-3">→</span>
  <span>
    <span class="block font-semibold text-gray-12 dark:text-white">Hover the whole card</span>
    <span class="block text-sm text-gray-7 transition group-hover:translate-x-1 dark:text-gray-4">The icon and this text react</span>
  </span>
</a>
```

បើ group នៅក្នុង group សូមដាក់ឈ្មោះវា៖ `group/item` លើ parent និង `group-hover/item:underline` លើ element ខាងក្នុង។

ក្រោយ `group-` ដាក់ស្ថានភាពណាមួយរបស់ parent ក៏បាន មិនមែនតែ hover និង focus ទេ៖ `group-data-open:`, `group-aria-expanded:`, `group-has-checked:`, `group-nth-2:`, `group-has-[...]:` ឬ `group-[.is-open]:`។ `peer-` ក៏ប្រើបានដូចគ្នា។

## រចនាតាម element ជិតខាង៖ peer {#styling-from-a-sibling-peer}

ដាក់ `peer` លើ element មួយ រួចរចនា element ជិតខាង **ដែលនៅខាងក្រោយវា** ដោយ `peer-checked:`, `peer-focus:`, `peer-invalid:` ជាដើម៖

```preview
<label class="flex cursor-pointer items-center gap-3">
  <input type="checkbox" class="peer sr-only" />
  <span class="relative h-6 w-11 rounded-full bg-gray-4 transition-colors peer-checked:bg-emerald-6 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-4 dark:bg-gray-8 dark:peer-checked:bg-emerald-5 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"></span>
  <span class="text-sm font-medium text-gray-11 peer-checked:text-emerald-7 dark:text-gray-3 dark:peer-checked:text-emerald-4">Click to switch</span>
</label>
```

## Element ខាងក្នុង៖ has, * និង in {#children-has-and-in}

- `has-[input:checked]:` រចនា element ពេលខាងក្នុងវាមាន element ដែលត្រូវនឹងលក្ខខណ្ឌ។ សម្រាប់ស្ថានភាព សរសេរឈ្មោះស្ថានភាពតែម្តង៖ `has-checked:` គឺពេលខាងក្នុងមាន element ដែល checked, `has-focus-visible:` គឺពេលខាងក្នុងមាន element កំពុង focus។
- `*:` រចនា element ខាងក្នុងជាន់ទីមួយទាំងអស់៖ `*:p-2`។ `**:` រចនាដល់គ្រប់ជាន់។
- `in-focus:` រចនា element ពេល parent ណាមួយរបស់វានៅក្នុងស្ថានភាពនោះ។

Variant ដែលសរសេរនៅក្រោយ `*:` ជាលក្ខខណ្ឌលើ element ខាងក្នុង៖ `*:first:pt-0` គឺ element ទីមួយ ហើយ `*:hover:bg-gray-2` គឺ element ណាដែលកំពុង hover។ បើសរសេរនៅមុខ លក្ខខណ្ឌនោះនៅលើ parent វិញ៖ `hover:*:bg-gray-2` រចនា element ខាងក្នុងទាំងអស់ ពេល hover លើ parent។

```preview
<label class="flex max-w-sm items-center gap-3 rounded-xl border border-gray-3 p-4 transition has-[input:checked]:border-indigo-6 has-[input:checked]:bg-indigo-1 dark:border-gray-9 dark:has-[input:checked]:bg-indigo-11">
  <input type="radio" name="plan" class="size-4 accent-indigo-6" />
  <span class="text-sm font-medium text-gray-11 dark:text-gray-2">The card highlights when its radio is checked</span>
</label>
```

## Attribute data និង ARIA {#data-and-aria-attributes}

```html
<div data-open class="data-open:rotate-180">...</div>
<div data-state="open" class="data-[state=open]:rotate-180">...</div>
<button aria-expanded="true" class="aria-expanded:bg-gray-2">...</button>
<th aria-sort="ascending" class="aria-[sort=ascending]:font-bold">...</th>
```

`aria-checked:`, `aria-disabled:`, `aria-expanded:`, `aria-hidden:`, `aria-pressed:`, `aria-readonly:`, `aria-required:`, `aria-selected:` និង `aria-busy:` មានស្រាប់។ `data-open:` ត្រូវនឹង element ណាដែលមាន attribute `data-open` មិនថាតម្លៃអ្វីទេ។ បើចង់ផ្ទៀងតម្លៃ ឬប្រើ attribute ARIA ផ្សេងទៀត សូមសរសេរក្នុងតង្កៀបការ៉េ។

ដាក់ `not-` ពីមុខ ដើម្បីបានការផ្ទុយ៖ `not-data-open:`, `not-first:`, `not-hover:`។

## Pseudo-element {#pseudo-elements}

`before:` និង `after:` បន្ថែមមាតិកាថ្មីដែល CSS បង្កើត។ Kbach ដាក់ `content: ""` ឱ្យស្រាប់ ដូច្នេះគ្រាន់តែ `after:absolute after:inset-0` ក៏គូរស្រទាប់ពីលើបានហើយ។

```preview
<p class="relative inline-block text-lg font-semibold text-gray-12 after:absolute after:-bottom-1 after:left-0 after:h-1 after:w-full after:rounded-full after:bg-linear-to-r after:from-amber-4 after:to-rose-5 dark:text-white">An underline drawn with after:</p>
```

មានផងដែរ៖ `placeholder:`, `selection:`, `marker:`, `file:`, `first-line:`, `first-letter:`, `backdrop:` និង `details-content:`។

`marker:` និង `selection:` ក៏ប្រើលើ element ខាងក្នុងដែរ ដូច្នេះ `marker:text-blue-6` លើ `<ul>` ប្តូរពណ៌ចំណុចនៅមុខ item ទាំងអស់។

## Media query និង feature query {#media-and-feature-queries}

| Variant | ប្រើពេល |
| :-- | :-- |
| `motion-safe:` `motion-reduce:` | អ្នកប្រើកំណត់ឱ្យកាត់បន្ថយចលនា ឬអត់ |
| `contrast-more:` `contrast-less:` | ការកំណត់កម្រិតពន្លឺផ្ទុយរបស់អ្នកប្រើ |
| `print:` | ពេលបោះពុម្ព |
| `forced-colors:` `inverted-colors:` | ពណ៌បង្ខំ (high contrast របស់ Windows) ឬពណ៌បញ្ច្រាស |
| `noscript:` | JavaScript ត្រូវបានបិទ |
| `portrait:` `landscape:` | អេក្រង់បញ្ឈរ ឬផ្តេក |
| `pointer-fine:` `pointer-coarse:` `pointer-none:` `any-pointer-fine:` `any-pointer-coarse:` `any-pointer-none:` | ប្រើ mouse, ប្រើម្រាមដៃ ឬគ្មាន pointer |
| `supports-[display:grid]:` `supports-grid:` | `@supports`៖ browser ស្គាល់ declaration ឬ property នោះឬអត់ |
| `starting:` | `@starting-style` សម្រាប់ transition ពេល element លេចចេញ |
| `rtl:` `ltr:` | ទិសសរសេរ |

ដាក់ `not-` ពីមុខ ដើម្បីបញ្ច្រាស៖ `not-print:`, `not-forced-colors:`, `not-dark:`, `not-md:`, `not-supports-[display:grid]:`។

## Container query {#container-queries}

ដាក់ `@container` លើ parent រួចកំណត់ទំហំ element ខាងក្នុងតាមទទឹងរបស់ parent ជំនួសឱ្យទទឹងរបស់ window៖

```html
<div class="@container">
  <div class="flex flex-col @min-[28rem]:flex-row">...</div>
</div>
```

ទំហំទាំងនេះតាមមាត្រដ្ឋាន container ដែលតូចជាងទំហំអេក្រង់៖

| Variant | ចាប់ពី | Variant | ចាប់ពី |
| :-- | :-- | :-- | :-- |
| `@3xs:` | 16rem (256px) | `@xl:` | 36rem (576px) |
| `@2xs:` | 18rem (288px) | `@2xl:` | 42rem (672px) |
| `@xs:` | 20rem (320px) | `@3xl:` | 48rem (768px) |
| `@sm:` | 24rem (384px) | `@4xl:` | 56rem (896px) |
| `@md:` | 28rem (448px) | `@5xl:` | 64rem (1024px) |
| `@lg:` | 32rem (512px) | `@6xl:` | 72rem (1152px) |
|  |  | `@7xl:` | 80rem (1280px) |

`@max-md:` ប្រើពេលតូចជាងទំហំនោះ។ ទទឹងផ្សេងទៀត សូមប្រើ `@min-[...]:` ឬ `@max-[...]:`។

`@container` តាមដានតែទទឹងរបស់ parent។ បើ element ខាងក្នុងត្រូវការកម្ពស់របស់វាផង (សម្រាប់ឯកតា `cqh` និង `cqb`) សូមប្រើ `@container-size`៖ `h-[50cqb]` គឺពាក់កណ្តាលកម្ពស់របស់ container។

បើ container នៅក្នុង container សូមដាក់ឈ្មោះ container ដែលអ្នកចង់ប្រើ៖ `@container/sidebar` លើ parent រួច `@min-[20rem]/sidebar:` លើ element ខាងក្នុង។ ឈ្មោះនោះសំដៅទៅ parent នោះ ទោះ element នៅជាន់ជ្រៅប៉ុណ្ណាក៏ដោយ។

```html
<aside class="@container/sidebar">
  <div class="@container">
    <p class="hidden @min-[20rem]/sidebar:block">Shown when the sidebar is at least 20rem wide</p>
  </div>
</aside>
```

## ផ្សេងៗទៀត៖ arbitrary variant {#anything-else-arbitrary-variants}

សរសេរ selector ក្នុងតង្កៀបការ៉េ ដោយ `&` តំណាងឱ្យ element ខ្លួនឯង៖

```html
<ul class="[&>li]:mt-2 [&_a]:underline [.dark_&]:text-white"></ul>
```

`[&>li]:mt-2` រចនា `li` ដែលនៅខាងក្នុងជាន់ទីមួយ, `[&_a]:` រចនាតំណភ្ជាប់គ្រប់ជាន់ខាងក្នុង ហើយ `[.dark_&]:` ប្រើពេល parent ណាមួយមាន class `dark`។

Media query, feature query ឬ container query ក៏សរសេរបែបនេះបានដែរ ដោយសរសេរពេញនៅក្រោយ `@`៖ `[@media(min-resolution:2dppx)]:`, `[@supports(selector(:has(a)))]:`, `[@container(min-width:300px)]:`។

## លើ React Native {#on-react-native}

App ទូរស័ព្ទគ្មាន CSS ទេ ដូច្នេះ React Native ប្រើ variant ខាងលើភាគច្រើនមិនបានទេ។ Variant ដែលប្រើបាន៖

| Variant | លើ React Native មានន័យថា |
| :-- | :-- |
| `dark:` | ទូរស័ព្ទ (ឬ app របស់អ្នក) កំពុងនៅក្នុង dark mode |
| `sm:` `md:` `lg:` `xl:` `2xl:`, ទំហំដែលអ្នកបន្ថែម, `max-md:`, `min-[500px]:` | Window របស់ app ធំជាង (ឬបើប្រើ `max-` គឺតូចជាង) ទទឹងនោះ។ ទទឹងក្នុងតង្កៀបត្រូវតែជា `px` ឬ `rem` |
| `active:` | កំពុងចុច `Pressable` |
| `hover:` | Mouse ឬ trackpad កំពុងនៅលើ element។ លើអេក្រង់ប៉ះ វាមិនដែលប្រើទេ |
| `focus:` | Element កំពុង focus |
| `disabled:` | Element មាន prop `disabled` |
| `data-[state=open]:`, `aria-selected:` និង variant `data-` និង `aria-` ផ្សេងទៀត | Element មាន prop `data-` ឬ `aria-` នោះ |

`not-` ប្រើបានពីមុខ `dark:` និងទំហំអេក្រង់៖ `not-dark:`, `not-md:`។

`disabled:`, `data-` និង `aria-` មើលតែ prop **របស់ element ខ្លួនឯង** ប៉ុណ្ណោះ។ ក្នុង `<Pressable disabled><Text className="disabled:text-gray-5">` ធាតុ `Text` គ្មាន prop `disabled` ទេ ដូច្នេះគ្មានអ្វីប្តូរ។ សូមដាក់ `disabled` លើ `Text` ផង៖ `<Text disabled className="disabled:text-gray-5">`។

Variant ផ្សេងទៀតទាំងអស់ក្នុងទំព័រនេះ គ្មានប្រសិទ្ធភាពលើ React Native ហើយក៏គ្មាន error ដែរ៖ `group-*`, `peer-*`, `has-*`, `in-*`, `*:` និង `**:`, ស្ថានភាពទីតាំង (`first:`, `odd:` ជាដើម), ស្ថានភាព form ក្រៅពី `disabled:`, `before:`, `after:` និង pseudo-element ផ្សេងៗ, media query និង feature query, container query និង arbitrary variant។ ប៉ុន្តែនៅលើ Expo Web ពួកវាប្រើបានទាំងអស់ ព្រោះ Expo Web ប្រើ engine របស់ web។

បើ class ពីរកំណត់របស់ដូចគ្នា class ដែលមាន variant ត្រូវលក្ខខណ្ឌច្រើនជាង ត្រូវយកមកប្រើ មិនថាសរសេរលំដាប់ណាទេ៖ `dark:bg-black bg-white` ក្នុង dark mode ជាពណ៌ខ្មៅ ដូចលើ web ដែរ។
