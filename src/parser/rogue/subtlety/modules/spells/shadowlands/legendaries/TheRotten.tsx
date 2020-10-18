import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { EnergizeEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceIcon from 'common/ResourceIcon';

class TheRotten extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  cpGained: number = 0;
  cpWasted: number = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.THE_ROTTEN.bonusID);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell([SPELLS.SHADOWSTRIKE, SPELLS.BACKSTAB, SPELLS.GLOOMBLADE_TALENT]), this.onDamage);
  }

  onDamage(event: EnergizeEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id)) {
      this.cpGained += event.resourceChange;
      this.cpWasted += event.waste;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            The Rotten helped you gain {this.cpGained + this.cpWasted} extra Combo Points with {this.cpWasted} Combo Points being wasted.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.THE_ROTTEN}>
          <ResourceIcon id={RESOURCE_TYPES.COMBO_POINTS.id} noLink />
          {this.cpGained}/{this.cpWasted + this.cpGained}
          <small> extra Combo Points gained.</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TheRotten;