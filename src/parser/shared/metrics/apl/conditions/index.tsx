export { default as hasConduit } from './hasConduit';
export { hasLegendary, hasNoLegendary } from './hasLegendary';
export { default as optional } from './optional';
export { buffPresent, buffMissing } from './buffPresent';
export { hasTalent, hasNoTalent } from './hasTalent';
export { default as spellAvailable } from './spellAvailable';
export { default as hasResource } from './hasResource';
export { default as inExecute } from './inExecute';
export { default as or } from './or';
export { default as not } from './not';
export { default as always } from './always';
export { default as and } from './and';
export { default as spellCharges } from './spellCharges';
export { default as buffStacks } from './buffStacks';

export interface Range {
  atLeast?: number;
  atMost?: number;
}

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
