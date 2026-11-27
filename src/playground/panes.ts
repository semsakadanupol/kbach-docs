// The playground's two layout thresholds, shared by Playground.tsx and the outline that shows while
// it loads (PlaygroundLoading.tsx), so the two lay the panes out the same way. Both are the
// playground's content width: the window less its padding (p-2, md:p-3).

/** Narrower than this, side by side leaves neither pane usable: the panes stack. */
export const SIDE_BY_SIDE_MIN = 760;
/** Narrower than this, the playground is laid out for a phone (PhoneBar): one pane at a time, the preview first. */
export const PHONE_MAX = 640;
