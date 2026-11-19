---
title: React Native
description: Kbach ដំណើរការយ៉ាងដូចម្តេចក្នុង app React Native ឬ Expo, ឧបករណ៍នីមួយៗប្រើ engine មួយណា និង class ណាខ្លះប្រើបានពិតប្រាកដលើទូរស័ព្ទ។
---

លើ React Native, Kbach គឺ package `@kbach/react-native`។ របៀបរៀបចំ មាននៅទំព័រ [ការដំឡើង](/installation?tab=react-native)។

## ដំណើរការយ៉ាងដូចម្តេច {#how-it-works}

React Native គ្មាន CSS ទេ។ Element នីមួយៗប្រើ style object ជំនួសវិញ ដូចជា `{ padding: 16, borderRadius: 12 }`។ Babel plugin របស់ Kbach ធ្វើឱ្យ `className` ប្រើបានលើ element របស់ React Native ហើយពេល element render, Kbach បំប្លែង class ទៅជា style object នោះ។

```tsx
<View className="rounded-xl bg-white p-4 shadow-md">
  <Text className="text-lg font-semibold text-gray-12">Hello</Text>
</View>
```

ដោយសារ Kbach បំប្លែង class ពេល app កំពុងរត់ class ដែលផ្គុំពីបំណែកៗក៏ប្រើបាន៖ `className={'bg-' + color + '-6'}`។ មិនបាច់ស្កេន ហើយក៏មិនបាច់រៀបចំអ្វីបន្ថែមដែរ។

## ឧបករណ៍នីមួយៗប្រើ engine មួយណា {#which-engine-runs}

| App រត់លើ | Engine |
| :-- | :-- |
| Android៖ build សម្រាប់ development, build សម្រាប់ release ឬ React Native CLI | Rust engine តាមរយៈ native module។ ក្រោយដំឡើង ត្រូវ build app ឡើងវិញម្តង |
| iOS មិនថា build បែបណា | Engine ជំនាន់ JavaScript |
| Expo Go | Engine ជំនាន់ JavaScript ដដែល (Expo Go មិនអាចប្រើ native module បានទេ) |
| Expo Web | Engine របស់ web ដែលសរសេរ CSS ពិតៗ។ អ្វីដែលប្រើបានលើ web ក៏ប្រើបាននៅទីនេះដែរ |

