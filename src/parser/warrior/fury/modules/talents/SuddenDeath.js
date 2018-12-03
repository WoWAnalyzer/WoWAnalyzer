import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Analyzer from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

/**
 * Your attacks have a chance to reset the cooldown of Execute
 * and make it usable on any target, regardless of their health.
 */

class SuddenDeath extends Analyzer {
  suddenDeathProcs = 0;
  suddenDeathProcsUsed = 0;
  suddenDeathDamage = 0;

  lastExecuteCast = 0;
  lastSuddenDeathExecuteCast = 0;

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTalent(SPELLS.SUDDEN_DEATH_TALENT_FURY.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXECUTE_FURY), this.onExecuteCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.EXECUTE_DAMAGE_FURY, SPELLS.EXECUTE_DAMAGE_OH_FURY]), this.onExecuteDamage);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DEATH_TALENT_FURY_BUFF), this.onSuddenDeathProc);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DEATH_TALENT_FURY_BUFF), this.onSuddenDeathProc);
  }

  onExecuteCast(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.SUDDEN_DEATH_TALENT_FURY_BUFF.id)) {
      this.lastSuddenDeathExecuteCast = event.timestamp;
      this.suddenDeathProcsUsed += 1;
    }
    this.lastExecuteCast = event.timestamp;
  }

  onExecuteDamage(event) {
    if (this.lastExecuteCast === this.lastSuddenDeathExecuteCast) {
      this.suddenDeathDamage += event.amount + (event.absorbed || 0);
    }
  }

  onSuddenDeathProc() {
    this.suddenDeathProcs += 1;
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.suddenDeathDamage);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.SUDDEN_DEATH_TALENT_FURY.id}
        value={`${this.suddenDeathProcsUsed} / ${this.suddenDeathProcs} procs used`}
        label="Sudden Death"
        tooltip={`Sudden Death contributed to <b>${formatThousands(this.suddenDeathDamage)} (${formatPercentage(this.damagePercent)}%)</b> of your overall damage.`}
      />
    );
  }
}

export default SuddenDeath;