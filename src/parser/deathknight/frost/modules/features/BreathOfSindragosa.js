import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

const GOOD_BREATH_DURATION_MS = 20000;

class BreathOfSindragosa extends Analyzer {

  beginTimestamp = 0;
  casts = 0;
  badCasts = 0;
  totalDuration = 0;
  breathActive = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BREATH_OF_SINDRAGOSA_TALENT), this.onCast);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BREATH_OF_SINDRAGOSA_TALENT), this.onRemoveBuff);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }


  onCast(event) {
    this.casts += 1;
    this.beginTimestamp = event.timestamp;
    this.breathActive = true;
  }

  onRemoveBuff(event) {
    this.breathActive = false;
    const duration = event.timestamp - this.beginTimestamp;
    if (duration < GOOD_BREATH_DURATION_MS) {
      this.badCasts +=1;
    }
    this.totalDuration += duration;
  }

  onFightEnd(event) {
    if (this.breathActive) {
      this.casts -=1;
    }
  }

  suggestions(when){
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<> You are not getting good uptime from your <SpellLink id={SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id} /> casts. Your cast should last <b>at least</b> 15 seconds to take full advantage of the <SpellLink id={SPELLS.PILLAR_OF_FROST.id} /> buff.  A good cast is one that lasts 20 seconds or more.  To ensure a good duration, make you sure have 60+ Runic Power pooled and have less than 5 Runes available before you start the cast.  Also make sure to use <SpellLink id={SPELLS.EMPOWER_RUNE_WEAPON.id} /> before you cast Breath of Sindragosa. {this.tickingOnFinishedString}</>)
          .icon(SPELLS.BREATH_OF_SINDRAGOSA_TALENT.icon)
          .actual(`You averaged ${(this.averageDuration).toFixed(1)} seconds of uptime per cast`)
          .recommended(`>${recommended} seconds is recommended`);
      });
  }

  get tickingOnFinishedString() {
    return this.breathActive ? "Your final cast was not counted in the average since it was still ticking when the fight ended" : "";
  }

  get averageDuration() {
    return ((this.totalDuration / this.casts) || 0) / 1000;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageDuration,
      isLessThan: {
        minor: 20.0,
        average: 17.5,
        major: 15.0,
      },
      style: 'seconds',
      suffix: 'Average',
    };
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id} />}
        value={`${(this.averageDuration).toFixed(1)} seconds`}
        label="Average Breath of Sindragosa Duration"
        tooltip={`You cast Breath of Sindragosa ${this.casts} times for a combined total of ${(this.totalDuration / 1000).toFixed(1)} seconds.  ${this.badCasts} casts were under 20 seconds.  ${this.tickingOnFinishedString}`}
        position={STATISTIC_ORDER.CORE(60)}
      />
    );
  }
}

export default BreathOfSindragosa;
