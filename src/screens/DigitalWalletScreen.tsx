import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useBudgetStore } from '../store/budgetStore';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { formatRupiah, parseRupiah } from '../utils/currency';

interface LocalIncome {
  categoryName: string;
  amount: number;
  notes: string;
}

interface LocalExpense {
  categoryName: string;
  plannedAmount: number;
  notes: string;
}

const DEFAULT_WALLET_PRESETS = [
  'GoPay',
  'ShopeePay',
  'DANA',
  'OVO',
  'SeaBank',
  'Bank Jago',
];

export const DigitalWalletScreen = () => {
  const { digitalWallets, saveDigitalWallet, deleteDigitalWallet } = useBudgetStore();

  const [selectedWalletName, setSelectedWalletName] = useState<string>('GoPay');
  const [showAddCustomWallet, setShowAddCustomWallet] = useState<boolean>(false);
  const [customWalletInput, setCustomWalletInput] = useState<string>('');
  const [customWalletList, setCustomWalletList] = useState<string[]>([]);

  // Combine default presets, user's saved wallets, and newly added custom wallet names in session
  const availableWalletNames = useMemo(() => {
    const namesMap = new Map<string, string>();
    DEFAULT_WALLET_PRESETS.forEach((name) => namesMap.set(name.toLowerCase(), name));
    (Array.isArray(digitalWallets) ? digitalWallets : []).forEach((w) => {
      if (w?.name) namesMap.set(w.name.toLowerCase(), w.name);
    });
    customWalletList.forEach((name) => {
      if (name) namesMap.set(name.toLowerCase(), name);
    });
    return Array.from(namesMap.values());
  }, [digitalWallets, customWalletList]);

  // Active saved wallet for the currently selected name
  const activeWallet = useMemo(() => {
    return (Array.isArray(digitalWallets) ? digitalWallets : []).find(
      (w) => w?.name?.toLowerCase() === selectedWalletName.toLowerCase()
    );
  }, [digitalWallets, selectedWalletName]);

  // Form states for initial balance, incomes, and expenses
  const [balanceInput, setBalanceInput] = useState<string>('0');

  const [incomes, setIncomes] = useState<LocalIncome[]>([]);
  const [newIncomeName, setNewIncomeName] = useState<string>('');
  const [newIncomeAmountInput, setNewIncomeAmountInput] = useState<string>('');
  const [newIncomeNotesInput, setNewIncomeNotesInput] = useState<string>('');

  const [expenses, setExpenses] = useState<LocalExpense[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newAmountInput, setNewAmountInput] = useState<string>('');
  const [newNotesInput, setNewNotesInput] = useState<string>('');

  // Load existing wallet data when switching wallet tabs
  useEffect(() => {
    if (activeWallet) {
      setBalanceInput((activeWallet.balance ?? 0).toString());
      setIncomes(
        (Array.isArray(activeWallet.incomes) ? activeWallet.incomes : []).map((inc) => ({
          categoryName: inc.categoryName || 'Pemasukan',
          amount: Number(inc.amount) || 0,
          notes: inc.notes || '',
        }))
      );
      setExpenses(
        (Array.isArray(activeWallet.expenses) ? activeWallet.expenses : []).map((e) => ({
          categoryName: e.categoryName || 'Pengeluaran',
          plannedAmount: Number(e.plannedAmount) || 0,
          notes: e.notes || '',
        }))
      );
    } else {
      setBalanceInput('0');
      setIncomes([]);
      setExpenses([]);
    }
  }, [activeWallet, selectedWalletName]);

  // Compute stats for selected wallet
  const baseBalance = parseRupiah(balanceInput);
  const totalAddedIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalEffectiveBalance = baseBalance + totalAddedIncome;
  const totalPlanned = expenses.reduce((sum, e) => sum + e.plannedAmount, 0);
  const remaining = totalEffectiveBalance - totalPlanned;
  const isOverBudget = totalPlanned > totalEffectiveBalance;

  // Compute global summary across all saved digital wallets
  const allWalletsSummary = useMemo(() => {
    const list = Array.isArray(digitalWallets) ? digitalWallets : [];
    const totalBalance = list.reduce((sum, w) => {
      const base = Number(w.balance) || 0;
      const incTotal = Array.isArray(w.incomes)
        ? w.incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0)
        : 0;
      return sum + base + incTotal;
    }, 0);
    const totalSpent = list.reduce(
      (sum, w) =>
        sum +
        (Array.isArray(w.expenses)
          ? w.expenses.reduce((s, e) => s + (Number(e.plannedAmount) || 0), 0)
          : 0),
      0
    );
    return {
      count: list.length,
      totalBalance,
      totalSpent,
      totalRemaining: totalBalance - totalSpent,
    };
  }, [digitalWallets]);

  // Add a custom wallet/bank pill
  const handleAddCustomWallet = () => {
    const trimmed = customWalletInput.trim();
    if (!trimmed) {
      Alert.alert('Wajib Diisi', 'Masukin nama dompet digital atau bank dulu ya.');
      return;
    }
    setCustomWalletList((prev) =>
      prev.some((n) => n.toLowerCase() === trimmed.toLowerCase()) ? prev : [...prev, trimmed]
    );
    setSelectedWalletName(trimmed);
    setCustomWalletInput('');
    setShowAddCustomWallet(false);
  };

  // --- INCOME HANDLERS (PERSIS SEPERTI PENGELUARAN) ---
  const handleAddIncomeRow = () => {
    const categoryName = newIncomeName.trim();
    if (!categoryName) {
      Alert.alert('Wajib Diisi', 'Masukin nama pemasukan dulu ya (misal: Top Up, Transfer Masuk, Cashback).');
      return;
    }

    const alreadyExists = incomes.some(
      (inc) => inc.categoryName.toLowerCase() === categoryName.toLowerCase()
    );
    if (alreadyExists) {
      Alert.alert('Udah Ada', 'Pemasukan ini udah ada di daftar. Langsung ubah angkanya di atas aja ya.');
      return;
    }

    const amount = parseRupiah(newIncomeAmountInput);
    setIncomes((prev) => [
      ...prev,
      {
        categoryName,
        amount,
        notes: newIncomeNotesInput,
      },
    ]);

    setNewIncomeName('');
    setNewIncomeAmountInput('');
    setNewIncomeNotesInput('');
  };

  const handleIncomeAmountChange = (index: number, val: string) => {
    const numericVal = parseRupiah(val);
    setIncomes((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, amount: numericVal } : item))
    );
  };

  const handleIncomeNotesChange = (index: number, text: string) => {
    setIncomes((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, notes: text } : item))
    );
  };

  const handleDeleteIncomeRow = (index: number) => {
    setIncomes((prev) => prev.filter((_, idx) => idx !== index));
  };

  // --- EXPENSE HANDLERS ---
  const handleAddCategoryRow = () => {
    const categoryName = newCategoryName.trim();
    if (!categoryName) {
      Alert.alert('Wajib Diisi', 'Masukin nama pengeluaran dulu ya (misal: Kopi, ShopeeFood, Listrik).');
      return;
    }

    const alreadyExists = expenses.some(
      (e) => e.categoryName.toLowerCase() === categoryName.toLowerCase()
    );
    if (alreadyExists) {
      Alert.alert('Udah Ada', 'Pengeluaran ini udah ada di daftar. Langsung ubah angkanya di atas aja ya.');
      return;
    }

    const amount = parseRupiah(newAmountInput);
    setExpenses((prev) => [
      ...prev,
      {
        categoryName,
        plannedAmount: amount,
        notes: newNotesInput,
      },
    ]);

    setNewCategoryName('');
    setNewAmountInput('');
    setNewNotesInput('');
  };

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

  const handleDeleteRow = (index: number) => {
    setExpenses((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Save wallet to store & database
  const handleSave = async () => {
    if (totalEffectiveBalance <= 0 && expenses.length === 0 && incomes.length === 0) {
      Alert.alert('Saldo Kosong', `Isi dulu saldo awal atau pemasukan ${selectedWalletName} lebih dari Rp0 ya.`);
      return;
    }

    try {
      await saveDigitalWallet(selectedWalletName, baseBalance, expenses, incomes);
      Alert.alert(
        'Tersimpan! ✅',
        `Dompet ${selectedWalletName} berhasil disimpan.\nTotal Saldo Masuk: ${formatRupiah(totalEffectiveBalance)}\nSisa Saldo Akhir: ${formatRupiah(remaining)}`
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal menyimpan data dompet digital.');
    }
  };

  // Delete current saved wallet
  const handleDeleteWallet = () => {
    if (!activeWallet) return;
    Alert.alert(
      `Hapus Dompet ${activeWallet.name}?`,
      `Semua catatan saldo, pemasukan, dan pengeluaran di ${activeWallet.name} bakal dihapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await deleteDigitalWallet(activeWallet.id);
            setBalanceInput('0');
            setIncomes([]);
            setExpenses([]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* TOTAL ALL WALLETS SUMMARY BANNER */}
        {allWalletsSummary.count > 0 && (
          <View style={styles.summaryBanner}>
            <Text style={[typography.bodySmall, typography.weightBold, { color: colors.primaryLight, marginBottom: 6 }]}>
              💳 Total {allWalletsSummary.count} Dompet Digital Aktif
            </Text>
            <View style={styles.summaryRow}>
              <View>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Total Saldo + Masuk</Text>
                <Text style={[typography.bodyMedium, typography.weightBold, { color: colors.textPrimary }]}>
                  {formatRupiah(allWalletsSummary.totalBalance)}
                </Text>
              </View>
              <View>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Total Kepake</Text>
                <Text style={[typography.bodyMedium, typography.weightBold, { color: colors.info }]}>
                  {formatRupiah(allWalletsSummary.totalSpent)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Total Sisa</Text>
                <Text
                  style={[
                    typography.bodyMedium,
                    typography.weightBold,
                    { color: allWalletsSummary.totalRemaining >= 0 ? colors.success : colors.error },
                  ]}
                >
                  {formatRupiah(allWalletsSummary.totalRemaining)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* WALLET SELECTOR */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
              👛 Pilih Dompet / Bank Digital
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddCustomWallet((prev) => !prev)}
              style={styles.addWalletToggleBtn}
            >
              <Text style={styles.addWalletToggleText}>
                {showAddCustomWallet ? 'Tutup ✖️' : '+ Dompet Lain'}
              </Text>
            </TouchableOpacity>
          </View>

          {showAddCustomWallet && (
            <View style={styles.customWalletBox}>
              <Input
                placeholder="Nama Dompet / Bank (misal: blu BCA, Mandiri, OVO)"
                value={customWalletInput}
                onChangeText={setCustomWalletInput}
              />
              <Button
                title="Pakai Dompet Ini"
                onPress={handleAddCustomWallet}
                variant="secondary"
                style={{ height: 44, marginTop: 4 }}
              />
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
            {availableWalletNames.map((wName) => {
              const isSelected = selectedWalletName.toLowerCase() === wName.toLowerCase();
              const savedWallet = (Array.isArray(digitalWallets) ? digitalWallets : []).find(
                (w) => w?.name?.toLowerCase() === wName.toLowerCase()
              );
              const hasData = Boolean(
                savedWallet &&
                  (savedWallet.balance > 0 ||
                    (savedWallet.incomes && savedWallet.incomes.length > 0) ||
                    savedWallet.expenses.length > 0)
              );

              return (
                <TouchableOpacity
                  key={wName}
                  style={[
                    styles.historyPill,
                    isSelected && styles.historyPillActive,
                    !isSelected && hasData && styles.historyPillSaved,
                  ]}
                  onPress={() => setSelectedWalletName(wName)}
                >
                  <Text style={[styles.historyPillText, isSelected && styles.historyPillTextActive]}>
                    {hasData ? `💳 ${wName} ✓` : `💳 ${wName}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {activeWallet && (
            <View style={styles.activeWalletActionRow}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Dompet <Text style={{ color: colors.primaryLight, fontWeight: '700' }}>{activeWallet.name}</Text> udah tersimpan
              </Text>
              <TouchableOpacity onPress={handleDeleteWallet} style={styles.deleteWalletBtn}>
                <Text style={{ color: colors.error, fontSize: 12, fontWeight: '700' }}>🗑️ Reset / Hapus Dompet</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 1. SET INITIAL WALLET BALANCE */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
            1. Set Saldo Awal {selectedWalletName}
          </Text>
          <Input
            label={`Saldo Awal ${selectedWalletName} (Rp)`}
            value={formatRupiah(balanceInput)}
            onChangeText={(val) => setBalanceInput(parseRupiah(val).toString())}
            keyboardType="numeric"
            placeholder="misal: 500.000"
          />
          {totalAddedIncome > 0 && (
            <View style={styles.effectiveBalanceBox}>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                💰 Total Saldo Tunai ({selectedWalletName}):{' '}
                <Text style={{ color: colors.success, fontWeight: '800' }}>
                  {formatRupiah(totalEffectiveBalance)}
                </Text>{' '}
                (Saldo Awal {formatRupiah(baseBalance)} + Pemasukan {formatRupiah(totalAddedIncome)})
              </Text>
            </View>
          )}
        </View>

        {/* 2. WALLET INCOMES (TAMBAH SALDO TUNAI) */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
            2. Pemasukan ke {selectedWalletName} (Tambah Saldo)
          </Text>

          {incomes.length === 0 ? (
            <Text style={[typography.bodyMedium, styles.emptyText]}>
              Belum ada pemasukan tambahan di {selectedWalletName}.
            </Text>
          ) : (
            incomes.map((item, index) => (
              <View key={item.categoryName} style={[styles.expenseRow, styles.incomeRow]}>
                <View style={styles.rowHeader}>
                  <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.success }]}>
                    💵 + {item.categoryName}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteIncomeRow(index)} style={styles.deleteBtn}>
                    <Text style={{ color: colors.error, fontSize: 13, fontWeight: '700' }}>Hapus ❌</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.rowInputs}>
                  <Input
                    placeholder="Jumlah Masuk (Rp)"
                    value={formatRupiah(item.amount)}
                    onChangeText={(val) => handleIncomeAmountChange(index, val)}
                    keyboardType="numeric"
                    containerStyle={{ flex: 1, marginRight: 8 }}
                  />
                  <Input
                    placeholder="Catatan (Opsional)"
                    value={item.notes}
                    onChangeText={(text) => handleIncomeNotesChange(index, text)}
                    containerStyle={{ flex: 1.5 }}
                  />
                </View>
              </View>
            ))
          )}

          {/* ADD NEW INCOME FORM */}
          <View style={[styles.addCategorySection, styles.addIncomeSection]}>
            <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.success, marginBottom: 12 }]}>
              ➕ Tambah Pemasukan ({selectedWalletName})
            </Text>

            <Input
              placeholder="Sumber Pemasukan (Top Up, Transfer Masuk, Cashback, dll)"
              value={newIncomeName}
              onChangeText={setNewIncomeName}
              containerStyle={{ marginBottom: 12 }}
            />

            <View style={styles.rowInputs}>
              <Input
                placeholder="Jumlah (Rp)"
                value={formatRupiah(newIncomeAmountInput)}
                onChangeText={(val) => setNewIncomeAmountInput(parseRupiah(val).toString())}
                keyboardType="numeric"
                containerStyle={{ flex: 1, marginRight: 8 }}
              />
              <Input
                placeholder="Catatan (Opsional)"
                value={newIncomeNotesInput}
                onChangeText={setNewIncomeNotesInput}
                containerStyle={{ flex: 1.5 }}
              />
            </View>
            <Button
              title="Tambah ke Pemasukan (+)"
              onPress={handleAddIncomeRow}
              variant="secondary"
              style={{ marginTop: 8, borderColor: colors.success }}
            />
          </View>
        </View>

        {/* 3. ALLOCATED WALLET EXPENSES */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, styles.sectionTitle]}>
            3. Pengeluaran dari {selectedWalletName}
          </Text>

          {expenses.length === 0 ? (
            <Text style={[typography.bodyMedium, styles.emptyText]}>
              Belum ada pengeluaran di {selectedWalletName}. Tambahin di bawah ya.
            </Text>
          ) : (
            expenses.map((item, index) => (
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
            ))
          )}

          {/* ADD NEW EXPENSE FORM */}
          <View style={[styles.addCategorySection, { marginTop: 12 }]}>
            <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary, marginBottom: 12 }]}>
              ➕ Tambah Pengeluaran ({selectedWalletName})
            </Text>

            <Input
              placeholder="Nama Pengeluaran (Jajan, Checkout Shopee, Tagihan, dll)"
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
              title="Tambah ke Pengeluaran (-)"
              onPress={handleAddCategoryRow}
              variant="secondary"
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </ScrollView>

      {/* STICKY FOOTER CALCULATION BAR */}
      <View style={styles.footer}>
        {isOverBudget && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ Waduh, pengeluaran {selectedWalletName} melebihi total saldonya! Awas boncos.
            </Text>
          </View>
        )}
        <View style={styles.footerStats}>
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              SALDO + MASUK: {formatRupiah(totalEffectiveBalance)}
            </Text>
            <Text style={[typography.bodyMedium, typography.weightBold, { color: colors.textPrimary, marginTop: 2 }]}>
              Kepake: {formatRupiah(totalPlanned)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              SISA SALDO {selectedWalletName.toUpperCase()}
            </Text>
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
        <Button title={`Simpan Dompet ${selectedWalletName}`} onPress={handleSave} style={styles.saveBtn} />
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
    paddingBottom: 200,
  },
  summaryBanner: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 14,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
  addWalletToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
  },
  addWalletToggleText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  customWalletBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  activeWalletActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  deleteWalletBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  effectiveBalanceBox: {
    marginTop: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 14,
  },
  expenseRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  incomeRow: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
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
  addIncomeSection: {
    marginTop: 12,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
  },
  historyScroll: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingVertical: 4,
  },
  historyPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  historyPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  historyPillSaved: {
    borderColor: colors.primaryLight,
  },
  historyPillText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
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
