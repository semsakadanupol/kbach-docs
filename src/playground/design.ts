// The Inspector's Design tab (components/DesignPanel.tsx): controls that write Kbach classes.
// Each control owns a family of classes (text colors, padding, corner radius, …); setting it
// replaces the element's class from that family, in the chosen state: always, on hover, in
// dark mode, or from md up (the class gets that variant: hover:bg-rose-5).
//
// Only classes written exactly as "<state><utility>" count: md:hover:bg-… is left alone by
// every state here, as are classes the controls don't know. A color control owns a class only
// when the engine says it sets a color (isColor: colorForClass in engine.ts), so bg-cover or
// bg-linear-to-r is never taken for a background color.

export interface DesignState {
  id: string;
  label: string;
  /** the variant written in front of the class ('' for always) */
  prefix: string;
}

export const STATES: DesignState[] = [
  { id: 'base', label: 'Always', prefix: '' },
  { id: 'hover', label: 'Hover', prefix: 'hover:' },
  { id: 'dark', label: 'Dark', prefix: 'dark:' },
  { id: 'md', label: 'md+', prefix: 'md:' },
];

export type ControlKind = 'color' | 'select' | 'segments';

export interface Control {
  id: string;
  label: string;
  kind: ControlKind;
  /** the class's prefix: text-, bg-, p- (for colors, the utility the color goes after) */
  utility: string;
  /** which (unprefixed) classes this control owns */
  owns: RegExp;
  /** select / segments: the classes to pick from, with their labels */
  options?: { cls: string; label: string }[];
}

const COLOR_VALUE = '(?:[a-z]+(?:-[a-z]+)*-\\d{1,2}|white|black|transparent|current|inherit|[a-z]+(?:-[a-z]+)*)(?:\\/\\d{1,3})?';
const SIZES = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'];
const TEXT_NOT_COLOR = new RegExp('^text-(?:' + SIZES.join('|') + '|left|center|right|justify|start|end|wrap|nowrap|balance|pretty|clip|ellipsis)$');
const SPACING = ['0', '0.5', '1', '1.5', '2', '2.5', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24'];
const spacing = (u: string) => SPACING.map((n) => ({ cls: u + '-' + n, label: n === '0' ? '0' : n + ' · ' + Number(n) * 4 + 'px' }));

export const CONTROLS: { group: string; controls: Control[] }[] = [
  {
    group: 'Color',
    controls: [
      { id: 'text-color', label: 'Text', kind: 'color', utility: 'text', owns: new RegExp('^text-' + COLOR_VALUE + '$') },
      { id: 'bg-color', label: 'Background', kind: 'color', utility: 'bg', owns: new RegExp('^bg-' + COLOR_VALUE + '$') },
      { id: 'border-color', label: 'Border', kind: 'color', utility: 'border', owns: new RegExp('^border-' + COLOR_VALUE + '$') },
    ],
  },
  {
    group: 'Spacing',
    controls: [
      { id: 'p', label: 'Padding', kind: 'select', utility: 'p', owns: /^p-/, options: spacing('p') },
      { id: 'px', label: 'Padding x', kind: 'select', utility: 'px', owns: /^px-/, options: spacing('px') },
      { id: 'py', label: 'Padding y', kind: 'select', utility: 'py', owns: /^py-/, options: spacing('py') },
      { id: 'gap', label: 'Gap', kind: 'select', utility: 'gap', owns: /^gap-(?![xy]-)/, options: spacing('gap') },
      { id: 'mt', label: 'Margin top', kind: 'select', utility: 'mt', owns: /^mt-/, options: spacing('mt') },
    ],
  },
  {
    group: 'Shape',
    controls: [
      {
        id: 'radius',
        label: 'Corners',
        kind: 'select',
        utility: 'rounded',
        owns: /^rounded(?:-(?:none|xs|sm|md|lg|xl|2xl|3xl|4xl|full))?$/,
        options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].map((v) => ({ cls: 'rounded-' + v, label: v })),
      },
      {
        id: 'shadow',
        label: 'Shadow',
        kind: 'select',
        utility: 'shadow',
        owns: /^shadow(?:-(?:none|2xs|xs|sm|md|lg|xl|2xl))?$/,
        options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'].map((v) => ({ cls: 'shadow-' + v, label: v })),
      },
      {
        id: 'border-width',
        label: 'Border',
        kind: 'select',
        utility: 'border',
        owns: /^border(?:-(?:0|2|4|8))?$/,
        options: [{ cls: 'border-0', label: '0' }, { cls: 'border', label: '1px' }, { cls: 'border-2', label: '2px' }, { cls: 'border-4', label: '4px' }],
      },
      {
        id: 'opacity',
        label: 'Opacity',
        kind: 'select',
        utility: 'opacity',
        owns: /^opacity-\d+$/,
        options: ['0', '25', '50', '75', '90', '100'].map((v) => ({ cls: 'opacity-' + v, label: v + '%' })),
      },
    ],
  },
  {
    group: 'Text',
    controls: [
      { id: 'font-size', label: 'Size', kind: 'select', utility: 'text', owns: new RegExp('^text-(?:' + SIZES.join('|') + ')$'), options: SIZES.map((v) => ({ cls: 'text-' + v, label: v })) },
      {
        id: 'font-weight',
        label: 'Weight',
        kind: 'select',
        utility: 'font',
        owns: /^font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
        options: ['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'].map((v) => ({ cls: 'font-' + v, label: v })),
      },
      {
        id: 'align',
        label: 'Align',
        kind: 'segments',
        utility: 'text',
        owns: /^text-(?:left|center|right|justify)$/,
        options: [{ cls: 'text-left', label: 'Left' }, { cls: 'text-center', label: 'Center' }, { cls: 'text-right', label: 'Right' }],
      },
    ],
  },
  {
    group: 'Layout',
    controls: [
      {
        id: 'display',
        label: 'Display',
        kind: 'segments',
        utility: '',
        owns: /^(?:block|inline-block|inline|flex|inline-flex|grid|hidden)$/,
        options: [{ cls: 'block', label: 'Block' }, { cls: 'flex', label: 'Flex' }, { cls: 'grid', label: 'Grid' }, { cls: 'hidden', label: 'Hidden' }],
      },
      {
        id: 'items',
        label: 'Align items',
        kind: 'select',
        utility: 'items',
        owns: /^items-(?:start|center|end|baseline|stretch)$/,
        options: ['start', 'center', 'end', 'baseline', 'stretch'].map((v) => ({ cls: 'items-' + v, label: v })),
      },
      {
        id: 'justify',
        label: 'Justify',
        kind: 'select',
        utility: 'justify',
        owns: /^justify-(?:start|center|end|between|around|evenly)$/,
        options: ['start', 'center', 'end', 'between', 'around', 'evenly'].map((v) => ({ cls: 'justify-' + v, label: v })),
      },
    ],
  },
];

