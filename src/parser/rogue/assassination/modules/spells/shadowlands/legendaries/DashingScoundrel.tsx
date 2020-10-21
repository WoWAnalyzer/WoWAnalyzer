import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { EnergizeEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ResourceIcon from 'common/ResourceIcon';

class DashingScoundrel extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  critCount: number = 0;
  comboPointsGained: number = 0;
  comboPointsWasted: number = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.DASHING_SCOUNDREL.bonusID);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.DASHING_SCOUNDREL), this.onEnergize);
  }

  onEnergize(event: EnergizeEvent) {
    this.critCount += 1;
    this.comboPointsGained += event.resourceChange;
    this.comboPointsWasted += event.waste;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            Dashing Scoundrel was responsible for {this.critCount} critical hits resulting in{' '}
            {this.comboPointsGained + this.comboPointsWasted} bonus ComboPoints being earned.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.DASHING_SCOUNDREL}>
          <ResourceIcon id={RESOURCE_TYPES.COMBO_POINTS.id} noLink /> {this.comboPointsGained}/{this.comboPointsWasted + this.comboPointsGained} <small> extra Combo Points gained.</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DashingScoundrel;
