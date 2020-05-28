import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import { CastEvent } from 'parser/core/Events';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastPotentialTriggerForRapidFireReset: CastEvent | null = null;
  rapidFireResets = 0;

  on_byPlayer_cast(event: CastEvent) {
    super.on_byPlayer_cast?.(event);

    const spellId = event.ability.guid;
    if (this.selectedCombatant.hasTrait(SPELLS.SURGING_SHOTS.id)) {
      if (spellId === SPELLS.AIMED_SHOT.id) {
        this.lastPotentialTriggerForRapidFireReset = event;
      } else if (spellId === SPELLS.RAPID_FIRE.id) {
        this.lastPotentialTriggerForRapidFireReset = null;
      }
    }
  }

  beginCooldown(spellId: number, cooldownTriggerEvent: Object) {
    if (spellId === SPELLS.RAPID_FIRE.id && this.selectedCombatant.hasTrait(SPELLS.SURGING_SHOTS.id)) {
      if (this.isOnCooldown(spellId)) {
        this.rapidFireResets += 1;
        this.endCooldown(spellId, undefined, this.lastPotentialTriggerForRapidFireReset ? this.lastPotentialTriggerForRapidFireReset.timestamp : undefined);
      }
    }
    super.beginCooldown(spellId, cooldownTriggerEvent);
  }
}

export default SpellUsable;
