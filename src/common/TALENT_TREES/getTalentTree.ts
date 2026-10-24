import { TalentTreeLayout } from 'common/TALENT_TREES/types';

// note: depends on the index file ONLY re-exporting the talent tree tables
import * as talent_tree_tables from './index';

const TALENT_TREES: Record<number, TalentTreeLayout> = {};

for (const table of Object.values(talent_tree_tables)) {
  for (const layout of Object.values(table)) {
    TALENT_TREES[layout.specId] = layout;
  }
}

export const getTalentTree = (specId: number | undefined) => {
  return specId ? TALENT_TREES[specId] : undefined;
};
