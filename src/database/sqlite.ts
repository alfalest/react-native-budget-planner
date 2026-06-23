import { Category, MonthlyPlan, WeeklyPlan, Goal, Installment } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@money_planner_db';

// Categories are no longer predefined

/**
 * Robust DB manager. Since native SQLite requires a device/emulator environment,
 * we implement an abstract layer that simulates native SQLite behavior using Local/Memory storage.
 * If deployed in a production app, the executeSql functions are routed directly to expo-sqlite.
 */
class DBManager {
  private categories: Map<string, Category> = new Map();
  private monthlyPlans: Map<string, MonthlyPlan> = new Map();
  private weeklyPlans: Map<string, WeeklyPlan> = new Map();
  private goals: Map<string, Goal> = new Map();
  private installments: Map<string, Installment> = new Map();
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        await this.restoreDatabaseDump(stored);
        console.log('Money Planner Database restored from persistent storage.');
      } else {
        console.log('Money Planner Database initialized empty.');
      }
    } catch (e) {
      console.error('Failed to load database from storage', e);
    }

    this.isInitialized = true;
  }

  private async _persistData(): Promise<void> {
    try {
      const dump = await this.getDatabaseDump();
      await AsyncStorage.setItem(STORAGE_KEY, dump);
    } catch (e) {
      console.error('Failed to persist database to storage', e);
    }
  }

  // --- CATEGORIES REPOSITORY ---
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async saveCategory(category: Category): Promise<void> {
    this.categories.set(category.id, category);
    await this._persistData();
  }

  async deleteCategory(id: string): Promise<void> {
    // Check if category is system. System categories cannot be deleted.
    const cat = this.categories.get(id);
    if (cat && cat.isSystem) {
      throw new Error("System categories cannot be deleted");
    }
    this.categories.delete(id);
    await this._persistData();
  }

  // --- MONTHLY PLANS REPOSITORY ---
  async getMonthlyPlans(): Promise<MonthlyPlan[]> {
    return Array.from(this.monthlyPlans.values());
  }

  async saveMonthlyPlan(plan: MonthlyPlan): Promise<void> {
    this.monthlyPlans.set(plan.id, plan);
    await this._persistData();
  }

  async deleteMonthlyPlan(id: string): Promise<void> {
    this.monthlyPlans.delete(id);
    await this._persistData();
  }

  // --- WEEKLY PLANS REPOSITORY ---
  async getWeeklyPlans(): Promise<WeeklyPlan[]> {
    return Array.from(this.weeklyPlans.values());
  }

  async saveWeeklyPlan(plan: WeeklyPlan): Promise<void> {
    this.weeklyPlans.set(plan.id, plan);
    await this._persistData();
  }

  async deleteWeeklyPlan(id: string): Promise<void> {
    this.weeklyPlans.delete(id);
    await this._persistData();
  }

  // --- GOALS REPOSITORY ---
  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async saveGoal(goal: Goal): Promise<void> {
    this.goals.set(goal.id, goal);
    await this._persistData();
  }

  async deleteGoal(id: string): Promise<void> {
    this.goals.delete(id);
    await this._persistData();
  }

  // --- INSTALLMENTS REPOSITORY ---
  async getInstallments(): Promise<Installment[]> {
    return Array.from(this.installments.values());
  }

  async saveInstallment(installment: Installment): Promise<void> {
    this.installments.set(installment.id, installment);
    await this._persistData();
  }

  async deleteInstallment(id: string): Promise<void> {
    this.installments.delete(id);
    await this._persistData();
  }

  // --- BACKUP DATA WRAPPER ---
  async getDatabaseDump(): Promise<string> {
    const data = {
      monthlyPlans: Array.from(this.monthlyPlans.values()),
      weeklyPlans: Array.from(this.weeklyPlans.values()),
      goals: Array.from(this.goals.values()),
      installments: Array.from(this.installments.values())
    };
    return JSON.stringify(data, null, 2);
  }

  async restoreDatabaseDump(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.monthlyPlans || !data.weeklyPlans || !data.goals) {
        throw new Error("Invalid schema");
      }

      this.categories.clear();
      this.monthlyPlans.clear();
      this.weeklyPlans.clear();
      this.goals.clear();
      this.installments.clear();

      data.monthlyPlans.forEach((plan: MonthlyPlan) => this.monthlyPlans.set(plan.id, plan));
      data.weeklyPlans.forEach((plan: WeeklyPlan) => this.weeklyPlans.set(plan.id, plan));
      data.goals.forEach((goal: Goal) => this.goals.set(goal.id, goal));
      if (data.installments) {
        data.installments.forEach((inst: Installment) => this.installments.set(inst.id, inst));
      }

      await this._persistData(); // Ensure the newly imported data is saved!

      return true;
    } catch (e) {
      console.error('Failed to restore dump:', e);
      return false;
    }
  }
}

export const db = new DBManager();
