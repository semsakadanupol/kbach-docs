---
title: ចាប់ផ្តើមរហ័ស
nav: ចាប់ផ្តើមរហ័ស
description: បង្កើតកាតប្រវត្តិរូបម្តងមួយជំហាន ហើយរៀនមូលដ្ឋានគ្រឹះរបស់ Kbach ក្នុងពេលជាមួយគ្នា។ ចំណាយពេលប្រហែល 10 នាទី។
---

នៅក្នុងមេរៀននេះ អ្នកនឹងបង្កើតកាតខាងក្រោម ម្តងមួយជំហាន៖

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

សូមដំឡើង Kbach ជាមុនសិន (មើល [ការដំឡើង](/installation))។ កូដក្នុងមេរៀននេះសរសេរជា React សម្រាប់ web។ នៅខាងចុង យើងនឹងបង្ហាញថាត្រូវកែអ្វីខ្លះ បើប្រើ React Native ឬទំព័រ HTML ធម្មតា។

## 1. ចាប់ផ្តើមពីមាតិកាសុទ្ធ {#start-with-plain-content}

ដំបូងយើងមិនទាន់ដាក់ class ទេ។ មានតែមាតិកា ហើយ browser បង្ហាញវាតាមរបៀបលំនាំដើមរបស់វា។

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

## 2. ធ្វើឱ្យទៅជាកាត {#make-it-a-card}

ដាក់ផ្ទៃខាងក្រោយពណ៌ស គម្លាតខាងក្នុង ជ្រុងមូល និងស្រមោលលើប្រអប់ខាងក្រៅ។ មួយ class សម្រាប់មួយចំណុច៖

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

| Class | តួនាទី |
| :-- | :-- |
| `max-w-md` | កាតធំបំផុតត្រឹម 28rem (448px) |
| `rounded-2xl` | ជ្រុងមូល 16px |
| `bg-white` | ផ្ទៃខាងក្រោយពណ៌ស |
| `p-6` | គម្លាត 24px ពីគែមចូលខាងក្នុង គ្រប់ជ្រុង |
| `shadow-lg` | ស្រមោលធំ និងស្រទន់ នៅពីក្រោមកាត |

លេខក្នុង class គម្លាតកើនម្តង 4px៖ `p-1` ស្មើ 4px, `p-4` ស្មើ 16px, `p-6` ស្មើ 24px។ លេខទាំងនេះប្រើដូចគ្នាសម្រាប់ margin, gap, ទទឹង និងកម្ពស់។

## 3. តម្រៀបជាជួរដេក {#put-things-in-a-row}

`flex` តម្រៀប element ខាងក្នុងជាជួរដេក។ `items-center` តម្រឹមពួកវាឱ្យនៅចំកណ្តាលតាមកម្ពស់ ហើយ `gap-4` ទុកគម្លាត 16px នៅចន្លោះពួកវា។

```tsx {2}
<div className="max-w-md rounded-2xl bg-white p-6 shadow-lg">
  <div className="flex items-center gap-4">
    <div>S</div>
    <div className="flex-1">…</div>
    <button>Follow</button>
  </div>
</div>
```

ដាក់ `flex-1` លើផ្នែកកណ្តាល ដើម្បីឱ្យវាពង្រីកយកកន្លែងទំនេរដែលនៅសល់ទាំងអស់។ ធ្វើបែបនេះ ប៊ូតុងត្រូវរុញទៅជាប់គែមខាងស្តាំ។

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

## 4. រចនាអក្សរ និងរូបតំណាង {#style-the-text-and-the-avatar}

```tsx
<div className="grid size-16 place-items-center rounded-full bg-amber-5 text-2xl font-bold text-white">S</div>
<div className="flex-1">
  <p className="text-lg font-semibold text-gray-12">Sokha Chan</p>
  <p className="text-sm text-gray-7">Designer in Phnom Penh</p>
</div>
```

- `size-16` ធ្វើឱ្យរូបតំណាងធំ 64px ទាំងទទឹង ទាំងកម្ពស់។ `rounded-full` ធ្វើឱ្យវាទៅជារង្វង់ ហើយ `grid place-items-center` ដាក់អក្សរនៅចំកណ្តាល។
- `text-lg` និង `text-sm` កំណត់ទំហំអក្សរ។ `font-semibold` និង `font-bold` កំណត់កម្រិតដិត។
- `bg-amber-5`, `text-gray-12` និង `text-gray-7` ជា class ពណ៌។ ពណ៌នីមួយៗមាន 12 កម្រិត ចាប់ពី `1` (ស្រាលបំផុត) ដល់ `12` (ដិតបំផុត)។ មើលបន្ថែមនៅ [ពណ៌](/colors)។

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

## 5. ឱ្យប៊ូតុងឆ្លើយតប {#make-the-button-respond}

បើដាក់ `hover:` នៅពីមុខ class, class នោះមានប្រសិទ្ធភាពតែពេលដាក់ mouse លើ element ប៉ុណ្ណោះ។ ប៊ូតុងខាងក្រោមប្តូរទៅពណ៌ខៀវចាស់ពេល hover ហើយ `transition-colors` ធ្វើឱ្យការប្តូរពណ៌នោះរលូន៖

```tsx
<button className="rounded-lg bg-blue-6 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-7">
  Follow
</button>
```

```preview
<button class="rounded-lg bg-blue-6 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-7">Follow</button>
```

