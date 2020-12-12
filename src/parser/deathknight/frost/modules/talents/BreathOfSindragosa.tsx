import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { t } from '@lingui/macro';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { CastEvent, RemoveBuffEvent, FightEndEvent } from 'parser/core/Events';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const GOOD_BREATH_DURATION_MS = 25000;

class BreathOfSindragosa extends Analyzer {

  beginTimestamp = 0;
  casts = 0;
  badCasts = 0;
  totalDuration = 0;
  breathActive = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BREATH_OF_SINDRAGOSA_TALENT), this.onCast);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BREATH_OF_SINDRAGOSA_TALENT), this.onRemoveBuff);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }


  onCast(event: CastEvent) {
    this.casts += 1;
    this.beginTimestamp = event.timestamp;
    this.breathActive = true;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.breathActive = false;
    const duration = event.timestamp - this.beginTimestamp;
    if (duration < GOOD_BREATH_DURATION_MS) {
      this.badCasts += 1;
    }
    this.totalDuration += duration;
  }

  onFightEnd(event: FightEndEvent) {
    if (this.breathActive) {
      this.casts -= 1;
    }
  }

  suggestions(when: When){
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<> You are not getting good uptime from your <SpellLink id={SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id} /> casts. A good cast is one that lasts 25 seconds or more.  To ensure a good duration, make sure you have 70+ Runic Power pooled and have less than 4 Runes available before you start the cast.  Also make sure to use <SpellLink id={SPELLS.EMPOWER_RUNE_WEAPON.id} /> within a few seconds of casting Breath of Sindragosa. Pay close attention to your Runic Power and make sure you are not overcapping. {this.tickingOnFinishedString}</>)
        .icon(SPELLS.BREATH_OF_SINDRAGOSA_TALENT.icon)
        .actual(t({
      id: "deathknight.frost.suggestions.breathOfSindragosa.uptime",
      message: `You averaged ${(this.averageDuration).toFixed(1)} seconds of uptime per cast`
    }))
        .recommended(`>${recommended} seconds is recommended`));
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
        minor: 25.0,
        average: 22.5,
        major: 20.0,
      },
      style: ThresholdStyle.SECONDS,
      suffix: 'Average',
    };
  }

  statistic() {
    return (
      <Statistic
        tooltip={`You cast Breath of Sindragosa ${this.casts} times for a combined total of ${(this.totalDuration / 1000).toFixed(1)} seconds.  ${this.badCasts} casts were under 25 seconds.  ${this.tickingOnFinishedString}`}
        position={STATISTIC_ORDER.CORE(60)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.BREATH_OF_SINDRAGOSA_TALENT}>
          <>
           {(this.averageDuration).toFixed(1)}s  <small>average duration</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BreathOfSindragosa;
