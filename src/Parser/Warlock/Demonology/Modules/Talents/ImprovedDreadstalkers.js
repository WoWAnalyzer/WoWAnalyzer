import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import DemoPets from '../WarlockCore/Pets';

class ImprovedDreadstalkers extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.IMPROVED_DREADSTALKERS_TALENT.id);
  }

  statistic() {
    const wildImpDamage = this.demoPets.getTotalPetDamage(PETS.WILDIMP_ON_DREADSTALKER.id); // fortunately, Wild Imps summoned by this talent have different guid than regular Wild Imps, making this rather easy
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IMPROVED_DREADSTALKERS_TALENT.id} />}
        value={`${formatNumber(wildImpDamage / this.owner.fightDuration * 1000)} DPS`}
        label="Bonus Wild Imp damage"
        tooltip={`Your Wild Imps summoned with Dreadstalkers did ${formatNumber(wildImpDamage)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(wildImpDamage))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default ImprovedDreadstalkers;
