import Spell from '../SPELLS/Spell';

export interface Talent extends Spell {
  maxRanks: number;
  reqPoints?: number;
}

type EnforceObjectType<T> = <V extends T>(v: V) => V;

export const createTalentList: EnforceObjectType<{ [key: string]: Talent }> = (v) => v;
