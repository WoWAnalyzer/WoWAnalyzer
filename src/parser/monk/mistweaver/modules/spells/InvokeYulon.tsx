import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { formatNumber } from 'common/format';
import ItemHealingDone from 'interface/ItemHealingDone';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

class InvokeYulon extends Analyzer {
  soothHealing: number = 0;
  envelopHealing: number = 0;

  constructor(options: Options){
    super(options);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id);
    if (!this.active) {return;}
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH), this.handleEnvelopingBreath);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_BREATH), this.handleSoothingBreath);
  }

  handleEnvelopingBreath(event: HealEvent) {
    this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleSoothingBreath(event: HealEvent) {
    this.soothHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(50)}
        size="flexible"
        tooltip={
          <>
                Healing Breakdown:
                <ul>
                  <li>{formatNumber(this.soothHealing)} healing from Soothing Breath.</li>
                  <li>{formatNumber(this.envelopHealing)} healing from Enveloping Breath.</li>
                </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.INVOKE_YULON_THE_JADE_SERPENT}>
          <ItemHealingDone amount={this.soothHealing + this.envelopHealing} /><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default InvokeYulon;
