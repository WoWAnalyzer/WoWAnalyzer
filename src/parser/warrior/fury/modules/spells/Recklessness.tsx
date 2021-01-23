import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, EnergizeEvent } from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatPercentage, formatThousands } from 'common/format';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

class Recklessness extends Analyzer {
  reckRageGen: number = 0;
  totalRageGen: number = 0;
  reckDamage: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.energize.by(SELECTED_PLAYER).to(SELECTED_PLAYER), this.onPlayerEnergize);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RECKLESSNESS.id) / this.owner.fightDuration;
  }

  get ratioReckRageGen() {
    return this.reckRageGen / this.totalRageGen;
  }

  get reckDPS() {
    return this.owner.getPercentageOfTotalDamageDone(this.reckDamage);
  }

  onPlayerEnergize(event: EnergizeEvent) {
    const resource = event.classResources && event.classResources.find(classResources => classResources.type === RESOURCE_TYPES.RAGE.id);

    if (!resource) {
      return;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.RECKLESSNESS.id)) {
      this.reckRageGen += event.resourceChange / 2;
    }

    this.totalRageGen += event.resourceChange;
  }

  onPlayerDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RECKLESSNESS.id)) {
      this.reckDamage += event.amount;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={(
          <>
            <strong>Extra Rage Generated:</strong> {this.reckRageGen}<br />
            <strong>Percent of total rage generated during recklessness:</strong> {formatPercentage(this.ratioReckRageGen)}%<br />
            <strong>Percent of total damage done during recklessness:</strong> {formatPercentage(this.reckDPS)}% ({formatThousands(this.reckDamage)})
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.RECKLESSNESS}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Recklessness;
