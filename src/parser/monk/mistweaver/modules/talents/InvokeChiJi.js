import React from 'react';
import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SpellIcon from 'common/SpellIcon';
import ItemHealingDone from 'interface/ItemHealingDone';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { TooltipElement } from 'common/Tooltip';
import { formatNumber } from 'common/format';

class InvokeChiJi extends Analyzer {
  gustHealing = 0;
  envbHealing = 0;

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
    this.envbHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
      <>
        <StatisticBox
          position={STATISTIC_ORDER.OPTIONAL(50)}
          icon={<SpellIcon id={SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id} />}
          value={<ItemHealingDone amount={this.gustHealing + this.envbHealing} />}
          label={
            <TooltipElement
              content={
                <>
                  Healing Breakdown:
                  <ul>
                    <li>{formatNumber(this.gustHealing)} healing from Chi-Ji Gust of Mist.</li>
                    <li>{formatNumber(this.envbHealing)} healing from Enveloping Breath.</li>
                  </ul>
                </>
              }
            >
              Total Healing Contributed
            </TooltipElement>
          }
        />
      </>
    );
  }
}

export default InvokeChiJi;
