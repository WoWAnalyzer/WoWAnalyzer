import type { JSX } from 'react';
import { Trans } from '@lingui/react/macro';
import BaseEnchantChecker from 'parser/retail/modules/items/EnchantChecker';
/**
 * Marksmanship Hunter EnchantChecker
 *
 * BiS enchants per Azortharion / Icy Veins (Midnight Season 1):
 *   Helm     - Empowered Hex of Leeching (Leech)
 *   Shoulders - Silvermoon's Mending (Leech)
 *   Chest    - Mark of the Worldsoul (Primary stat)
 *   Legs     - Forest Hunter's Armor Kit (Agility)
 *   Boots    - Shaladrassil's Roots (Leech)
 *   Rings    - Eyes of the Eagle (Crit)
 *   Weapon   - Acuity of the Ren'dorei (Primary stat proc)
 */
const ENCHANTABLE_SLOTS: Record<number, JSX.Element> = {
  1: <Trans id="common.slots.helm">Helm</Trans>,
  3: <Trans id="common.slots.shoulders">Shoulders</Trans>,
  4: <Trans id="common.slots.chest">Chest</Trans>,
  6: <Trans id="common.slots.legs">Legs</Trans>,
  7: <Trans id="common.slots.boots">Boots</Trans>,
  10: <Trans id="common.slots.ring">Ring</Trans>,
  11: <Trans id="common.slots.ring">Ring</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
};
class EnchantChecker extends BaseEnchantChecker {
  get EnchantableSlots(): Record<number, JSX.Element> {
    return ENCHANTABLE_SLOTS;
  }
  get MaxEnchantIds(): number[] {
    return [...super.MaxEnchantIds];
  }
}
export default EnchantChecker;
