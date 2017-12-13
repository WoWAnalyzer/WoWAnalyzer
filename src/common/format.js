/*
 * Rounds to nearest integer and returns as a String with added thousands seperators.
 * Ex: 5842923.7 => 5,842,924
 */
export function formatThousands(number) {
  return (`${Math.round(number || 0)}`).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

/*
 * Rounds to nearest integer and returns as a String with added thousands seperators,
 * but if above 10,000 expresses as number of thousands and if above 1,000,000 expresses as number of millions (with 2 decimal places).
 * Ex: 4445.2 => 4,445
 *     78921 => 79k
 *     3444789 => 3.44m
 */
export function formatNumber(number) {
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 10000) {
    return `${Math.round(number / 1000)}k`;
  }
  return formatThousands(number);
}

/*
 * Formats a number as a percentage with the given precision (default 2), with 0 = 0 percent and 1 = 100 percent.
 * Ex: 0.79832 => 79.83
 */
export function formatPercentage(percentage, precision = 2) {
  return ((percentage || 0) * 100).toFixed(precision);
}

/*
 * Formats a duration in seconds to be a String expressed as minutes and seconds.
 * Ex: 317.3 => 5:17
 */
export function formatDuration(duration) {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
}

/*
 * Formats a duration in milliseconds to be a String expressed as minutes, seconds, and milliseconds.
 * Formatting maintains ordering but is pretty ugly, mostly suitable for debug logging instead of user facing content.
 * Ex. 317327 => 05:17.327
 */
export function formatMilliseconds(duration) {
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
