import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';

const HAUNT_DAMAGE_BONUS = 0.15;

class Haunt extends Analyzer {
  // TODO: test on dummy or in raid on some boss, there are no logs with this talent to test, should work though
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  bonusDmg = 0;
  totalTicks = 0;
  buffedTicks = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.HAUNT_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }
    const hasHaunt = target.hasBuff(SPELLS.HAUNT_TALENT.id, event.timestamp);

    if (UNSTABLE_AFFLICTION_DEBUFF_IDS.includes(event.ability.guid)) {
      this.totalTicks += 1;
      if (hasHaunt) {
        this.buffedTicks += 1;
      }
    }

    if (hasHaunt) {
      this.bonusDmg += calculateEffectiveDamage(event, HAUNT_DAMAGE_BONUS);
    }
  }

  get unbuffedTicks() {
    return this.totalTicks - this.buffedTicks;
  }

  get suggestionThresholds() {
    return {
      actual: (this.unbuffedTicks / this.totalTicks) || 1,
      isGreaterThan: {
        minor: 0.15,
        average: 0.2,
        major: 0.25,
      },
      style: 'percentage',
    };
  }

  // used in Checklist, mirrors the numbers from suggestionThresholds()
  get positiveSuggestionThresholds() {
    return {
      actual: (this.buffedTicks / this.totalTicks) || 0,
      isLessThan: {
        minor: 0.85,
        average: 0.8,
        major: 0.75,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id}/> aren't buffed enough by <SpellLink id={SPELLS.HAUNT_TALENT.id}/>. You should try to cast your Unstable Affliction in the burst windows provided by Haunt (but <strong>don't overcap</strong> your Soul Shards while waiting).</Wrapper>)
          .icon(SPELLS.HAUNT_TALENT.icon)
          .actual(`${formatPercentage(actual)}% unbuffed Unstable Affliction ticks.`)
          .recommended(`< ${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const buffedTicksPercentage = (this.buffedTicks / this.totalTicks) || 1;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HAUNT_TALENT.id} />}
        value={`${formatPercentage(buffedTicksPercentage)} %`}
        label="UA ticks buffed by Haunt"
        tooltip={`Your Haunt talent contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default Haunt;
