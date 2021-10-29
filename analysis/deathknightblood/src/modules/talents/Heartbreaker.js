import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentStatisticBox from 'parser/ui/TalentStatisticBox';
import React from 'react';

const DEATHSTRIKE_COST = 40;

class Heartbreaker extends Analyzer {
  rpGains = [];
  hsCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HEARTBREAKER_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HEART_STRIKE), this.onCast);
    this.addEventListener(Events.energize.spell(SPELLS.HEARTBREAKER), this.onEnergize);
  }

  onCast(event) {
    this.hsCasts += 1;
  }

  onEnergize(event) {
    if (event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id) {
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
      <TalentStatisticBox
        talent={SPELLS.HEARTBREAKER_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(1)}
        value={this.totalRPGained}
        label="Runic Power gained"
        tooltip={
          <>
            Resulting in about {Math.floor(this.totalRPGained / DEATHSTRIKE_COST)} extra Death
            Strikes.
            <br />
            Your Heart Strike hit on average {this.averageHearStrikeHits} targets.
          </>
        }
      />
    );
  }
}

export default Heartbreaker;
