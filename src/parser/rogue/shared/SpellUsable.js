import SPELLS from 'common/SPELLS';

import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

const MARK_FOR_DEATH_DURATION = 60 * 1000;

class SpellUsable extends CoreSpellUsable {

  /**
	 * A map of target strings to the timestamp of when Marked for Death was cast on them.
	 */
	markMap = {};

  on_byPlayer_cast(event) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }

		if (!event.ability.guid === SPELLS.MARKED_FOR_DEATH_TALENT.id) {
			return;
		}

		const targetString = encodeTargetString(event.targetID, event.targetInstance);
		this.markMap[targetString] = event.timestamp;
	}

  on_byPlayer_removedebuff(event) {
    if (super.on_byPlayer_removedebuff) {
      super.on_byPlayer_removedebuff(event);
    }

    if (event.ability.guid !== SPELLS.MARKED_FOR_DEATH_TALENT.id || !this.isOnCooldown(SPELLS.MARKED_FOR_DEATH_TALENT.id)) {
			return;
		}

		const targetString = encodeTargetString(event.targetID, event.targetInstance);

		// Only refresh cooldown if the target died, which is not the case if the debuff is removed at the end of its duration.
		if(event.timestamp - this.markMap[targetString] < MARK_FOR_DEATH_DURATION) {
			this.endCooldown(SPELLS.MARKED_FOR_DEATH_TALENT.id);
		}
	}
}

export default SpellUsable;
