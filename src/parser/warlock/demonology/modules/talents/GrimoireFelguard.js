import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import DemoPets from '../pets/DemoPets';
import PETS from '../pets/PETS';

class GrimoireFelguard extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    demoPets: DemoPets,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GRIMOIRE_FELGUARD_TALENT.id);
  }

  subStatistic() {
    const damage = this.demoPets.getPetDamage(PETS.GRIMOIRE_FELGUARD.guid);
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.GRIMOIRE_FELGUARD_TALENT.id} /> dmg</>}
        value={this.owner.formatItemDamageDone(damage)}
        valueTooltip={`${formatThousands(damage)} damage`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(3);
}

export default GrimoireFelguard;
