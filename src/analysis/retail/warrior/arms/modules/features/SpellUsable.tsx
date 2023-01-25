import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { EventType } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  onEvent(event: any) {
    super.onEvent(event);
    // Tactician passive: You have a 1.40% chance per Rage spent on damaging abilities to reset the remaining cooldown on Overpower.
    // normally charges dont count down simultaneously. these do
    if (
      (event.type === EventType.ApplyBuff || event.type === EventType.RefreshBuff) &&
      event.ability.guid === SPELLS.TACTICIAN.id &&
      this.isOnCooldown(SPELLS.OVERPOWER.id)
    ) {
      this.endCooldown(SPELLS.OVERPOWER.id, this.owner.currentTimestamp, false, false);
    }

    // Battlelord: overpower has a chance to reset mortal strike
    if (
      (event.type === EventType.ApplyBuff || event.type === EventType.RefreshBuff) &&
      event.ability.guid === TALENTS.BATTLELORD_TALENT.id &&
      this.isOnCooldown(SPELLS.MORTAL_STRIKE.id)
    ) {
      this.endCooldown(SPELLS.MORTAL_STRIKE.id);
    }
  }
}

export default SpellUsable;
