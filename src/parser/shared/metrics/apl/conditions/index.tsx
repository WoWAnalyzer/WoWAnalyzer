export { default as hasConduit } from './hasConduit';
export { default as hasLegendary } from './hasLegendary';
export { default as optional } from './optional';
export { buffPresent, buffMissing } from './buffPresent';
export { default as spellAvailable } from './spellAvailable';
export { default as hasResource } from './hasResource';
export { default as inExecute } from './inExecute';
export { default as or } from './or';
export { default as always } from './always';
export { default as and } from './and';

export interface Range {
  atLeast?: number;
  atMost?: number;
}
