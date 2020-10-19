import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const DAMAGE_BONUS: {[rank: number]: number } = {
  1: .01,
  2: .01,
  3: .01,
  4: .01,
  5: .01,
  6: .02,
  7: .02,
  8: .02,
  9: .02,
  10: .02,
  11: .02,
  12: .02,
  13: .02,
  14: .02,
  15: .02,
};

class SiphonedMalice extends Analyzer {

  conduitRank: number = 0;

  bonusDamage = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.SIPHONED_MALICE.id);
    if (!this.active) {
      return;
    }
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.SIPHONED_MALICE.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const buff = this.selectedCombatant.getBuff(SPELLS.SIPHONED_MALICE_BUFF.id);
    if (!buff) {
      return;
    }
    this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS[this.conduitRank] * buff.stacks);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.SIPHONED_MALICE}>
          <ItemDamageDone amount={this.bonusDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SiphonedMalice;
