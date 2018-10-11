import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

class Heartbreaker extends Analyzer {
  rpGains = [];
  hsCasts = 0;
  deathStrikeCost = 45;

  constructor(...args) {
    super(...args);
    if (this.selectedCombatant.hasTalent(SPELLS.OSSUARY_TALENT.id)) {
      this.deathStrikeCost -= 5;
    }
    this.active = this.selectedCombatant.hasTalent(SPELLS.HEARTBREAKER_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.HEART_STRIKE.id) {
      return;
    }
    this.hsCasts += 1;
  }

  on_energize(event) {
    if (event.ability.guid !== SPELLS.HEARTBREAKER.id || event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id) {
      return;
    }
    this.rpGains.push(event.resourceChange);
  }

  get totalRPGained() {
    return this.rpGains.reduce((a, b) => a + b, 0);
  }

  get averageHearStrikeHits() {
    return (this.rpGains.length / this.hsCasts).toFixed(2);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HEARTBREAKER_TALENT.id} />}
        value={`${this.totalRPGained}`}
        label="Runic Power gained"
        tooltip={`
          Resulting in about ${Math.floor(this.totalRPGained / this.deathStrikeCost)} extra Death Strikes.<br/>
          Your Heart Strike hit on average ${this.averageHearStrikeHits} targets.
        `}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Heartbreaker;
