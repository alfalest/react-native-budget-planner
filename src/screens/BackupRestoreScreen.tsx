import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Alert,
  Clipboard
} from 'react-native';
import { useBudgetStore } from '../store/budgetStore';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BackupService } from '../services/backupService';

export const BackupRestoreScreen = () => {
  const { exportData, importData, initData } = useBudgetStore();

  const [backupText, setBackupText] = useState('');
  const [importText, setImportText] = useState('');

  const handleExport = async () => {
    try {
      const dump = await exportData();
      setBackupText(dump);
      Clipboard.setString(dump);
      Alert.alert('Mantap!', 'Data backup berhasil di-copy ke clipboard. Simpen di tempat yang aman ya.');
    } catch (e) {
      Alert.alert('Error', 'Gagal bikin backup database.');
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      Alert.alert('Wah Kosong', 'Paste dulu dong teks JSON backup-nya.');
      return;
    }

    const isValid = BackupService.validateBackupSchema(importText);
    if (!isValid) {
      Alert.alert('Backup Gak Valid', 'Teks backup yang lo paste gak sesuai format. Coba cek lagi.');
      return;
    }

    Alert.alert(
      'Yakin Mau Import?',
      'Ini bakal NINGGALIN (timpa) semua plan dan data lo yang sekarang. Gak bisa di-undo lho. Lanjut?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Timpa & Import',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await importData(importText);
              if (success) {
                await initData(); // Reinitialize
                Alert.alert('Sukses', 'Database berhasil di-restore! Mantap.');
                setImportText('');
              } else {
                Alert.alert('Error', 'Gagal narik data dari backup.');
              }
            } catch (e) {
              Alert.alert('Error', 'Sistem error pas restore backup.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <Text style={[typography.h2, typography.weightBold, { color: colors.textPrimary, marginBottom: 4 }]}>
        Backup & Restore
      </Text>
      <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: 20 }]}>
        Biar data lo aman sentosa. Export plan lo jadi teks, atau paste teks backup buat balikin data yang ilang.
      </Text>

      {/* EXPORT CARD */}
      <Card variant="elevated" style={styles.card}>
        <Text style={[typography.h3, typography.weightBold, { color: colors.textPrimary, marginBottom: 8 }]}>
          Export Data
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: 14 }]}>
          Bikin salinan teks dari database lo sekarang. Bakal otomatis di-copy ke clipboard HP lo.
        </Text>
        
        {backupText ? (
          <View style={styles.jsonContainer}>
            <Text numberOfLines={8} style={styles.jsonText}>{backupText}</Text>
          </View>
        ) : null}

        <Button title="Export & Copy" onPress={handleExport} />
      </Card>

      {/* IMPORT CARD */}
      <Card variant="elevated" style={styles.card}>
        <Text style={[typography.h3, typography.weightBold, { color: colors.textPrimary, marginBottom: 8 }]}>
          Import Data
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: 14 }]}>
          Paste teks JSON backup lo di kotak bawah buat balikin data yang dulu.
        </Text>

        <Input
          placeholder='Paste JSON di sini (misal: {"categories": [], ...})'
          value={importText}
          onChangeText={setImportText}
          multiline
          numberOfLines={6}
          style={styles.importInput}
        />

        <Button title="Import & Timpa Data" onPress={handleImport} variant="danger" />
      </Card>
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
  card: {
    marginBottom: 20,
  },
  jsonContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  jsonText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  importInput: {
    height: 120,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
