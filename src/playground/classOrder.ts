// The order Format sorts classes into. The engine already orders variants
// (hover: before dark: before md:), but every plain class has the same
// order there, so within a variant the classes are ranked by the CSS
// property they set: layout and position, then the box (spacing, sizing,
// flex and grid), then borders and backgrounds, then text, then effects
// and motion. The same broad order the Tailwind CSS class sorter uses, so
// a class list reads outside-in: where the box goes, what it is, how it looks.

const PROPERTY_ORDER = [
  'position', 'inset', 'inset-inline', 'inset-block', 'top', 'right', 'bottom', 'left', 'inset-inline-start', 'inset-inline-end',
  'isolation', 'z-index', 'order',
  'grid-column', 'grid-column-start', 'grid-column-end', 'grid-row', 'grid-row-start', 'grid-row-end',
  'float', 'clear',
  'margin', 'margin-inline', 'margin-block', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'margin-inline-start', 'margin-inline-end',
  'box-sizing', 'display', 'visibility', 'aspect-ratio',
  'width', 'inline-size', 'min-width', 'max-width', 'height', 'block-size', 'min-height', 'max-height',
  'flex', 'flex-basis', 'flex-grow', 'flex-shrink',
  'table-layout', 'caption-side', 'border-collapse', 'border-spacing',
  'transform-origin', 'translate', 'rotate', 'scale', 'transform', 'transform-style', 'perspective', 'backface-visibility',
  'animation', 'cursor', 'touch-action', 'resize', 'scroll-snap-type', 'scroll-snap-align', 'scroll-margin', 'scroll-padding',
  'list-style-position', 'list-style-type', 'appearance', 'columns', 'break-before', 'break-inside', 'break-after',
  'grid-auto-columns', 'grid-auto-flow', 'grid-auto-rows', 'grid-template-columns', 'grid-template-rows',
  'flex-direction', 'flex-wrap', 'place-content', 'place-items', 'align-content', 'align-items', 'justify-content', 'justify-items',
  'gap', 'column-gap', 'row-gap',
  'place-self', 'align-self', 'justify-self',
  'overflow', 'overflow-x', 'overflow-y', 'overscroll-behavior', 'scroll-behavior',
  'text-overflow', 'white-space', 'word-break', 'overflow-wrap', 'hyphens',
  'border-radius', 'border-start-start-radius', 'border-start-end-radius', 'border-end-start-radius', 'border-end-end-radius',
  'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
  'border-width', 'border-inline-width', 'border-block-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-style', 'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'background-color', 'background-image', 'background-size', 'background-attachment', 'background-clip', 'background-position', 'background-repeat', 'background-origin',
  'mask-image', 'fill', 'stroke', 'stroke-width', 'object-fit', 'object-position',
  'padding', 'padding-inline', 'padding-block', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'padding-inline-start', 'padding-inline-end',
  'text-align', 'text-indent', 'vertical-align',
  'font-family', 'font-size', 'line-height', 'font-weight', 'font-style', 'font-stretch', 'font-variant-numeric', 'letter-spacing', 'text-wrap',
  'color', 'text-transform', 'text-decoration-line', 'text-decoration-color', 'text-decoration-style', 'text-decoration-thickness', 'text-underline-offset',
  '-webkit-font-smoothing', 'accent-color', 'caret-color',
  'opacity', 'mix-blend-mode', 'background-blend-mode', 'box-shadow', 'text-shadow',
  'outline', 'outline-style', 'outline-width', 'outline-offset', 'outline-color',
  'filter', 'backdrop-filter',
  'transition-property', 'transition-behavior', 'transition-delay', 'transition-duration', 'transition-timing-function',
  'will-change', 'contain', 'content', 'forced-color-adjust', 'pointer-events', 'user-select',
];
const RANK = new Map(PROPERTY_ORDER.map((p, i) => [p, i]));

// a class that only sets the engine's own variables works through a real property
const VARIABLE_PROPERTY: [RegExp, string][] = [
  [/^--kb-(shadow|inset-shadow|ring|inset-ring)/, 'box-shadow'],
  [/^--kb-text-shadow/, 'text-shadow'],
  [/^--kb-gradient/, 'background-image'],
  [/^--kb-(translate|rotate|scale|skew)/, 'transform'],
  [/^--kb-(blur|brightness|contrast|grayscale|hue-rotate|invert|saturate|sepia|drop-shadow)/, 'filter'],
  [/^--kb-backdrop/, 'backdrop-filter'],
  [/^--kb-space-/, 'margin'],
  [/^--kb-divide/, 'border-width'],
  [/^--kb-mask/, 'mask-image'],
  [/^--kb-(duration|ease)/, 'transition-duration'],
  [/^--kb-snap/, 'scroll-snap-type'],
  [/^--kb-outline-style/, 'outline-style'],
  [/^--kb-fvn/, 'font-variant-numeric'],
  [/^--kb-leading/, 'line-height'],
  [/^--kb-content/, 'content'],
  [/^--kb-border-spacing/, 'border-spacing'],
];

/** The rank of the property a rule body sets first (lower sorts earlier). */
export function propertyRank(body: string): number {
  const props = body
    .split(';')
    .map((d) => d.slice(0, d.indexOf(':')).trim())
    .filter(Boolean);
  const real = props.find((p) => !p.startsWith('--'));
  let prop = real;
  if (!prop) for (const v of props) prop ??= VARIABLE_PROPERTY.find(([re]) => re.test(v))?.[1];
  return prop !== undefined && RANK.has(prop) ? RANK.get(prop)! : PROPERTY_ORDER.length;
}
