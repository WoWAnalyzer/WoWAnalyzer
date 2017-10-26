import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import EnemyInstances from 'Parser/Core/Modules/EnemyInstances';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatMilliseconds, formatPercentage } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class WintersChillTracker extends Analyzer {

  static dependencies = {
    enemies: EnemyInstances,
  };

  totalProcs = 0;

  frostboltHits = 0;
  missedFrostboltCasts = 0;
  singleFrostboltCasts = 0;

  iceLanceHits = 0;
  missedIceLanceCasts = 0;
  singleIceLanceCasts = 0;
  doubleIceLanceCasts = 0;

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      return;
    }

    if (spellId === SPELLS.ICE_LANCE_DAMAGE.id) {
      this.iceLanceHits += 1;
    } else if(spellId === SPELLS.FROSTBOLT_DAMAGE.id) {
      this.frostboltHits += 1;
    }
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
	  if(spellId !== SPELLS.WINTERS_CHILL.id) {
		  return;
	  }
    this.iceLanceHits = 0;
    this.frostboltHits = 0;
	}

  on_byPlayer_removedebuff(event) {
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.WINTERS_CHILL.id) {
      return;
    }

    this.totalProcs += 1;

    if (this.iceLanceHits === 0) {
      this.missedIceLanceCasts += 1;
    } else if (this.iceLanceHits === 1) {
      this.singleIceLanceCasts += 1;
    } else if (this.iceLanceHits === 2) {
      this.doubleIceLanceCasts += 1;
    } else {
      console.error(`Unexpected number of Ice Lances inside Winter's Chill @ ${formatMilliseconds(this.owner.currentTimestamp - this.owner.fight.start_time)} -> ${this.iceLanceHits}`);
    }

    if (this.frostboltHits === 0) {
      this.missedFrostboltCasts += 1;
    } else if (this.frostboltHits === 1) {
      this.singleFrostboltCasts += 1;
    } else {
      console.error(`Unexpected number of Frostbolt hits inside Winter's Chill @ ${formatMilliseconds(this.owner.currentTimestamp - this.owner.fight.start_time)} -> ${this.frostboltHits}`);
    }
  }

  suggestions(when) {
    const missedIceLancesPerMinute = this.missedIceLanceCasts / (this.owner.fightDuration / 1000 / 60);
    when(missedIceLancesPerMinute).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You failed to Ice Lance into {this.missedIceLanceCasts} <SpellLink id={SPELLS.WINTERS_CHILL.id}/> ({missedIceLancesPerMinute.toFixed(1)} missed per minute).  Make sure you cast <SpellLink id={SPELLS.ICE_LANCE_CAST.id}/> after each <SpellLink id={SPELLS.FLURRY.id}/> to benefit from <SpellLink id={SPELLS.SHATTER.id}/>.</span>)
          .icon(SPELLS.ICE_LANCE_CAST.icon)
          .actual(`${formatNumber(this.missedIceLanceCasts)} Winter's Chill not shattered with Ice Lance`)
          .recommended(`${formatNumber(recommended)} is recommended`)
          .regular(0.5).major(1);
      });

    const missedFrostboltsPerMinute = this.missedFrostboltCasts / (this.owner.fightDuration / 1000 / 60);
    when(missedFrostboltsPerMinute).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You failed to Frostbolt into {this.missedFrostboltCasts} <SpellLink id={SPELLS.WINTERS_CHILL.id}/> ({missedFrostboltsPerMinute.toFixed(1)} missed per minute).  Make sure you cast <SpellLink id={SPELLS.FROSTBOLT.id}/> just before each instant <SpellLink id={SPELLS.FLURRY.id}/> to benefit from <SpellLink id={SPELLS.SHATTER.id}/>.</span>)
          .icon(SPELLS.FROSTBOLT.icon)
          .actual(`${formatNumber(this.missedFrostboltCasts)} Winter's Chill not shattered with Frostbolt`)
          .recommended(`${formatNumber(recommended)} is recommended`)
          .regular(0.5).major(1);
      });
  }

  statistic() {
    const icelanceUtil = (1 - (this.missedIceLanceCasts / this.totalProcs)) || 0;
    const frostboltUtil = (1 - (this.missedFrostboltCasts / this.totalProcs)) || 0;
    const doubleIcelancePerc = (this.doubleIceLanceCasts / this.totalProcs) || 0;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.WINTERS_CHILL.id} />}
        value={(
          <span>
            {formatPercentage(icelanceUtil, 0)}{'% '}
            <SpellIcon
              id={SPELLS.ICE_LANCE_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {' '}
            {formatPercentage(frostboltUtil, 0)}{'% '}
            <SpellIcon
              id={SPELLS.FROSTBOLT.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
          </span>
        )}
        label="Winter's Chill Utilization"
        tooltip={`Every Brain Freeze Flurry should be preceded by a Frostbolt and followed by an Ice Lance. <br><br> You were able to double Ice Lance into Winter's Chill ${this.doubleIceLanceCasts} times (${formatPercentage(doubleIcelancePerc, 1)}%). Note this is only possible when close to the target and at very high levels of haste.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default WintersChillTracker;
