import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useBudgetStore } from '../store/budgetStore';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { Card } from '../components/Card';
import { formatMonthYear, formatDateRange, formatReadableDate, getDaysRemaining } from '../utils/date';
import { formatRupiah } from '../utils/currency';

export const CalendarScreen = () => {
  const { monthlyPlans, weeklyPlans, goals } = useBudgetStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={[typography.h2, typography.weightBold, { color: colors.textPrimary, marginBottom: 4 }]}>
        Roadmap Keuangan
      </Text>
      <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: 20 }]}>
        Ringkasan semua plan bulanan, mingguan, dan target nabung lo ada di sini.
      </Text>

      {/* SECTION: MONTHLY HORIZONS */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>📅 Plan Bulanan</Text>
        {monthlyPlans.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada plan bulanan.</Text>
        ) : (
          monthlyPlans.map((plan) => {
            const spent = plan.expenses.reduce((sum, e) => sum + e.plannedAmount, 0);
            return (
              <Card key={plan.id} variant="flat" style={styles.eventCard}>
                <View style={[styles.colorIndicator, { backgroundColor: colors.primary }]} />
                <View style={styles.eventContent}>
                  <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary }]}>
                    Plan {formatMonthYear(plan.month)}
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
                    Gaji: {formatRupiah(plan.income)} | Diplot: {formatRupiah(spent)}
                  </Text>
                </View>
              </Card>
            );
          })
        )}
      </View>

      {/* SECTION: WEEKLY CYCLES */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>🗓️ Plan Mingguan</Text>
        {weeklyPlans.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada plan mingguan.</Text>
        ) : (
          weeklyPlans.map((plan) => {
            const spent = plan.expenses.reduce((sum, e) => sum + e.plannedAmount, 0);
            return (
              <Card key={plan.id} variant="flat" style={styles.eventCard}>
                <View style={[styles.colorIndicator, { backgroundColor: colors.info }]} />
                <View style={styles.eventContent}>
                  <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary }]}>
                    Jatah Mingguan
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
                    Siklus: {formatDateRange(plan.startDate, plan.endDate)}
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                    Masuk: {formatRupiah(plan.income)} | Diplot: {formatRupiah(spent)}
                  </Text>
                </View>
              </Card>
            );
          })
        )}
      </View>

      {/* SECTION: GOALS DEADLINES */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>🎯 Deadline Nabung</Text>
        {goals.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada deadline nih.</Text>
        ) : (
          goals.map((goal) => {
            const daysLeft = getDaysRemaining(goal.deadline);
            const isUrgent = daysLeft > 0 && daysLeft <= 30;
            return (
              <Card key={goal.id} variant="flat" style={styles.eventCard}>
                <View 
                  style={[
                    styles.colorIndicator, 
                    { backgroundColor: isUrgent ? colors.error : colors.success }
                  ]} 
                />
                <View style={styles.eventContent}>
                  <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary }]}>
                    Target: {goal.name}
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
                    Deadline: {formatReadableDate(goal.deadline)} ({daysLeft > 0 ? `Sisa ${daysLeft} hari` : 'Udah lewat deadline'})
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                    Target: {formatRupiah(goal.targetAmount)} | Kumpul: {formatRupiah(goal.currentAmount)}
                  </Text>
                </View>
              </Card>
            );
          })
        )}
      </View>
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
  section: {
    marginBottom: 26,
  },
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
    marginBottom: 10,
    height: 90,
  },
  colorIndicator: {
    width: 6,
    height: '100%',
  },
  eventContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    paddingLeft: 8,
  },
});
