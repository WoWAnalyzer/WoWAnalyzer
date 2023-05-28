// We currently only need to fetch talents by IDs from the large object.
import { Talent } from 'common/TALENTS/types';
import { TalentEntry } from 'parser/core/Events';
// note: depends on the index file ONLY re-exporting the talent objects
import * as talent_tables from './index';

// we aren't using the regular indexOnlyById method because we need to use a different field and can skip most of the checks

const TALENTS: Record<number, Talent> = {};

for (const table of Object.values(talent_tables)) {
  for (const talent of Object.values(table)) {
    for (const entryId of talent.entryIds) {
      TALENTS[entryId] = talent;
    }
  }
}

const getTalentFromEntry = (entry: TalentEntry): Talent | undefined => TALENTS[entry.id];
export default getTalentFromEntry;
