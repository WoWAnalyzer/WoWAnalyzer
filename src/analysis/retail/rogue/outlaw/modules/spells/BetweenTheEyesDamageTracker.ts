import { FilteredDamageTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';

class BetweenTheEyesDamageTracker extends FilteredDamageTracker {
  static dependencies = {
    ...FilteredDamageTracker.dependencies,
    spellUsable: SpellUsable,
    spellManaCost: SpellManaCost,
  };
  protected spellUsable!: SpellUsable;

  shouldProcessEvent(event: HealEvent | CastEvent | DamageEvent): boolean {
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
