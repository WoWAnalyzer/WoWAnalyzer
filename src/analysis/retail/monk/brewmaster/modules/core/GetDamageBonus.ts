import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { DamageEvent } from 'parser/core/Events';
import { WHITELISTED_SPELL_IDS } from '../../constants';

/**
 * Variant of `calculateEffectiveDamage` that incorporates the BREWMASTER (!!) whitelist.
 * Weapons of Order, Press the Advantage and other modifiers only interact with the whitelisted spells since ~10.1.
 */
export default function getDamageBonus(
  event: DamageEvent,
  increase: number,
  ignoreWhitelist = false,
) {
  if (!ignoreWhitelist && !WHITELISTED_SPELL_IDS.has(event.ability.guid)) {
    return 0;
  }

  return calculateEffectiveDamage(event, increase);
}
