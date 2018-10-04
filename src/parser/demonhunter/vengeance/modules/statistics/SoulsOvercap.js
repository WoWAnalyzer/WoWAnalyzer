import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/core/modules/AbilityTracker';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import SoulFragmentsTracker from '../features/SoulFragmentsTracker';

class SoulsOvercap extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    soulFragmentsTracker: SoulFragmentsTracker,
  };

  /* Feed The Demon talent is taken in defensive builds. In those cases you want to generate and consume souls as quickly
 as possible. So how you consume your souls down matter. If you dont take that talent your taking a more balanced
 build meaning you want to consume souls in a way that boosts your dps. That means feeding the souls into spirit
 bomb as efficiently as possible (cast at 4+ souls) for a dps boost and have soul cleave absorb souls as little as
 possible since it provides no extra dps.
*/
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id) && !this.selectedCombatant.hasTalent(SPELLS.FEED_THE_DEMON_TALENT.id);
  }

  wasterPerGenerated() {
    return this.soulFragmentsTracker.soulsWasted / this.soulFragmentsTracker.soulsGenerated;
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: this.wasterPerGenerated(),
      isGreaterThan: {
        minor: 0.05,
        average: 0.10,
        major: 0.15,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholdsEfficiency)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You are generating <SpellLink id={SPELLS.SOUL_FRAGMENT.id} />s when you are already at 5 souls. These are auto consumed. You are missing out on the extra damage consuming them with <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> provides.</>)
          .icon(SPELLS.SOUL_FRAGMENT.icon)
          .actual(`${formatPercentage(this.wasterPerGenerated())}% wasted Soul Fragments.`)
          .recommended(`${formatPercentage(recommended)}% or less is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(5)}
        icon={<SpellIcon id={SPELLS.SOUL_FRAGMENT.id} />}
        value={`${formatPercentage(this.wasterPerGenerated())}% Souls`}
        label="Inefficiently generated"
        tooltip={`You generated ${formatNumber(this.soulFragmentsTracker.soulsWasted)} souls at cap. These are absorbed automatically <br/>
                  and aren't avalible to boost Spirit Bomb's damage.<br/>
                  Total Soul Fragments generated: ${formatNumber(this.soulFragmentsTracker.soulsGenerated)}<br/>
                  Total Soul Fragments spent: ${formatNumber(this.soulFragmentsTracker.soulsSpent)}<br/>
                  At the end of the fight, you had ${formatNumber(this.soulFragmentsTracker.currentSouls)} unused Soul Fragments.`}
      />
    );
  }
}

export default SoulsOvercap;
