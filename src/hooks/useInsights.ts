import { useMemo } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { FinancialInsight } from '../types';
import { getDaysRemaining } from '../utils/date';

export const useInsights = () => {
  const { monthlyPlans, goals, installments } = useBudgetStore();

  const insights = useMemo(() => {
    const list: FinancialInsight[] = [];
    
    // Fetch the latest monthly plan to evaluate
    if (monthlyPlans.length === 0) {
      list.push({
        id: 'no-plan',
        title: 'Belum Ada Plan Bulanan Nih',
        description: 'Bikin plan budget bulanan dulu dong, biar gue bisa kasih insight keuangan lo.',
        status: 'info',
      });
      return list;
    }

    // Sort to get latest plan
    const latestPlan = [...monthlyPlans].sort((a, b) => b.month.localeCompare(a.month))[0];
    const { income, expenses } = latestPlan;
    
    if (income <= 0) return list;

    const activeInstallments = installments.filter(
      (inst) => inst.startMonth <= latestPlan.month && inst.endMonth >= latestPlan.month
    );

    const totalAllocated = 
      expenses.reduce((sum, exp) => sum + exp.plannedAmount, 0) +
      activeInstallments.reduce((sum, inst) => sum + inst.amount, 0);

    // Rule 1: Over-budget check
    if (totalAllocated > income) {
      list.push({
        id: 'over-budget',
        title: '⚠️ Awas Nombok!',
        description: `Alokasi lo kegedean, minus Rp${income - totalAllocated} dari gaji. Coba atur lagi porsinya biar gak ngutang.`,
        status: 'warning',
      });
    }

    // Map expense items back to categories to inspect names/types
    let savingsAmount = 0;
    let necessityAmount = 0;
    let entertainmentAmount = 0;

    const processItem = (name: string, amount: number, isInstallment: boolean = false) => {
      const nameLower = name.toLowerCase();
      
      if (nameLower.includes('saving') || nameLower.includes('emergency') || nameLower.includes('investment') || nameLower.includes('tabung') || nameLower.includes('invest')) {
        savingsAmount += amount;
      } else if (
        nameLower.includes('entertainment') || nameLower.includes('coffee') || nameLower.includes('date') || 
        nameLower.includes('netflix') || nameLower.includes('gaming') || nameLower.includes('kopi') ||
        nameLower.includes('game') || nameLower.includes('hobby')
      ) {
        entertainmentAmount += amount;
      } else if (
        nameLower.includes('rent') || nameLower.includes('token') || nameLower.includes('water') ||
        nameLower.includes('electricity') || nameLower.includes('installment') || nameLower.includes('cicil') ||
        nameLower.includes('food') || nameLower.includes('makan') || nameLower.includes('kos') ||
        nameLower.includes('transport') || isInstallment
      ) {
        necessityAmount += amount; // Installments default to necessity unless caught by saving/entertainment rules
      } else {
        necessityAmount += amount; // fallback to necessity
      }
    };

    expenses.forEach((exp) => processItem(exp.categoryName, exp.plannedAmount, false));
    activeInstallments.forEach((inst) => processItem(inst.name, inst.amount, true));

    const savingsRatio = savingsAmount / income;
    const necessityRatio = necessityAmount / income;
    const entertainmentRatio = entertainmentAmount / income;

    // Rule 2: Savings Target Check
    if (savingsRatio >= 0.20) {
      list.push({
        id: 'savings-healthy',
        title: '🔥 Mantap, Nabung Jalan Terus!',
        description: `Lo udah nyisihin ${(savingsRatio * 100).toFixed(0)}% gaji buat masa depan. Sabi banget!`,
        status: 'success',
      });
    } else if (savingsRatio < 0.10) {
      list.push({
        id: 'savings-warning',
        title: '⚠️ Tabungan Menipis!',
        description: `Tabungan lo cuma ${(savingsRatio * 100).toFixed(0)}% nih. Kalo bisa minimal 10% dong buat dana darurat.`,
        status: 'warning',
      });
    } else {
      list.push({
        id: 'savings-ok',
        title: '👍 Nabung Aman',
        description: `Porsi nabung lo ada di ${(savingsRatio * 100).toFixed(0)}%. Boleh lah, kalo ada sisa taikin ke 20% ya.`,
        status: 'info',
      });
    }

    // Rule 3: Fixed Necessities Check
    if (necessityRatio > 0.50) {
      list.push({
        id: 'necessity-high',
        title: '⚠️ Kebutuhan Pokok Ketinggian',
        description: `Plot kebutuhan pokok lo makan ${(necessityRatio * 100).toFixed(0)}% gaji. Coba cek lagi cicilan yang gak penting.`,
        status: 'warning',
      });
    } else if (necessityRatio > 0) {
      list.push({
        id: 'necessity-healthy',
        title: '✅ Kebutuhan Pokok Aman',
        description: `Kebutuhan pokok lo cuma makan ${(necessityRatio * 100).toFixed(0)}% gaji. Masih banyak ruang buat nabung dan main.`,
        status: 'success',
      });
    }

    // Rule 4: Entertainment Check
    if (entertainmentRatio > 0.15) {
      list.push({
        id: 'entertainment-high',
        title: '⚠️ Awas Hedon!',
        description: `Lo abisin ${(entertainmentRatio * 100).toFixed(0)}% gaji murni buat seneng-seneng. Coba kurangin ngopi cantik atau Netflix.`,
        status: 'warning',
      });
    } else if (entertainmentRatio > 0) {
      list.push({
        id: 'entertainment-controlled',
        title: '😎 Seneng-Seneng Terkontrol',
        description: `Uang main lo masih santai di angka ${(entertainmentRatio * 100).toFixed(0)}%. Gas terus tapi tetep inget batas ya.`,
        status: 'success',
      });
    }

    // Rule 5: Goals Check
    goals.forEach((goal) => {
      const daysLeft = getDaysRemaining(goal.deadline);
      const savedRatio = goal.currentAmount / goal.targetAmount;
      
      if (daysLeft > 0 && daysLeft <= 30 && savedRatio < 0.8) {
        list.push({
          id: `goal-urgency-${goal.id}`,
          title: `🚨 Target "${goal.name}" Udah Deket!`,
          description: `Tinggal ${daysLeft} hari lagi nih, padahal kurang ${(100 - savedRatio * 100).toFixed(0)}%. Semangat kejar setoran!`,
          status: 'warning',
          category: 'goals'
        });
      }
    });

    return list;
  }, [monthlyPlans, goals]);

  return { insights };
};
