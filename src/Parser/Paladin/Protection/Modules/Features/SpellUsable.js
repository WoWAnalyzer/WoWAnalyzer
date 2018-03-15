import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    combatants: Combatants,
  };

  on_initialized() {
    this.hasCrusadersJudgment = this.combatants.selected.hasTalent(SPELLS.CRUSADERS_JUDGMENT_TALENT.id);
  }

  lastPotentialTriggerForAvengersShield = null;
  lastPotentialTriggerForJudgment = null;
  on_byPlayer_cast(event) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }

    const spellId = event.ability.guid;
    if (spellId === SPELLS.HAMMER_OF_THE_RIGHTEOUS.id || spellId === SPELLS.BLESSED_HAMMER_TALENT.id) {
      this.lastPotentialTriggerForAvengersShield = event;
    } else if (spellId === SPELLS.AVENGERS_SHIELD.id) {
      this.lastPotentialTriggerForAvengersShield = null;
    } else if (spellId === SPELLS.JUDGMENT_CAST.id) {
      this.lastPotentialTriggerForJudgment = null;
    }
  }
  on_toPlayer_damage(event) {
    if (super.on_toPlayer_damage) {
      super.on_toPlayer_damage(event);
    }

    if ([HIT_TYPES.DODGE, HIT_TYPES.PARRY].includes(event.hitType)) {
      this.lastPotentialTriggerForAvengersShield = event;
      this.lastPotentialTriggerForJudgment = event;
    }
  }

  beginCooldown(spellId, timestamp) {
    if (spellId === SPELLS.AVENGERS_SHIELD.id) {
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(spellId, undefined, this.lastPotentialTriggerForAvengersShield ? this.lastPotentialTriggerForAvengersShield.timestamp : undefined);
      }
    } else if (this.hasCrusadersJudgment && spellId === SPELLS.JUDGMENT_CAST.id) {
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(spellId, undefined, this.lastPotentialTriggerForJudgment ? this.lastPotentialTriggerForJudgment.timestamp : undefined);
      }
    }

    super.beginCooldown(spellId, timestamp);
  }
}

export default SpellUsable;
