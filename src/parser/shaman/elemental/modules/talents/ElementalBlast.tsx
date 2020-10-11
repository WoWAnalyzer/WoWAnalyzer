import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import { ELEMENTAL_BLAST_BUFFS } from 'parser/shaman/elemental/constants';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import UptimeIcon from 'interface/icons/Uptime';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

class ElementalBlast extends Analyzer {
  currentBuffAmount: number = 0;
  lastFreshApply: number = 0;
  resultDuration: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(ELEMENTAL_BLAST_BUFFS), this.onEBApply);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(ELEMENTAL_BLAST_BUFFS), this.onEBRemove);
  }

  onEBRemove(event: RemoveBuffEvent) {
    this.currentBuffAmount -= 1;
    if (this.currentBuffAmount === 0) {
      this.resultDuration += event.timestamp - this.lastFreshApply;
    }
  }

  onEBApply(event: ApplyBuffEvent) {
    if (this.currentBuffAmount === 0) {
      this.lastFreshApply = event.timestamp;
    }
    this.currentBuffAmount += 1;
  }

  get hasteUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_HASTE.id) / this.owner.fightDuration;
  }

  get critUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_CRIT.id) / this.owner.fightDuration;
  }

  get masteryUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_MASTERY.id) / this.owner.fightDuration;
  }

  get elementalBlastUptime() {
    return this.resultDuration / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            <span className="stat-mastery">
              <strong>{formatPercentage(this.masteryUptime)}% Mastery</strong>
            </span><br />
            <span className="stat-criticalstrike">
              <strong>{formatPercentage(this.critUptime)}% Crit</strong>
            </span><br />
            <span className="stat-haste">
              <strong>{formatPercentage(this.hasteUptime)}% Haste</strong>
            </span>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.ELEMENTAL_BLAST_TALENT}>
          <>
            <UptimeIcon /> {formatPercentage(this.elementalBlastUptime)}% Uptime
          </>
        </BoringSpellValueText>

      </Statistic>
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default ElementalBlast;
