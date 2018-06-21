import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import DemoPets from '../WarlockCore/Pets';

class GrimoireFelguard extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    demoPets: DemoPets,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.GRIMOIRE_FELGUARD_TALENT.id);
  }

  statistic() {
    // TODO: Probably fix felguard GUID in PETS
    const damage = this.demoPets.getTotalPetDamage(PETS.GRIMOIRE_FELGUARD.id);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GRIMOIRE_FELGUARD_TALENT.id} />}
        value={`${formatNumber(damage / this.owner.fightDuration * 1000)} DPS`}
        label="Grimoire: Felguard damage"
        tooltip={`Your Grimoire: Felguard did ${formatNumber(damage)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(3);
}

export default GrimoireFelguard;
