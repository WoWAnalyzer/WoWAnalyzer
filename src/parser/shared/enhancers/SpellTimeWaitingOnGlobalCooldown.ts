import Analyzer from 'parser/core/Analyzer';
import Events, {
  EventType,
  GlobalCooldownEvent,
  UpdateSpellUsableEvent,
} from 'parser/core/Events';

import SpellUsable from '../modules/SpellUsable';

const GCD_MATCH_BUFFER_MS = 150;
const RESET_BUFFER_PERCENT = 0.5;

class SpellTimeWaitingOnGlobalCooldown extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  // necessary for the UpdateSpellUsable event
  protected spellUsable!: SpellUsable;

  private lastGlobalCooldown: GlobalCooldownEvent | undefined;
  constructor(options: any) {
    super(options);
    this.addEventListener(
      Events.UpdateSpellUsable,
      this.handleUpdateSpellUsable,
    );
    this.addEventListener(Events.GlobalCooldown, this.handleGlobalCooldown);
  }

  private handleUpdateSpellUsable(event: UpdateSpellUsableEvent) {
    if (!this.lastGlobalCooldown) {
      return;
    }
    const resetBufferMS =
      RESET_BUFFER_PERCENT * this.lastGlobalCooldown.duration;
    const earlyByMS = event.start + event.expectedDuration - event.timestamp;
    // check if the ability was reset early. If the reset was less than a percentage of the GCD don't consider it as a reset.
    // check if the reset happened as a result of the previous cast
    if (
      event.trigger === EventType.EndCooldown &&
      resetBufferMS < earlyByMS &&
      event.timestamp < this.lastGlobalCooldown.timestamp + GCD_MATCH_BUFFER_MS
    ) {
      // if the time remaining was less than the GCD use that instead
      event.timeWaitingOnGCD = Math.min(
        earlyByMS,
        this.lastGlobalCooldown.duration,
      );
    }
  }
  private handleGlobalCooldown(event: GlobalCooldownEvent) {
    this.lastGlobalCooldown = event;
  }
}

export default SpellTimeWaitingOnGlobalCooldown;
