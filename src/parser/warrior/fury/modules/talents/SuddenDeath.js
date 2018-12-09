import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Analyzer from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import SpellUsable from '../features/SpellUsable';

/**
 * Your attacks have a chance to reset the cooldown of Execute
 * and make it usable on any target, regardless of their health.
 */

class SuddenDeath extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  suddenDeathProcs = 0;
  suddenDeathProcsUsed = 0;
  executeDamageEvents = [];

  lastExecuteCast = 0;
  lastSuddenDeathExecuteCast = 0;
  lastSuddenDeathTargetID = 0;

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTalent(SPELLS.SUDDEN_DEATH_TALENT_FURY.id);
    this.executeThreshold = this.selectedCombatant.hasTalent(SPELLS.MASSACRE_TALENT_FURY.id) ? 0.35 : 0.2;

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
      this.lastSuddenDeathTargetID = event.targetID;
    }
    this.lastExecuteCast = event.timestamp;
  }

  onExecuteDamage(event) {
    if (!this.executeDamageEvents[this.lastExecuteCast]) {
      this.executeDamageEvents[this.lastExecuteCast] = {
        damageDone: 0,
        isMainTargetAboveThreshold: false,
        isSuddenDeath: this.lastExecuteCast === this.lastSuddenDeathExecuteCast,
      };        
    }
    this.executeDamageEvents[this.lastExecuteCast].damageDone += event.amount + (event.absorbed || 0);

    if (event.targetID === this.lastSuddenDeathTargetID && this.isExecuteAboveThreshold(event)) {
      this.executeDamageEvents[this.lastExecuteCast].isMainTargetAboveThreshold = true;
    }
  }

  onSuddenDeathProc() {
    this.suddenDeathProcs += 1;
  }

  isExecuteAboveThreshold(event) {
    return event.hitPoints / event.maxHitPoints > this.executeThreshold;
  }

  get damageAboveThreshold() {
    return this.executeDamageEvents.reduce((total, event) => {
      return event.isMainTargetAboveThreshold ? total + event.damageDone : total;
    }, 0);
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageAboveThreshold);
  }

  get executeCastsAboveThreshold() {
    return this.executeDamageEvents.filter(e => e.isMainTargetAboveThreshold && e.isSuddenDeath).length;
  }

  get effectiveExecuteCDR() {
    return this.spellUsable.executeCdrEvents.reduce((total, cdrValue, index) => {
      return this.executeDamageEvents[index] && !this.executeDamageEvents[index].isMainTargetAboveThreshold ? total + cdrValue : total;
    }, 0);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.SUDDEN_DEATH_TALENT_FURY.id}
        value={`${this.suddenDeathProcsUsed} / ${this.suddenDeathProcs} procs used`}
        label="Sudden Death"
        tooltip={`Sudden Death usage on targets above ${formatPercentage(this.executeThreshold)}%<br />
        Damage done: <b>${formatThousands(this.damageAboveThreshold)} (${formatPercentage(this.damagePercent)}%)</b><br />
        Execute casts: <b>${formatThousands(this.executeCastsAboveThreshold)}</b><br /><br />
        Sudden Death usage on targets below ${formatPercentage(this.executeThreshold)}%</u><br />
        Effective CDR: <b>${(this.effectiveExecuteCDR / 1000).toFixed(2)}s</b>`}
      />
    );
  }
}

export default SuddenDeath;