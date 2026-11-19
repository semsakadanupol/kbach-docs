---
title: CDN script API
nav: CDN script API
description: Object window.kbachConfig និង API window.Kbach របស់ @kbach/browser។
---

## window.kbachConfig {#windowkbachconfig}

Script អានវាតែម្តង ពេលវាចាប់ផ្តើម។ សូមកំណត់វាក្នុង `<script>` ដែលនៅ **មុន** script របស់ Kbach៖

```html
<script>
  window.kbachConfig = { darkMode: 'class', extend: { colors: { brand: '#ff6b35' } } };
</script>
<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
```

ទម្រង់ដូចគ្នាបេះបិទនឹង [kbach.config.js](/configuration)។ បើចង់ប្តូរពេលក្រោយ សូមហៅ `Kbach.config()`។

## window.Kbach {#windowkbach}

### Kbach.ready {#kbachready}

```js
await Kbach.ready;
```

Promise ដែល resolve ពេល engine ទាញយករួច ហើយទំព័របាន style ជាលើកដំបូង។

### Kbach.config(cfg) {#kbachconfigcfg}

```js
Kbach.config({ extend: { colors: { brand: '#2563eb' } } });
```

យក config ថ្មីមកប្រើ ហើយដាក់ style ទំព័រទាំងមូលម្តងទៀត។

### Kbach.refresh() {#kbachrefresh}

ដាក់ style ទំព័រទាំងមូលម្តងទៀត។ Script ចាប់ការផ្លាស់ប្តូរលើទំព័រដោយខ្លួនឯងស្រាប់ ដូច្នេះកម្រត្រូវការវាណាស់។

### Kbach.setMode(mode) និង Kbach.toggle() {#kbachsetmodemode-and-kbachtoggle}

```js
Kbach.setMode('dark'); // 'light', 'dark' or 'system'
Kbach.toggle();
```

ជម្រើសត្រូវរក្សាទុកក្នុង `localStorage` ហើយយកមកវិញពេលចូលលើកក្រោយ។ ត្រូវការ `darkMode: 'class'` ឬ `'attribute'`។

## Attribute របស់ script {#script-attributes}

| Attribute | |
| :-- | :-- |
| `data-wasm` | ទីតាំងទាញយក `kbach_core_engine_bg.wasm` ពេលវាមិននៅក្បែរ script |

## អ្វីខ្លះបាន style {#what-gets-styled}

ពេល engine ទាញយករួច script ដាក់ style ឱ្យឈ្មោះគ្រប់ឈ្មោះក្នុង attribute `class` ទាំងអស់លើទំព័រ។ បន្ទាប់មក `MutationObserver` ដាក់ style ឱ្យ element ដែលអ្នកបន្ថែម និង class ដែលអ្នកប្តូរ។ Class នីមួយៗត្រូវបំប្លែងតែម្តង។ ឈ្មោះណាដែលមិនមែនជា class របស់ Kbach មិនបង្កើត CSS ទេ ហើយត្រូវរំលង ដូច្នេះ script ប្រើជាមួយ stylesheet ផ្ទាល់ខ្លួនរបស់អ្នកបាន។

Script មិនដែលកែ attribute `class` របស់អ្នកទេ។
