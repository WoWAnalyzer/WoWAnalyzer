import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatThousands } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import DemoPets from '../pets/DemoPets';
import PETS from '../pets/PETS_temp';

class GrimoireFelguard extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    demoPets: DemoPets,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GRIMOIRE_FELGUARD_TALENT.id);
  }

  statistic() {
    const damage = this.demoPets.getPetDamage(PETS.GRIMOIRE_FELGUARD.guid);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GRIMOIRE_FELGUARD_TALENT.id} />}
        value={`${formatNumber(damage / this.owner.fightDuration * 1000)} DPS`}
        label="Grimoire: Felguard damage"
        tooltip={`Your Grimoire: Felguard did ${formatThousands(damage)} damage (${this.owner.formatItemDamageDone(damage)}).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(3);
}

export default GrimoireFelguard;
