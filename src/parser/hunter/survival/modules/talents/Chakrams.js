import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';

/**
 * Throw a pair of chakrams at your target, slicing all enemies in the chakrams' path for (40% of Attack power) Physical damage. The chakrams will return to you, damaging enemies again.
 *
 * Example log: https://www.warcraftlogs.com/reports/XmxJf2w8NpYvPR3H#fight=9&type=damage-done
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
      <TalentStatisticBox
        talent={SPELLS.CHAKRAMS_TALENT.id}
        position={STATISTIC_ORDER.CORE(21)}
        value={`${this.averageTargetsHit}`}
        label="Average targets hit"
      />
    );
  }
}

export default Chakrams;