/** Whether a class sets a color (the engine's answer). */
export type IsColor = (cls: string) => boolean;

/** Whether an unprefixed class belongs to this control (a text color isn't a text size, bg-cover isn't a color). */
function owned(control: Control, cls: string, isColor: IsColor): boolean {
  if (control.kind === 'color') return cls.startsWith(control.utility + '-') && !TEXT_NOT_COLOR.test(cls) && isColor(cls);
  return control.owns.test(cls);
}

/** The element's class for this control in this state (null if none), and its value without the state prefix. */
export function currentClass(classes: string[], control: Control, state: DesignState, isColor: IsColor): string | null {
  for (const cls of classes) {
    if (!cls.startsWith(state.prefix)) continue;
    const rest = cls.slice(state.prefix.length);
    if (rest.includes(':')) continue;
    if (owned(control, rest, isColor)) return rest;
  }
  return null;
}

/** What to take out and put in to set this control to `value` (an unprefixed class, or null to clear it). */
export function changeFor(classes: string[], control: Control, state: DesignState, value: string | null, isColor: IsColor): { remove: string[]; add: string[] } {
  const remove = classes.filter((cls) => cls.startsWith(state.prefix) && !cls.slice(state.prefix.length).includes(':') && owned(control, cls.slice(state.prefix.length), isColor));
  const add = value ? [state.prefix + value] : [];
  return { remove: remove.filter((c) => !add.includes(c)), add: add.filter((c) => !classes.includes(c)) };
}

/** A class list with `remove` taken out and `add` put at the end (order kept otherwise). */
export function applyChange(tokens: string[], remove: string[], add: string[]): string[] {
  const kept = tokens.filter((t) => t && !remove.includes(t));
  return [...kept, ...add.filter((a) => !kept.includes(a))];
}

/** A theme color name split into family and shade ("blue-6" → blue, 6), or the whole name for a single color. */
export function splitColor(name: string): { family: string; shade: number | null } {
  const m = /^(.*)-(\d{1,2})$/.exec(name);
  return m ? { family: m[1], shade: Number(m[2]) } : { family: name, shade: null };
}
