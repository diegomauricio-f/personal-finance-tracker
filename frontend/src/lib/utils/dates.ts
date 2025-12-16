/**
 * Date utility functions using date-fns
 *
 * @see specs/001-personal-finance-tracker/plan.md lines 178-182
 */

import { format, parse, isWithinInterval } from 'date-fns';

/**
 * Formats a date to a specific format
 *
 * @param date - The date to format
 * @param formatStr - The format string (default: 'yyyy-MM-dd')
 * @returns Formatted date string
 */
export function formatDate(date: Date, formatStr: string = 'yyyy-MM-dd'): string {
  return format(date, formatStr);
}

/**
 * Parses a date string to a Date object
 *
 * @param dateStr - The date string to parse
 * @param formatStr - The format string (default: 'yyyy-MM-dd')
 * @returns Parsed Date object
 */
export function parseDate(dateStr: string, formatStr: string = 'yyyy-MM-dd'): Date {
  return parse(dateStr, formatStr, new Date());
}

/**
 * Checks if a date is within a specific range
 *
 * @param date - The date to check
 * @param start - The start of the range
 * @param end - The end of the range
 * @returns True if the date is within the range
 */
export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  return isWithinInterval(date, { start, end });
}

/**
 * Gets the start of the current month
 *
 * @returns Date object at the start of the current month
 */
export function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Gets the end of the current month
 *
 * @returns Date object at the end of the current month
 */
export function getEndOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Formats a date with time to 'yyyy-MM-dd HH:mm' format
 *
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm');
}

/**
 * Formats a date for datetime-local input (yyyy-MM-dd'T'HH:mm)
 *
 * @param date - The date to format
 * @returns Formatted date-time string for input
 */
export function formatDateTimeLocal(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}
