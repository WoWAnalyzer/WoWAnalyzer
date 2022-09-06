import {
  RAPTOR_MONGOOSE_VARIANTS,
  SURVIVAL_BOMB_TYPES,
} from 'analysis/retail/hunter-survival/constants';
import SPELLS from 'common/SPELLS';
import { CastEvent, DamageEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastPotentialTriggerForBombReset: CastEvent | null = null;
  bombResets = 0;

  raptorMongooseVariantsIds = RAPTOR_MONGOOSE_VARIANTS.map((spell) => spell.id);

  onCast(event: CastEvent) {
    const spell = event.ability;
    if (this.selectedCombatant.hasLegendary(SPELLS.RYLAKSTALKERS_CONFOUNDING_STRIKES_EFFECT)) {
      if (this.raptorMongooseVariantsIds.includes(spell.guid)) {
        this.lastPotentialTriggerForBombReset = event;
      } else if (spell.guid === SPELLS.WILDFIRE_BOMB.id) {
        this.lastPotentialTriggerForBombReset = null;
      }
    }
    super.onCast(event);
  }

  beginCooldown(triggerEvent: CastEvent | DamageEvent, spellId: number) {
    if (
      SURVIVAL_BOMB_TYPES.includes(spellId) &&
      this.selectedCombatant.hasLegendary(SPELLS.RYLAKSTALKERS_CONFOUNDING_STRIKES_EFFECT)
    ) {
      if (this.isOnCooldown(spellId) && this.chargesAvailable(spellId) === 0) {
        this.bombResets += 1;
        this.endCooldown(
          spellId,
          this.lastPotentialTriggerForBombReset
            ? this.lastPotentialTriggerForBombReset.timestamp
            : undefined,
        );
      }
    }
    super.beginCooldown(triggerEvent, spellId);
  }
}

export default SpellUsable;
