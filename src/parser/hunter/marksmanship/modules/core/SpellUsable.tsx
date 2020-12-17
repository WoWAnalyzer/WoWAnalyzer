import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import { CastEvent, DamageEvent } from 'parser/core/Events';
import { LegendarySpell } from 'common/SPELLS/Spell';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastPotentialTriggerForRapidFireReset: CastEvent | null = null;
  rapidFireResets = 0;
  SURGING_SHOTS_EFFECT = SPELLS.SURGING_SHOTS_EFFECT as LegendarySpell;
  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
  
    if (this.selectedCombatant.hasLegendaryByBonusID(this.SURGING_SHOTS_EFFECT.bonusID ? this.SURGING_SHOTS_EFFECT.bonusID : 0)) {
      if (spellId === SPELLS.AIMED_SHOT.id) {
        this.lastPotentialTriggerForRapidFireReset = event;
      } else if (spellId === SPELLS.RAPID_FIRE.id) {
        this.lastPotentialTriggerForRapidFireReset = null;
      }
    }
    super.onCast(event);
  }

  beginCooldown(spellId: number, cooldownTriggerEvent: CastEvent | DamageEvent) {
    if (spellId === SPELLS.RAPID_FIRE.id && this.selectedCombatant.hasLegendaryByBonusID(this.SURGING_SHOTS_EFFECT.bonusID ? this.SURGING_SHOTS_EFFECT.bonusID : 0)) {
      if (this.isOnCooldown(spellId)) {
        this.rapidFireResets += 1;
        this.endCooldown(
          spellId,
          undefined,
          this.lastPotentialTriggerForRapidFireReset
            ? this.lastPotentialTriggerForRapidFireReset.timestamp
            : undefined,
        );
      }
    }
    super.beginCooldown(spellId, cooldownTriggerEvent);
  }
}

export default SpellUsable;
