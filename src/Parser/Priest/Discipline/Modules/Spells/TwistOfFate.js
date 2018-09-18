import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const TWIST_OF_FATE_HEALING_INCREASE = 0.2;

class TwistOfFate extends Analyzer {
  healing = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TWIST_OF_FATE_TALENT_DISCIPLINE.id);
  }

  on_byPlayer_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TWIST_OF_FATE_BUFF_DISCIPLINE.id, event.timestamp)) {
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
    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
      return;
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.TWIST_OF_FATE_BUFF_DISCIPLINE.id, event.timestamp)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, TWIST_OF_FATE_HEALING_INCREASE);
  }

  suggestions(when) {
    when(this.owner.getPercentageOfTotalHealingDone(this.healing)).isLessThan(0.05)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Consider picking a different talent than <SpellLink id={SPELLS.TWIST_OF_FATE_TALENT_DISCIPLINE.id} />. Castigation will give a consistent 3-5% increase and Schism provides a significant DPS increase if more healing is not needed.</span>)
          .icon(SPELLS.TWIST_OF_FATE_TALENT_DISCIPLINE.icon)
          .actual(`${formatPercentage(actual)}% of total healing`)
          .recommended(`>${formatPercentage(recommended)}% is recommended.`)
          .regular(0.045)
          .major(0.025);
      });
  }

  statistic() {
    if (!this.active) {
      return null;
    }

    const healing = this.healing || 0;
    const damage = this.damage || 0;
    const tofPercent = this.owner.getPercentageOfTotalHealingDone(healing);
    const tofDamage = this.owner.getPercentageOfTotalDamageDone(damage);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TWIST_OF_FATE_TALENT_DISCIPLINE.id} />}
        value={this.owner.formatItemHealingDone(healing)}
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
}

export default TwistOfFate;
