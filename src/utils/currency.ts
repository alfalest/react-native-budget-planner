/**
 * Formats a numeric value into Indonesian Rupiah (Rp) format
 * Example: 4000000 -> Rp4.000.000
 */
export const formatRupiah = (amount: number | string): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value) || value === null || value === undefined) {
    return 'Rp0';
  }
  
  // Format with thousands separator as '.'
  const formatted = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `Rp${formatted}`;
};

/**
 * Parses a string input (which might include "Rp", dots, spaces) back to a clean number.
 * Example: "Rp4.000.000" -> 4000000
 */
export const parseRupiah = (text: string): number => {
  if (!text) return 0;
  // Strip all non-numeric characters except for decimals if necessary
  const cleaned = text.replace(/[^0-9]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
};
