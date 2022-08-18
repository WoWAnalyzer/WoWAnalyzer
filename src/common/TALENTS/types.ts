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
  //These three are currently not exported in the script - but they could be if we deem the information necessary
  reqPoints?: number;
  talentType?: ClassNodeType;
  spellType?: EntryType;
}

type EnforceObjectType<T> = <V extends T>(v: V) => V;

export const createTalentList: EnforceObjectType<{ [key: string]: Talent }> = (v) => v;
