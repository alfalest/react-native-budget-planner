import React, { useState } from 'react';
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
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { formatRupiah, parseRupiah } from '../utils/currency';
import { getDaysRemaining, formatReadableDate } from '../utils/date';

export const GoalsScreen = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useBudgetStore();

  // Create form states
  const [name, setName] = useState('');
  const [targetAmountInput, setTargetAmountInput] = useState('');
  const [currentAmountInput, setCurrentAmountInput] = useState('0');
  const [deadlineInput, setDeadlineInput] = useState('');

  // Editing state
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editSavedInput, setEditSavedInput] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a goal name.');
      return;
    }
    const target = parseRupiah(targetAmountInput);
    const current = parseRupiah(currentAmountInput);
    if (target <= 0) {
      Alert.alert('Validation Error', 'Target amount must be greater than Rp0.');
      return;
    }

    // Basic date validation YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(deadlineInput)) {
      Alert.alert('Validation Error', 'Please enter deadline in YYYY-MM-DD format.');
      return;
    }

    try {
      await addGoal(name.trim(), target, current, deadlineInput);
      Alert.alert('Success', `Goal "${name}" created.`);
      setName('');
      setTargetAmountInput('');
      setCurrentAmountInput('0');
      setDeadlineInput('');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create goal.');
    }
  };

  const handleUpdateProgress = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newSaved = parseRupiah(editSavedInput);
    if (newSaved > goal.targetAmount) {
      Alert.alert('Check Amount', 'Saved amount exceeds target. Target will be completed!');
    }

    try {
      await updateGoal({
        ...goal,
        currentAmount: newSaved,
      });
      setEditingGoalId(null);
      setEditSavedInput('');
      Alert.alert('Success', 'Goal progress updated.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update goal.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete the goal "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteGoal(id);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      
      {/* GOAL CREATOR FORM */}
      <View style={styles.formContainer}>
        <Text style={[typography.h3, typography.weightBold, { color: colors.textPrimary, marginBottom: 12 }]}>
          Bikin Target Nabung Baru
        </Text>
        
        <Input
          label="Nama Target"
          value={name}
          onChangeText={setName}
          placeholder="misal: Beli PC, Dana Darurat, Liburan Bali"
        />

        <View style={styles.row}>
          <Input
            label="Target Kumpul (Rp)"
            value={formatRupiah(targetAmountInput)}
            onChangeText={(val) => setTargetAmountInput(parseRupiah(val).toString())}
            keyboardType="numeric"
            placeholder="misal: 5.000.000"
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Uang Awal (Rp)"
            value={formatRupiah(currentAmountInput)}
            onChangeText={(val) => setCurrentAmountInput(parseRupiah(val).toString())}
            keyboardType="numeric"
            placeholder="misal: 1.000.000"
            containerStyle={{ flex: 1 }}
          />
        </View>

        <Input
          label="Deadline Kapan? (YYYY-MM-DD)"
          value={deadlineInput}
          onChangeText={setDeadlineInput}
          placeholder="misal: 2026-12-31"
          maxLength={10}
        />

        <Button title="Simpan Target" onPress={handleCreate} style={{ marginTop: 10 }} />
      </View>

      {/* GOALS LIST */}
      <View style={styles.listContainer}>
        <Text style={[typography.h3, typography.weightBold, { color: colors.textPrimary, marginBottom: 14 }]}>
          Daftar Target Nabung Lo
        </Text>

        {goals.length === 0 ? (
          <Text style={[typography.bodyMedium, styles.emptyText]}>
            Belum ada target nabung nih. Yuk mulai rencanain dari sekarang!
          </Text>
        ) : (
          goals.map((goal) => {
            const progressRatio = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysLeft = getDaysRemaining(goal.deadline);

            const isEditing = editingGoalId === goal.id;

            return (
              <Card key={goal.id} variant="elevated" style={styles.goalCard}>
                <View style={styles.cardHeader}>
                  <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary }]}>
                    {goal.name}
                  </Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      onPress={() => {
                        setEditingGoalId(isEditing ? null : goal.id);
                        setEditSavedInput(goal.currentAmount.toString());
                      }} 
                      style={styles.editBtn}
                    >
                      <Text style={styles.editBtnText}>{isEditing ? 'Batal ✖️' : 'Update Uang 💵'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(goal.id, goal.name)} style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>Hapus 🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Main Progress Stat */}
                <View style={styles.statRow}>
                  <View>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>Terkumpul</Text>
                    <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.success }]}>
                      {formatRupiah(goal.currentAmount)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>Target</Text>
                    <Text style={[typography.bodyLarge, typography.weightBold, { color: colors.textPrimary }]}>
                      {formatRupiah(goal.targetAmount)}
                    </Text>
                  </View>
                </View>

                <ProgressBar progress={progressRatio} color={colors.success} showPercentage />

                {/* Inline Editing Row */}
                {isEditing && (
                  <View style={styles.inlineEditBlock}>
                    <Input
                      label="Update Uang Terkumpul (Rp)"
                      value={formatRupiah(editSavedInput)}
                      onChangeText={(val) => setEditSavedInput(parseRupiah(val).toString())}
                      keyboardType="numeric"
                    />
                    <Button 
                      title="Simpan Progress" 
                      onPress={() => handleUpdateProgress(goal.id)} 
                      variant="primary" 
                      style={{ height: 44, marginTop: 4 }}
                    />
                  </View>
                )}

                {/* Footer details */}
                <View style={styles.cardFooter}>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                    Kurang: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{formatRupiah(remaining > 0 ? remaining : 0)}</Text>
                  </Text>
                  <Text style={[typography.bodySmall, { color: daysLeft <= 30 ? colors.error : colors.textSecondary }]}>
                    {daysLeft > 0 ? `Sisa ${daysLeft} hari` : 'Udah lewat deadline'} ({formatReadableDate(goal.deadline)})
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
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
  },
  listContainer: {},
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
  },
  goalCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
  },
  editBtn: {
    marginRight: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editBtnText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: colors.borderMuted,
    paddingTop: 10,
  },
  inlineEditBlock: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