សម្រាប់ class ប្រចាំថ្ងៃ ជំនាន់ JavaScript ឱ្យលទ្ធផលដូច Rust engine ទាំងស្រុង។ ចំណុចដែលវាខ្វះ មានរៀបរាប់ [ខាងក្រោម](#ios-and-expo-go)។

## អ្វីដែលប្រើបានលើទូរស័ព្ទ {#what-works-on-a-phone}

- **តម្រៀបដោយ flexbox៖** `flex-row`, `flex-col`, `flex-1`, `flex-wrap`, `items-*`, `justify-*`, `self-*`, `content-*`, `gap-*`, `grow`, `shrink`, `basis-*`។ `View` តម្រៀបពីលើចុះក្រោមស្រាប់ ដូច្នេះបើចង់បានជួរដេក សូមប្រើ `flex-row`។
- **គម្លាត៖** `p-*`, `px-*`, `pt-*` និងផ្សេងៗ ព្រមទាំង `m-*` និង `mx-auto` ហើយ margin អវិជ្ជមានក៏បានដែរ។
- **ទំហំ៖** `w-*`, `h-*`, `size-*`, `min-*` និង `max-*` ជាលេខ ជាប្រភាគ (`w-1/2`) ឬ `full` ព្រមទាំង `aspect-*`។
- **ទីតាំង៖** `absolute`, `relative`, `inset-*`, `top-*` និងជ្រុងផ្សេងទៀត ព្រមទាំង `z-*`។
- **ពណ៌៖** `bg-*`, `text-*` និង `border-*` ធ្វើឱ្យថ្លាក៏បាន (`bg-black/50`)។
- **Border៖** កម្រាស់ ពណ៌ `rounded-*` (តាមជ្រុងនីមួយៗក៏បាន) និង `border-solid`, `border-dashed`, `border-dotted`។
- **ស្រមោល៖** `shadow-*` ដែលបង្ហាញជាស្រមោលលើ iOS និងជា elevation លើ Android។
- **អក្សរ៖** ទំហំ `text-sm` ជាដើម កម្រិតដិត `font-*`, `italic`, កម្ពស់បន្ទាត់ជាលេខ ដូចជា `leading-6`, `text-left`, `text-center`, `text-right`, `text-justify`, `underline`, `line-through`, `uppercase`, `lowercase`, `capitalize` និងគម្លាតអក្សរជា pixel (`tracking-[1px]`)។
- **Transform៖** `translate-*`, `rotate-*`, `scale-*`, `skew-*`។
- **ផ្សេងៗ៖** `opacity-*`, `hidden`, `overflow-hidden`, `overflow-scroll`, `backface-hidden`។

## អ្វីដែលប្រើមិនបាន {#what-doesnt-work}

Class ខាងក្រោមត្រឹមត្រូវ ហើយប្រើបានលើ web និង Expo Web។ តែលើទូរស័ព្ទ វាគ្មានប្រសិទ្ធភាពអ្វីទេ ហើយក៏គ្មាន error ប្រាប់ដែរ៖

| ក្រុម | Class | លើទូរស័ព្ទ សូមប្រើជំនួសវិញ |
| :-- | :-- | :-- |
| Grid និង layout ផ្សេងៗ | `grid`, `grid-cols-*`, `col-span-*`, `float-*`, `columns-*`, `order-*` | ដាក់ View `flex-row` និង `flex-col` ត្រួតក្នុងគ្នា |
| គម្លាតរវាង element ខាងក្នុង | `space-x-*`, `space-y-*`, `divide-*` | `gap-*` និងដាក់ border លើ element ខាងក្នុង |
| ឯកតាអេក្រង់ | `h-screen`, `w-screen`, `min-h-screen`, `*-dvh` | `flex-1` ឬ `useWindowDimensions()` |
| ទំហំតាមមាតិកា | `w-fit`, `w-min`, `w-max` | `self-start` ដើម្បីកុំឱ្យ View លាតពេញ parent ហើយទំហំស្មើនឹងមាតិកា |
| កាត់អក្សរដែលវែងពេក | `truncate`, `line-clamp-*` | Prop `numberOfLines` លើ `Text` |
| គម្លាតអក្សរ និងកម្ពស់បន្ទាត់ដែលមានឈ្មោះ | `tracking-tight` ជាដើម និង `leading-tight` ជាដើម | `tracking-[1px]`, `leading-6` |
| Effect | gradient (`bg-linear-*`), `blur-*` និង filter ផ្សេងៗ, `backdrop-*`, `mix-blend-*`, mask, `ring-*`, ពណ៌ស្រមោល (`shadow-sky-6`), `text-shadow-*`, `inset-shadow-*` | Library ដូចជា expo-linear-gradient សម្រាប់ gradient |
| ចលនា | `transition-*`, `duration-*`, `ease-*`, `animate-*` | `Animated` របស់ React Native ឬ Reanimated |
| របស់ដែលមានតែក្នុង browser | `cursor-*`, `select-*`, `pointer-events-*`, `scroll-*`, `snap-*`, `touch-*`, `resize-*`, `appearance-*`, `accent-*`, `caret-*`, `sr-only`, តារាង, បញ្ជី, `fill-*`, `stroke-*` | Prop របស់ component ដូចជា `pointerEvents` ឬ `fill` របស់ react-native-svg |
| ទិសសរសេរ | `ps-*`, `pe-*`, `ms-*`, `me-*`, `rounded-s-*`, `border-s` | ប្រើជំនាន់ឆ្វេង/ស្តាំវិញ (`pl-*`, `ml-*`) |

អ្នកមិនចាំបាច់ចាំតារាងនេះទេ។ ក្នុងឯកសារយោង [Utilities](/layout) class ណាដែលគ្មានប្រសិទ្ធភាពលើទូរស័ព្ទ មានសញ្ញា **Web only**។ សញ្ញានេះបានមកពីការដាក់ class នីមួយៗឱ្យ engine គណនាផ្ទាល់ ដូច្នេះវាត្រឹមត្រូវជានិច្ច។ [VS Code extension](/editor-setup) ក៏គូសបន្ទាត់ពីក្រោម class ទាំងនេះក្នុង project React Native ដែរ។

## Variants {#variants}

`dark:`, ទំហំអេក្រង់ (`md:`), `active:` (ពេលកំពុងចុច `Pressable`), `hover:` (តែពេលប្រើ mouse), `focus:`, `disabled:` និង variant `data-` និង `aria-` ប្រើបាន។ ចំណែក `group-*`, `peer-*`, `before:` និងភាគច្រើនផ្សេងទៀតប្រើមិនបាន ព្រោះ app ទូរស័ព្ទគ្មាន CSS selector។ មើលនៅ [Variants លើ React Native](/variants#on-react-native)។

## តម្លៃក្នុងតង្កៀបការ៉េ {#values-in-brackets}

React Native វាស់អ្វីៗទាំងអស់ជាលេខធម្មតា ដូច្នេះតម្លៃក្នុងតង្កៀបត្រូវតែជា `px` ឬ `rem` (1rem ស្មើ 16px)៖

- `text-[20px]`, `p-[1.5rem]` និង `w-[300px]` ប្រើបាន។
- `p-[calc(16px+8px)]` ប្រើបាន៖ Kbach គណនាឱ្យ ហើយបានលទ្ធផល 24។
- `w-[calc(100%-3rem)]`, `w-[min(50%,20rem)]` និង `w-[clamp(16rem,50%,32rem)]` ប្រើបានសម្រាប់ទទឹង និងកម្ពស់។ Kbach វាស់ parent មុន រួចទើបកំណត់ទំហំ element។
- តម្លៃជា `em`, `vw` ឬ `vh` ត្រូវបោះចោល ហើយពេល develop នឹងមានការព្រមានប្រាប់។

ដូចកន្លែងផ្សេងទៀតដែរ សូមសរសេរ `_` ជំនួសដកឃ្លា៖ `w-[calc(100%_-_3rem)]`។

## Font {#fonts}

`font-sans`, `font-serif` និង `font-mono` ដាក់ឈ្មោះ font សម្រាប់ web ដែលទូរស័ព្ទគ្មាន ដូច្នេះលើទូរស័ព្ទ class ទាំងនេះគ្មានប្រសិទ្ធភាពទេ។ បើចង់ប្រើ font ណាមួយក្នុង app សូមទាញយក font នោះចូល app សិន (ឧទាហរណ៍ដោយ `expo-font`) រួចដាក់ឈ្មោះវាក្នុង `kbach.config.js`៖

```js title="kbach.config.js"
export default {
  extend: {
    fontFamily: {
      sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
  },
};
```

លើទូរស័ព្ទ Kbach ប្រើតែឈ្មោះដំបូងគឺ `Inter` ដូច្នេះ config តែមួយប្រើបានទាំងលើ web និងក្នុង app។ មើលនៅ [Spacing, screens និង fonts](/spacing-screens-fonts#fonts)។

## លើ iOS និង Expo Go {#ios-and-expo-go}

Engine ជំនាន់ JavaScript ប្រើបានគ្រប់អ្វីដែលមានក្នុង [អ្វីដែលប្រើបានលើទូរស័ព្ទ](#what-works-on-a-phone) លើកលែងតែ៖

- Class `object-*` (`object-cover`, `object-contain`) គ្មានប្រសិទ្ធភាព។ សូមប្រើ prop `resizeMode` លើ `Image` វិញ។
- ទទឹងដែលមានឈ្មោះតូចៗ (`w-3xs`, `w-2xs`, `w-xs` និងឈ្មោះដដែលជាមួយ `min-w-`, `max-w-` និង `basis-`) គ្មានប្រសិទ្ធភាព។ សូមប្រើលេខជំនួស៖ `w-80` ស្មើ 320px។
- គ្មានការព្រមានពេលវាយឈ្មោះ class ខុសទេ។

## ការព្រមានពេល develop {#warnings}

ក្នុង build សម្រាប់ development លើ Android បើ class ណាមិនត្រូវនឹងអ្វីសោះ Kbach ព្រមានម្តងក្នុង terminal របស់ Metro ហើយប្រាប់ class ដែលអ្នកប្រហែលជាចង់សរសេរ៖ `bg-blue-500 → did you mean bg-blue-6?`។ ចំណែក class ដែលត្រឹមត្រូវ តែគ្មានប្រសិទ្ធភាពលើទូរស័ព្ទ Kbach មិនព្រមានទេ ព្រោះវាមិនមែនជាកំហុស។

## ទំព័រពាក់ព័ន្ធ {#related}

- [Dark mode](/dark-mode#react-native)៖ ចងចាំជម្រើសរបស់អ្នកប្រើដោយ AsyncStorage។
- [React Native API](/react-native-api)៖ `resolveStyle`, dynamic tokens និង component សម្រាប់ Expo Web។
