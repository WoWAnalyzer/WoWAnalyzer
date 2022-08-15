import { SpellList } from 'common/SPELLS/Spell';

import ITEMS from './items';

const itemSpells: SpellList = {
  ...ITEMS,
} as const;

export default itemSpells;
