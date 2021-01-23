import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { STORMSTOUTS_LK_MODIFIER } from 'parser/monk/brewmaster/constants';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';

/**
 * Keg Smash deals 30% additional damage, and has 1 additional charge.
 */
class StormstoutsLastKeg extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.STORMSTOUTS_LAST_KEG.bonusID);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.KEG_SMASH), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, STORMSTOUTS_LK_MODIFIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        tooltip={(
          <>
            This statistic shows the damage gained from the increased Keg Smash damage. It does not reflect the potential damage gain from having 2 charges of Keg Smashs.
          </>
        )}
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.STORMSTOUTS_LAST_KEG}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default StormstoutsLastKeg;
