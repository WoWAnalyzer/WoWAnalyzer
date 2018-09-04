import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class Ascendance extends Analyzer {
  numLavaBurstsCast = 0;
  numLightningBoltsCast = 0;
  numOtherCasts = 0;

  numCasts = {
    [SPELLS.LAVA_BURST.id]: 0,
    [SPELLS.EARTH_SHOCK.id]: 0,
    [SPELLS.ELEMENTAL_BLAST_TALENT.id]: 0,
    [SPELLS.FLAME_SHOCK.id]: 0,
    [SPELLS.LIGHTNING_BOLT.id]: 0,
    others: 0,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id);
  }

  get rawUpdate() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) / this.owner.fightDuration;
  }

  get AscendanceUptime() {
    return this.rawUpdate;
  }

  on_byPlayer_cast(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id, event.timestamp)) {
      const spellId = event.ability.guid;
      if (this.numCasts[spellId] !== undefined) {
        this.numCasts[spellId] += 1;
      } else {
        this.numCasts.others += 1;
      }
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id} />}
        value={`${this.numCasts[SPELLS.LAVA_BURST.id]}`}
        label="Lava Burst casts"
        tooltip={`With a uptime of: ${formatPercentage(this.AscendanceUptime)} %<br>
        Casts while Ascendance was up:<br>
        <ul>
          <li>Earth Shock: ${this.numCasts[SPELLS.EARTH_SHOCK.id]}</li>
          <li>Elemental Blast: ${this.numCasts[SPELLS.ELEMENTAL_BLAST_TALENT.id]}</li>
          <li>Flame Shock: ${this.numCasts[SPELLS.FLAME_SHOCK.id]}</li>
          <li>Lightning Bolt: ${this.numCasts[SPELLS.LIGHTNING_BOLT.id]}</li>
          <li>Other Spells: ${this.numCasts.others}</li>
        </ul>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Ascendance;
