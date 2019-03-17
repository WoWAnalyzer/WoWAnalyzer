import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatThousands, formatPercentage } from 'common/format';

/**
 * Example Report: https://www.warcraftlogs.com/reports/tYjD6fp9cJ7nbAkm/#fight=7&source=12
 */

const IMMOLATION_AURA = [SPELLS.IMMOLATION_AURA_FIRST_STRIKE_DPS, SPELLS.IMMOLATION_AURA_BUFF_DPS];

class ImmolationAura extends Analyzer{

  furyGain = 0;
  furyWaste = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.IMMOLATION_AURA_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.IMMOLATION_AURA_BUFF_DPS), this.onEnergizeEvent);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(IMMOLATION_AURA), this.onDamageEvent);
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

  get suggestionThresholds() {
    return {
      actual: this.furyWaste / this.furyGain,
      isGreaterThan: {
        minor: 0.03,
        average: 0.07,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<> Be mindful of your Fury levels and spend it before capping.</>)
          .icon(SPELLS.IMMOLATION_AURA_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Fury wasted`)
          .recommended(`${formatPercentage(recommended)}% is recommended.`);
      });
  }

  statistic(){
    const effectiveFuryGain = this.furyGain - this.furyWaste;
    return (
      <TalentStatisticBox
        talent={SPELLS.IMMOLATION_AURA_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={(
          <>
            {this.furyPerMin} Fury per min <br />
            {this.owner.formatItemDamageDone(this.damage)}
          </>
        )}
        tooltip={(
          <>
            {formatThousands(this.damage)} Total damage<br />
            {effectiveFuryGain} Effective Fury gained<br />
            {this.furyGain} Total Fury gained<br />
            {this.furyWaste} Fury wasted
          </>
        )}
      />
    );
  }
}
export default ImmolationAura;
