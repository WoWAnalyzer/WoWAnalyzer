import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { BLOODLETTING_BARBED_DOT_INCREASE } from 'parser/hunter/beastmastery/constants';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import React from 'react';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';

/**
 * Barbed Shot's recharge time is reduced by 1 sec.
 * The damage of Barbed Shot is increased by x%.
 *
 * Example log
 *
 */
class Bloodletting extends Analyzer {

  conduitRank: number = 0;
  addedDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.BLOODLETTING_CONDUIT.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

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
        <ConduitSpellText spell={SPELLS.BLOODLETTING_CONDUIT} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }

}

export default Bloodletting;
