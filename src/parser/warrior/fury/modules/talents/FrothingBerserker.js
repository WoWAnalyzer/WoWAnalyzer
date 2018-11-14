import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox from 'interface/others/StatisticBox';

/**
 Frothing Berserker users should maximize casts with 100 rage to proc Frothing Berserker the post
 Carnage users should cast as soon as possible, i.e. at 70 rage
 Massacre users (not from Soul of the Battlelord) should cast as soon as possible, i.e. at 85 rage
 Whenever Battle Cry is active, user should cast Rampage whenever possible - regardless of talents
 */

class FrothingBerserker extends Analyzer {

  last_timestamp = null;
  casts_counter = 0;
  premature_counter = 0;
  reckless_abandon = null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FROTHING_BERSERKER_TALENT.id);
    this.reckless_abandon = this.selectedCombatant.hasTalent(SPELLS.RECKLESS_ABANDON_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.RAMPAGE.id) {
      const rage = Math.floor(event.classResources[0].amount / 10);

      // Ignore any free casts due to Massacre talent
      if (this.selectedCombatant.hasBuff(SPELLS.MASSACRE.id)) {
        return;
      }

      this.casts_counter++;

      if (rage < 100 && !this.selectedCombatant.hasBuff(SPELLS.RECKLESSNESS.id)) {
        this.premature_counter++;
        this.last_timestamp = event.timestamp;
      }
    } else if (event.ability.guid === SPELLS.RECKLESSNESS.id && this.last_timestamp && this.reckless_abandon) {
      if (event.timestamp - this.last_timestamp < 2000) {
        this.premature_counter--;
        this.last_timestamp = null;
      }
    }
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FROTHING_BERSERKER.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.65,
        average: 0.6,
        major: 0.55,
      },
      style: 'percentage',
    };
  }

  get rampageSuggestionThresholds() {
    return {
      actual: this.premature_counter / this.casts_counter,
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.10,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Your <SpellLink id={SPELLS.FROTHING_BERSERKER.id} /> uptime can be improved.</>)
        .icon(SPELLS.FROTHING_BERSERKER.icon)
        .actual(`${formatPercentage(actual)}% Frothing Berserker uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
    when(this.rampageSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Try to cast <SpellLink id={SPELLS.RAMPAGE.id} /> at 100 rage to proc <SpellLink id={SPELLS.FROTHING_BERSERKER_TALENT.id} />.</>)
        .icon(SPELLS.RAMPAGE.icon)
        .actual(`${formatPercentage(actual)}% (${this.premature_counter} out of ${this.casts_counter}) of your Rampage casts were cast below 100 rage.`)
        .recommended(`${recommended}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FROTHING_BERSERKER.id} />}
        value={`${formatPercentage(this.frothingBerserkerUptime)} %`}
        label="Frothing Berserker uptime"
      />
    );
  }
}

export default FrothingBerserker;
