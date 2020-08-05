import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events from 'parser/core/Events';

//TODO Revisit this module when we have more information
class TranquilizingShot extends Analyzer {

  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  totalDispels: number = 0;

  constructor(options: any) {
    super(options);

    this.addEventListener(Events.dispel.by(SELECTED_PLAYER), this.onDispel);

    options.abilities.add({
      spell: SPELLS.TRANQUILIZING_SHOT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      cooldown: 10,
      gcd: {
        static: 1000,
      },
    });
  }

  onDispel() {
    this.totalDispels += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spell={SPELLS.TRANQUILIZING_SHOT}>
          <>
            {this.totalDispels}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TranquilizingShot;
