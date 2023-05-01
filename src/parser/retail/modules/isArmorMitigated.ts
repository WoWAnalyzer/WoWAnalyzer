import { DamageEvent } from 'parser/core/Events';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';

/** spellIds of damage that is non-phyiscal or periodic but is still mitigated by armor */
const MITIGATED_LIST: number[] = [];

/** spellIds of damage that is physical and non-periodic but is not mitigated by armor */
const UNMITIGATED_LIST: number[] = [];

/**
 * Returns true iff the given damage event is mitigated by armor.
 * For the vast majority of cases, this will be damage that is physical and non-periodic.
 * A whitelist/blacklist is maintained for special case damage.
 * */
export const isArmorMitigated = (event: DamageEvent) => {
  if (MITIGATED_LIST.includes(event.ability.guid)) {
    return true;
  } else if (UNMITIGATED_LIST.includes(event.ability.guid)) {
    return false;
  } else {
    return event.ability.type === MAGIC_SCHOOLS.ids.PHYSICAL && !event.tick;
  }
};
