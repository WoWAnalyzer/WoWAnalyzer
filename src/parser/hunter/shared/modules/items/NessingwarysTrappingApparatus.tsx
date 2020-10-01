import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import Events, { EnergizeEvent } from 'parser/core/Events';
import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

/**
 * Whenever a trap is triggered, gain 25 Focus.
 *
 * Example log:
 *
 */
class NessingwarysTrappingApparatus extends Analyzer {

  focusGained: number = 0;
  focusWasted: number = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.NESSINGWARYS_TRAPPING_APPARATUS_ENERGIZE.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.NESSINGWARYS_TRAPPING_APPARATUS_ENERGIZE), this.onEnergize);
  }

  onEnergize(event: EnergizeEvent) {
    this.focusGained += event.resourceChange;
    this.focusWasted += event.waste;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.NESSINGWARYS_TRAPPING_APPARATUS_EFFECT}>
          <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink /> {this.focusGained}/{this.focusWasted + this.focusGained}<small> gained Focus</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NessingwarysTrappingApparatus;
