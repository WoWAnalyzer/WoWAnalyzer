import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Ascendance extends Module {
  numLavaBurstsCast = 0;
  numLightningBoltsCast = 0;
  numOtherCasts = 0;

  numCasts = {
    [SPELLS.LAVA_BURST.id]: 1,
    [SPELLS.EARTH_SHOCK.id]: 1,
    [SPELLS.ELEMENTAL_BLAST.id]: 1,
    [SPELLS.FLAME_SHOCK.id]: 1,
    [SPELLS.LIGHTNING_BOLT.id]: 1,
    'others': 1,
  };

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) || this.owner.modules.combatants.selected.hasHands(ITEMS.SMOLDERING_HEART.id);
  }

  get rawUpdate() {
    return this.owner.modules.combatants.selected.getBuffUptime(SPELLS.ASCENDANCE.id) / this.owner.fightDuration;
  }

  get AscendanceUptime() {
    return this.rawUpdate;
  }

  on_byPlayer_cast(event) {
    if (this.owner.modules.combatants.selected.hasBuff(SPELLS.ASCENDANCE.id, event.timestamp)) {
      const spellId = event.ability.guid;
      if (this.numCasts[spellId]) {
        this.numCasts[spellId]++;
      } else {
        this.numCasts.others++;
      }
    }
  }

  on_finished() {
    for(const i in this.numCasts) {
      this.numCasts[i]--;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ASCENDANCE.id} />}
        value={`${this.numCasts[SPELLS.LAVA_BURST.id]}`}
        label={`Lava Burst casts`}
        tooltip={`With a uptime of: ${formatPercentage(this.AscendanceUptime)} %<br>
        Casts while Ascendance was up:<br>
        <ul>
          <li>Earth Shock: ${this.numCasts[SPELLS.EARTH_SHOCK.id]}</li>
          <li>Elemental Blast: ${this.numCasts[SPELLS.ELEMENTAL_BLAST.id]}</li>
          <li>Flame Shock: ${this.numCasts[SPELLS.FLAME_SHOCK.id]}</li>
          <li>Lightning Bolt: ${this.numCasts[SPELLS.LIGHTNING_BOLT.id]}</li>
          <li>Other Spells: ${this.numCasts['others']}</li>
        </ul>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Ascendance;
