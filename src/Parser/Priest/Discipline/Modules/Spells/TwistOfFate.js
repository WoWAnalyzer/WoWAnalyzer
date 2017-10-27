import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage, formatNumber } from 'common/format';

import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const TWIST_OF_FATE_HEALING_INCREASE = 0.2;

class TwistOfFate extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  hasTwistOfFate = false;
  hasSoulOfTheHighPriest = false;

  healing = 0;
  damage = 0;

  on_initialized() {
    this.hasTwistOfFate = this.owner.modules.combatants.selected.hasTalent(SPELLS.TWIST_OF_FATE_TALENT.id);
    this.hasSoulOfTheHighPriest = this.owner.modules.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HIGH_PRIEST.id);
    this.active = this.hasTwistOfFate || this.hasSoulOfTheHighPriest;
  }

  on_byPlayer_damage(event) {
    if (!this.owner.modules.combatants.selected.hasBuff(SPELLS.TWIST_OF_FATE_BUFF.id, event.timestamp)) {
      return;
    }

    const raw = event.amount + (event.absorbed || 0);
    this.damage += raw - raw / 1.2;
  }
  on_byPlayer_heal(event) {
    this.parseHeal(event);
  }
  on_byPlayer_absorbed(event) {
    this.parseHeal(event);
  }

  parseHeal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }
    if (!this.owner.modules.combatants.selected.hasBuff(SPELLS.TWIST_OF_FATE_BUFF.id, event.timestamp)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, TWIST_OF_FATE_HEALING_INCREASE);
  }

  statistic() {
    if(!this.hasTwistOfFate) { return; }

    const healing = this.healing || 0;
    const damage = this.damage || 0;
    const tofPercent = this.owner.getPercentageOfTotalHealingDone(healing);
    const tofDamage = this.owner.getPercentageOfTotalDamageDone(damage);

    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TWIST_OF_FATE_TALENT.id} />}
        value={`${this.owner.formatItemHealingDone(healing)}`}
        label={(
          <dfn data-tip={
            `The effective healing contributed by Twist of Fate was ${formatPercentage(tofPercent)}% of total healing done. Twist of Fate also contributed ${formatNumber(damage / this.owner.fightDuration * 1000)} DPS (${formatPercentage(tofDamage)}% of total damage); the healing gain of this damage was included in the shown numbers.`
          }>
            Twist of Fate Healing
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();

  item() {
    if(!this.hasSoulOfTheHighPriest) { return; }

    const healing = this.healing || 0;
    const damage = this.damage || 0;
    const tofPercent = this.owner.getPercentageOfTotalHealingDone(healing);
    const tofDamage = this.owner.getPercentageOfTotalDamageDone(damage);

    return {
      item: ITEMS.SOUL_OF_THE_HIGH_PRIEST,
      result: (
        <dfn data-tip={
          `The effective healing contributed by the talent Twist of Fate (from Soul of the High Priest) was ${formatPercentage(tofPercent)}% of total healing done. Twist of Fate also contributed ${formatNumber(damage / this.owner.fightDuration * 1000)} DPS (${formatPercentage(tofDamage)}% of total damage); the healing gain of this damage was included in the shown numbers.`
        }>
          {this.owner.formatItemHealingDone(healing)}
        </dfn>
      ),
    };
  }
}

export default TwistOfFate;
