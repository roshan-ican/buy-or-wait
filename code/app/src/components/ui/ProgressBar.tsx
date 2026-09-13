import React, { useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, PanResponder, StyleSheet, View } from 'react-native';
import { colors, radius } from '../../theme';

/** Thin single-fill progress track, e.g. the onboarding step indicator. */
export function ProgressBar({
  progress,
  color = colors.accent,
  trackColor = colors.divider,
}: {
  progress: number;
  color?: string;
  trackColor?: string;
}) {
  return (
    <View style={[styles.track, { backgroundColor: trackColor }]}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, progress)) * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

export interface Segment {
  value: number;
  color: string;
}

/** Multi-color proportion bar, e.g. essential/flexible/optional spend split. */
export function SegmentBar({
  segments,
  height = 10,
  trackColor = colors.divider,
}: {
  segments: Segment[];
  height?: number;
  trackColor?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <View style={[styles.segmentTrack, { height, backgroundColor: trackColor }]}>
      {segments.map((s, i) => (
        <View key={i} style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }} />
      ))}
    </View>
  );
}

/** Draggable dot-on-track slider, e.g. minimum balance / risk comfort. Tap or drag anywhere on the track. */
export function DotSlider({
  progress,
  onChange,
  color = colors.navy,
}: {
  progress: number;
  onChange?: (progress: number) => void;
  color?: string;
}) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  const widthRef = useRef(0);

  const respondToTouch = (event: GestureResponderEvent) => {
    if (!onChange || widthRef.current <= 0) return;
    const x = event.nativeEvent.locationX;
    onChange(Math.max(0, Math.min(1, x / widthRef.current)));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: respondToTouch,
        onPanResponderMove: respondToTouch,
      }),
    [onChange],
  );

  return (
    <View
      style={styles.dotTrack}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
      }}
      hitSlop={{ top: 14, bottom: 14 }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.dotFill, { width: `${pct}%`, backgroundColor: color }]} />
      <View style={[styles.dotKnob, { left: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2 },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: radius.sm / 3,
    overflow: 'hidden',
  },
  dotTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    position: 'relative',
  },
  dotFill: { height: '100%', borderRadius: 2 },
  dotKnob: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    top: -7,
    marginLeft: -9,
  },
});
