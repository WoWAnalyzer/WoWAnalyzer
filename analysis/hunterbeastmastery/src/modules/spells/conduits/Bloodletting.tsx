import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { BLOODLETTING_BARBED_DOT_INCREASE } from '@wowanalyzer/hunter-beastmastery/src/constants';

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

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT),
      this.onBarbedShotDamage,
    );
  }

  onBarbedShotDamage(event: DamageEvent) {
    this.addedDamage += calculateEffectiveDamage(
      event,
      BLOODLETTING_BARBED_DOT_INCREASE[this.conduitRank],
    );
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
