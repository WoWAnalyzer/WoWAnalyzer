import React from 'react';

import SPELLS from 'common/SPELLS';
import { TooltipElement } from 'common/Tooltip';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';

import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

import UptimeIcon from 'interface/icons/Uptime';
import MasteryIcon from 'interface/icons/Mastery';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';

const AncestralResonanceStats = traits => Object.values(traits).reduce((total, ilvl) => {
  const statForPiece = calculateAzeriteEffects(SPELLS.ANCESTRAL_RESONANCE.id, ilvl)[0];
  return statForPiece + total;
}, 0);

class AncestralResonance extends Analyzer {
  stats = 0;

  static dependencies = {
    statTracker: StatTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.ANCESTRAL_RESONANCE.id);
    if (!this.active) {
      return;
    }

    this.stats = AncestralResonanceStats(this.selectedCombatant.traitsBySpellId[SPELLS.ANCESTRAL_RESONANCE.id]);

    this.statTracker.add(SPELLS.ANCESTRAL_RESONANCE_BUFF.id, {
      mastery: this.stats,
    });
  }

  get masteryBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ANCESTRAL_RESONANCE_BUFF.id) / this.owner.fightDuration;
  }

  get averageMastery() {
    return (this.stats * this.masteryBuffUptime).toFixed(0);
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.ANCESTRAL_RESONANCE}>
          <MasteryIcon /> <TooltipElement content={(
            <div>
              <UptimeIcon /> {formatPercentage(this.masteryBuffUptime, 2)}% uptime
            </div>
          )}
          >{this.averageMastery} <small>average Mastery gained</small></TooltipElement>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default AncestralResonance;
