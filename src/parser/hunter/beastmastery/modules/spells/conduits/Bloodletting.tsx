import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { BLOODLETTING_BARBED_DOT_INCREASE } from 'parser/hunter/beastmastery/constants';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

/**
 * Barbed Shot's recharge time is reduced by 1 sec.
 * The damage of Barbed Shot is increased by x%.
 *
 * Example log
 *
 * TODO: Add the 1 second reduction to the barbed shot ability
 * TODO: Can a reasonable statistic be made with the 1 second reduction
 */
class Bloodletting extends Analyzer {

  conduitRank: number = 0;
  addedDamage: number = 0;

  constructor(options: any) {
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }

    this.conduitRank = 1; //TODO: Find out the proper way of parsing conduit ranks

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT), this.onBarbedShotDamage);

  }

  onBarbedShotDamage(event: DamageEvent) {
    this.addedDamage += calculateEffectiveDamage(event, BLOODLETTING_BARBED_DOT_INCREASE[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.BLOODLETTING_CONDUIT}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default Bloodletting;
