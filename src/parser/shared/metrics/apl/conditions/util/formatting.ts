import { Range } from './types';

export function formatRange(range: Range): string {
  if (range.atLeast !== undefined && range.atLeast === range.atMost) {
    return `${range.atLeast}`;
  } else if (range.atLeast !== undefined && range.atMost !== undefined) {
    return `${range.atLeast}-${range.atMost}`;
  } else if (range.atLeast !== undefined) {
    return `at least ${range.atLeast}`;
  } else if (range.atMost !== undefined) {
    return `at most ${range.atMost}`;
  } else {
    return '';
  }
}

export function formatTimestampRange(range: Range): string {
  if (range.atLeast && !range.atMost) {
    return formatRange({ atLeast: range.atLeast / 1000 });
  }
  if (range.atMost && !range.atLeast) {
    return formatRange({ atMost: range.atMost / 1000 });
  }
  if (range.atLeast && range.atMost) {
    return formatRange({
      atMost: range.atMost / 1000,
      atLeast: range.atLeast / 1000,
    });
  }
  return '';
}
