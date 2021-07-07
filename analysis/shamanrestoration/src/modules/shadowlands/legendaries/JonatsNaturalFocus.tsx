import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

const HEAL_INCREASE_PER_STACK = 0.2;

/**
 * Healing Wave and Healing Surge increase the healing done by your next Chain Heal by 20%, stacking up to 5 times.
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
    const buff = this.selectedCombatant.getBuff(
      SPELLS.JONATS_NATURAL_FOCUS_BUFF.id,
      event.timestamp,
      200,
    );
    if (buff) {
      this.healing += calculateEffectiveHealing(event, HEAL_INCREASE_PER_STACK * buff.stacks);
    }
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spellId={SPELLS.JONATS_NATURAL_FOCUS.id}>
          <ItemHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default JonatsNaturalFocus;
