import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber } from 'common/format';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

// dependencies
import Combatants from 'Parser/Core/Modules/Combatants';
import SerenityReduction from './SerendipityReduction/SerenityReduction';
import SanctifyReduction from './SerendipityReduction/SanctifyReduction';

// This module might contain too much information but to rewrite some of the output
// in this file would entail a lot of redundant copying (aka violating the "DRY"
// coding mindset). Let me @enragednuke if you think I should move stuff out.

// Currently contains:
// - "Wasted Serendipity" statistic
// - "Fully missed holy word casts (via Serendipity)" suggestion
// - "Holy Priest T20 2P Bonus" item
class Serendipity extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    serenity: SerenityReduction,
    sanctify: SanctifyReduction,
  }

  statistic() {
    const percWastedVersusTotal = (this.serenity.overcast + this.sanctify.overcast) / (this.serenity.rawReduction + this.sanctify.rawReduction);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SERENDIPITY.id} />}
        value={`${formatPercentage(percWastedVersusTotal)}%`}
        label="Wasted Serendipity"
        tooltip={
          `${formatNumber(this.serenity.overcast / 1000)}s wasted Serenity reduction (of ${formatNumber(this.serenity.rawReduction / 1000)}s total)<br/>
          ${formatNumber(this.sanctify.overcast / 1000)}s wasted Sanctify reduction (of ${formatNumber(this.sanctify.rawReduction / 1000)}s total)<br/>`
        }
      />
    );
  }

  suggestions(when) {
    const totalFullOvercast = this.serenity.effectiveFullOvercasts + this.sanctify.effectiveFullOvercasts;

    when(totalFullOvercast).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        // This wording is somewhat poor but I can't figure out a good alternative for it.
        return suggest('You held onto Holy Words too long. Try to cast Holy Words if you think you won\'t need them before they come up again instead of using filler heals.')
          .icon(SPELLS.SERENDIPITY.icon)
          .actual(`${totalFullOvercast} missed casts.`)
          .recommended('It is recommended to miss none.')
          .regular(recommended + 1).major(recommended + 2);
      });
  }

  item() {
    return this.serenity.holy_t20_2p_active && ({
      id: `spell-${SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip="Effective gain from the 2-piece bonus. This filters out wasted Serendipity.">
          {formatNumber(this.serenity.holy_t20_2p / 1000 + this.sanctify.holy_t20_2p / 1000)} seconds of additional Holy Word cooldown reduction
        </dfn>
      ),
    });
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}


export default Serendipity;
