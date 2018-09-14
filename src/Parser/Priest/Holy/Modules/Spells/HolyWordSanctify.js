import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

const MAX_HITS_PER_CAST = 6;
class HolyWordSanctify extends Analyzer {
  casts = 0;
  goodHit = 0;
  totalHits = 0;
  overhealHit =0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HOLY_WORD_SANCTIFY.id) {
      return;
    }
    this.totalHits += 1;
    // We should consider hits of HolyWordSanctify with >80% OH to essentially be "missed" hits since they did very little
    // and likely could have been done better.
    if ((event.overheal || 0) > event.amount * 4) {
      this.overhealHit += 1;
      return;
    }
    this.goodHit += 1;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HOLY_WORD_SANCTIFY.id) {
      return;
    }
    this.casts += 1;
  }

  get report() {
    const sancAvgHits = this.goodHit / this.casts;
    const sancMissedHits = (this.casts * MAX_HITS_PER_CAST) - this.goodHit;

    return {
      sancAvgHits,
      sancMissedHits,
    };
  }

  statistic() {
    const report = this.report;
    const noHits = (this.casts * MAX_HITS_PER_CAST)- this.totalHits;
    const hitsPerCast = this.totalHits / this.casts;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HOLY_WORD_SANCTIFY.id} />}
        value={`${report.sancAvgHits.toFixed(2)}`}
        label="Avg effective hits per cast"
        tooltip={`A measure of how many targets were effectively healed by your <b>Holy Word: Sanctify</b>. </br>
                  Over 80% overhealing on a hit is considered a "miss". </br>
                  When you hit less than the max amount of targets, each missing target is a "miss". </br></br>
                  <b>Total players hit:</b> ${this.totalHits} </br>
                  <b>Total casts:</b> ${this.casts} </br>
                  <b>Hits per cast :</b> ${hitsPerCast.toFixed(2)} </br>
                  <b>Overheal misses:</b> ${this.overhealHit}</br>
                  <b>Targets missed:</b> ${noHits}`}

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

export default HolyWordSanctify;
