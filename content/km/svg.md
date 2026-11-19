---
title: SVG
description: ពណ៌ fill, ពណ៌ stroke និងកម្រាស់ stroke សម្រាប់ icon និងរូបរាង SVG។
---

## Fill {#fill}

ពណ៌នៅខាងក្នុងរូបរាង។ `fill-current` ប្រើពណ៌អក្សរ ដូច្នេះ icon ប្តូរពណ៌តាម `text-*` (ព្រមទាំង `hover:`, `dark:`) ដូចអក្សរដែរ។

::classes fill-none fill-current fill-sky-6 fill-sky-6/50 fill-black fill-white

```preview
<div class="flex items-center gap-6">
  <svg viewBox="0 0 24 24" class="size-10 fill-sky-6"><path d="M12 2 15 9l7 .5-5.5 4.5L18 21l-6-3.8L6 21l1.5-7L2 9.5 9 9z"/></svg>
  <svg viewBox="0 0 24 24" class="size-10 fill-pink-6/50"><path d="M12 2 15 9l7 .5-5.5 4.5L18 21l-6-3.8L6 21l1.5-7L2 9.5 9 9z"/></svg>
  <button class="text-gray-6 transition-colors hover:text-amber-5"><svg viewBox="0 0 24 24" class="size-10 fill-current"><path d="M12 2 15 9l7 .5-5.5 4.5L18 21l-6-3.8L6 21l1.5-7L2 9.5 9 9z"/></svg></button>
</div>
```

## Stroke {#stroke}

ពណ៌បន្ទាត់គែមរបស់រូបរាង។ `stroke-current` ប្រើពណ៌អក្សរ ដែលគេនិយមប្រើសម្រាប់ icon បែបបន្ទាត់។

::classes stroke-none stroke-current stroke-sky-6 stroke-black stroke-white

## Stroke width {#stroke-width}

លេខធម្មតា គិតជាឯកតារបស់ SVG (ធំ ឬតូចតាម icon)។ ក្នុងតង្កៀបការ៉េ ដាក់តម្លៃណាក៏បាន ឧទាហរណ៍ `stroke-[1.5]`។

::classes stroke-0 stroke-1 stroke-2 stroke-[1.5] stroke-[3]

```preview
<div class="flex items-center gap-6 text-sky-6">
  <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" class="size-10 stroke-current stroke-1"><path d="M3 12h18M12 3v18"/><circle cx="12" cy="12" r="9"/></svg>
  <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" class="size-10 stroke-current stroke-[1.5]"><path d="M3 12h18M12 3v18"/><circle cx="12" cy="12" r="9"/></svg>
  <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" class="size-10 stroke-current stroke-2"><path d="M3 12h18M12 3v18"/><circle cx="12" cy="12" r="9"/></svg>
  <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" class="size-10 stroke-violet-6 stroke-[3]"><path d="M3 12h18M12 3v18"/><circle cx="12" cy="12" r="9"/></svg>
</div>
```
