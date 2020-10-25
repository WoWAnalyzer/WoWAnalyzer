import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

const DESPERATE_PRAYER_BASE_COOLDOWN = 90000;

// Example Log: /report/1bgY6k8ADWJLzjPN/7-Mythic+Taloc+-+Kill+(5:45)/1-Cruzco
class AngelsMercy extends Analyzer {
  desperatePrayersCast = 0;
  desperatePrayerTimeReduced = 0;
  lastDesperatePrayerTimestamp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ANGELS_MERCY_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DESPERATE_PRAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    if (this.desperatePrayersCast > 0) {
      const timeSinceLastDP = (event.timestamp - this.lastDesperatePrayerTimestamp);
      const timeReduced = DESPERATE_PRAYER_BASE_COOLDOWN - timeSinceLastDP;
      if (timeReduced > 0) {
        this.desperatePrayerTimeReduced += DESPERATE_PRAYER_BASE_COOLDOWN - timeSinceLastDP;
      }
    }
    this.desperatePrayersCast += 1;
    this.lastDesperatePrayerTimestamp = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        tooltip={`Desperate Prayers cast: ${this.desperatePrayersCast}`}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(2)}
      ><BoringSpellValueText spell={SPELLS.ANGELS_MERCY_TALENT}>
        {Math.floor(this.desperatePrayerTimeReduced / 1000)}s Cooldown Reduction Used
      </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AngelsMercy;
