import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

/**
 * Throw a pair of chakrams at your target, slicing all enemies in the
 * chakrams' path for (40% of Attack power) Physical damage. The
 * chakrams will return to you, damaging enemies again.
 */

const CHAKRAMS = [
  SPELLS.CHAKRAMS_TO_MAINTARGET.id,
  SPELLS.CHAKRAMS_BACK_FROM_MAINTARGET.id,
  SPELLS.CHAKRAMS_NOT_MAINTARGET.id,
];

class Chakrams extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  casts = 0;
  targetsHit = 0;
  uniqueTargets = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CHAKRAMS_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CHAKRAMS_TALENT.id) {
      return;
    }
    this.uniqueTargets = [];
    this.casts++;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!CHAKRAMS.includes(spellId)) {
      return;
    }
    if (this.casts === 0) {
      this.casts++;
      this.spellUsable.beginCooldown(SPELLS.CHAKRAMS_TALENT.id, this.owner.fight.start_time);
    }
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.uniqueTargets.includes(damageTarget)) {
      this.targetsHit++;
      this.uniqueTargets.push(damageTarget);
    }
  }

  get averageTargetsHit() {
    return (this.targetsHit / this.casts).toFixed(2);
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CHAKRAMS_TALENT.id} />}
        value={`${this.averageTargetsHit}`}
        label="Average targets hit"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default Chakrams;
