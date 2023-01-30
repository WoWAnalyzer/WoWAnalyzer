import Spell from '../SPELLS/Spell';

enum ClassNodeType {
  Choice = 'choice',
  Single = 'single',
  Tiered = 'tiered',
}

enum EntryType {
  Active = 'active',
  Passive = 'passive',
}

export interface Talent extends Spell {
  maxRanks: number;
  entryIds: number[];
  //These three are currently not exported in the script - but they could be if we deem the information necessary
  reqPoints?: number;
  talentType?: ClassNodeType;
  spellType?: EntryType;
}

export type SpellList<T, SpellType extends Spell = Spell> = { [Key in keyof T]: SpellType };

export const createTalentList = <T>(v: SpellList<T, Talent>): SpellList<T, Talent> => v;

export const isTalent = (spell: Spell): spell is Talent => 'maxRanks' in spell;
