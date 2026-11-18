import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

/**
 * Gets the current month key in YYYY-MM format
 */
export const getCurrentMonth = (): string => {
  return dayjs().format('YYYY-MM');
};

export interface WeekCycleInfo {
  weekNumber: number;
  label: string;
  startDate: string;
  endDate: string;
  daysCount: number;
}

/**
 * Calculates inclusive number of days in a date range
 */
export const getWeekDaysCount = (startStr: string, endStr: string): number => {
  if (!startStr || !endStr) return 7;
  const start = dayjs(startStr).startOf('day');
  const end = dayjs(endStr).startOf('day');
  const diff = end.diff(start, 'day') + 1;
  return diff > 0 ? diff : 7;
};

/**
 * Generates the 4 standard week cycles for a given month ('YYYY-MM'):
 * Minggu 1: 01 - 07 (7 days)
 * Minggu 2: 08 - 14 (7 days)
 * Minggu 3: 15 - 21 (7 days)
 * Minggu 4: 22 - end of month (7 to 10 days)
 */
export const getWeeksForMonth = (monthStr: string = getCurrentMonth()): WeekCycleInfo[] => {
  const base = dayjs(`${monthStr}-01`);
  const yearMonth = base.format('YYYY-MM');
  const endOfMonth = base.endOf('month').format('YYYY-MM-DD');

  const rawWeeks = [
    { weekNumber: 1, label: 'Minggu 1', startDate: `${yearMonth}-01`, endDate: `${yearMonth}-07` },
    { weekNumber: 2, label: 'Minggu 2', startDate: `${yearMonth}-08`, endDate: `${yearMonth}-14` },
    { weekNumber: 3, label: 'Minggu 3', startDate: `${yearMonth}-15`, endDate: `${yearMonth}-21` },
    { weekNumber: 4, label: 'Minggu 4', startDate: `${yearMonth}-22`, endDate: endOfMonth },
  ];

  return rawWeeks.map((w) => ({
    ...w,
    daysCount: getWeekDaysCount(w.startDate, w.endDate),
  }));
};

/**
 * Gets the total number of days in a given month ('YYYY-MM')
 */
export const getDaysInMonth = (monthStr: string = getCurrentMonth()): number => {
  return dayjs(`${monthStr}-01`).daysInMonth();
};

/**
 * Gets the current week bounds based on day of month:
 * Week 1: 1-7
 * Week 2: 8-14
 * Week 3: 15-21
 * Week 4: 22-end of month
 */
export const getWeekRangeForDate = (dateParam: dayjs.Dayjs | string = dayjs()): { startDate: string; endDate: string } => {
  const date = dayjs(dateParam);
  const dayOfMonth = date.date();
  const yearMonth = date.format('YYYY-MM');
  
  if (dayOfMonth <= 7) {
    return { startDate: `${yearMonth}-01`, endDate: `${yearMonth}-07` };
  } else if (dayOfMonth <= 14) {
    return { startDate: `${yearMonth}-08`, endDate: `${yearMonth}-14` };
  } else if (dayOfMonth <= 21) {
    return { startDate: `${yearMonth}-15`, endDate: `${yearMonth}-21` };
  } else {
    return { startDate: `${yearMonth}-22`, endDate: date.endOf('month').format('YYYY-MM-DD') };
  }
};

export const getCurrentWeekRange = (): { startDate: string; endDate: string } => {
  return getWeekRangeForDate();
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
