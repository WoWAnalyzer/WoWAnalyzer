import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    abilities: Abilities,
  };
  onEvent(event) {
    super.onEvent(event);
    // Tactician passive: You have a 1.40% chance per Rage spent on damaging abilities to reset the remaining cooldown on Overpower.
    // normally charges dont count down simultaneously. these do
    if (event.type === EventType.ApplyBuff || event.type === EventType.RefreshBuff) {
      if (event.ability.guid === SPELLS.TACTICIAN.id) {
        if (this.isOnCooldown(SPELLS.OVERPOWER.id)) {
          const remainingCD =
            this.abilities.getAbility(SPELLS.OVERPOWER.id).cooldown * 1000 -
            this.cooldownRemaining(SPELLS.OVERPOWER.id);
          this.endCooldown(SPELLS.OVERPOWER.id, false, this.owner.currentTimestamp, remainingCD);
        }
      }
    }

    // Battlelord legendary: overpower has a chance to reset mortal strike
    if (event.type === EventType.ApplyBuff || event.type === EventType.RefreshBuff) {
      if (event.ability.guid === SPELLS.BATTLELORD_ENERGIZE.id) {
        if (this.isOnCooldown(SPELLS.MORTAL_STRIKE.id)) {
          this.endCooldown(SPELLS.MORTAL_STRIKE.id);
        }
      }
    }
  }
}

export default SpellUsable;
