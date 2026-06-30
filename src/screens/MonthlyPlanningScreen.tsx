import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { getCurrentMonth, formatMonthYear } from '../utils/date';

interface LocalExpense {
  categoryName: string;
  plannedAmount: number;
  notes: string;
}

export const MonthlyPlanningScreen = () => {
  const { monthlyPlans, saveMonthlyPlan, installments, addInstallment, deleteInstallment } = useBudgetStore();

  const currentRealMonth = getCurrentMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentRealMonth);
  const activePlan = monthlyPlans.find((p) => p.month === selectedMonth);

  // Automatically switch to current month when screen is focused
  useFocusEffect(
    useCallback(() => {
      setSelectedMonth(getCurrentMonth());
    }, [])
  );

  // Generate 5 months (-2, -1, 0, 1, 2) relative to currentRealMonth
  const availableMonths = useMemo(() => {
    return [-2, -1, 0, 1, 2].map(offset => dayjs().add(offset, 'month').format('YYYY-MM'));
  }, []);

  // Form states
  const [incomeInput, setIncomeInput] = useState<string>('0');
  const [expenses, setExpenses] = useState<LocalExpense[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newAmountInput, setNewAmountInput] = useState<string>('');
  const [newNotesInput, setNewNotesInput] = useState<string>('');

  const [newInstName, setNewInstName] = useState<string>('');
  const [newInstAmount, setNewInstAmount] = useState<string>('');
  const [newInstEnd, setNewInstEnd] = useState<string>('');

  // Compute active installments for selected month
  const activeInstallments = installments.filter(
    (inst) => inst.startMonth <= selectedMonth && inst.endMonth >= selectedMonth
  );
  const totalInstallments = activeInstallments.reduce((sum, inst) => sum + inst.amount, 0);

  // Load existing plan data if it exists
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
  }, [activePlan, selectedMonth]);

  // Compute stats
  const income = parseRupiah(incomeInput);
  const totalManualPlanned = expenses.reduce((sum, e) => sum + e.plannedAmount, 0);
  const totalPlanned = totalManualPlanned + totalInstallments;
  const remaining = income - totalPlanned;
  const isOverBudget = totalPlanned > income;

  // Add category row to the allocation list
  const handleAddCategoryRow = () => {
    const categoryName = newCategoryName.trim();
    if (!categoryName) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }

    // Check if category is already added
    const alreadyExists = expenses.some((e) => e.categoryName.toLowerCase() === categoryName.toLowerCase());
    if (alreadyExists) {
      Alert.alert('Duplicate Category', 'This category is already listed. Edit the existing row.');
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

    // Reset temporary inputs
    setNewCategoryName('');
    setNewAmountInput('');
    setNewNotesInput('');
  };

  // Add Installment
  const handleAddInstallment = async () => {
    const name = newInstName.trim();
    if (!name) {
      Alert.alert('Required', 'Please enter an installment name.');
      return;
    }
    const endMonth = newInstEnd.trim();
    if (!/^\d{4}-\d{2}$/.test(endMonth)) {
      Alert.alert('Invalid Format', 'End Month must be in YYYY-MM format (e.g. 2027-04)');
      return;
    }
    if (endMonth < selectedMonth) {
      Alert.alert('Invalid Month', 'End Month cannot be in the past compared to the current selected cycle.');
      return;
    }
    
    const amount = parseRupiah(newInstAmount);
    if (amount <= 0) {
      Alert.alert('Required', 'Please enter a valid installment amount.');
      return;
    }

    await addInstallment(name, amount, selectedMonth, endMonth);
    
    setNewInstName('');
    setNewInstAmount('');
    setNewInstEnd('');
    Alert.alert('Added', 'Installment plan activated!');
  };

  // Modify expense in line
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

  // Save to Zustand & database
  const handleSave = async () => {
    if (income <= 0) {
      Alert.alert('Invalid Income', 'Please set a monthly income greater than Rp0.');
      return;
    }

    try {
      await saveMonthlyPlan(selectedMonth, income, expenses);
      Alert.alert('Success', `Monthly plan for ${formatMonthYear(selectedMonth)} saved successfully.`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save plan.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* MONTH SELECTOR */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
            📅 Pilih Bulan
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
            {availableMonths.map((mStr) => {
              const isActive = selectedMonth === mStr;
              const isCurrent = mStr === currentRealMonth;
              
              return (
                <TouchableOpacity 
                  key={mStr}
                  style={[styles.historyPill, isActive && styles.historyPillActive]}
                  onPress={() => setSelectedMonth(mStr)}
                >
                  <Text style={[styles.historyPillText, isActive && styles.historyPillTextActive]}>
                    {isCurrent ? `🌟 ${formatMonthYear(mStr)}` : formatMonthYear(mStr)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* INCOME CONTAINER */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
            1. Set Pemasukan/Gaji ({formatMonthYear(selectedMonth)})
          </Text>
          <Input
            label="Gaji Masuk (Rp)"
            value={formatRupiah(incomeInput)}
            onChangeText={(val) => setIncomeInput(parseRupiah(val).toString())}
            keyboardType="numeric"
            placeholder="misal: 4.000.000"
          />
        </View>

        {/* ALLOCATED EXPENSES */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
            2. Alokasi Budget (Udah Diplot)
          </Text>

          {expenses.length === 0 ? (
            <Text style={[typography.bodyMedium, styles.emptyText]}>
              Belum ada pengeluaran yang di-plot. Tambahin di bawah ya.
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
                      placeholder="Bakal Kepake (Rp)"
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

        {/* ADD NEW CATEGORY ALLOCATION FORM */}
        <View style={[styles.section, styles.addCategorySection]}>
          <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary, marginBottom: 12 }]}>
            ➕ Tambah Pengeluaran
          </Text>
          
          <Input
            placeholder="Nama Pengeluaran (Kos, Makan, dll)"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            containerStyle={{ marginBottom: 12 }}
          />

          <View style={styles.rowInputs}>
            <Input
              placeholder="Bakal Kepake (Rp)"
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

        {/* AUTO-RECURRING INSTALLMENTS */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
            3. Cicilan Otomatis (Gak Perlu Input Ulang)
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 12 }]}>
            Ini bakal otomatis kepotong dari budget lo tiap bulannya.
          </Text>

          {activeInstallments.length === 0 ? (
            <Text style={[typography.bodyMedium, styles.emptyText]}>
              Bulan ini aman dari cicilan otomatis.
            </Text>
          ) : (
            activeInstallments.map((inst) => (
              <View key={inst.id} style={[styles.expenseRow, { borderColor: colors.primaryLight, backgroundColor: 'rgba(56, 189, 248, 0.05)' }]}>
                <View style={styles.rowHeader}>
                  <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.primaryLight }]}>
                    🔄 {inst.name}
                  </Text>
                  <TouchableOpacity onPress={() => deleteInstallment(inst.id)} style={styles.deleteBtn}>
                    <Text style={{ color: colors.error, fontSize: 13, fontWeight: '700' }}>Stop ❌</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.rowInputs, { justifyContent: 'space-between' }]}>
                  <Text style={[typography.bodyMedium, typography.weightBold, { color: colors.textPrimary }]}>
                    {formatRupiah(inst.amount)}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    Sampai: {formatMonthYear(inst.endMonth)}
                  </Text>
                </View>
              </View>
            ))
          )}

          {/* ADD INSTALLMENT FORM */}
          <View style={[styles.addCategorySection, { marginTop: 12, borderColor: colors.primary }]}>
            <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.primaryLight, marginBottom: 12 }]}>
              ➕ Tambah Cicilan Baru
            </Text>
            
            <Input
              placeholder="Nama Cicilan (misal: Cicilan PC)"
              value={newInstName}
              onChangeText={setNewInstName}
              containerStyle={{ marginBottom: 12 }}
            />

            <View style={styles.rowInputs}>
              <Input
                placeholder="Jumlah (Rp)"
                value={formatRupiah(newInstAmount)}
                onChangeText={(val) => setNewInstAmount(parseRupiah(val).toString())}
                keyboardType="numeric"
                containerStyle={{ flex: 1, marginRight: 8 }}
              />
              <Input
                placeholder="Bulan Lunas (YYYY-MM)"
                value={newInstEnd}
                onChangeText={setNewInstEnd}
                containerStyle={{ flex: 1 }}
              />
            </View>
            <Button
              title="Aktifin Cicilan"
              onPress={handleAddInstallment}
              variant="primary"
              style={{ marginTop: 8 }}
            />
          </View>
        </View>

      </ScrollView>

      {/* STICKY FOOTER CALCULATION BAR */}
      <View style={styles.footer}>
        {isOverBudget && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>⚠️ Waduh, plan lo melebihi gaji! Awas boncos.</Text>
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
        <Button title="Simpan Plan Bulanan" onPress={handleSave} style={styles.saveBtn} />
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
    marginBottom: 12,
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
  historyScroll: {
    flexDirection: 'row',
    marginBottom: 8,
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
