/**
 * Handles validation of backup file schemas
 */
export class BackupService {
  /**
   * Validates if a imported string has the valid Money Planner JSON schema structure
   */
  static validateBackupSchema(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      
      // Basic check for required arrays
      if (!data || typeof data !== 'object') return false;
      if (!Array.isArray(data.monthlyPlans)) return false;
      if (!Array.isArray(data.weeklyPlans)) return false;
      if (!Array.isArray(data.goals)) return false;

      // Validate monthly plans schema
      for (const plan of data.monthlyPlans) {
        if (!plan.id || !plan.month || typeof plan.income !== 'number' || !Array.isArray(plan.expenses)) {
          return false;
        }
      }

      // Validate weekly plans schema
      for (const plan of data.weeklyPlans) {
        if (!plan.id || !plan.startDate || !plan.endDate || typeof plan.income !== 'number' || !Array.isArray(plan.expenses)) {
          return false;
        }
      }

      // Validate goals schema
      for (const goal of data.goals) {
        if (!goal.id || !goal.name || typeof goal.targetAmount !== 'number' || typeof goal.currentAmount !== 'number' || !goal.deadline) {
          return false;
        }
      }

      return true;
    } catch (e) {
      return false;
    }
  }
}
