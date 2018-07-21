import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

class Sanctify extends Analyzer {
  casts = 0
  hits = 0

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HOLY_WORD_SANCTIFY.id) {
      return;
    }

    // We should consider hits of Sanctify with >80% OH to essentially be "missed" hits since they did very little
    // and likely could have been done better.
    if ((event.overheal || 0) > event.amount * 4) {
      return;
    }
    this.hits += 1;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HOLY_WORD_SANCTIFY.id) {
      return;
    }
    this.casts += 1;
  }

  get report() {
    const sancAvgHits = this.hits / this.casts;
    const sancMissedHits = (this.casts * 6) - this.hits;

    return {
      sancAvgHits,
      sancMissedHits,
    };
  }

  statistic() {
    const report = this.report;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HOLY_WORD_SANCTIFY.id} />}
        value={`${report.sancAvgHits.toFixed(2)}`}
        label="Average hits"
        tooltip={`A measure of how many targets were effectively healed by your Holy Word: Sanctify. Over 80% overhealing on a hit is considered a "miss". You missed ${report.sancMissedHits} of ${this.casts * 6} potential hits.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);

  suggestions(when) {
    const report = this.report;

    when(report.sancAvgHits).isLessThan(5.25)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your Holy Word: Sanctify effectiveness was could be improved. Try to position your Sanctify casts better to make sure you hit players who need the healing.')
          .icon('spell_holy_divineprovidence')
          .actual(`${actual.toFixed(2)} average hits`)
          .recommended(`>${recommended} is recommended`)
          .regular(recommended - 0.5).major(recommended - 1.5);
      });
  }
}

export default Sanctify;
