import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const HEAL_INCREASE_PER_STACK = 0.1

/**
 * Healing Wave and Healing Surge increase the healing done by your next Chain Heal by 10%, stacking up to 5 times.
 * https://www.warcraftlogs.com/reports/CHaBLQd6FPZ9xGX1#fight=24&type=auras&source=7
 */
class JonatsNaturalFocus extends Analyzer {
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.JONATS_NATURAL_FOCUS.bonusID);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_HEAL), this.chainHeal);
  }

  chainHeal(event: HealEvent) {
    const buff = this.selectedCombatant.getBuff(SPELLS.JONATS_NATURAL_FOCUS_BUFF.id, event.timestamp, 200);
    if (buff) {
      this.healing += calculateEffectiveHealing(event, HEAL_INCREASE_PER_STACK * buff.stacks);
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.JONATS_NATURAL_FOCUS}>
          <ItemHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default JonatsNaturalFocus;
