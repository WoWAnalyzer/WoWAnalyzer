import SPELLS from 'common/SPELLS';
import { CastEvent, DamageEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

import {
  RAPTOR_MONGOOSE_VARIANTS,
  SURVIVAL_BOMB_TYPES,
} from '@wowanalyzer/hunter-survival/src/constants';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastPotentialTriggerForBombReset: CastEvent | null = null;
  bombResets = 0;

  onCast(event: CastEvent) {
    const spell = event.ability;
    if (this.selectedCombatant.hasLegendary(SPELLS.RYLAKSTALKERS_CONFOUNDING_STRIKES_EFFECT)) {
      if (RAPTOR_MONGOOSE_VARIANTS.includes(spell)) {
        this.lastPotentialTriggerForBombReset = event;
      } else if (spell.guid === SPELLS.WILDFIRE_BOMB.id) {
        this.lastPotentialTriggerForBombReset = null;
      }
    }
    super.onCast(event);
  }

  beginCooldown(spellId: number, cooldownTriggerEvent: CastEvent | DamageEvent) {
    if (
      SURVIVAL_BOMB_TYPES.includes(spellId) &&
      this.selectedCombatant.hasLegendary(SPELLS.RYLAKSTALKERS_CONFOUNDING_STRIKES_EFFECT)
    ) {
      if (this.isOnCooldown(spellId) && this.chargesAvailable(spellId) === 0) {
        this.bombResets += 1;
        this.endCooldown(
          spellId,
          false,
          this.lastPotentialTriggerForBombReset
            ? this.lastPotentialTriggerForBombReset.timestamp
            : undefined,
        );
      }
    }
    super.beginCooldown(spellId, cooldownTriggerEvent);
  }
}

export default SpellUsable;
