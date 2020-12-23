import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';

import SpellUsable from '../features/SpellUsable';

/**
 * Your attacks have a chance to reset the cooldown of Execute
 * and make it usable on any target, regardless of their health.
 */

type ExecuteDamageTracker = {
  damageDone: number,
  isMainTargetAboveThreshold: boolean,
  isSuddenDeath: boolean,
}

class SuddenDeath extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  suddenDeathProcs: number = 0;
  suddenDeathProcsUsed: number = 0;
  executeDamageEvents: ExecuteDamageTracker[] = [];
  lastExecuteCast: number = 0;
  lastSuddenDeathExecuteCast: number = 0;
  lastSuddenDeathTargetID: number | undefined = 0;
  executeThreshold: number = 0.2;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.WAR_MACHINE_FURY_TALENT.id);
    this.executeThreshold = this.selectedCombatant.hasTalent(SPELLS.MASSACRE_FURY_TALENT.id) ? 0.35 : this.executeThreshold;

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.EXECUTE_FURY, SPELLS.EXECUTE_FURY_MASSACRE]), this.onExecuteCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.EXECUTE_DAMAGE_FURY, SPELLS.EXECUTE_DAMAGE_OH_FURY]), this.onExecuteDamage);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WAR_MACHINE_FURY_TALENT_BUFF), this.onSuddenDeathProc);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.WAR_MACHINE_FURY_TALENT_BUFF), this.onSuddenDeathProc);
  }

  get damageAboveThreshold() {
    return this.executeDamageEvents.reduce((total, event) => event.isMainTargetAboveThreshold ? total + event.damageDone : total, 0);
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageAboveThreshold);
  }

  get executeCastsAboveThreshold() {
    return this.executeDamageEvents.filter(e => e.isMainTargetAboveThreshold && e.isSuddenDeath).length;
  }

  get effectiveExecuteCDR() {
    return this.spellUsable.executeCdrEvents.reduce((total, cdrValue, index) => this.executeDamageEvents[index] && !this.executeDamageEvents[index].isMainTargetAboveThreshold ? total + cdrValue : total, 0);
  }

  onExecuteCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.WAR_MACHINE_FURY_TALENT_BUFF.id)) {
      this.lastSuddenDeathExecuteCast = event.timestamp;
      this.suddenDeathProcsUsed += 1;
      this.lastSuddenDeathTargetID = event.targetID;
    }
    this.lastExecuteCast = event.timestamp;
  }

  onExecuteDamage(event: DamageEvent) {
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

  isExecuteAboveThreshold(event: DamageEvent) {
    if (!event.hitPoints || !event.maxHitPoints) {
      return false;
    }
    return event.hitPoints / event.maxHitPoints > this.executeThreshold;
  }

  onSuddenDeathProc() {
    this.suddenDeathProcs += 1;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={(
          <>
            Sudden Death usage on targets above {formatPercentage(this.executeThreshold)}%<br />
            Damage done: <strong>{formatThousands(this.damageAboveThreshold)} ({formatPercentage(this.damagePercent)}%)</strong><br />
            Execute casts: <strong>{formatThousands(this.executeCastsAboveThreshold)}</strong><br /><br />

            Sudden Death usage on targets below <u>{formatPercentage(this.executeThreshold)}%</u><br />
            Effective CDR: <strong>{(this.effectiveExecuteCDR / 1000).toFixed(2)}s</strong>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.WAR_MACHINE_FURY_TALENT}>
          <>
            {this.suddenDeathProcsUsed} / {this.suddenDeathProcs} procs used
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SuddenDeath;
