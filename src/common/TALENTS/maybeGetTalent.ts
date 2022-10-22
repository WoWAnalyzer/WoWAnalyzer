// We currently only need to fetch talents by IDs from the large object.
import { indexOnlyById } from 'common/indexById';
import { Talent } from 'common/TALENTS/types';
import {
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
} from './index';

// We currently only need to fetch talents by IDs from the large object.
// We `indexOnlyById` every talent set individually due to talent name conflicts
// occurring between classes. FLURRY_TALENT is a very popular talent name, apparently.
const TALENTS = {
  ...indexOnlyById<Talent, typeof TALENTS_WARRIOR>(TALENTS_WARRIOR),
  ...indexOnlyById<Talent, typeof TALENTS_PALADIN>(TALENTS_PALADIN),
  ...indexOnlyById<Talent, typeof TALENTS_HUNTER>(TALENTS_HUNTER),
  ...indexOnlyById<Talent, typeof TALENTS_ROGUE>(TALENTS_ROGUE),
  ...indexOnlyById<Talent, typeof TALENTS_PRIEST>(TALENTS_PRIEST),
  ...indexOnlyById<Talent, typeof TALENTS_DEATH_KNIGHT>(TALENTS_DEATH_KNIGHT),
  ...indexOnlyById<Talent, typeof TALENTS_SHAMAN>(TALENTS_SHAMAN),
  ...indexOnlyById<Talent, typeof TALENTS_MAGE>(TALENTS_MAGE),
  ...indexOnlyById<Talent, typeof TALENTS_WARLOCK>(TALENTS_WARLOCK),
  ...indexOnlyById<Talent, typeof TALENTS_MONK>(TALENTS_MONK),
  ...indexOnlyById<Talent, typeof TALENTS_DRUID>(TALENTS_DRUID),
  ...indexOnlyById<Talent, typeof TALENTS_DEMON_HUNTER>(TALENTS_DEMON_HUNTER),
  ...indexOnlyById<Talent, typeof TALENTS_EVOKER>(TALENTS_EVOKER),
} as const;

const maybeGetTalent = (key: number | undefined): Talent | undefined =>
  key ? TALENTS[key as any] : undefined;

export default maybeGetTalent;
