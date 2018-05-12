import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT = [
  SPELLS.DEMORALIZING_SHOUT.id,
  SPELLS.BATTLE_CRY.id,
  SPELLS.LAST_STAND.id,
  SPELLS.SHIELD_WALL.id,
];

class AngerManagement extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  totalRageSpend = 0;
  wastedReduction = { };
  effectiveReduction = { };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.ANGER_MANAGEMENT_TALENT.id);
    COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT.forEach(e => {
      this.wastedReduction[e] = 0;
      this.effectiveReduction[e] = 0;
    });
  }

  on_byPlayer_cast(event) {
    if (event.classResources[0].type === RESOURCE_TYPES.RAGE.id && event.classResources[0].cost) {
      const rageSpend = event.classResources[0].cost / 10;
      const reduction = rageSpend / 10 * 1000;
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
  }

  get tooltip() {
    let returnString = "";

    COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT.forEach(e => {
      returnString += `${ SPELLS[e].name }: ${ formatDuration(this.effectiveReduction[e] / 1000) } reduction (${ formatDuration(this.wastedReduction[e] / 1000) } wasted)<br>`;
    });

    return returnString;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ANGER_MANAGEMENT_TALENT.id} />}
        value={`${formatDuration((this.effectiveReduction[SPELLS.DEMORALIZING_SHOUT.id] + this.wastedReduction[SPELLS.DEMORALIZING_SHOUT.id]) / 1000)} min`}
        label={`possible cooldown reduction`}
        tooltip={`${this.tooltip}`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default AngerManagement;
