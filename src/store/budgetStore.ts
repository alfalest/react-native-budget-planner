import { create } from 'zustand';
import { Category, MonthlyPlan, WeeklyPlan, Goal, MonthlyExpense, WeeklyExpense, Installment } from '../types';
import { db } from '../database/sqlite';

interface BudgetStoreState {
  categories: Category[];
  monthlyPlans: MonthlyPlan[];
  weeklyPlans: WeeklyPlan[];
  goals: Goal[];
  installments: Installment[];
  isLoading: boolean;
  error: string | null;

  // Initializer
  initData: () => Promise<void>;

  // Category Actions
  // (Categories are now free text, so predefined categories are removed)

  // Monthly Plan Actions
  saveMonthlyPlan: (month: string, income: number, expenses: Omit<MonthlyExpense, 'id' | 'planId'>[]) => Promise<void>;
  deleteMonthlyPlan: (id: string) => Promise<void>;

  // Weekly Plan Actions
  saveWeeklyPlan: (startDate: string, endDate: string, income: number, expenses: Omit<WeeklyExpense, 'id' | 'planId'>[]) => Promise<void>;
  deleteWeeklyPlan: (id: string) => Promise<void>;

  // Goal Actions
  addGoal: (name: string, targetAmount: number, currentAmount: number, deadline: string) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Installment Actions
  addInstallment: (name: string, amount: number, startMonth: string, endMonth: string) => Promise<void>;
  deleteInstallment: (id: string) => Promise<void>;

  // Backup & Import
  exportData: () => Promise<string>;
  importData: (jsonString: string) => Promise<boolean>;
}

export const useBudgetStore = create<BudgetStoreState>((set, get) => ({
  categories: [],
  monthlyPlans: [],
  weeklyPlans: [],
  goals: [],
  installments: [],
  isLoading: false,
  error: null,

  initData: async () => {
    set({ isLoading: true, error: null });
    try {
      await db.init();
      const categories = await db.getCategories();
      const monthlyPlans = await db.getMonthlyPlans();
      const weeklyPlans = await db.getWeeklyPlans();
      const goals = await db.getGoals();
      const installments = await db.getInstallments();

      set({
        categories,
        monthlyPlans,
        weeklyPlans,
        goals,
        installments,
        isLoading: false
      });
    } catch (e: any) {
      set({ error: e.message || 'Failed to initialize database', isLoading: false });
    }
  },


  saveMonthlyPlan: async (month, income, rawExpenses) => {
    set({ isLoading: true });
    try {
      // Find if monthly plan already exists
      const existing = get().monthlyPlans.find(p => p.month === month);
      const planId = existing ? existing.id : `m-plan-${Date.now()}`;
      
      const expenses: MonthlyExpense[] = rawExpenses.map((exp, idx) => ({
        id: existing?.expenses[idx]?.id || `m-exp-${Date.now()}-${idx}`,
        planId,
        categoryName: exp.categoryName,
        plannedAmount: exp.plannedAmount,
        notes: exp.notes
      }));

      const plan: MonthlyPlan = {
        id: planId,
        month,
        income,
        expenses
      };

      await db.saveMonthlyPlan(plan);
      const monthlyPlans = await db.getMonthlyPlans();
      set({ monthlyPlans, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to save monthly plan', isLoading: false });
    }
  },

  deleteMonthlyPlan: async (id) => {
    set({ isLoading: true });
    try {
      await db.deleteMonthlyPlan(id);
      const monthlyPlans = await db.getMonthlyPlans();
      set({ monthlyPlans, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to delete monthly plan', isLoading: false });
    }
  },

  saveWeeklyPlan: async (startDate, endDate, income, rawExpenses) => {
    set({ isLoading: true });
    try {
      const existing = get().weeklyPlans.find(p => p.startDate === startDate);
      const planId = existing ? existing.id : `w-plan-${Date.now()}`;

      const expenses: WeeklyExpense[] = rawExpenses.map((exp, idx) => ({
        id: existing?.expenses[idx]?.id || `w-exp-${Date.now()}-${idx}`,
        planId,
        categoryName: exp.categoryName,
        plannedAmount: exp.plannedAmount,
        notes: exp.notes
      }));

      const plan: WeeklyPlan = {
        id: planId,
        startDate,
        endDate,
        income,
        expenses
      };

      await db.saveWeeklyPlan(plan);
      const weeklyPlans = await db.getWeeklyPlans();
      set({ weeklyPlans, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to save weekly plan', isLoading: false });
    }
  },

  deleteWeeklyPlan: async (id) => {
    set({ isLoading: true });
    try {
      await db.deleteWeeklyPlan(id);
      const weeklyPlans = await db.getWeeklyPlans();
      set({ weeklyPlans, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to delete weekly plan', isLoading: false });
    }
  },

  addGoal: async (name, targetAmount, currentAmount, deadline) => {
    set({ isLoading: true });
    try {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        name,
        targetAmount,
        currentAmount,
        deadline
      };
      await db.saveGoal(newGoal);
      const goals = await db.getGoals();
      set({ goals, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to add goal', isLoading: false });
    }
  },

  updateGoal: async (goal) => {
    set({ isLoading: true });
    try {
      await db.saveGoal(goal);
      const goals = await db.getGoals();
      set({ goals, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to update goal', isLoading: false });
    }
  },

  deleteGoal: async (id) => {
    set({ isLoading: true });
    try {
      await db.deleteGoal(id);
      const goals = await db.getGoals();
      set({ goals, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to delete goal', isLoading: false });
    }
  },

  addInstallment: async (name, amount, startMonth, endMonth) => {
    set({ isLoading: true });
    try {
      const newInstallment: Installment = {
        id: `inst-${Date.now()}`,
        name,
        amount,
        startMonth,
        endMonth
      };
      await db.saveInstallment(newInstallment);
      const installments = await db.getInstallments();
      set({ installments, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to add installment', isLoading: false });
    }
  },

  deleteInstallment: async (id) => {
    set({ isLoading: true });
    try {
      await db.deleteInstallment(id);
      const installments = await db.getInstallments();
      set({ installments, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to delete installment', isLoading: false });
    }
  },

  exportData: async () => {
    return await db.getDatabaseDump();
  },

  importData: async (jsonString) => {
    set({ isLoading: true });
    try {
      const success = await db.restoreDatabaseDump(jsonString);
      if (success) {
        const categories = await db.getCategories();
        const monthlyPlans = await db.getMonthlyPlans();
        const weeklyPlans = await db.getWeeklyPlans();
        const goals = await db.getGoals();
        const installments = await db.getInstallments();

        set({
          categories,
          monthlyPlans,
          weeklyPlans,
          goals,
          installments,
          isLoading: false,
          error: null
        });
        return true;
      }
      set({ isLoading: false, error: 'Database restore returned false status' });
      return false;
    } catch (e: any) {
      set({ error: e.message || 'Failed to restore database dump', isLoading: false });
      return false;
    }
  }
}));
