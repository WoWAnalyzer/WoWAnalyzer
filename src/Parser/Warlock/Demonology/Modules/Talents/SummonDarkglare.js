import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import DemoPets from '../WarlockCore/Pets';

class SummonDarkglare extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SUMMON_DARKGLARE_TALENT.id);
  }

  statistic() {
    const darkglareDamage = this.demoPets.getTotalPetDamage(PETS.DARKGLARE.id);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SUMMON_DARKGLARE_TALENT.id} />}
        value={`${formatNumber(darkglareDamage / this.owner.fightDuration * 1000)} DPS`}
        label="Darkglare damage"
        tooltip={`Your Darkglare did ${formatNumber(darkglareDamage)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(darkglareDamage))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(5);
}

export default SummonDarkglare;
