export const fontFamily = {
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  sans: 'InstrumentSans_400Regular',
  sansMedium: 'InstrumentSans_500Medium',
  sansSemiBold: 'InstrumentSans_600SemiBold',
  sansBold: 'InstrumentSans_700Bold',
} as const;

/** Display sizes use the serif face, matching the big numerals/headlines in the design. */
export const display = {
  hero: 76,
  xxl: 68,
  xl: 64,
  lg: 42,
  md: 40,
  sm: 38,
  xs: 36,
  xxs: 34,
} as const;

export const heading = {
  h1: 32,
  h2: 30,
  h3: 28,
  h4: 26,
} as const;

export const body = {
  lg: 19,
  md: 17,
  base: 16,
  sm: 15,
  xs: 14,
} as const;

export const label = {
  base: 13,
  sm: 12,
  xs: 11,
} as const;

export const lineHeight = {
  tight: 1.08,
  snug: 1.15,
  normal: 1.4,
  relaxed: 1.5,
  loose: 1.6,
} as const;

export const letterSpacing = {
  wide: 0.6,
  wider: 0.9,
  widest: 1.6,
} as const;
