---
title: Flexbox & Grid
description: ទិសតម្រៀប ការចុះបន្ទាត់ grow និង shrink ជួរឈរ និងជួរដេករបស់ grid, gap និង utility justify, align, place ទាំងអស់ សម្រាប់រៀប element ខាងក្នុង។
---

ដាក់ `flex` ដើម្បីចាប់ផ្តើម flex layout ឬ `grid` ដើម្បីចាប់ផ្តើម grid (មើលនៅ [Display](/layout#display))។ បន្ទាប់មក class ក្នុងទំព័រនេះកំណត់ថា element ខាងក្នុងតម្រៀបយ៉ាងដូចម្តេច។

## Flex direction {#flex-direction}

ទិសដែល element ខាងក្នុងតម្រៀប។ `-reverse` បញ្ច្រាសលំដាប់។

::classes flex-row flex-row-reverse flex-col flex-col-reverse

```preview
<div class="grid gap-4 sm:grid-cols-2">
  <div class="flex flex-row gap-2 rounded-xl bg-gray-1 p-3 dark:bg-gray-9">
    <div class="grid size-12 place-items-center rounded-lg bg-sky-6 font-semibold text-white">1</div>
    <div class="grid size-12 place-items-center rounded-lg bg-sky-6 font-semibold text-white">2</div>
    <div class="grid size-12 place-items-center rounded-lg bg-sky-6 font-semibold text-white">3</div>
  </div>
  <div class="flex flex-row-reverse gap-2 rounded-xl bg-gray-1 p-3 dark:bg-gray-9">
    <div class="grid size-12 place-items-center rounded-lg bg-violet-6 font-semibold text-white">1</div>
    <div class="grid size-12 place-items-center rounded-lg bg-violet-6 font-semibold text-white">2</div>
    <div class="grid size-12 place-items-center rounded-lg bg-violet-6 font-semibold text-white">3</div>
  </div>
</div>
```

## Flex wrap {#flex-wrap}

ពេលកន្លែងមិនគ្រប់ តើ element ខាងក្នុងចុះបន្ទាត់ថ្មីឬអត់។

::classes flex-wrap flex-nowrap flex-wrap-reverse

```preview
<div class="flex max-w-sm flex-wrap gap-2">
  <span class="rounded-full bg-sky-2 px-3 py-1 text-sm font-medium text-sky-10 dark:bg-sky-10 dark:text-sky-2">React</span>
  <span class="rounded-full bg-sky-2 px-3 py-1 text-sm font-medium text-sky-10 dark:bg-sky-10 dark:text-sky-2">React Native</span>
  <span class="rounded-full bg-sky-2 px-3 py-1 text-sm font-medium text-sky-10 dark:bg-sky-10 dark:text-sky-2">Expo</span>
  <span class="rounded-full bg-sky-2 px-3 py-1 text-sm font-medium text-sky-10 dark:bg-sky-10 dark:text-sky-2">Next.js</span>
  <span class="rounded-full bg-sky-2 px-3 py-1 text-sm font-medium text-sky-10 dark:bg-sky-10 dark:text-sky-2">Vite</span>
  <span class="rounded-full bg-sky-2 px-3 py-1 text-sm font-medium text-sky-10 dark:bg-sky-10 dark:text-sky-2">Plain HTML</span>
</div>
```

## Flex, grow និង shrink {#flex-grow-and-shrink}

`flex-1` ឱ្យ element ពង្រីក ឬបង្រួម ដើម្បីចែកកន្លែងគ្នា។ `flex-none` រក្សាទំហំរបស់វាដដែល។ `grow` កំណត់តែការពង្រីក ហើយ `shrink` កំណត់តែការបង្រួម។

::classes flex-1 flex-auto flex-initial flex-none grow grow-0 shrink shrink-0

```preview
<div class="space-y-2 text-sm font-medium text-white">
  <div class="flex gap-2">
    <div class="flex-none rounded-lg bg-gray-7 px-4 py-2">flex-none</div>
    <div class="flex-1 rounded-lg bg-sky-6 px-4 py-2">flex-1</div>
    <div class="flex-1 rounded-lg bg-sky-6 px-4 py-2">flex-1</div>
  </div>
  <div class="flex gap-2">
    <div class="flex-none rounded-lg bg-gray-7 px-4 py-2">flex-none</div>
    <div class="grow rounded-lg bg-violet-6 px-4 py-2">grow</div>
    <div class="flex-none rounded-lg bg-gray-7 px-4 py-2">flex-none</div>
  </div>
</div>
```

## Flex basis {#flex-basis}

ទំហំដំបូងរបស់ element មុនពេលពង្រីក ឬបង្រួម៖ ជាលេខគម្លាត ប្រភាគ `full` ឬទំហំ container ដូចជា `basis-xs`។

::classes basis-0 basis-4 basis-64 basis-1/2 basis-1/3 basis-full basis-auto basis-3xs basis-xs basis-[12rem]

## Order {#order}

ប្តូរលំដាប់ element ឱ្យមកមុន ឬទៅក្រោយ ដោយមិនបាច់កែ HTML។

::classes order-1 order-2 order-first order-last order-none -order-1

```preview
<div class="flex gap-2 text-sm font-semibold text-white">
  <div class="grid size-12 place-items-center rounded-lg bg-sky-6">1</div>
  <div class="order-last grid size-12 place-items-center rounded-lg bg-rose-6">2</div>
  <div class="grid size-12 place-items-center rounded-lg bg-sky-6">3</div>
  <div class="order-first grid size-12 place-items-center rounded-lg bg-amber-6">4</div>
</div>
```

## Grid template columns {#grid-template-columns}

Grid មានប៉ុន្មានជួរឈរ។ `grid-cols-3` បង្កើតបីជួរឈរស្មើៗគ្នា។ ក្នុងតង្កៀបការ៉េ អ្នកអាចកំណត់ទំហំជួរឈរតាមចិត្ត ដូចជា `grid-cols-[200px_1fr]`។

::classes grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 grid-cols-6 grid-cols-12 grid-cols-none grid-cols-subgrid grid-cols-[200px_1fr]

```preview
<div class="grid grid-cols-3 gap-3 text-sm font-semibold text-white">
  <div class="rounded-lg bg-sky-6 py-4 text-center">1</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">2</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">3</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">4</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">5</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">6</div>
</div>
```

## Grid column span, start និង end {#grid-column-span-start-and-end}

Element មួយគ្របប៉ុន្មានជួរឈរ ឬចាប់ផ្តើម និងបញ្ចប់នៅបន្ទាត់ណាពិតប្រាកដ។

::classes col-span-1 col-span-2 col-span-3 col-span-full col-start-1 col-start-2 col-end-3 col-end-4 col-auto

```preview
<div class="grid grid-cols-4 gap-3 text-sm font-semibold text-white">
  <div class="col-span-2 rounded-lg bg-violet-6 py-4 text-center">col-span-2</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">1</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">1</div>
  <div class="col-start-2 col-end-5 rounded-lg bg-pink-6 py-4 text-center">col-start-2 col-end-5</div>
  <div class="col-span-full rounded-lg bg-amber-6 py-4 text-center">col-span-full</div>
</div>
```

## Grid template rows {#grid-template-rows}

Grid មានប៉ុន្មានជួរដេក សម្រាប់ grid ដែលបំពេញតាមជួរឈរមុន ឬត្រូវការជួរដេកចំនួនថេរ។

::classes grid-rows-1 grid-rows-2 grid-rows-3 grid-rows-6 grid-rows-none grid-rows-subgrid grid-rows-[auto_1fr_auto]

## Grid row span, start និង end {#grid-row-span-start-and-end}

ដូច column span ដែរ តែសម្រាប់ជួរដេក។

::classes row-span-1 row-span-2 row-span-full row-start-1 row-start-2 row-end-3 row-auto

```preview
<div class="grid grid-flow-col grid-rows-3 gap-3 text-sm font-semibold text-white">
  <div class="row-span-3 grid place-items-center rounded-lg bg-violet-6 p-4">row-span-3</div>
  <div class="col-span-2 rounded-lg bg-sky-6 p-4 text-center">col-span-2</div>
  <div class="col-span-2 row-span-2 grid place-items-center rounded-lg bg-pink-6 p-4">col-span-2 row-span-2</div>
</div>
```

## Grid auto flow {#grid-auto-flow}

Element ដែលមិនបានកំណត់ទីតាំង ចូលបំពេញ grid តាមរបៀបណា៖ តាមជួរដេក តាមជួរឈរ និងថាតើត្រូវបំពេញចន្លោះទំនេរខាងមុខវិញឬអត់ (`dense`)។

::classes grid-flow-row grid-flow-col grid-flow-dense grid-flow-row-dense grid-flow-col-dense

## Grid auto columns និង rows {#grid-auto-columns-and-rows}

ទំហំរបស់ជួរឈរ និងជួរដេកដែល grid បង្កើតខ្លួនឯង។

::classes auto-cols-auto auto-cols-min auto-cols-max auto-cols-fr auto-rows-auto auto-rows-min auto-rows-max auto-rows-fr

## Gap {#gap}

គម្លាតរវាងជួរដេក និងជួរឈរ ប្រើបានទាំង flex និង grid។ `gap-x-*` និង `gap-y-*` កំណត់តែមួយទិស។

::classes gap-0 gap-1 gap-2 gap-4 gap-8 gap-x-4 gap-y-2 gap-[10px]

```preview
<div class="grid grid-cols-3 gap-x-8 gap-y-3 text-sm font-semibold text-white">
  <div class="rounded-lg bg-sky-6 py-3 text-center">1</div>
  <div class="rounded-lg bg-sky-6 py-3 text-center">2</div>
  <div class="rounded-lg bg-sky-6 py-3 text-center">3</div>
  <div class="rounded-lg bg-sky-6 py-3 text-center">4</div>
  <div class="rounded-lg bg-sky-6 py-3 text-center">5</div>
  <div class="rounded-lg bg-sky-6 py-3 text-center">6</div>
</div>
```

## Justify content {#justify-content}

Element ខាងក្នុងនៅត្រង់ណា តាមទិសដែលវាតម្រៀប (ពីឆ្វេងទៅស្តាំក្នុងជួរដេក ពីលើចុះក្រោមក្នុងជួរឈរ) ហើយកន្លែងទំនេរចែកគ្នាយ៉ាងដូចម្តេច។

::classes justify-start justify-end justify-center justify-between justify-around justify-evenly justify-stretch justify-normal

```preview
<div class="space-y-3 text-sm font-semibold text-white">
  <div class="flex justify-start gap-2 rounded-xl bg-gray-1 p-2 dark:bg-gray-9"><div class="rounded-lg bg-sky-6 px-4 py-2">01</div><div class="rounded-lg bg-sky-6 px-4 py-2">02</div><div class="rounded-lg bg-sky-6 px-4 py-2">03</div></div>
  <div class="flex justify-center gap-2 rounded-xl bg-gray-1 p-2 dark:bg-gray-9"><div class="rounded-lg bg-violet-6 px-4 py-2">01</div><div class="rounded-lg bg-violet-6 px-4 py-2">02</div><div class="rounded-lg bg-violet-6 px-4 py-2">03</div></div>
  <div class="flex justify-between rounded-xl bg-gray-1 p-2 dark:bg-gray-9"><div class="rounded-lg bg-pink-6 px-4 py-2">01</div><div class="rounded-lg bg-pink-6 px-4 py-2">02</div><div class="rounded-lg bg-pink-6 px-4 py-2">03</div></div>
  <div class="flex justify-evenly rounded-xl bg-gray-1 p-2 dark:bg-gray-9"><div class="rounded-lg bg-amber-6 px-4 py-2">01</div><div class="rounded-lg bg-amber-6 px-4 py-2">02</div><div class="rounded-lg bg-amber-6 px-4 py-2">03</div></div>
</div>
```

## Justify items និង self {#justify-items-and-self}

Element ក្នុង grid នៅត្រង់ណាក្នុងក្រឡារបស់វា តាមបណ្តោយជួរដេក។ `justify-self-*` កំណត់សម្រាប់ element តែមួយ។

::classes justify-items-start justify-items-end justify-items-center justify-items-stretch justify-items-normal justify-self-auto justify-self-start justify-self-center justify-self-end justify-self-stretch

## Align content {#align-content}

ពេល element ខាងក្នុងចុះបន្ទាត់ច្រើនបន្ទាត់៖ បន្ទាត់ទាំងនោះនៅត្រង់ណា បើនៅមានកន្លែងទំនេរ។

::classes content-normal content-start content-center content-end content-between content-around content-evenly content-stretch

## Align items និង self {#align-items-and-self}

Element ខាងក្នុងនៅត្រង់ណា តាមទិសកាត់ទិសតម្រៀប៖ ក្នុងជួរដេក គឺពីលើចុះក្រោម។ `self-*` កំណត់សម្រាប់ element តែមួយ។

::classes items-start items-end items-center items-baseline items-stretch self-auto self-start self-center self-end self-stretch self-baseline

```preview
<div class="flex h-32 items-center gap-2 rounded-xl bg-gray-1 p-2 text-sm font-semibold text-white dark:bg-gray-9">
  <div class="rounded-lg bg-sky-6 px-4 py-2">center</div>
  <div class="self-start rounded-lg bg-violet-6 px-4 py-2">self-start</div>
  <div class="self-end rounded-lg bg-pink-6 px-4 py-2">self-end</div>
  <div class="self-stretch rounded-lg bg-amber-6 px-4 py-2">self-stretch</div>
</div>
```

## Place content, items និង self {#place-content-items-and-self}

`place-*` កំណត់ទាំង align និង justify ក្នុងពេលតែមួយ៖ `place-items-center` ដាក់ element នីមួយៗក្នុង grid នៅចំកណ្តាលក្រឡារបស់វា ទាំងទទឹង ទាំងកម្ពស់។

::classes place-content-center place-content-start place-content-between place-content-stretch place-items-start place-items-center place-items-stretch place-self-auto place-self-center place-self-end

```preview
<div class="grid h-36 place-items-center rounded-xl bg-gray-1 dark:bg-gray-9">
  <div class="rounded-lg bg-sky-6 px-4 py-2 text-sm font-semibold text-white">place-items-center</div>
</div>
```
