import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, spacing } from '../../theme';
import { ProgressBar } from './ProgressBar';

interface BackHeaderProps {
  onBack?: () => void;
  icon?: 'back' | 'close' | 'none';
  progress?: number;
  progressLabel?: string;
  trailing?: React.ReactNode;
}

/** The back-arrow (+ optional step progress) row repeated at the top of nearly every screen. */
export function BackHeader({ onBack, icon = 'back', progress, progressLabel, trailing }: BackHeaderProps) {
  const hasProgress = progress != null;

  return (
    <View style={[styles.row, hasProgress && styles.rowWithProgress]}>
      {icon !== 'none' ? (
        <Pressable onPress={onBack} hitSlop={10}>
          <Text style={styles.glyph}>{icon === 'close' ? '✕' : '←'}</Text>
        </Pressable>
      ) : (
        <View />
      )}
      {hasProgress ? (
        <>
          <View style={styles.progressTrack}>
            <ProgressBar progress={progress!} />
          </View>
          {progressLabel ? <Text style={styles.progressLabel}>{progressLabel}</Text> : null}
        </>
      ) : (
        trailing ?? null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  rowWithProgress: { gap: spacing.mdl },
  glyph: { fontSize: 22, color: colors.textSecondary },
  progressTrack: { flex: 1 },
  progressLabel: { fontFamily: fontFamily.sans, fontSize: 13, color: colors.textTertiary },
});
