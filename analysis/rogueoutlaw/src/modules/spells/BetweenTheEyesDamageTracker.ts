import SPELLS from 'common/SPELLS';

import { FilteredDamageTracker, SpellUsable } from '@wowanalyzer/rogue';

import SpellManaCost from '../../../../../src/parser/shared/modules/SpellManaCost';

class BetweenTheEyesDamageTracker extends FilteredDamageTracker {
  static dependencies = {
    spellUsable: SpellUsable,
    spellManaCost: SpellManaCost,
  };
  protected spellUsable!: SpellUsable;

  shouldProcessEvent(event: any): boolean {
    // isOnCooldown returns true when this event is a BTE cast, but we want to keep those casts too
    if (
      event.ability.guid !== SPELLS.BETWEEN_THE_EYES.id &&
      this.spellUsable.isOnCooldown(SPELLS.BETWEEN_THE_EYES.id)
    ) {
      return false;
    }

    const hasRuthlessPrecision = this.selectedCombatant.hasBuff(SPELLS.RUTHLESS_PRECISION.id);
    return hasRuthlessPrecision;
  }
}

export default BetweenTheEyesDamageTracker;