យើងហៅ `hover:` ថា **variant**៖ ជាពាក្យដាក់ពីមុខ class ដើម្បីប្រាប់ថា class នោះប្រើ *ពេលណា*។ ក្រៅពី hover នៅមាន variant សម្រាប់ពេល focus, ពេល element ត្រូវបិទ (disabled), សម្រាប់ទំហំអេក្រង់ និងសម្រាប់ dark mode ទៀត។ មើលបន្ថែមនៅ [Variants](/variants)។

## 6. ឱ្យសមនឹងអេក្រង់តូច {#fit-small-screens}

លើទូរស័ព្ទ ការតម្រៀបជាជួរដេកចង្អៀតពេក។ ដូច្នេះលើអេក្រង់តូច យើងតម្រៀបពីលើចុះក្រោមវិញ ហើយប្រើជួរដេកតែលើអេក្រង់ចាប់ពី 640px ឡើងទៅ៖

```tsx
<div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
```

`flex-col` តម្រៀប element ខាងក្នុងពីលើចុះក្រោម។ `sm:flex-row` មានន័យថា "ចាប់ពីអេក្រង់ទំហំ `sm` (640px) ឡើងទៅ ត្រូវតម្រៀបជាជួរដេក"។ Class ដែលគ្មានពាក្យទំហំអេក្រង់នៅពីមុខ ប្រើលើគ្រប់អេក្រង់ ចំណែក class ដែលមាន ប្រើជំនួសវិញចាប់ពីទទឹងនោះឡើងទៅ។ ហេតុនេះហើយបានជាគេរចនាសម្រាប់អេក្រង់តូចមុន រួចទើបបន្ថែមអ្វីដែលត្រូវប្តូរនៅលើអេក្រង់ធំ។

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

សាកបង្រួម window របស់ browser ឱ្យតូចជាង 640px នោះកាតនឹងប្តូរទៅតម្រៀបពីលើចុះក្រោម។ ឬសាកនៅក្នុង [Playground](/playground) ដែលមានអេក្រង់ទំហំទូរស័ព្ទស្រាប់។

## 7. បន្ថែម dark mode {#add-dark-mode}

Class ដែលមាន `dark:` នៅពីមុខ ប្រើតែពេលនៅក្នុង dark mode ប៉ុណ្ណោះ។ ក្នុង dark mode យើងចង់ឱ្យកាតមានផ្ទៃខាងក្រោយងងឹត និងអក្សរភ្លឺ៖

```tsx
<div className="max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-10">
  …
  <p className="text-lg font-semibold text-gray-12 dark:text-white">Sokha Chan</p>
  <p className="text-sm text-gray-7 dark:text-gray-4">Designer in Phnom Penh</p>
```

សាកប្តូរ theme របស់គេហទំព័រនេះ (រូបព្រះអាទិត្យ និងព្រះច័ន្ទនៅខាងលើ) ដើម្បីមើលលទ្ធផល។ ជាលំនាំដើម dark mode ប្តូរតាមការកំណត់របស់ឧបករណ៍។ បើចង់មានប៊ូតុងប្តូរផ្ទាល់ខ្លួន មើលនៅ [Dark mode](/dark-mode)។

កាតនៅដើមទំព័រនេះ គឺជាលទ្ធផលចុងក្រោយ។

## សម្រាប់ React Native និង HTML ធម្មតា {#on-react-native-and-in-plain-html}

Class នៅដដែល មានតែឈ្មោះ element ទេដែលខុសគ្នា៖

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

លើ React Native មានចំណុចបីដែលខុសគ្នា៖

- អក្សរត្រូវនៅក្នុង `<Text>` ជានិច្ច ដូច្នេះ class អក្សរត្រូវដាក់លើ `Text` មិនមែនលើ `View` ទេ។
- `View` តម្រៀបពីលើចុះក្រោមស្រាប់ ដូច្នេះបើចង់បានជួរដេកត្រូវប្រើ `flex-row` (លើ web គ្រាន់តែ `flex` ក៏បានជួរដេកហើយ)។
- React Native គ្មាន grid ទេ ដូច្នេះត្រូវដាក់អក្សរកណ្តាលរូបតំណាងដោយ `items-center justify-center` វិញ។ ហើយអេក្រង់ប៉ះក៏គ្មាន hover ដែរ៖ ប្រើ `active:` សម្រាប់ពេលកំពុងចុច `Pressable`។

ចំណែក HTML ធម្មតា គ្រាន់តែសរសេរ `class` ជំនួស `className` ក្រៅពីនោះដូចគ្នាទាំងអស់។

## សរុបមេរៀន {#what-you-learned}

- Class នីមួយៗមានតួនាទីតែមួយ ហើយយើងដាក់វាច្រើនរួមគ្នាលើ element។
- លេខគម្លាត និងទំហំ កើនម្តង 4px។
- ពណ៌នីមួយៗមាន 12 កម្រិត ពី `1` (ស្រាលបំផុត) ដល់ `12` (ដិតបំផុត)។
- Variant ដូចជា `hover:`, `sm:` ឬ `dark:` ប្រាប់ថា class ប្រើពេលណា។

ជំហានបន្ទាប់ សូមអាន [របៀបដែល Kbach ដំណើរការ](/how-it-works) ដើម្បីយល់ថា class របស់អ្នកក្លាយជា style ដោយរបៀបណា ឬបើកមើល [Utilities](/layout) ដើម្បីរក class ដែលអ្នកត្រូវការ។
