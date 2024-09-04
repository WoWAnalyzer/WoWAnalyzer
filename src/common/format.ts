/**
 * Rounds to nearest integer and returns as a String with added thousands seperators. *
 * Ex: 5842923.7 => 5,842,924
 */
export function formatThousands(number: number): string {
  // If env variable LOCALE is set, use that locale for formatting.
  return Math.round(number || 0).toLocaleString(import.meta.env.LOCALE);
}

/**
 * Rounds to nearest integer and returns as a String with added thousands seperators,
 * but if above 10,000 expresses as number of thousands and if above 1,000,000 expresses as number of millions (with 2 decimal places).
 * Ex: 4445.2 => 4,445
 *     78921 => 79k
 *     3444789 => 3.44m
 */
export function formatNumber(number: number): string {
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 10000) {
    return `${Math.round(number / 1000)}k`;
  }
  return formatThousands(number);
}

/**
 * Formats a number as a percentage with the given precision (default 2), with 0 = 0 percent and 1 = 100 percent.
 * Ex: 0.79832 => 79.83
 */
export function formatPercentage(percentage: number, precision: number = 2): string {
  return ((percentage || 0) * 100).toFixed(precision);
}

/**
 * Formats a duration in milliseconds to be a String expressed as minutes and seconds
 * with the given decimal second precision (default 0).
 * Ex: 317.3 => 5:17
 */
export function formatDuration(duration: number, precision: number = 0): string {
  const totalSeconds = duration / 1000;
  const neg = totalSeconds < 0 ? '-' : '';
  const posSeconds = Math.abs(totalSeconds);
  const minutes = Math.floor(posSeconds / 60);
  const mult = Math.pow(10, precision);
  const rest = (Math.floor((posSeconds % 60) * mult) / mult).toFixed(precision);
  const seconds = Number(rest) < 10 ? `0${rest}` : rest;

  return `${neg}${minutes}:${seconds}`;
}

/**
 * Like `formatDuration`, but formats it as "Xm Ys".
 */
export function formatDurationMinSec(duration: number): string {
  const minutes = Math.floor(duration / 60);
  const seconds = Number.isInteger(duration) ? duration % 60 : (duration % 60).toFixed(1);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Like `formatDurationMinSec` but accepts duration in milliseconds.
 */
export function formatDurationMillisMinSec(duration: number, precision: number = 0): string {
  const totalSeconds = duration / 1000;
  const neg = totalSeconds < 0 ? '-' : '';
  const posSeconds = Math.abs(totalSeconds);
  const minutes = Math.floor(posSeconds / 60);
  const mult = Math.pow(10, precision);
  const rest = (Math.floor((posSeconds % 60) * mult) / mult).toFixed(precision);
  const seconds = Number(rest) < 10 ? `${rest}` : rest;

  if (minutes !== 0) {
    return `${neg}${minutes}m ${seconds}s`;
  }
  return `${neg}${seconds}s`;
}

/**
 * Formats a duration in milliseconds to be a String expressed as minutes, seconds, and milliseconds.
 * Formatting maintains ordering but is pretty ugly, mostly suitable for debug logging instead of user facing content.
 * Ex. 317327 => 05:17.327
 */
export function formatMilliseconds(duration: number): string {
  const sumSeconds = duration / 1000;
  const minutes = Math.floor(sumSeconds / 60);
  const seconds = sumSeconds % 60;

  let response = '';
  if (minutes < 10) {
    response += '0';
  }
  response += minutes;
  response += ':';
  if (seconds < 10) {
    response += '0';
  }
  response += seconds.toFixed(3);

  return response;
}

/**
 * Formats a number into the ordinal form.
 * Ex: 2nd, 7th, 20th, 23rd, 52nd, 135th, 301st
 */
export function formatNth(number: number): string {
  return number.toString() + (['st', 'nd', 'rd'][((((number + 90) % 100) - 10) % 10) - 1] || 'th');
}
