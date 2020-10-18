import SPELLS from 'common/SPELLS';

import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';

const MARK_FOR_DEATH_DURATION = 60 * 1000;

class SpellUsable extends CoreSpellUsable {
  /**
   * A map of target strings to the timestamp of when Marked for Death was cast on them.
   */
  markMap = {};

  constructor(options){
    super(options);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MARKED_FOR_DEATH_TALENT), this.onRemoveBuff);
  }

  onCast(event) {
    super.onCast(event);

    if (!event.ability.guid === SPELLS.MARKED_FOR_DEATH_TALENT.id) {
      return;
    }

    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    this.markMap[targetString] = event.timestamp;
  }

  onRemoveBuff(event) {
    if (!this.isOnCooldown(SPELLS.MARKED_FOR_DEATH_TALENT.id)) {
      return;
    }

    const targetString = encodeTargetString(event.targetID, event.targetInstance);

    // Only refresh cooldown if the target died, which is not the case if the debuff is removed at the end of its duration.
    if (event.timestamp - this.markMap[targetString] < MARK_FOR_DEATH_DURATION) {
      this.endCooldown(SPELLS.MARKED_FOR_DEATH_TALENT.id);
    }
  }
}

export default SpellUsable;
