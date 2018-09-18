import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TalentStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';

const DESPERATE_PRAYER_BASE_COOLDOWN = 90000;

// Example Log: /report/1bgY6k8ADWJLzjPN/7-Mythic+Taloc+-+Kill+(5:45)/1-Cruzco
class AngelsMercy extends Analyzer {
  desperatePrayersCast = 0;
  desperatePrayerTimeReduced = 0;
  lastDesperatePrayerTimestamp = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ANGELS_MERCY_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DESPERATE_PRAYER.id) {
      if (this.desperatePrayersCast > 0) {
        const timeSinceLastDP = (event.timestamp - this.lastDesperatePrayerTimestamp);
        const timeReduced = DESPERATE_PRAYER_BASE_COOLDOWN - timeSinceLastDP;
        if (timeReduced > 0) {
          this.desperatePrayerTimeReduced += DESPERATE_PRAYER_BASE_COOLDOWN - timeSinceLastDP;
        }
      }
      this.desperatePrayersCast++;
      this.lastDesperatePrayerTimestamp = event.timestamp;
    }
  }

  statistic() {
    return (

      <TalentStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.ANGELS_MERCY_TALENT.id} />}
        value={`${Math.floor(this.desperatePrayerTimeReduced / 1000)}s Cooldown Reduction Used`}
        label="Angels Mercy"
        tooltip={`
          Desperate Prayers cast: ${this.desperatePrayersCast}<br />
        `}
        position={STATISTIC_ORDER.CORE(2)}
      />

    );
  }
}

export default AngelsMercy;
