export const colors = {
  // Canvas Colors
  background: '#09090B',       // Pure charcoal black
  surface: '#18181B',          // Elevated card background
  surfaceElevated: '#27272A',  // More elevated surface
  border: '#27272A',           // Slate grey border
  borderMuted: '#1F1F22',      // Muted border

  // Accent Colors
  primary: '#8B5CF6',          // Brand Purple (Linear style)
  primaryLight: '#A78BFA',     // Soft Purple
  
  // Status Colors
  success: '#10B981',          // Emerald Green (For remaining budgets/savings)
  successMuted: '#064E3B',
  
  info: '#06B6D4',             // Cyan Blue (For weekly planning)
  infoMuted: '#164E63',

  warning: '#F59E0B',          // Amber Orange (For approaching thresholds)
  warningMuted: '#78350F',

  error: '#EF4444',            // Rose Red (For over budget/limits)
  errorMuted: '#7F1D1D',

  // Text Colors
  textPrimary: '#F4F4F5',      // High emphasis white
  textSecondary: '#A1A1AA',    // Medium emphasis grey
  textMuted: '#71717A',        // Low emphasis grey
  textInverse: '#09090B',      // Inverse text on light background

  // Gradients (Represented as color arrays for linear-gradient compatibility)
  gradients: {
    purple: ['#8B5CF6', '#6D28D9'],
    emerald: ['#10B981', '#047857'],
    cyan: ['#06B6D4', '#0891B2'],
    amber: ['#F59E0B', '#B45309'],
    rose: ['#EF4444', '#B91C1C'],
    darkCard: ['#18181B', '#0F0F11'],
  }
};
