import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useInsights } from '../hooks/useInsights';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { Card } from '../components/Card';

export const InsightsScreen = () => {
  const { insights } = useInsights();

  // Map status colors for visual styling
  const getStatusDetails = (status: 'success' | 'warning' | 'info') => {
    switch (status) {
      case 'success':
        return {
          color: colors.success,
          bg: 'rgba(16, 185, 129, 0.05)',
          emoji: '✅'
        };
      case 'warning':
        return {
          color: colors.error,
          bg: 'rgba(239, 68, 68, 0.05)',
          emoji: '⚠️'
        };
      case 'info':
      default:
        return {
          color: colors.primary,
          bg: 'rgba(139, 92, 246, 0.05)',
          emoji: '💡'
        };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={[typography.h2, typography.weightBold, { color: colors.textPrimary, marginBottom: 4 }]}>
        Insight Keuangan
      </Text>
      <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: 20 }]}>
        Analisa otomatis dari plan budget lo. Tenang aja, datanya aman tersimpan di HP ini doang.
      </Text>

      {insights.map((insight) => {
        const details = getStatusDetails(insight.status);
        return (
          <Card 
            key={insight.id} 
            variant="flat" 
            borderColor={details.color} 
            style={[styles.insightCard, { backgroundColor: details.bg }]}
          >
            <View style={styles.cardHeader}>
              <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary, flex: 1 }]}>
                {details.emoji}  {insight.title}
              </Text>
              <View style={[styles.badge, { backgroundColor: details.color }]}>
                <Text style={styles.badgeText}>{insight.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={[typography.bodyMedium, styles.description]}>
              {insight.description}
            </Text>
          </Card>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  insightCard: {
    marginBottom: 16,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: colors.background,
    fontSize: 9,
    fontWeight: '800',
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
