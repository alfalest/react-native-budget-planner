export type RootStackParamList = {
  MainTabs: undefined;
  MonthlyPlanning: { planId?: string } | undefined;
  WeeklyPlanning: { planId?: string } | undefined;
  GoalEditor: { goalId?: string } | undefined;
  BackupRestore: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  MonthlyPlan: undefined;
  WeeklyPlan: undefined;
  Simulation: undefined;
  Goals: undefined;
  Insights: undefined;
  Calendar: undefined;
};
