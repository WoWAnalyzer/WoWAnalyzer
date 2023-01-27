import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, FilterCooldownInfoEvent, RemoveBuffEvent } from 'parser/core/Events';
import { encodeEventTargetString, encodeTargetString } from 'parser/shared/modules/Enemies';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/rogue';

const MARK_FOR_DEATH_DURATION = 60 * 1000;

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  /**
   * A map of target strings to the timestamp of when Marked for Death was cast on them.
   */
  markMap: Record<string, number> = {};

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.MARKED_FOR_DEATH_TALENT),
      this.onRemoveBuff,
    );
  }

  onCast(event: CastEvent | FilterCooldownInfoEvent) {
    super.onCast(event);

    if (event.ability.guid !== TALENTS.MARKED_FOR_DEATH_TALENT.id) {
      return;
    }

    const targetString = encodeEventTargetString(event);
    if (targetString) {
      this.markMap[targetString] = event.timestamp;
    }
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (!this.isOnCooldown(TALENTS.MARKED_FOR_DEATH_TALENT.id)) {
      return;
    }

    const targetString = encodeTargetString(event.targetID, event.targetInstance);

    // Only refresh cooldown if the target died, which is not the case if the debuff is removed at the end of its duration.
    if (event.timestamp - this.markMap[targetString] < MARK_FOR_DEATH_DURATION) {
      this.endCooldown(TALENTS.MARKED_FOR_DEATH_TALENT.id);
    }
  }
}

export default SpellUsable;
