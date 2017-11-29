import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import DemoPets from '../WarlockCore/Pets';

class GrimoireOfService extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    demoPets: DemoPets,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id);
  }

  statistic() {
    // TODO: Add other Grimoire pets (but realistically this is enough)
    const grimoireFelguardDamage = this.demoPets.getTotalPetDamage(PETS.GRIMOIRE_FELGUARD.id);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id} />}
        value={`${formatNumber(grimoireFelguardDamage / this.owner.fightDuration * 1000)} DPS`}
        label="Grimoire of Service damage"
        tooltip={`Your Grimoire of Service: Felguard did ${formatNumber(grimoireFelguardDamage)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(grimoireFelguardDamage))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(3);
}

export default GrimoireOfService;
