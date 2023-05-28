import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import { ELEMENTAL_BLAST_BUFFS } from './constants';

class ElementalBlast extends Analyzer {
  currentBuffAmount = 0;
  lastFreshApply = 0;
  resultDuration = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ELEMENTAL_BLAST_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(ELEMENTAL_BLAST_BUFFS),
      this.onRemoveBuff,
    );

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(ELEMENTAL_BLAST_BUFFS),
      this.onApplyBuff,
    );
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.currentBuffAmount -= 1;
    if (this.currentBuffAmount === 0) {
      this.resultDuration += event.timestamp - this.lastFreshApply;
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    if (this.currentBuffAmount === 0) {
      this.lastFreshApply = event.timestamp;
    }
    this.currentBuffAmount += 1;
  }

  get hasteUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_HASTE.id) /
      this.owner.fightDuration
    );
  }

  get critUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_CRIT.id) /
      this.owner.fightDuration
    );
  }

  get masteryUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_MASTERY.id) /
      this.owner.fightDuration
    );
  }

  get elementalBlastUptime() {
    return this.resultDuration / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        icon={<SpellIcon id={TALENTS_SHAMAN.ELEMENTAL_BLAST_TALENT.id} />}
        value={`${formatPercentage(this.elementalBlastUptime)} %`}
        label="Uptime"
        tooltip={
          <>
            <span className="stat-mastery">
              <strong>{formatPercentage(this.masteryUptime)}% Mastery</strong>
            </span>
            <br />
            <span className="stat-criticalstrike">
              <strong>{formatPercentage(this.critUptime)}% Crit</strong>
            </span>
            <br />
            <span className="stat-haste">
              <strong>{formatPercentage(this.hasteUptime)}% Haste</strong>
            </span>
          </>
        }
      />
    );
  }
}

export default ElementalBlast;
