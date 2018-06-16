// Based on Clearcasting Implementation done by @Blazyb
import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

class Vivify extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  remVivifyHealCount = 0;
  remVivifyHealing = 0;
  lastCastTarget = null;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.VIVIFY.id !== spellId) {
      return;
    }
    this.lastCastTarget = event.targetID;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (SPELLS.VIVIFY.id !== spellId || this.lastCastTarget === event.targetID) {
      this.lastCastTarget = null; // Null out Target in case Vivify target also had REM on them
      return;
    }
    this.remVivifyHealCount += 1;
    this.remVivifyHealing += (event.amount || 0 ) + (event.absorbed || 0);
  }

  get averageRemPerVivify() {
    const vivifyCasts = this.abilityTracker.getAbility(SPELLS.VIVIFY.id).casts || 0;

    return this.remVivifyHealCount / vivifyCasts || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageRemPerVivify,
      isLessThan: {
        minor: 1.5,
        average: 1,
        major: 0.5,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <React.Fragment>
            You are casting <SpellLink id={SPELLS.VIVIFY.id} /> with less than 2 <SpellLink id={SPELLS.RENEWING_MIST.id} /> out on the raid. To ensure you are gaining the maximum <SpellLink id={SPELLS.VIVIFY.id} /> healing, keep <SpellLink id={SPELLS.RENEWING_MIST.id} /> on cooldown.
          </React.Fragment>
        )
          .icon(SPELLS.VIVIFY.icon)
          .actual(`${this.averageRemPerVivify} Unused Uplifting Trance procs`)
          .recommended(`${recommended} wasted UT Buffs is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VIVIFY.id} />}
        value={`${this.averageRemPerVivify.toFixed(2)}`}
        label={(
          <dfn data-tip={`Healing Breakdown:
          <ul>
          <li>${formatNumber(this.abilityTracker.getAbility(SPELLS.VIVIFY.id).healingEffective)} overall healing from Vivify.</li>
          <li>${formatNumber(this.remVivifyHealing)} portion of your Vivify healing to REM targets.</li>
          </ul>`}>
            Avg REMs per Cast
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(15);
}

export default Vivify;
