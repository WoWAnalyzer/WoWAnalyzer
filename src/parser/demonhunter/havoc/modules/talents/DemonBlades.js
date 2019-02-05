import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatThousands } from 'common/format';

/**
 * Example Report:
 */
class DemonBlades extends Analyzer{

  effectiveFuryGain = 0;
  furyGain = 0;
  furyWaste = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEMON_BLADES_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.DEMON_BLADES_FURY), this.onEnergizeEvent);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEMON_BLADES_FURY), this.onDamageEvent);
  }

  onEnergizeEvent(event) {
    this.furyGain += event.resourceChange;
    this.furyWaste += event.waste;
  }

  onDamageEvent(event) {
    this.damage += event.amount;
  }

  get furyPerMin() {
    return ((this.furyGain - this.furyWaste) / (this.owner.fightDuration/60000)).toFixed(2);
  }

  statistic(){
    this.effectiveFuryGain = this.furyGain - this.furyWaste;
    return (
      <TalentStatisticBox
        talent={SPELLS.DEMON_BLADES_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={(<>{this.furyPerMin} fury per min <br />
                {this.owner.formatItemDamageDone(this.damage)}</>)}
        tooltip={`
          ${formatThousands(this.damage)} Total damage<br />
          ${this.effectiveFuryGain} Effective fury gained<br />
          ${this.furyGain} Total fury gained<br />
          ${this.furyWaste} Fury wasted
        `}
      />
    );
  }
}
export default DemonBlades;
