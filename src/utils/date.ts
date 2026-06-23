import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

/**
 * Gets the current month key in YYYY-MM format
 */
export const getCurrentMonth = (): string => {
  return dayjs().format('YYYY-MM');
};

/**
 * Gets the current ISO week bounds (Monday to Sunday)
 */
export const getCurrentWeekRange = (): { startDate: string; endDate: string } => {
  const start = dayjs().startOf('isoWeek');
  const end = dayjs().endOf('isoWeek');
  return {
    startDate: start.format('YYYY-MM-DD'),
    endDate: end.format('YYYY-MM-DD'),
  };
};

/**
 * Formats a month string 'YYYY-MM' into a user-friendly format (e.g., "June 2026")
 */
export const formatMonthYear = (monthStr: string): string => {
  if (!monthStr) return '';
  return dayjs(monthStr, 'YYYY-MM').format('MMMM YYYY');
};

/**
 * Formats a week range into a user-friendly format (e.g., "22 Jun - 28 Jun 2026")
 */
export const formatDateRange = (startStr: string, endStr: string): string => {
  if (!startStr || !endStr) return '';
  const start = dayjs(startStr);
  const end = dayjs(endStr);
  
  if (start.year() === end.year()) {
    return `${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}`;
  }
  return `${start.format('DD MMM YYYY')} - ${end.format('DD MMM YYYY')}`;
};

/**
 * Calculates remaining days until a deadline string 'YYYY-MM-DD'
 */
export const getDaysRemaining = (deadlineStr: string): number => {
  const today = dayjs().startOf('day');
  const deadline = dayjs(deadlineStr).startOf('day');
  return deadline.diff(today, 'day');
};

/**
 * Formats date to simple readable date (e.g., "23 Jun 2026")
 */
export const formatReadableDate = (dateStr: string): string => {
  return dayjs(dateStr).format('DD MMM YYYY');
};
