import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

import Combatants from 'Parser/Core/Modules/Combatants';
import Rejuvenation from '../Core/Rejuvenation';

class PowerOfTheArchdruid extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    rejuvenation: Rejuvenation,
  };

  potaRejuvs = 0;
  regrowths = 0;

  lastPotaRemovedTimestamp = null;
  lastPotaRegrowthTimestamp = null;
  proccs = 0;
  regrowthDirect = 0;
  potaRegrowthCounter = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.POWER_OF_THE_ARCHDRUID.id] > 0;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.POWER_OF_THE_ARCHDRUID_BUFF.id !== spellId) {
      return;
    }
    this.proccs += 1;

    // Our 4PT19 can procc PotA
    if (this.lastPotaRemovedTimestamp !== null && Math.abs(event.timestamp - this.lastPotaRemovedTimestamp) < 32) {
      if (SPELLS.REJUVENATION.id === spellId) {
        this.potaRejuvs = this.potaRejuvs + 2;
      } else if (SPELLS.REGROWTH.id === spellId) {
        this.regrowths = this.regrowths + 2;
        this.lastPotaRegrowthTimestamp = event.timestamp;
      }
      this.lastPotaRemovedTimestamp = null;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.POWER_OF_THE_ARCHDRUID_BUFF.id !== spellId) {
      return;
    }
    this.lastPotaRemovedTimestamp = event.timestamp;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (this.lastPotaRemovedTimestamp !== null && Math.abs(event.timestamp - this.lastPotaRemovedTimestamp) < 32) {
      if (SPELLS.REJUVENATION.id === spellId) {
        this.potaRejuvs = this.potaRejuvs + 2;
      } else if (SPELLS.REGROWTH.id === spellId) {
        this.regrowths = this.regrowths + 2;
        this.lastPotaRegrowthTimestamp = event.timestamp;
      }
      this.lastPotaRemovedTimestamp = null;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (SPELLS.REGROWTH.id !== spellId) {
      return;
    }
    if (this.lastPotaRegrowthTimestamp !== null) {
      // Skipping the first regrowth, only taking the 2 other.
      if (this.potaRegrowthCounter > 0) {
        this.regrowthDirect += event.amount + (event.absorbed || 0);
      }
      this.potaRegrowthCounter += 1;
      if (this.potaRegrowthCounter === 3) {
        this.lastPotaRegrowthTimestamp = null;
        this.potaRegrowthCounter = 0;
      }
    }
  }

  statistic() {
    const potaHealing = (this.rejuvenation.avgRejuvHealing * this.potaRejuvs) + this.regrowthDirect;
    const potaHealingPercent = this.owner.getPercentageOfTotalHealingDone(potaHealing);

    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.POWER_OF_THE_ARCHDRUID.id} />}
        value={`${formatPercentage(potaHealingPercent)} %`}
        label="Power of the Archdruid"
        tooltip={`Power of the Archdruid gave you ${this.potaRejuvs} bonus rejuvenations, ${this.regrowths} bonus regrowths`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(20);


}

export default PowerOfTheArchdruid;
