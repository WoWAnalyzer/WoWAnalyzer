import React from 'react';

import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const CHAIN_PROC_BUFFER = 200;
const HOLY_POWER_SPENDERS = [SPELLS.DIVINE_STORM, SPELLS.TEMPLARS_VERDICT, SPELLS.JUSTICARS_VENGEANCE_TALENT];

class DivinePurpose extends Analyzer {
  divinePurposeProcs = 0;
  templarsVerdictConsumptions = 0;
  divineStormConsumptions = 0;
  justicarsVengeanceConsumptions = 0;
  largestProcChain = 0;
  currentProcChain = 0;
  lastDivinePurposeConsumption = null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_RETRIBUTION.id);

    // event listeners
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(HOLY_POWER_SPENDERS), this.onCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_BUFF), this.onApplyDivinePurpose);
  }

  onCast(event){
    const spellId = event.ability.guid;
    if (!this.selectedCombatant.hasBuff(SPELLS.DIVINE_PURPOSE_BUFF.id)) {
      return;
    }
    switch (spellId) {
      case SPELLS.TEMPLARS_VERDICT.id:
        this.templarsVerdictConsumptions += 1;
        break;
      case SPELLS.DIVINE_STORM.id:
      // Empyrean Power grants a free Divine Storm and is prioritized over Divine Purpose if both are active
        if (this.selectedCombatant.hasBuff(SPELLS.EMPYREAN_POWER_BUFF.id)) {
          return;
        }
        this.divineStormConsumptions += 1;
        break;
      case SPELLS.JUSTICARS_VENGEANCE_TALENT.id:
        this.justicarsVengeanceConsumptions += 1;
        break;
      default:
        break;
    }
    this.lastDivinePurposeConsumption = event.timestamp;
  }

  onApplyDivinePurpose(event){
    this.divinePurposeProcs += 1;
    const timeSinceLastDPconsumption = event.timestamp - this.lastDivinePurposeConsumption;
    if (timeSinceLastDPconsumption < CHAIN_PROC_BUFFER) {
      if (this.currentProcChain === 0) {
        this.currentProcChain = 2;
      } else {
        this.currentProcChain += 1;
      }
      if (this.currentProcChain > this.largestProcChain){
        this.largestProcChain = this.currentProcChain;
      }
    } else {
      this.currentProcChain = 0;
    }
  }

  statistic() {
    const hasJV = this.selectedCombatant.hasTalent(SPELLS.JUSTICARS_VENGEANCE_TALENT.id);
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(1)}
        icon={<SpellIcon id={SPELLS.DIVINE_PURPOSE_TALENT_RETRIBUTION.id} />}
        value={`${formatNumber(this.divinePurposeProcs)}`}
        label="Divine Purpose procs"
        tooltip={(
          <>
          Your Divine Purpose procs were used on:<br />
          Templars Verdict: {this.templarsVerdictConsumptions}<br />
          Divine Storm: {this.divineStormConsumptions}
          {hasJV && <><br />Justicars Vengeance: {this.justicarsVengeanceConsumptions}</>}
          {this.largestProcChain > 1 && <><br />Your longest chain of procs was {this.largestProcChain}</>}
          </>
        )}
      />
    );
  }
}

export default DivinePurpose;
