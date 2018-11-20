import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import Analyzer from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events from 'parser/core/Events';
import CombatLogParser from 'parser/core/CombatLogParser';

class ThermalVoid extends Analyzer {
  casts = 0;
  buffApplied = 0;
  extraUptime = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.THERMAL_VOID_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.ICY_VEINS), this.onApplyIcyVeins);
    this.addEventListener(CombatLogParser.finish, this.onFinish);

  }

  onApplyIcyVeins(event) {
    this.casts += 1;
    this.buffApplied = event.timestamp;
  }

  onFinish() {
    if (this.selectedCombatant.hasBuff(SPELLS.ICY_VEINS.id)) {
      this.casts -= 1;
      this.extraUptime = this.owner.currentTimestamp - this.buffApplied;
    }
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ICY_VEINS.id) - this.extraUptime;
  }

  get averageDuration() {
    return this.uptime / this.casts;
  }

  get averageDurationSeconds() {
    return this.averageDuration / 1000;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.THERMAL_VOID_TALENT.id}
        position={STATISTIC_ORDER.CORE(100)}
        value={`${formatNumber(this.averageDurationSeconds)}s`}
        label="Avg Icy Veins Duration"
        tooltip="Icy Veins Casts that do not complete before the fight ends are removed from this statistic"
      />
    );
  }
}

export default ThermalVoid;
