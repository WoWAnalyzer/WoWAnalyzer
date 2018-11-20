import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatDuration } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

/**
 * Every 20 Rage you spend reduces the remaining cooldown on Recklessness by 1 sec.
 */

const RAGE_NEEDED_FOR_A_PROC = 20;
const CDR_PER_PROC = 1000; // ms

class AngerManagement extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  totalRageSpend = 0;
  wastedReduction = 0;
  effectiveReduction = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ANGER_MANAGEMENT_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (!event.classResources) {
      return;
    }
    const rage = event.classResources.find(e => e.type === RESOURCE_TYPES.RAGE.id);
    if (!rage || !rage.cost) {
      return;
    }

    const recklessness = SPELLS.RECKLESSNESS.id;
    const rageSpend = rage.cost / 10;
    const reduction = rageSpend / RAGE_NEEDED_FOR_A_PROC * CDR_PER_PROC;

    if (!this.spellUsable.isOnCooldown(recklessness)) {
        this.wastedReduction += reduction;
    } else {
        const effectiveReduction = this.spellUsable.reduceCooldown(recklessness, reduction);
        this.effectiveReduction += effectiveReduction;
        this.wastedReduction += reduction - effectiveReduction;
      }

    this.totalRageSpend += rageSpend;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(4)}
        icon={<SpellIcon id={SPELLS.ANGER_MANAGEMENT_TALENT.id} />}
        value={`${formatDuration((this.effectiveReduction + this.wastedReduction) / 1000)} min`}
        label="Possible cooldown reduction"
        tooltip={`Recklessness: ${formatDuration(this.effectiveReduction / 1000)} reduction (${formatDuration(this.wastedReduction / 1000)} wasted)`}
      />
    );
  }
}

export default AngerManagement;
