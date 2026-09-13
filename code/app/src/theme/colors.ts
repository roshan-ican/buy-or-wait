/**
 * Palette lifted directly from the "Buy or Wait" Claude Design canvas.
 * Keep these values in sync with the source `.dc.html` if the design changes.
 */
export const colors = {
  // Surfaces
  canvas: '#EFEDE8',
  surface: '#FFFDFA',
  navy: '#14233B',
  navyAlt: '#22355a',

  // Text
  textPrimary: '#14233B',
  textSecondary: '#5A6478',
  textTertiary: '#8A8578',
  textInverse: '#FFFDFA',
  textInverseMuted: '#B9C2D4',
  textInverseFaint: '#9FB3F5',

  // Borders / dividers
  border: '#E2DFD6',
  borderStrong: '#14233B',
  borderDashed: '#D8D4C8',
  borderDashedBlue: '#A9B6D6',
  divider: '#ECE9E1',
  dividerSoft: '#F0EDE6',

  // Accent (blue)
  accent: '#3B5BDB',
  accentTint: '#EEF1FD',
  accentSoft: '#9FB3F5',

  // Positive (green)
  positive: '#0E7C61',
  positiveTint: '#E6F2EE',
  positiveSoft: '#5FA88F',

  // Caution (amber)
  caution: '#B4710A',
  cautionTint: '#FAF1E0',
  cautionBorder: '#EBD9C4',
  cautionTintAlt: '#FDFAF4',
  cautionBar: '#E0A93E',

  // Danger (red)
  danger: '#B23A48',
  dangerTint: '#FDF3F3',
  dangerTintAlt: '#FDF7F7',
  dangerBorder: '#EBD3D3',

  // Neutral fill
  neutralFill: '#F5F3EE',

  // Inactive nav
  inactive: '#A9A497',

  // Navy-surface internals (used on dark screens)
  navyLine: '#25354F',
  navyBorder: '#3B4A66',
  navyMuted: '#5E6C88',
  navyMutedAlt: '#6B7A96',

  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
