import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellUsable from 'parser/core/modules/SpellUsable';

const COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT = [
  SPELLS.DEMORALIZING_SHOUT.id,
  SPELLS.AVATAR_TALENT.id,
  SPELLS.LAST_STAND.id,
  SPELLS.SHIELD_WALL.id,
];
const RAGE_NEEDED_FOR_A_PROC = 10;
const CDR_PER_PROC = 1000; // ms

class AngerManagement extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  totalRageSpend = 0;
  wastedReduction = { };
  effectiveReduction = { };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ANGER_MANAGEMENT_TALENT.id);
    COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT.forEach(e => {
      this.wastedReduction[e] = 0;
      this.effectiveReduction[e] = 0;
    });
  }

  on_byPlayer_cast(event) {
    if (!event.classResources || 
        !event.classResources.filter(e => e.type !== RESOURCE_TYPES.RAGE.id) || 
        !event.classResources.find(e => e.type === RESOURCE_TYPES.RAGE.id).cost) {
      return;
    }

    const rageSpend = event.classResources.find(e => e.type === RESOURCE_TYPES.RAGE.id).cost / RAGE_NEEDED_FOR_A_PROC;
    const reduction = rageSpend / RAGE_NEEDED_FOR_A_PROC * CDR_PER_PROC;
    COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT.forEach(e => {
      if (!this.spellUsable.isOnCooldown(e)) {
        this.wastedReduction[e] += reduction;
      } else {
        const effectiveReduction = this.spellUsable.reduceCooldown(e, reduction);
        this.effectiveReduction[e] += effectiveReduction;
        this.wastedReduction[e] += reduction - effectiveReduction;
      }
    });
    this.totalRageSpend += rageSpend;
  }

  get tooltip() {
    return COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT.reduce((a, e) => {
      return `${a}${SPELLS[e].name}: ${formatDuration(this.effectiveReduction[e] / 1000)} reduction (${formatDuration(this.wastedReduction[e] / 1000)} wasted)<br>`;
    }, '');
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ANGER_MANAGEMENT_TALENT.id} />}
        value={`${formatDuration((this.effectiveReduction[SPELLS.DEMORALIZING_SHOUT.id] + this.wastedReduction[SPELLS.DEMORALIZING_SHOUT.id]) / 1000)} min`}
        label="Possible cooldown reduction"
        tooltip={this.tooltip}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default AngerManagement;
