import React from 'react';

import ItemHealingDone from 'interface/ItemHealingDone';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import COVENANTS from 'game/shadowlands/COVENANTS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

import AtonementDamageSource from '../../features/AtonementDamageSource';
import isAtonement from '../../core/isAtonement';

class BoonOfTheAscended extends Analyzer {
  static dependencies = {
    atonementDamageSource: AtonementDamageSource,
  };

  protected atonementDamageSource!: AtonementDamageSource;

  atonementHealing = 0;
  directHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.ASCENDED_BLAST, SPELLS.ASCENDED_NOVA, SPELLS.ASCENDED_ERUPTION]), this.onHeal);
  }

  onHeal(event: HealEvent) {
    if (isAtonement(event)) {

      const atonenementDamageEvent = this.atonementDamageSource.event;

      if (!atonenementDamageEvent) {
        return;
      }
      this.atonementHealing += event.amount + (event.absorbed || 0);
    } else {
      this.directHealing += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={(
          <>
            Healing Breakdown:
            <ul>
              <li>{formatNumber(this.atonementHealing)} Atonement Healing</li>
              <li>{formatNumber(this.directHealing)} Direct Healing</li>
            </ul>
          </>
        )}
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.BOON_OF_THE_ASCENDED}>
          <>
            <ItemHealingDone amount={this.atonementHealing + this.directHealing} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BoonOfTheAscended;
