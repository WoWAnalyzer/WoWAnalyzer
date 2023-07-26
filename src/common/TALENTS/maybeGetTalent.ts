import { Talent } from 'common/TALENTS/types';

// note: depends on the index file ONLY re-exporting the talent objects
import * as talent_tables from './index';

// we aren't using the regular indexOnlyById method because we only want to enable number indexes
const TALENTS: Record<number, Talent> = {};

for (const table of Object.values(talent_tables)) {
  for (const talent of Object.values(table)) {
    TALENTS[talent.id] = talent;
  }
}

export const maybeGetTalent = (key: number | undefined) => {
  return key ? TALENTS[key] : undefined;
};
