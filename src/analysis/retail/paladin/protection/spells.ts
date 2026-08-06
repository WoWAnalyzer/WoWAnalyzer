import GeneratedSpells from './spell-list_Paladin_Protection.retail';
import type { RetailSpell } from 'wow-dbc';

const extraSpells = {} as const satisfies Record<string, RetailSpell & { icon: string }>;

const spells = { ...GeneratedSpells, ...extraSpells } as const;
export type Spells = typeof spells;
export default spells;
