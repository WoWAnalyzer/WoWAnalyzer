import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { TALENTS_DRUID } from 'common/TALENTS';
import DebuffTracker from 'analysis/retail/druid/balance/modules/spells/DebuffTracker';

const SUNFIRE_DURATION_MS = 18_000;
const DEBUG = false;

class SunfireTracker extends DebuffTracker {
  constructor(options: Options) {
    super(SPELLS.SUNFIRE, SUNFIRE_DURATION_MS, options);

    // -------------------------------------------------------------------------------------------------------
    // Aetherial Kindling
    // https://www.wowhead.com/spell=327541/aetherial-kindling
    // -------------------------------------------------------------------------------------------------------
    // as-of 12.0.5
    // " Casting Starfall extends the duration of active Moonfires and Sunfires by 3.0 sec, up to 28 sec. "
    // -------------------------------------------------------------------------------------------------------
    if (this.owner.selectedCombatant.hasTalent(TALENTS_DRUID.AETHERIAL_KINDLING_TALENT)) {
      DEBUG && console.info('Player has TALENTS_DRUID.AETHERIAL_KINDLING_TALENT');
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARFALL_CAST),
        this.onStarfall,
      );
    }
  }

  private onStarfall(event: CastEvent) {
    for (const debuffTracker of Object.values(this.debuffHistoryPerTargetId)) {
      if (
        debuffTracker.currentDebuff !== undefined &&
        debuffTracker.currentDebuff.endTimeStamp >= event.timestamp
      ) {
        const maximumEndTimeStamp = event.timestamp + 28_000;
        const newEndTimeStamp = Math.min(
          debuffTracker.currentDebuff.endTimeStamp + 3_000,
          maximumEndTimeStamp,
        );

        DEBUG &&
          console.info(
            '[%s] Extend duration by %dms',
            this.owner.formatTimestamp(event.timestamp, 3),
            newEndTimeStamp - debuffTracker.currentDebuff.endTimeStamp,
          );
        debuffTracker.currentDebuff.endTimeStamp = newEndTimeStamp;
      }
    }
  }
}

export default SunfireTracker;
