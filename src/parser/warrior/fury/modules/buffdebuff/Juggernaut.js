import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticsListBox, { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

class JuggernautReset extends Analyzer {

  resets = 0;
  stacksDropped = 0;
  stacksMax = 0;

  on_toPlayer_changebuffstack(event) {
    if(event.ability.guid !== SPELLS.JUGGERNAUT.id) {
      return;
    }

    if(event.newStacks < event.oldStacks) {
      this.resets += 1;
      this.stacksDropped += event.oldStacks;
    }

    if(this.stacksMax < event.newStacks) {
      this.stacksMax = event.newStacks;
    }
  }

  get suggestionThresholds() {
    return {
      isGreaterThan: {
        minor: 0.5,
        average: 0.9,
        major: 1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const {
      isGreaterThan: {
          minor,
          average,
          major,
        },
      } = this.suggestionThresholds;

    when(this.resets).isGreaterThan(minor)
      .addSuggestion((suggest, actual) => {
        return suggest(<React.Fragment>Your <SpellLink id={SPELLS.JUGGERNAUT.id} /> stacks dropped during the fight.</React.Fragment>)
          .icon(SPELLS.JUGGERNAUT.icon)
          .actual(`${actual} resets resulting in ${this.stacksDropped} stacks lost.`)
          .recommended(`0 is recommended`)
          .regular(average).major(major);
      });
  }

  juggernautResets() {
    return (
      <StatisticListBoxItem
        title={<React.Fragment><SpellIcon id={SPELLS.JUGGERNAUT.id} noLink /> Resets</React.Fragment>}
        value={this.resets}
      />
    );
  }

  juggernautStacksDropped() {
    return (
      <StatisticListBoxItem
        title={<React.Fragment><SpellIcon id={SPELLS.JUGGERNAUT.id} noLink /> Stacks lost</React.Fragment>}
        value={this.stacksDropped}
      />
    );
  }

  juggernautStacksMax() {
    return (
      <StatisticListBoxItem
        title={<React.Fragment><SpellIcon id={SPELLS.JUGGERNAUT.id} noLink /> Max stacks</React.Fragment>}
        value={this.stacksMax}
      />
    );
  }

  juggernautStacksMaxDamageIncrease() {
    return (
      <StatisticListBoxItem
        title={<React.Fragment><SpellIcon id={SPELLS.JUGGERNAUT.id} noLink /> Max stacks damage increase</React.Fragment>}
        value={`${this.stacksMax * 3} %`}
      />
    );
  }

  statistic() {
    return (
      <StatisticsListBox title="Juggernaut Statistics">
        {this.juggernautResets()}
        {this.juggernautStacksDropped()}
        {this.juggernautStacksMax()}
        {this.juggernautStacksMaxDamageIncrease()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default JuggernautReset;
