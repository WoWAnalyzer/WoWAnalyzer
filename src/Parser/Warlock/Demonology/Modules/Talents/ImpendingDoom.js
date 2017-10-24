import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import DemoPets from '../WarlockCore/Pets';

class ImpendingDoom extends Analyzer {
  static dependencies = {
    damageDone: DamageDone,
    demoPets: DemoPets,
    combatants: Combatants,
  };

  //each time Doom ticks it summons a Wild Imp, so this should equal the number of pets summoned (and it's easier than tracking it from summon events)
  doomTicks = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.IMPENDING_DOOM_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.DOOM.id) {
      return;
    }
    this.doomTicks += 1;
  }

  statistic() {
    const averageWildImpDamage = this.demoPets.getAveragePetDamage(PETS.WILDIMP.id);
    const estimatedBonusDamage = averageWildImpDamage * this.doomTicks;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IMPENDING_DOOM_TALENT.id} />}
        value={`${formatNumber(estimatedBonusDamage / this.owner.fightDuration * 1000)} DPS`}
        label="Bonus Wild Imp damage"
        tooltip={`Your Wild Imps summoned by Doom did an estimated ${formatNumber(estimatedBonusDamage)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(estimatedBonusDamage))} %). This value is estimated by multiplying the number of Wild Imps summoned this way by average Wild Imp damage`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default ImpendingDoom;
