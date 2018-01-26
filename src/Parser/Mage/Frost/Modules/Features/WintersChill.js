import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import EnemyInstances from 'Parser/Core/Modules/EnemyInstances';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import { formatMilliseconds, formatPercentage } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

const HARDCAST_HITS = [
  SPELLS.FROSTBOLT_DAMAGE.id,
  SPELLS.EBONBOLT_DAMAGE.id,
  SPELLS.GLACIAL_SPIKE_DAMAGE.id,
];

class WintersChillTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: EnemyInstances,
  };

  hasGlacialSpike;

  totalProcs = 0;

  hardcastHits = 0;
  missedHardcasts = 0;
  singleHardcasts = 0;

  iceLanceHits = 0;
  missedIceLanceCasts = 0;
  singleIceLanceCasts = 0;
  doubleIceLanceCasts = 0;

  on_initialized() {
    this.hasGlacialSpike = this.combatants.selected.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      return;
    }

    if (spellId === SPELLS.ICE_LANCE_DAMAGE.id) {
      this.iceLanceHits += 1;
      debug && console.log("Ice Lance into Winter's Chill");
    } else if(HARDCAST_HITS.includes(spellId)) {
      this.hardcastHits += 1;
      debug && console.log(`${event.ability.name} into Winter's Chill`);
    }
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
	  if(spellId !== SPELLS.WINTERS_CHILL.id) {
		  return;
	  }
    this.iceLanceHits = 0;
    this.hardcastHits = 0;
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

    if (this.hardcastHits === 0) {
      this.missedHardcasts += 1;
    } else if (this.hardcastHits === 1) {
      this.singleHardcasts += 1;
    } else {
      console.error(`Unexpected number of Frostbolt hits inside Winter's Chill @ ${formatMilliseconds(this.owner.currentTimestamp - this.owner.fight.start_time)} -> ${this.hardcastHits}`);
    }
  }

  get iceLanceMissedPercent() {
    return (this.missedIceLanceCasts / this.totalProcs) || 0;
  }

  get iceLanceUtil() {
    return 1 - this.iceLanceMissedPercent;
  }

  get iceLanceUtilSuggestionThresholds() {
    return {
      actual: this.iceLanceUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: 'percentage',
    };
  }

  get hardcastMissedPercent() {
    return (this.missedHardcasts / this.totalProcs) || 0;
  }

  get hardcastUtil() {
    return 1 - this.hardcastMissedPercent;
  }

  // less strict than the ice lance suggestion both because it's less important,
  // and also because using a Brain Freeze after being forced to move is a good excuse for missing the hardcast.
  get hardcastUtilSuggestionThresholds() {
    return {
      actual: this.hardcastUtil,
      isLessThan: {
        minor: 0.90,
        average: 0.80,
        major: 0.60,
      },
      style: 'percentage',
    };
  }

  get doubleIceLancePercentage() {
    return this.doubleIceLanceCasts / this.totalProcs || 0;
  }

  suggestions(when) {
    when(this.iceLanceUtilSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You failed to Ice Lance into <SpellLink id={SPELLS.WINTERS_CHILL.id}/> {this.missedIceLanceCasts} times ({formatPercentage(this.iceLanceMissedPercent)}%). Make sure you cast <SpellLink id={SPELLS.ICE_LANCE.id}/> after each <SpellLink id={SPELLS.FLURRY.id}/> to benefit from <SpellLink id={SPELLS.SHATTER.id}/>.</Wrapper>)
          .icon(SPELLS.ICE_LANCE.icon)
          .actual(`${formatPercentage(this.iceLanceMissedPercent)}% Winter's Chill not shattered with Ice Lance`)
          .recommended(`<${formatPercentage(1 - this.iceLanceUtilSuggestionThresholds.isLessThan.minor)}% is recommended`);
      });

    if(this.hasGlacialSpike) { // Different suggestion text depending on talent choice (which includes a SpellLink, so can't switch inside suggestion)
      when(this.hardcastUtilSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>You failed to <SpellLink id={SPELLS.FROSTBOLT.id}/>, <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id}/>, or <SpellLink id={SPELLS.EBONBOLT.id}/> into <SpellLink id={SPELLS.WINTERS_CHILL.id}/> {this.missedHardcasts} times ({formatPercentage(this.hardcastMissedPercent)}%}). Make sure you hard cast just before each instant <SpellLink id={SPELLS.FLURRY.id}/> to benefit from <SpellLink id={SPELLS.SHATTER.id}/>.</Wrapper>)
            .icon(SPELLS.FROSTBOLT.icon)
            .actual(`${formatPercentage(this.hardcastMissedPercent)}% Winter's Chill not shattered with Frostbolt, Glacial Spike, or Ebonbolt`)
            .recommended(`${formatPercentage(1 - recommended)}% is recommended`);
        });
    } else {
      when(this.hardcastUtilSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>You failed to <SpellLink id={SPELLS.FROSTBOLT.id}/> or <SpellLink id={SPELLS.EBONBOLT.id}/> into <SpellLink id={SPELLS.WINTERS_CHILL.id}/> {this.missedHardcasts} times ({formatPercentage(this.hardcastMissedPercent)}%}). Make sure you hard cast just before each instant <SpellLink id={SPELLS.FLURRY.id}/> to benefit from <SpellLink id={SPELLS.SHATTER.id}/>.</Wrapper>)
          .icon(SPELLS.FROSTBOLT.icon)
          .actual(`${formatPercentage(this.hardcastMissedPercent)}% Winter's Chill not shattered with Frostbolt or Ebonbolt`)
          .recommended(`${formatPercentage(1 - recommended)}% is recommended`);
        });
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.WINTERS_CHILL.id} />}
        value={(
          <span>
            <SpellIcon
              id={SPELLS.ICE_LANCE.id}
              style={{
                height: '1.2em',
                marginBottom: '.15em',
              }}
            />
            {' '}{formatPercentage(this.iceLanceUtil, 0)}{' %'}
            <br />
            <SpellIcon
              id={SPELLS.FROSTBOLT.id}
              style={{
                height: '1.2em',
                marginBottom: '.15em',
              }}
            />
            {' '}{formatPercentage(this.hardcastUtil, 0)}{' %'}
          </span>
        )}
        label="Winter's Chill Utilization"
        tooltip={`Every Brain Freeze Flurry should be preceded by a Frostbolt${this.hasGlacialSpike ? `, Glacial Spike, ` : ` `}or Ebonbolt and followed by an Ice Lance, so that both the preceding and following spells benefit from Shatter. <br><br> You double Ice Lance'd into Winter's Chill ${this.doubleIceLanceCasts} times (${formatPercentage(this.doubleIceLancePercentage, 1)}%). Note this is usually impossible, it can only be done with strong haste buffs active and by moving towards the target while casting. It should mostly be considered 'extra credit'.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(14);
}

export default WintersChillTracker;
