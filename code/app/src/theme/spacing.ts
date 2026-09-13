export const spacing = {
  xxxs: 4,
  xxs: 6,
  xs: 8,
  sm: 10,
  smd: 12,
  md: 14,
  mdl: 16,
  lg: 18,
  lgl: 20,
  xl: 22,
  xxl: 24,
  xxxl: 28,
  huge: 32,
  massive: 36,
} as const;

export const radius = {
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 22,
  xxxl: 24,
  huge: 30,
  frame: 38,
  pill: 999,
} as const;

/** Standard horizontal screen padding used across every phone screen in the design. */
export const screenPadding = 28;

/** Phone artboard width the whole design was built at (iPhone 14/15-ish). */
export const phoneWidth = 390;

/** Above this viewport width we center content inside a fixed phone-width frame. */
export const desktopBreakpoint = 560;
