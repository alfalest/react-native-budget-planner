import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useBudgetStore } from '../store/budgetStore';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { formatRupiah } from '../utils/currency';
import { getCurrentMonth, getCurrentWeekRange, formatDateRange, formatMonthYear, getWeekDaysCount } from '../utils/date';

export const DashboardScreen = ({ navigation }: any) => {
  const { monthlyPlans, weeklyPlans, installments } = useBudgetStore();

  // Keep state so the Dashboard updates when date rolls over while app is open
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeekRange());
  const [todayStr, setTodayStr] = useState(dayjs().format('YYYY-MM-DD'));

  useFocusEffect(
    useCallback(() => {
      setCurrentMonth(getCurrentMonth());
      setCurrentWeek(getCurrentWeekRange());
      setTodayStr(dayjs().format('YYYY-MM-DD'));
    }, [])
  );

  const activeMonthlyPlan = monthlyPlans.find((p) => p.month === currentMonth);
  const activeWeeklyPlan =
    weeklyPlans.find((p) => p.startDate === currentWeek.startDate) ||
    weeklyPlans.find((p) => p.startDate <= todayStr && p.endDate >= todayStr);

  const activeInstallments = installments.filter(
    (inst) => inst.startMonth <= currentMonth && inst.endMonth >= currentMonth
  );
  const totalInstallments = activeInstallments.reduce((sum, inst) => sum + inst.amount, 0);

  // Compute Monthly Statistics
  const mIncome = activeMonthlyPlan?.income || 0;
  const manualAllocated = activeMonthlyPlan?.expenses.reduce((sum, e) => sum + e.plannedAmount, 0) || 0;
  const mAllocated = manualAllocated + totalInstallments;
  const mRemaining = mIncome - mAllocated;
  const mProgress = mIncome > 0 ? mAllocated / mIncome : 0;

  // Trend Calculations
  const getMonthlyTotal = (mStr: string) => {
    const plan = monthlyPlans.find((p) => p.month === mStr);
    const manual = plan ? plan.expenses.reduce((s, e) => s + e.plannedAmount, 0) : 0;
    const autoInst = installments.filter(
      (inst) => inst.startMonth <= mStr && inst.endMonth >= mStr
    ).reduce((s, inst) => s + inst.amount, 0);
    return manual + autoInst;
  };

  const mMinus1 = dayjs().subtract(1, 'month').format('YYYY-MM');
  const mMinus2 = dayjs().subtract(2, 'month').format('YYYY-MM');

  const val0 = mAllocated;
  const val1 = getMonthlyTotal(mMinus1);
  const val2 = getMonthlyTotal(mMinus2);

  const maxVal = Math.max(val0, val1, val2, 1); // prevent div by zero

  const trendData = [
    { label: dayjs(mMinus2).format('MMM'), value: val2 },
    { label: dayjs(mMinus1).format('MMM'), value: val1 },
    { label: dayjs(currentMonth).format('MMM'), value: val0 },
  ];

  let trendText = "Consistent spending detected.";
  let trendColor = colors.textSecondary;
  if (val1 > 0) {
    const diff = val0 - val1;
    const pct = ((Math.abs(diff) / val1) * 100).toFixed(0);
    if (diff > 0) {
      trendText = `📈 Naik ${pct}% dari bulan lalu (Awas Boncos!)`;
      trendColor = colors.warning;
    } else if (diff < 0) {
      trendText = `📉 Turun ${pct}% dari bulan lalu (Aman!)`;
      trendColor = colors.success;
    } else {
      trendText = `⏸️ Sama aja kaya kemaren`;
    }
  }

  // Compute Weekly Statistics
  const wStart = activeWeeklyPlan?.startDate || currentWeek.startDate;
  const wEnd = activeWeeklyPlan?.endDate || currentWeek.endDate;
  const wDaysCount = getWeekDaysCount(wStart, wEnd);
  const wIncome = activeWeeklyPlan?.income || 0;
  const wAllocated = activeWeeklyPlan?.expenses.reduce((sum, e) => sum + e.plannedAmount, 0) || 0;
  const wRemaining = wIncome - wAllocated;
  const wProgress = wIncome > 0 ? wAllocated / wIncome : 0;
  const wDailySafe = wDaysCount > 0 ? Math.floor(wIncome / wDaysCount) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>HALO BOSKU!</Text>
          <Text style={[typography.h2, typography.weightBold, { color: colors.textPrimary }]}>Anti Boncos by Adib</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>Atur gajian biar gak cuma lewat</Text>
        </View>
        <Button 
          title="Backup ⚙️" 
          onPress={() => navigation.navigate('BackupRestore')} 
          variant="ghost" 
          style={styles.settingsBtn}
        />
      </View>

      {/* MONTHLY SUMMARY CARD */}
      <Card variant="elevated" style={styles.planCard}>
        <View style={styles.cardHeader}>
          <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.primaryLight }]}>
            Jatah Bulanan ({formatMonthYear(currentMonth)})
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>BULANAN</Text>
        </View>

        {activeMonthlyPlan ? (
          <View>
            <View style={styles.statRow}>
              <View>
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>Gaji Masuk</Text>
                <Text style={[typography.h3, typography.weightBold, { color: colors.textPrimary }]}>
                  {formatRupiah(mIncome)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>Udah Diplot</Text>
                <Text style={[typography.h3, typography.weightBold, { color: colors.primaryLight }]}>
                  {formatRupiah(mAllocated)}
                </Text>
              </View>
            </View>

            <ProgressBar progress={mProgress} color={colors.primary} showPercentage />

            <View style={styles.remainingRow}>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Sisa Saldo:</Text>
              <Text
                style={[
                  typography.bodyLarge,
                  typography.weightBold,
                  { color: mRemaining >= 0 ? colors.success : colors.error },
                ]}
              >
                {formatRupiah(mRemaining)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCardState}>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: 12 }]}>
              Belum ada plan budget nih buat {formatMonthYear(currentMonth)}.
            </Text>
            <Button
              title="Bikin Plan Bulanan"
              onPress={() => navigation.navigate('MonthlyPlan')}
              variant="secondary"
            />
          </View>
        )}
      </Card>

      {/* WEEKLY SUMMARY CARD */}
      <Card variant="elevated" style={styles.planCard}>
        <View style={styles.cardHeader}>
          <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.info }]}>
            Jatah Mingguan
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>MINGGUAN ({wDaysCount} HARI)</Text>
        </View>
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 12 }]}>
          {formatDateRange(wStart, wEnd)}
        </Text>

        {activeWeeklyPlan ? (
          <View>
            <View style={styles.statRow}>
              <View>
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>Jatah Minggu Ini</Text>
                <Text style={[typography.h3, typography.weightBold, { color: colors.textPrimary }]}>
                  {formatRupiah(wIncome)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>Udah Diplot</Text>
                <Text style={[typography.h3, typography.weightBold, { color: colors.info }]}>
                  {formatRupiah(wAllocated)}
                </Text>
              </View>
            </View>

            <ProgressBar progress={wProgress} color={colors.info} showPercentage />

            <View style={styles.remainingRow}>
              <View>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Sisa Jatah:</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                  🛡️ Batas aman ≈ {formatRupiah(wDailySafe)} / hari
                </Text>
              </View>
              <Text
                style={[
                  typography.bodyLarge,
                  typography.weightBold,
                  { color: wRemaining >= 0 ? colors.success : colors.error },
                ]}
              >
                {formatRupiah(wRemaining)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCardState}>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: 12 }]}>
              Belum ada plan budget minggu ini.
            </Text>
            <Button
              title="Bikin Plan Mingguan"
              onPress={() => navigation.navigate('WeeklyPlan')}
              variant="secondary"
            />
          </View>
        )}
      </Card>

      {/* SPENDING TREND CARD */}
      <Card variant="elevated" style={styles.planCard}>
        <View style={styles.cardHeader}>
          <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary }]}>
            Tren Pengeluaran
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>3 BULAN TERAKHIR</Text>
        </View>

        <View style={styles.chartContainer}>
          {trendData.map((data, index) => {
            const heightPct = (data.value / maxVal) * 100;
            const isCurrent = index === 2;
            return (
              <View key={data.label} style={styles.chartColumn}>
                <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 6, fontSize: 10 }]} numberOfLines={1}>
                  {data.value > 0 ? formatRupiah(data.value).replace('Rp', '') : '0'}
                </Text>
                <View style={styles.chartBarBackground}>
                  <View 
                    style={[
                      styles.chartBarFill, 
                      { height: `${heightPct}%`, backgroundColor: isCurrent ? colors.primary : colors.border }
                    ]} 
                  />
                </View>
                <Text style={[typography.bodySmall, { color: isCurrent ? colors.primaryLight : colors.textSecondary, marginTop: 8 }]}>
                  {data.label}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={[typography.bodyMedium, typography.weightBold, { color: trendColor }]}>
            {trendText}
          </Text>
        </View>
      </Card>

      {/* QUICK LINKS SECTION */}
      <View style={styles.quickLinks}>
        {/* Removed Categories Manager button as categories are now text inputs */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  settingsBtn: {
    height: 40,
    paddingHorizontal: 12,
  },
  planCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  remainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: colors.borderMuted,
    paddingTop: 12,
  },
  emptyCardState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  quickLinks: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    marginTop: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.borderMuted,
    paddingBottom: 12,
  },
  chartColumn: {
    alignItems: 'center',
    width: 80,
  },
  chartBarBackground: {
    height: 90,
    width: 28,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 14,
  },
});
