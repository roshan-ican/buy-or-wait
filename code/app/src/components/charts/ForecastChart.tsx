import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { colors } from '../../theme';

interface ForecastChartProps {
  /** Whether to also draw the "with the purchase" comparison line. */
  showComparison: boolean;
}

const AS_THINGS_STAND = '6,150 60,120 114,96 168,74 222,46 276,28 328,10';
const WITH_PURCHASE = '6,150 60,138 114,126 168,118 222,102 276,88 328,72';

/** Six-month balance projection chart, redrawn from the design's inline SVG. */
export function ForecastChart({ showComparison }: ForecastChartProps) {
  return (
    <View style={styles.wrap}>
      <Svg viewBox="0 0 334 220" width="100%" height={220}>
        <Line x1={0} y1={168} x2={334} y2={168} stroke={colors.danger} strokeWidth={1.5} strokeDasharray="5 5" />
        <SvgText x={0} y={186} fontSize={12} fill={colors.danger}>
          Floor 1,500
        </SvgText>
        <Polyline
          points={AS_THINGS_STAND}
          fill="none"
          stroke={colors.navy}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {showComparison ? (
          <Polyline
            points={WITH_PURCHASE}
            fill="none"
            stroke={colors.accent}
            strokeWidth={2.5}
            strokeDasharray="6 5"
            strokeLinejoin="round"
          />
        ) : null}
        <Circle cx={6} cy={150} r={4} fill={colors.navy} />
        <Circle cx={328} cy={10} r={4} fill={colors.navy} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
});
