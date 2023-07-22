import safeMerge from 'common/safeMerge';

import { TALENTS_WARRIOR } from './warrior';
import { TALENTS_PALADIN } from './paladin';
import { TALENTS_HUNTER } from './hunter';
import { TALENTS_ROGUE } from './rogue';
import { TALENTS_PRIEST } from './priest';
import { TALENTS_DEATH_KNIGHT } from './deathknight';
import { TALENTS_SHAMAN } from './shaman';
import { TALENTS_MAGE } from './mage';
import { TALENTS_WARLOCK } from './warlock';
import { TALENTS_MONK } from './monk';
import { TALENTS_DRUID } from './druid';
import { TALENTS_DEMON_HUNTER } from './demonhunter';
import { TALENTS_EVOKER } from './evoker';
import indexById from 'common/indexById';
import { Talent } from 'common/TALENTS/types';

const TALENTS = safeMerge(
  TALENTS_WARRIOR,
  TALENTS_PALADIN,
  TALENTS_HUNTER,
  TALENTS_ROGUE,
  TALENTS_PRIEST,
  TALENTS_DEATH_KNIGHT,
  TALENTS_SHAMAN,
  TALENTS_MAGE,
  TALENTS_WARLOCK,
  TALENTS_MONK,
  TALENTS_DRUID,
  TALENTS_DEMON_HUNTER,
  TALENTS_EVOKER,
);
const InternalTalentTable = indexById<Talent, typeof TALENTS>(TALENTS);

export const maybeGetTalent = (key: string | number | undefined) => {
  return key ? InternalTalentTable[key as any] : undefined;
};
