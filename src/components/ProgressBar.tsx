import React from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

interface ProgressBarProps {
  progress: number; // Value from 0 to 1+
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.primary,
  height = 8,
  showPercentage = false,
}) => {
  const percentage = Math.min(Math.max(0, progress), 2); // Cap visually at 200% for bar loading
  const displayPercentage = Math.round(progress * 100);
  const isOverBudget = progress > 1.0;

  // Decide bar color dynamically based on budget status
  const barColor = isOverBudget ? colors.error : color;

  return (
    <View style={styles.container}>
      <View style={styles.barWrapper}>
        <View style={[styles.track, { height }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${Math.min(percentage * 100, 100)}%`,
                backgroundColor: barColor,
                height,
                borderRadius: height / 2,
              },
            ]}
          />
        </View>
        {isOverBudget && (
          <View style={[styles.overfilledTrack, { height, width: `${Math.max(0, (percentage - 1) * 100)}%` }]} />
        )}
      </View>
      {showPercentage && (
        <Text style={[
          typography.bodySmall, 
          typography.weightSemiBold, 
          { color: barColor, marginTop: 4 }
        ]}>
          {displayPercentage}% {isOverBudget ? 'Exceeded' : 'Allocated'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: '100%',
  },
  barWrapper: {
    position: 'relative',
    width: '100%',
  },
  track: {
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
  },
  overfilledTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 999,
  }
});
