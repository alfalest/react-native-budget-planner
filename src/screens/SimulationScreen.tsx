import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { useSimulator } from '../hooks/useSimulator';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { formatRupiah, parseRupiah } from '../utils/currency';

export const SimulationScreen = () => {
  const {
    salary,
    items,
    updateSalary,
    addItem,
    removeItem,
    clearSimulation,
    totalAllocated,
    remaining,
    percentAllocated,
  } = useSimulator();

  // Add Item form states
  const [catName, setCatName] = useState('');
  const [amountInput, setAmountInput] = useState('');

  const handleAddItem = () => {
    if (!catName.trim()) return;
    const amount = parseRupiah(amountInput);
    if (amount <= 0) return;

    addItem(catName, amount);
    setCatName('');
    setAmountInput('');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* EXPLANATORY HEADER BANNER */}
        <Card variant="flat" style={styles.introCard}>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            ⚡ SANDBOX SIMULATOR
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 4, lineHeight: 18 }]}>
            Tempat buat ngotak-ngatik alokasi gaji (coba-coba) tanpa takut ngerusak data aslinya. Hasil simulasi ini gak disave ke database lo.
          </Text>
        </Card>

        {/* SALARY SETTER */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, { color: colors.textPrimary, marginBottom: 8 }]}>
            1. Pura-puranya Gaji
          </Text>
          <Input
            value={formatRupiah(salary)}
            onChangeText={(val) => updateSalary(parseRupiah(val))}
            keyboardType="numeric"
            placeholder="misal: 4.000.000"
          />
        </View>

        {/* ADD MOCK SPENDING */}
        <View style={styles.section}>
          <Text style={[typography.h3, typography.weightBold, { color: colors.textPrimary, marginBottom: 8 }]}>
            2. Coba-coba Alokasi
          </Text>
          
          <View style={styles.addBlock}>
            <View style={styles.row}>
              <Input
                placeholder="Nama Pengeluaran"
                value={catName}
                onChangeText={setCatName}
                containerStyle={{ flex: 1.2, marginRight: 8 }}
              />
              <Input
                placeholder="Jumlah (Rp)"
                value={formatRupiah(amountInput)}
                onChangeText={(val) => setAmountInput(parseRupiah(val).toString())}
                keyboardType="numeric"
                containerStyle={{ flex: 1 }}
              />
            </View>
            <Button title="Tambah Item Simulasi" onPress={handleAddItem} variant="secondary" />
          </View>
        </View>

        {/* SIMULATED ITEMS LIST */}
        <View style={styles.section}>
          <View style={styles.listHeader}>
            <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary }]}>
              Daftar Simulasi ({items.length})
            </Text>
            {items.length > 0 && (
              <TouchableOpacity onPress={clearSimulation} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Reset Semua 🔄</Text>
              </TouchableOpacity>
            )}
          </View>

          {items.length === 0 ? (
            <Text style={[typography.bodyMedium, styles.emptyText]}>
              Sandbox masih kosong. Tambahin pengeluaran di atas buat nyoba.
            </Text>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.simItemRow}>
                <View>
                  <Text style={[typography.bodyMedium, typography.weightBold, { color: colors.textPrimary }]}>
                    {item.categoryName}
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                    {(salary > 0 ? (item.amount / salary) * 100 : 0).toFixed(0)}% dari gaji simulasi
                  </Text>
                </View>
                <View style={styles.rightSide}>
                  <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary, marginRight: 12 }]}>
                    {formatRupiah(item.amount)}
                  </Text>
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                    <Text style={{ fontSize: 14 }}>✖️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* FLOATING REAL-TIME CALCULATION PANEL */}
      <View style={styles.footerPanel}>
        <View style={styles.footerProgress}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            PERSENTASE DIPLOT
          </Text>
          <ProgressBar progress={percentAllocated / 100} color={colors.primary} showPercentage />
        </View>
        
        <View style={styles.footerStats}>
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>TOTAL SIMULASI DIPLOT</Text>
            <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary }]}>
              {formatRupiah(totalAllocated)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>SISA UANG SIMULASI</Text>
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
  introCard: {
    marginBottom: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  section: {
    marginBottom: 24,
  },
  addBlock: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.borderMuted,
  },
  clearBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  simItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 6,
  },
  footerPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
    padding: 16,
  },
  footerProgress: {
    marginBottom: 12,
  },
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
