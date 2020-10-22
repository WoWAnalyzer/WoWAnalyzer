import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import calculateMaxCasts from 'parser/core/calculateMaxCasts';
import Abilities from 'parser/core/modules/Abilities';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Spell from 'common/SPELLS/Spell';

import React from 'react';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

/*
  Creates a suggestion for an AoE-Spell based on the amount of hits done and min. amount of hits possible
*/

class AoESpellEfficiency extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  protected abilities!: Abilities;

  ability!: Spell;
  bonusDmg = 0;
  casts: Array<{ timestamp: number, hits: number }> = [];

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onCast(event: CastEvent) {
    if(event.ability.guid !== this.ability.id) {
      return;
    }
    this.casts.push({
      timestamp: event.timestamp,
      hits: 0,
    });
  }

  onDamage(event: DamageEvent) {
    if (event.ability.guid !== this.ability.id) {
      return;
    }

    this.bonusDmg += event.amount + (event.absorbed || 0);
    this.casts[this.casts.length - 1].hits += 1;
  }

  get maxCasts() {
    const cooldown = this.abilities.getAbility(this.ability.id)?.cooldown ?? Infinity;
    return Math.ceil(calculateMaxCasts(cooldown, this.owner.fightDuration));
  }

  get possibleHits() {
    const cooldownS = this.abilities.getAbility(this.ability.id)?.cooldown;
    if (cooldownS === undefined) {
      return 0;
    }
    const cooldownMS = cooldownS * 1000;
    let lastCast: number | null = null;
    let missedCasts = 0;
    let timeSum = 0;

    this.casts.forEach(e => {
      if (!lastCast) {
        timeSum = e.timestamp - this.owner.fight.start_time;
      } else {
        timeSum += e.timestamp - lastCast - cooldownMS;
      }
      lastCast = e.timestamp;
      missedCasts += Math.floor(timeSum / cooldownMS);
      timeSum %= cooldownMS;
      // reset the time sum if a cast hit more than one target (we have to assume this cast was at an optimal time)
      if (e.hits > 1) {
        timeSum = 0;
      }
    });

    timeSum += this.owner.currentTimestamp - (lastCast || 0);
    missedCasts += Math.floor(timeSum / cooldownMS);
    timeSum %= cooldownMS;

    return Math.max(this.totalHits + missedCasts, this.maxCasts);
  }

  get totalHits() {
    return this.casts.reduce((a, b) => a + b.hits, 0);
  }

  get hitSuggestionThreshold() {
    return {
      actual: this.totalHits / this.possibleHits,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.hitSuggestionThreshold)
      .addSuggestion((suggest) => suggest(<>It's benefitial to delay <SpellLink id={this.ability.id} /> to hit multiple targets, but don't delay it too long or you'll miss out on casts and possible hits.</>)
          .icon(this.ability.icon)
          .actual(i18n._(t('shared.suggestions.aoeSpells.efficiency')`${this.totalHits} total hits`))
          .recommended(`${this.possibleHits} or more hits were possible`));
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(5)}
        icon={<SpellIcon id={this.ability.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={`${this.ability.name} added a total of ${formatNumber(this.bonusDmg)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%).`}
      />
    );
  }
}

export default AoESpellEfficiency;
