// Whether a class does anything on React Native, worked out from the engine
// itself: resolve_style_json is the same Rust code the Android build runs.
//
// The engine's answer isn't enough on its own. For some classes it returns a
// style property React Native doesn't have (`float`, `columns`, `display:
// grid`) or a value it can't read (`"16px"`, `currentColor`), and React
// Native ignores those. So a class counts as working on native only if at
// least one property it returns is one React Native really uses, with a
// value it accepts. The lists below are React Native's own style props
// (View, Text and Image), as of React Native 0.71.

/** Style props React Native reads, and for some, the values it accepts (any other value is ignored). */
const PROPS: Record<string, readonly string[] | null> = {
  // layout
  alignContent: ['flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly'],
  alignItems: ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
  alignSelf: ['auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
  aspectRatio: null,
  bottom: null, end: null, left: null, right: null, start: null, top: null, inset: null,
  display: ['flex', 'none', 'contents'],
  flex: null, flexBasis: null, flexDirection: null, flexGrow: null, flexShrink: null, flexWrap: null,
  gap: null, columnGap: null, rowGap: null,
  height: null, width: null, maxHeight: null, maxWidth: null, minHeight: null, minWidth: null,
  justifyContent: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
  margin: null, marginTop: null, marginRight: null, marginBottom: null, marginLeft: null, marginStart: null, marginEnd: null, marginHorizontal: null, marginVertical: null,
  padding: null, paddingTop: null, paddingRight: null, paddingBottom: null, paddingLeft: null, paddingStart: null, paddingEnd: null, paddingHorizontal: null, paddingVertical: null,
  overflow: ['visible', 'hidden', 'scroll'],
  position: ['absolute', 'relative', 'static'],
  zIndex: null,
  direction: null,
  // view
  backfaceVisibility: null,
  backgroundColor: null,
  borderColor: null, borderTopColor: null, borderRightColor: null, borderBottomColor: null, borderLeftColor: null, borderStartColor: null, borderEndColor: null,
  borderWidth: null, borderTopWidth: null, borderRightWidth: null, borderBottomWidth: null, borderLeftWidth: null, borderStartWidth: null, borderEndWidth: null,
  borderRadius: null, borderTopLeftRadius: null, borderTopRightRadius: null, borderBottomLeftRadius: null, borderBottomRightRadius: null,
  borderTopStartRadius: null, borderTopEndRadius: null, borderBottomStartRadius: null, borderBottomEndRadius: null,
  borderStyle: ['solid', 'dotted', 'dashed'],
  opacity: null,
  elevation: null,
  shadowColor: null, shadowOffset: null, shadowOpacity: null, shadowRadius: null,
  transform: null,
  // text
  color: null,
  fontFamily: null,
  fontSize: null,
  fontStyle: null,
  fontWeight: null,
  fontVariant: null,
  letterSpacing: null,
  lineHeight: null,
  textAlign: ['auto', 'left', 'right', 'center', 'justify'],
  textDecorationLine: null,
  textDecorationStyle: null,
  textDecorationColor: null,
  textTransform: null,
  // image
  objectFit: ['contain', 'cover', 'fill', 'scale-down', 'none'],
};

/** A value React Native can't read: a CSS length with a unit, or a CSS-only keyword. */
function unusable(prop: string, value: unknown): boolean {
  if (typeof value === 'string') {
    if (/^-?[\d.]+(px|rem|em|vw|vh|ch)$/.test(value)) return true;
    if (/currentColor|inherit|var\(/.test(value)) return true;
    // fonts the default theme names for the web; no phone has a font by these names
    if (prop === 'fontFamily' && /^ui-/.test(value)) return true;
  }
  if (prop === 'zIndex' && typeof value !== 'number') return true;
  return false;
}

/** Whether one style property and its value do something on React Native. */
export function nativeUses(prop: string, value: unknown): boolean {
  if (!(prop in PROPS)) return false;
  const allowed = PROPS[prop];
  if (allowed && !allowed.includes(String(value))) return false;
  return !unusable(prop, value);
}

/**
 * For a class the engine resolved for React Native (resolve_style_json's
 * JSON): true if any of its properties takes effect on a phone.
 */
export function worksOnNative(styleJson: string): boolean {
  const { __kbachWarnings: _w, ...style } = JSON.parse(styleJson) as Record<string, unknown>;
  return Object.entries(style).some(([prop, value]) => nativeUses(prop, value));
}
