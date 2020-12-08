import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyBuffEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import { formatNumber } from 'common/format';

class Firestorm extends Analyzer {

  castsDuringFirestorm = 0;
  firestormProcs = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.FIRESTORM.bonusID);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.PYROBLAST,SPELLS.FLAMESTRIKE]), this.onCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FIRESTORM_BUFF), this.onFirestormApplied);
  }

  onCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.FIRESTORM_BUFF.id)) {
      return;
    }
    this.castsDuringFirestorm += 1;
  }

  onFirestormApplied(event: ApplyBuffEvent) {
    this.firestormProcs += 1;
  }

  get castsPerProc() {
    return this.castsDuringFirestorm / this.firestormProcs;
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FEVERED_INCANTATION_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.FIRESTORM}>
          {formatNumber(this.firestormProcs)} <small>Total Procs</small><br />
          {formatNumber(this.castsPerProc)} <small>Avg. Casts per Proc</small><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Firestorm;
