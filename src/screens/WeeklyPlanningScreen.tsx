import React, { useState, useEffect, useCallback } from 'react';
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
import { getCurrentWeekRange, formatDateRange } from '../utils/date';

interface LocalExpense {
  categoryName: string;
  plannedAmount: number;
  notes: string;
}

export const WeeklyPlanningScreen = () => {
  const { weeklyPlans, saveWeeklyPlan } = useBudgetStore();

  const [currentWeek, setCurrentWeek] = useState(getCurrentWeekRange());
  const activePlan = weeklyPlans.find((p) => p.startDate === currentWeek.startDate);

  // Form states
  const [incomeInput, setIncomeInput] = useState<string>('0');
  const [expenses, setExpenses] = useState<LocalExpense[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newAmountInput, setNewAmountInput] = useState<string>('');
  const [newNotesInput, setNewNotesInput] = useState<string>('');

  // Automatically switch to current week when screen is focused
  useFocusEffect(
    useCallback(() => {
      setCurrentWeek(getCurrentWeekRange());
    }, [])
  );

  // Load existing plan data
  useEffect(() => {
    if (activePlan) {
      setIncomeInput(activePlan.income.toString());
      setExpenses(
        activePlan.expenses.map((e) => ({
          categoryName: e.categoryName,
          plannedAmount: e.plannedAmount,
          notes: e.notes || '',
        }))
      );
    } else {
      setIncomeInput('0');
      setExpenses([]);
    }
  }, [activePlan, currentWeek]);

  // Adjust dates
  const shiftDates = (days: number) => {
    setCurrentWeek(prev => ({
      startDate: dayjs(prev.startDate).add(days, 'day').format('YYYY-MM-DD'),
      endDate: dayjs(prev.endDate).add(days, 'day').format('YYYY-MM-DD'),
    }));
  };

  // Compute calculations
  const income = parseRupiah(incomeInput);
  const totalPlanned = expenses.reduce((sum, e) => sum + e.plannedAmount, 0);
  const remaining = income - totalPlanned;
  const isOverBudget = totalPlanned > income;

  // Add row
  const handleAddCategoryRow = () => {
    const categoryName = newCategoryName.trim();
    if (!categoryName) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }

    const alreadyExists = expenses.some((e) => e.categoryName.toLowerCase() === categoryName.toLowerCase());
    if (alreadyExists) {
      Alert.alert('Duplicate Category', 'This category is already listed.');
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
    setExpenses((prev) => {
      const updated = [...prev];
      updated[index].plannedAmount = numericVal;
      return updated;
    });
  };

  const handleNotesChange = (index: number, text: string) => {
    setExpenses((prev) => {
      const updated = [...prev];
      updated[index].notes = text;
      return updated;
    });
  };

  // Delete row
  const handleDeleteRow = (index: number) => {
    setExpenses((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Save weekly plan
  const handleSave = async () => {
    if (income <= 0) {
      Alert.alert('Invalid Income', 'Please set a weekly income greater than Rp0.');
      return;
    }

    try {
      await saveWeeklyPlan(currentWeek.startDate, currentWeek.endDate, income, expenses);
      Alert.alert('Success', 'Weekly plan saved successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save weekly plan.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* HISTORY & CYCLE SELECTOR */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
            📅 Riwayat Mingguan
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
            <TouchableOpacity 
              style={[styles.historyPill, currentWeek.startDate === getCurrentWeekRange().startDate && styles.historyPillActive]}
              onPress={() => setCurrentWeek(getCurrentWeekRange())}
            >
              <Text style={[styles.historyPillText, currentWeek.startDate === getCurrentWeekRange().startDate && styles.historyPillTextActive]}>
                🌟 Minggu Ini
              </Text>
            </TouchableOpacity>
            
            {weeklyPlans.map(plan => {
              const isActive = currentWeek.startDate === plan.startDate;
              if (plan.startDate === getCurrentWeekRange().startDate) return null; // Already shown
              
              return (
                <TouchableOpacity 
                  key={plan.id}
                  style={[styles.historyPill, isActive && styles.historyPillActive]}
                  onPress={() => setCurrentWeek({ startDate: plan.startDate, endDate: plan.endDate })}
                >
                  <Text style={[styles.historyPillText, isActive && styles.historyPillTextActive]}>
                    {formatDateRange(plan.startDate, plan.endDate)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.dateSelectorContainer}>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: 8 }]}>
              Atur Siklus Custom (Per 7 Hari)
            </Text>
            <View style={styles.dateControlRow}>
              <TouchableOpacity onPress={() => shiftDates(-7)} style={styles.dateBtn}>
                <Text style={styles.dateBtnText}>- 1 Mgu</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => shiftDates(-1)} style={styles.dateBtn}>
                <Text style={styles.dateBtnText}>- 1 Hari</Text>
              </TouchableOpacity>
              
              <View style={styles.currentDateDisplay}>
                <Text style={[typography.bodyMedium, typography.weightBold, { color: colors.primaryLight }]}>
                  {formatDateRange(currentWeek.startDate, currentWeek.endDate)}
                </Text>
              </View>

              <TouchableOpacity onPress={() => shiftDates(1)} style={styles.dateBtn}>
                <Text style={styles.dateBtnText}>+ 1 Hari</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => shiftDates(7)} style={styles.dateBtn}>
                <Text style={styles.dateBtnText}>+ 1 Mgu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* INCOME CONTAINER */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
            1. Set Pemasukan Mingguan
          </Text>
          <Input
            label="Masukan Mingguan (Rp)"
            value={formatRupiah(incomeInput)}
            onChangeText={(val) => setIncomeInput(parseRupiah(val).toString())}
            keyboardType="numeric"
            placeholder="misal: 500.000"
          />
        </View>

        {/* ALLOCATED EXPENSES */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
            2. Alokasi Mingguan (Udah Diplot)
          </Text>

          {expenses.length === 0 ? (
            <Text style={[typography.bodyMedium, styles.emptyText]}>
              Belum ada pengeluaran mingguan. Yuk tambahin di bawah.
            </Text>
          ) : (
            expenses.map((item, index) => {
              return (
                <View key={item.categoryName} style={styles.expenseRow}>
                  <View style={styles.rowHeader}>
                    <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary }]}>
                      📌 {item.categoryName}
                    </Text>
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
            placeholder="Nama Pengeluaran (Ngemil, Bensin, dll)"
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
            <Text style={styles.warningText}>⚠️ Waduh, plan mingguan lo melebihi masukan!</Text>
          </View>
        )}
        <View style={styles.footerStats}>
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>TOTAL DIPLOT</Text>
            <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary }]}>
              {formatRupiah(totalPlanned)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>SISA UANG</Text>
            <Text
              style={[
                typography.bodyLarge,
                typography.weightBold,
                { color: remaining >= 0 ? colors.success : colors.error },
              ]}
            >
              {formatRupiah(remaining)}
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
    paddingBottom: 180,
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
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  catPillText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  historyScroll: {
    flexDirection: 'row',
    marginBottom: 16,
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
  dateSelectorContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  currentDateDisplay: {
    flex: 1,
    alignItems: 'center',
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
