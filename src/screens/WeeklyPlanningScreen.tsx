import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { useBudgetStore } from '../store/budgetStore';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { formatRupiah, parseRupiah } from '../utils/currency';
import { 
  getCurrentMonth, 
  getCurrentWeekRange, 
  formatDateRange, 
  formatMonthYear, 
  getWeeksForMonth, 
  getWeekDaysCount, 
  getDaysInMonth 
} from '../utils/date';

interface LocalExpense {
  categoryName: string;
  plannedAmount: number;
  notes: string;
}

export const WeeklyPlanningScreen = () => {
  const { weeklyPlans, monthlyPlans, installments, saveWeeklyPlan, deleteWeeklyPlan } = useBudgetStore();

  const realTodayWeek = getCurrentWeekRange();
  const realCurrentMonth = getCurrentMonth();

  const [selectedMonth, setSelectedMonth] = useState<string>(realCurrentMonth);
  const [currentWeek, setCurrentWeek] = useState(realTodayWeek);

  // Match plan either by exact startDate or if a custom legacy plan overlaps
  const activePlan = useMemo(() => {
    return weeklyPlans.find((p) => p.startDate === currentWeek.startDate);
  }, [weeklyPlans, currentWeek.startDate]);

  // Form states
  const [incomeInput, setIncomeInput] = useState<string>('0');
  const [expenses, setExpenses] = useState<LocalExpense[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newAmountInput, setNewAmountInput] = useState<string>('');
  const [newNotesInput, setNewNotesInput] = useState<string>('');

  // Generate 5 months (-2, -1, 0, 1, 2) relative to current month
  const availableMonths = useMemo(() => {
    return [-2, -1, 0, 1, 2].map((offset) => dayjs().add(offset, 'month').format('YYYY-MM'));
  }, []);

  // Generate the 4 structured weeks for the selected month
  const monthWeeks = useMemo(() => {
    return getWeeksForMonth(selectedMonth);
  }, [selectedMonth]);

  // Chronologically sorted history of saved weekly plans
  const sortedWeeklyPlans = useMemo(() => {
    return (Array.isArray(weeklyPlans) ? weeklyPlans : [])
      .filter((p) => Boolean(p?.startDate && p?.endDate))
      .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  }, [weeklyPlans]);

  // Automatically switch to current week when screen is focused
  useFocusEffect(
    useCallback(() => {
      const nowWeek = getCurrentWeekRange();
      setSelectedMonth(getCurrentMonth());
      setCurrentWeek(nowWeek);
    }, [])
  );

  // When user switches month tab, select the current week if it's the current month, otherwise Week 1 of that month
  const handleSelectMonth = (mStr: string) => {
    setSelectedMonth(mStr);
    const nowWeek = getCurrentWeekRange();
    if (mStr === getCurrentMonth()) {
      setCurrentWeek(nowWeek);
    } else {
      const weeks = getWeeksForMonth(mStr);
      if (weeks.length > 0) {
        setCurrentWeek({ startDate: weeks[0].startDate, endDate: weeks[0].endDate });
      }
    }
  };

  // Load existing plan data
  useEffect(() => {
    if (activePlan) {
      setIncomeInput((activePlan.income ?? 0).toString());
      setExpenses(
        (Array.isArray(activePlan.expenses) ? activePlan.expenses : []).map((e) => ({
          categoryName: e.categoryName || 'Pengeluaran',
          plannedAmount: Number(e.plannedAmount) || 0,
          notes: e.notes || '',
        }))
      );
    } else {
      setIncomeInput('0');
      setExpenses([]);
    }
  }, [activePlan, currentWeek.startDate]);

  // Compute weekly duration & calculations
  const daysInWeek = getWeekDaysCount(currentWeek.startDate, currentWeek.endDate);
  const totalDaysInMonth = getDaysInMonth(selectedMonth);
  const currentWeekInfo = monthWeeks.find((w) => w.startDate === currentWeek.startDate);

  const income = parseRupiah(incomeInput);
  const totalPlanned = expenses.reduce((sum, e) => sum + e.plannedAmount, 0);
  const remaining = income - totalPlanned;
  const isOverBudget = totalPlanned > income;

  // Daily safe limit calculations
  const dailyBudgetFromIncome = daysInWeek > 0 ? Math.floor(income / daysInWeek) : 0;
  const dailyPlannedAvg = daysInWeek > 0 ? Math.floor(totalPlanned / daysInWeek) : 0;
  const dailyRemainingSafe = daysInWeek > 0 && remaining > 0 ? Math.floor(remaining / daysInWeek) : 0;

  // Monthly integration calculations for selectedMonth
  const activeMonthlyPlan = useMemo(
    () => monthlyPlans.find((p) => p.month === selectedMonth),
    [monthlyPlans, selectedMonth]
  );

  const monthlyInstallmentsTotal = useMemo(() => {
    return installments
      .filter((inst) => inst.startMonth <= selectedMonth && inst.endMonth >= selectedMonth)
      .reduce((sum, inst) => sum + inst.amount, 0);
  }, [installments, selectedMonth]);

  const monthlyIncome = activeMonthlyPlan?.income || 0;
  const monthlyExpensesTotal =
    (Array.isArray(activeMonthlyPlan?.expenses)
      ? activeMonthlyPlan.expenses.reduce((sum, e) => sum + (Number(e.plannedAmount) || 0), 0)
      : 0) + monthlyInstallmentsTotal;
  const monthlyUnallocated = monthlyIncome - monthlyExpensesTotal;

  // Base pool from monthly plan: if user still has unallocated monthly money, use that; otherwise fallback to monthly income
  const monthlyPoolForWeekly = monthlyUnallocated > 0 ? monthlyUnallocated : monthlyIncome;
  const monthlyPoolLabel =
    monthlyUnallocated > 0 ? 'Sisa Gaji Bulanan (Belum Diplot)' : 'Total Gaji Bulanan';

  // Calculate total weekly budgets across this month (including live edits on the active week)
  const otherWeeksInMonth = (Array.isArray(weeklyPlans) ? weeklyPlans : []).filter(
    (p) => Boolean(p?.startDate) && p.startDate.startsWith(selectedMonth) && p.startDate !== currentWeek.startDate
  );
  const otherWeeksIncomeTotal = otherWeeksInMonth.reduce((sum, p) => sum + p.income, 0);
  const monthTotalWeeklyIncome = otherWeeksIncomeTotal + income;
  const isExceedingMonthlyPool =
    monthlyPoolForWeekly > 0 && monthTotalWeeklyIncome > monthlyPoolForWeekly;

  // One-click auto-fill helpers for lay users
  const handleAutoFillProportional = () => {
    if (monthlyPoolForWeekly <= 0) return;
    const proportionalAmount = Math.round((monthlyPoolForWeekly * daysInWeek) / totalDaysInMonth);
    setIncomeInput(proportionalAmount.toString());
  };

  const handleAutoFillEqual = () => {
    if (monthlyPoolForWeekly <= 0) return;
    const equalAmount = Math.round(monthlyPoolForWeekly / 4);
    setIncomeInput(equalAmount.toString());
  };

  // Add row
  const handleAddCategoryRow = () => {
    const categoryName = newCategoryName.trim();
    if (!categoryName) {
      Alert.alert('Wajib Diisi', 'Masukin nama pengeluaran dulu ya (misal: Makan, Bensin).');
      return;
    }

    const alreadyExists = expenses.some((e) => e.categoryName.toLowerCase() === categoryName.toLowerCase());
    if (alreadyExists) {
      Alert.alert('Udah Ada', 'Pengeluaran ini udah ada di daftar. Langsung ubah angkanya di atas aja ya.');
      return;
    }

    const amount = parseRupiah(newAmountInput);
    setExpenses((prev) => [
      ...prev,
      {
        categoryName: categoryName,
        plannedAmount: amount,
        notes: newNotesInput,
      },
    ]);

    setNewCategoryName('');
    setNewAmountInput('');
    setNewNotesInput('');
  };

  // Modify expense amounts and notes
  const handleAmountChange = (index: number, val: string) => {
    const numericVal = parseRupiah(val);
    setExpenses((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, plannedAmount: numericVal } : item))
    );
  };

  const handleNotesChange = (index: number, text: string) => {
    setExpenses((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, notes: text } : item))
    );
  };

  // Delete row
  const handleDeleteRow = (index: number) => {
    setExpenses((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Save weekly plan
  const handleSave = async () => {
    if (income <= 0) {
      Alert.alert('Jatah Mingguan Kosong', 'Isi dulu jatah pemasukan mingguan lebih dari Rp0 ya (bisa klik tombol bagi otomatis di atas).');
      return;
    }

    try {
      await saveWeeklyPlan(currentWeek.startDate, currentWeek.endDate, income, expenses);
      Alert.alert('Tersimpan! ✅', `Plan untuk ${formatDateRange(currentWeek.startDate, currentWeek.endDate)} berhasil disimpan.`);
    } catch (e: any) {
      Alert.alert('Gagal Menyimpan', e.message || 'Terjadi kesalahan saat menyimpan plan mingguan.');
    }
  };

  // Delete entire weekly plan
  const handleDeletePlan = () => {
    if (!activePlan) return;
    Alert.alert(
      'Hapus Plan Minggu Ini?',
      `Data plan untuk periode ${formatDateRange(currentWeek.startDate, currentWeek.endDate)} bakal dihapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await deleteWeeklyPlan(activePlan.id);
            setIncomeInput('0');
            setExpenses([]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* STEP 0: MONTH & WEEK 1-4 SELECTOR */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
            📅 Pilih Bulan & Minggu
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 10 }]}>
            Satu bulan dibagi jadi 4 minggu tetap biar lo gampang ngontrol pengeluaran.
          </Text>

          {/* Month Selector Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
            {availableMonths.map((mStr) => {
              const isSelected = selectedMonth === mStr;
              const isCurrent = mStr === realCurrentMonth;
              return (
                <TouchableOpacity
                  key={mStr}
                  style={[styles.historyPill, isSelected && styles.historyPillActive]}
                  onPress={() => handleSelectMonth(mStr)}
                >
                  <Text style={[styles.historyPillText, isSelected && styles.historyPillTextActive]}>
                    {isCurrent ? `🌟 ${formatMonthYear(mStr)}` : formatMonthYear(mStr)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 4 Weeks Grid for Selected Month */}
          <View style={styles.weekGrid}>
            {monthWeeks.map((w) => {
              const isSelected = currentWeek.startDate === w.startDate;
              const isCurrentRealWeek = realTodayWeek.startDate === w.startDate;
              const hasSavedPlan = weeklyPlans.some((p) => p.startDate === w.startDate);

              return (
                <TouchableOpacity
                  key={w.weekNumber}
                  style={[
                    styles.weekCard,
                    isSelected && styles.weekCardActive,
                    !isSelected && hasSavedPlan && styles.weekCardSaved,
                  ]}
                  onPress={() => setCurrentWeek({ startDate: w.startDate, endDate: w.endDate })}
                >
                  <View style={styles.weekCardHeader}>
                    <Text
                      style={[
                        typography.bodyMedium,
                        typography.weightBold,
                        { color: isSelected ? colors.background : colors.textPrimary },
                      ]}
                    >
                      {w.label} {isCurrentRealWeek ? '🌟' : ''}
                    </Text>
                    {hasSavedPlan && (
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: isSelected ? colors.background : colors.success,
                        }}
                      >
                        ✓ Terisi
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: isSelected ? colors.background : colors.textSecondary,
                        marginTop: 4,
                      },
                    ]}
                  >
                    {dayjs(w.startDate).format('DD')} - {dayjs(w.endDate).format('DD MMM')} ({w.daysCount} hari)
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Saved History Quick Access (including any custom legacy ranges) */}
          {sortedWeeklyPlans.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                🗂️ Riwayat Plan Mingguan Tersimpan:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {sortedWeeklyPlans.map((plan) => {
                  const isActive = currentWeek.startDate === plan.startDate;
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[styles.savedHistoryChip, isActive && styles.savedHistoryChipActive]}
                      onPress={() => {
                        setSelectedMonth(dayjs(plan.startDate).format('YYYY-MM'));
                        setCurrentWeek({ startDate: plan.startDate, endDate: plan.endDate });
                      }}
                    >
                      <Text
                        style={[
                          styles.savedHistoryChipText,
                          isActive && styles.savedHistoryChipTextActive,
                        ]}
                      >
                        {formatDateRange(plan.startDate, plan.endDate)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Active Cycle Banner & Longer Week 4 Notice */}
          <View style={styles.activeCycleBanner}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMedium, typography.weightBold, { color: colors.primaryLight }]}>
                📌 Periode Aktif: {currentWeekInfo ? `${currentWeekInfo.label} • ` : ''}
                {formatDateRange(currentWeek.startDate, currentWeek.endDate)} ({daysInWeek} Hari)
              </Text>
              {daysInWeek > 7 && (
                <Text style={[typography.caption, { color: colors.warning, marginTop: 4 }]}>
                  ⏳ Minggu ke-4 ini punya {daysInWeek} hari (lebih panjang dari 7 hari biasa). Pastiin jatah uangnya cukup sampai akhir bulan ya!
                </Text>
              )}
            </View>
            {activePlan && (
              <TouchableOpacity onPress={handleDeletePlan} style={styles.deletePlanBtn}>
                <Text style={{ color: colors.error, fontSize: 12, fontWeight: '700' }}>🗑️ Hapus Plan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* STEP 1: WEEKLY INCOME + SMART MONTHLY HELPER */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
            1. Tentukan Jatah Minggu Ini
          </Text>

          {/* Smart Helper Connected to Monthly Plan */}
          {activeMonthlyPlan && monthlyPoolForWeekly > 0 ? (
            <View style={styles.helperCard}>
              <Text style={[typography.bodySmall, typography.weightBold, { color: colors.info, marginBottom: 4 }]}>
                💡 Bantu Hitung Otomatis dari Plan {formatMonthYear(selectedMonth)}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 10 }]}>
                {monthlyPoolLabel}:{' '}
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                  {formatRupiah(monthlyPoolForWeekly)}
                </Text>
                {'  •  '}Total 4 minggu diplot:{' '}
                <Text
                  style={{
                    color: isExceedingMonthlyPool ? colors.error : colors.success,
                    fontWeight: '700',
                  }}
                >
                  {formatRupiah(monthTotalWeeklyIncome)}
                </Text>
              </Text>

              <View style={styles.autoFillBtnRow}>
                <TouchableOpacity
                  style={[styles.autoFillBtn, styles.autoFillBtnPrimary]}
                  onPress={handleAutoFillProportional}
                >
                  <Text style={styles.autoFillBtnPrimaryText}>
                    ⚖️ Sesuai Hari ({daysInWeek} hr)
                  </Text>
                  <Text style={styles.autoFillSubText}>
                    {formatRupiah(Math.round((monthlyPoolForWeekly * daysInWeek) / totalDaysInMonth))}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.autoFillBtn} onPress={handleAutoFillEqual}>
                  <Text style={styles.autoFillBtnText}>➗ Bagi Rata 4 Minggu</Text>
                  <Text style={[styles.autoFillSubText, { color: colors.textSecondary }]}>
                    {formatRupiah(Math.round(monthlyPoolForWeekly / 4))}
                  </Text>
                </TouchableOpacity>
              </View>

              {isExceedingMonthlyPool && (
                <Text style={[typography.caption, { color: colors.error, marginTop: 8, fontWeight: '600' }]}>
                  ⚠️ Total jatah mingguan bulan ini ({formatRupiah(monthTotalWeeklyIncome)}) melebihi {monthlyPoolLabel.toLowerCase()} ({formatRupiah(monthlyPoolForWeekly)})!
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.helperCardMuted}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                💡 Tips: Kalau lo isi <Text style={{ color: colors.primaryLight, fontWeight: '700' }}>Plan Bulanan</Text> dulu, aplikasi ini bakal otomatis ngitungin rekomendasi jatah mingguan biar gak boncos di akhir bulan.
              </Text>
            </View>
          )}

          <Input
            label={`Jatah Uang Minggu Ini (${daysInWeek} Hari)`}
            value={formatRupiah(incomeInput)}
            onChangeText={(val) => setIncomeInput(parseRupiah(val).toString())}
            keyboardType="numeric"
            placeholder="misal: 500.000"
          />

          {/* Daily Safe Allowance Indicator */}
          {income > 0 && (
            <View style={styles.dailySafeBox}>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                🛡️ Batas aman keluar uang:{' '}
                <Text style={{ color: colors.primaryLight, fontWeight: '800' }}>
                  {formatRupiah(dailyBudgetFromIncome)} / hari
                </Text>{' '}
                (selama {daysInWeek} hari)
              </Text>
            </View>
          )}
        </View>

        {/* STEP 2: ALLOCATED EXPENSES */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
            2. Rincian Pengeluaran Mingguan
          </Text>

          {expenses.length === 0 ? (
            <Text style={[typography.bodyMedium, styles.emptyText]}>
              Belum ada pengeluaran mingguan. Yuk tambahin di bawah.
            </Text>
          ) : (
            expenses.map((item, index) => {
              const itemPerDay = daysInWeek > 0 ? Math.floor(item.plannedAmount / daysInWeek) : 0;
              return (
                <View key={item.categoryName} style={styles.expenseRow}>
                  <View style={styles.rowHeader}>
                    <View>
                      <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary }]}>
                        📌 {item.categoryName}
                      </Text>
                      {item.plannedAmount > 0 && (
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          ≈ {formatRupiah(itemPerDay)} / hari
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteRow(index)} style={styles.deleteBtn}>
                      <Text style={{ color: colors.error, fontSize: 13, fontWeight: '700' }}>Hapus ❌</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.rowInputs}>
                    <Input
                      placeholder="Jumlah (Rp)"
                      value={formatRupiah(item.plannedAmount)}
                      onChangeText={(val) => handleAmountChange(index, val)}
                      keyboardType="numeric"
                      containerStyle={{ flex: 1, marginRight: 8 }}
                    />
                    <Input
                      placeholder="Catatan (Opsional)"
                      value={item.notes}
                      onChangeText={(text) => handleNotesChange(index, text)}
                      containerStyle={{ flex: 1.5 }}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ADD CATEGORY FORM */}
        <View style={[styles.section, styles.addCategorySection]}>
          <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary, marginBottom: 12 }]}>
            ➕ Tambah Pengeluaran
          </Text>

          <Input
            placeholder="Nama Pengeluaran (Makan, Ngemil, Bensin, dll)"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            containerStyle={{ marginBottom: 12 }}
          />

          <View style={styles.rowInputs}>
            <Input
              placeholder="Jumlah (Rp)"
              value={formatRupiah(newAmountInput)}
              onChangeText={(val) => setNewAmountInput(parseRupiah(val).toString())}
              keyboardType="numeric"
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <Input
              placeholder="Catatan (Opsional)"
              value={newNotesInput}
              onChangeText={setNewNotesInput}
              containerStyle={{ flex: 1.5 }}
            />
          </View>
          <Button
            title="Tambah ke Plot"
            onPress={handleAddCategoryRow}
            variant="secondary"
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>

      {/* FOOTER CALCULATION BAR */}
      <View style={styles.footer}>
        {isOverBudget && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>⚠️ Waduh, pengeluaran mingguan lo melebihi jatah minggu ini!</Text>
          </View>
        )}
        <View style={styles.footerStats}>
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              TOTAL DIPLOT ({daysInWeek} HARI)
            </Text>
            <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary }]}>
              {formatRupiah(totalPlanned)}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              ≈ {formatRupiah(dailyPlannedAvg)} / hari
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>SISA JATAH MINGGU INI</Text>
            <Text
              style={[
                typography.bodyLarge,
                typography.weightBold,
                { color: remaining >= 0 ? colors.success : colors.error },
              ]}
            >
              {formatRupiah(remaining)}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {remaining >= 0
                ? `Sisa bebas ≈ ${formatRupiah(dailyRemainingSafe)} / hari`
                : 'Minus / Kurang budget'}
            </Text>
          </View>
        </View>
        <Button title="Simpan Plan Mingguan" onPress={handleSave} style={styles.saveBtn} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 210,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  weekGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  weekCard: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  weekCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  weekCardSaved: {
    borderColor: colors.primaryLight,
  },
  weekCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedHistoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  savedHistoryChipActive: {
    borderColor: colors.primaryLight,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  savedHistoryChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  savedHistoryChipTextActive: {
    color: colors.primaryLight,
  },
  activeCycleBanner: {
    marginTop: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deletePlanBtn: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  helperCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginTop: 6,
    marginBottom: 14,
  },
  helperCardMuted: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginTop: 6,
    marginBottom: 12,
  },
  autoFillBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  autoFillBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  autoFillBtnPrimary: {
    borderColor: colors.primaryLight,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  autoFillBtnPrimaryText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  autoFillBtnText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  autoFillSubText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  dailySafeBox: {
    marginTop: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  expenseRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCategorySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 16,
  },
  historyScroll: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 4,
  },
  historyPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  historyPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  historyPillText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  historyPillTextActive: {
    color: colors.background,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
    padding: 16,
  },
  warningBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  warningText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '700',
  },
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  saveBtn: {
    width: '100%',
  },
});
