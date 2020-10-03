import React from 'react';
import SPELLS from 'common/SPELLS';
import {Trans} from '@lingui/macro';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemHealingDone from 'interface/ItemHealingDone';
class InvokeChiJi extends Analyzer {
  gustHealing = 0;
  envelopHealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id);
    if (!this.active) return;
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUST_OF_MISTS_CHIJI), this.handleGust);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH), this.handleEnvelopingBreath);
  }

  handleGust(event) {
    this.gustHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleEnvelopingBreath(event) {
    this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL(50)}
          size="flexible"
          tooltip={
            <Trans>
                  Healing Breakdown:
                  <ul>
                    <li>{formatNumber(this.gustHealing)} healing from Chi-Ji Gust of Mist.</li>
                    <li>{formatNumber(this.envelopHealing)} healing from Enveloping Breath.</li>
                  </ul>
            </Trans>
          }
        >
          <BoringSpellValueText spell={SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT}>
            <ItemHealingDone amount={this.gustHealing + this.envelopHealing} /><br />
          </BoringSpellValueText>
        </Statistic>
    );
  }
}

export default InvokeChiJi;
