---
title: Backgrounds
description: ពណ៌ផ្ទៃខាងក្រោយ, gradient បែប linear, radial និង conic ព្រមទាំងពណ៌ក្នុង gradient និង background size, position, repeat, clip, origin, attachment។
---

## Background color {#background-color}

ពណ៌ទាំងអស់ក្នុងតារាងពណ៌ មាន 12 កម្រិត ហើយប្រើសញ្ញា `/` ដើម្បីធ្វើឱ្យថ្លា។ តារាងពណ៌ពេញលេញមាននៅ [ពណ៌](/colors)។

::classes bg-black bg-white bg-gray-{1,2,3,6,9,12} bg-sky-{1..12} bg-sky-6/50 bg-inherit bg-current bg-transparent bg-[#c7a25d]

```preview
<div class="flex flex-wrap gap-3">
  <div class="size-16 rounded-xl bg-sky-2"></div>
  <div class="size-16 rounded-xl bg-sky-4"></div>
  <div class="size-16 rounded-xl bg-sky-6"></div>
  <div class="size-16 rounded-xl bg-sky-8"></div>
  <div class="size-16 rounded-xl bg-sky-10"></div>
  <div class="size-16 rounded-xl bg-sky-6/50"></div>
  <div class="size-16 rounded-xl bg-sky-6/20"></div>
</div>
```

## Gradients {#gradients}

`bg-linear-to-*` គូរ gradient ត្រង់តាមទិសមួយ (`bg-linear-45` ប្រើជាមុំ)។ `bg-radial` និង `bg-conic` ជារាងពីរផ្សេងទៀត។ ពណ៌របស់ gradient កំណត់ដោយ class ក្នុងផ្នែកខាងក្រោម។

::classes bg-linear-to-t bg-linear-to-tr bg-linear-to-r bg-linear-to-br bg-linear-to-b bg-linear-to-bl bg-linear-to-l bg-linear-to-tl bg-linear-45 bg-linear-[25deg] bg-radial bg-radial-[at_25%_25%] bg-conic bg-conic-180 bg-none

```preview
<div class="grid grid-cols-3 gap-4">
  <div class="h-24 rounded-xl bg-linear-to-r from-sky-4 to-violet-6"></div>
  <div class="h-24 rounded-xl bg-radial from-amber-3 to-rose-6"></div>
  <div class="h-24 rounded-xl bg-conic from-emerald-4 via-sky-5 to-emerald-4"></div>
</div>
```

## Gradient color stops {#gradient-color-stops}

`from-*` កំណត់ពណ៌ចាប់ផ្តើម, `to-*` ពណ៌បញ្ចប់ ហើយ `via-*` ពណ៌នៅកណ្តាល។ ដាក់ភាគរយ ដើម្បីប្តូរទីតាំងរបស់ពណ៌នីមួយៗ។

::classes from-sky-4 via-violet-5 to-pink-6 from-transparent to-white/0 from-10% via-30% to-90%

```preview
<div class="space-y-3">
  <div class="h-12 rounded-xl bg-linear-to-r from-sky-4 to-pink-6"></div>
  <div class="h-12 rounded-xl bg-linear-to-r from-sky-4 via-violet-5 to-pink-6"></div>
  <div class="h-12 rounded-xl bg-linear-to-r from-sky-4 from-10% via-violet-5 via-30% to-pink-6 to-90%"></div>
</div>
```

## Background clip {#background-clip}

កំណត់ថាផ្ទៃខាងក្រោយលាតដល់ត្រឹមណា។ `bg-clip-text` លាបពណ៌តែនៅពីក្រោយតួអក្សរប៉ុណ្ណោះ៖ ប្រើជាមួយ `text-transparent` ដើម្បីបានអក្សរពណ៌ gradient។

::classes bg-clip-border bg-clip-padding bg-clip-content bg-clip-text

```preview
<p class="bg-linear-to-r from-amber-5 via-orange-6 to-rose-6 bg-clip-text text-5xl font-black tracking-tight text-transparent">Kbach</p>
```

## Background size {#background-size}

::classes bg-auto bg-cover bg-contain bg-size-[200px_100px]

## Background position {#background-position}

::classes bg-top bg-bottom bg-center bg-left bg-right bg-top-left bg-top-right bg-bottom-left bg-bottom-right bg-position-[center_top_1rem]

## Background repeat {#background-repeat}

::classes bg-repeat bg-no-repeat bg-repeat-x bg-repeat-y bg-repeat-space bg-repeat-round

```preview
<div class="grid grid-cols-2 gap-4">
  <div class="h-28 rounded-xl bg-gray-1 bg-[url(/kbach-logo-128.png)] bg-size-[40px_40px] bg-repeat dark:bg-gray-9"></div>
  <div class="h-28 rounded-xl bg-gray-1 bg-[url(/kbach-logo-128.png)] bg-size-[56px_56px] bg-center bg-no-repeat dark:bg-gray-9"></div>
</div>
```

## Background origin និង attachment {#background-origin-and-attachment}

Origin កំណត់ថាផ្ទៃខាងក្រោយចាប់ផ្តើមពីណា (ពី border, ពី padding ឬពីប្រអប់មាតិកា)។ Attachment កំណត់ថាវា scroll ទៅតាមប្រអប់ (`bg-scroll`), ទៅតាមមាតិកាក្នុងប្រអប់ (`bg-local`) ឬនៅនឹងមួយកន្លែង (`bg-fixed`)។

::classes bg-origin-border bg-origin-padding bg-origin-content bg-fixed bg-local bg-scroll

## Background image {#background-image}

រូបភាពណាក៏បាន ដោយដាក់ URL ក្នុងតង្កៀបការ៉េ។ បើប្រើ `var()` សូមប្រាប់ប្រភេទតម្លៃ ដើម្បីឱ្យវាជារូបភាព មិនមែនពណ៌៖ `bg-[image:var(--hero)]`។

::classes bg-[url(/img/hero.png)] bg-none
