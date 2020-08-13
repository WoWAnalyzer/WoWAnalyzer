import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

/**
 *A sweeping attack that strikes all enemies in front of you for (14% of attack power) Frost damage. This attack benefits from Killing Machine. Critical strikes with Frostscythe deal 4 times normal damage.
 */
class Frostscythe extends Analyzer {
  casts: number = 0;
  hits: number = -1; // need to initialize negative to make sure first cast isn't counted as bad
  goodCasts: number = 0;
  hitThreshold: number = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FROSTSCYTHE_TALENT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FROSTSCYTHE_TALENT), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FROSTSCYTHE_TALENT), this.onDamage);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onCast(event: CastEvent) {
    if (this.hits >= this.hitThreshold) { // this is checking the previous cast, not the cast in the current event
      this.goodCasts += 1;
    }
    this.casts += 1;
    this.hitThreshold = this.selectedCombatant.hasBuff(SPELLS.KILLING_MACHINE.id, event.timestamp) ? 1 : 2;
    this.hits = 0;
  }

  onDamage(event: DamageEvent) {
    this.hits += 1;
  }

  onFightEnd() { // check if the last cast of Fsc was good
    if (this.hits >= this.hitThreshold) {
      this.goodCasts += 1;
    }
  }

  get efficiency() {
    return this.goodCasts / this.casts;
  }

  get efficencyThresholds() {
    return {
      actual: this.efficiency,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: .75,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    when(this.efficencyThresholds).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(
        <>
          Your <SpellLink id={SPELLS.FROSTSCYTHE_TALENT.id} /> efficiency can be improved. Only cast Frostscythe if you have a <SpellLink id={SPELLS.KILLING_MACHINE.id} icon /> proc or you can hit 2+ targets.
        </>)
        .icon(SPELLS.FROSTSCYTHE_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Frostscythe efficiency`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        icon={<SpellIcon id={SPELLS.FROSTSCYTHE_TALENT.id} />}
        value={`${formatPercentage(this.efficiency)}%`}
        label="Frostscythe efficiency"
        tooltip={`A good cast is one where you either hit 1+ targets with a Killing Machine buff or you hit 2+ targets.  You had ${this.goodCasts} / ${this.casts} good casts`}
      />
    );
  }
}

export default Frostscythe;
