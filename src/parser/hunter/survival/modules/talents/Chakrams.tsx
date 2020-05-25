import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { CastEvent, DamageEvent } from 'parser/core/Events';

/**
 * Throw a pair of chakrams at your target, slicing all enemies in the chakrams' path for (40% of Attack power) Physical damage. The chakrams will return to you, damaging enemies again.
 *
 * Example log: https://www.warcraftlogs.com/reports/hYwpkJ41FG7cazWA#fight=3&type=damage-done
 */

const CHAKRAM_TYPES = [
  SPELLS.CHAKRAMS_TO_MAINTARGET.id,
  SPELLS.CHAKRAMS_BACK_FROM_MAINTARGET.id,
  SPELLS.CHAKRAMS_NOT_MAINTARGET.id,
];

class Chakrams extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  casts = 0;
  targetsHit = 0;
  uniqueTargets: string[] = [];

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CHAKRAMS_TALENT.id);
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CHAKRAMS_TALENT.id) {
      return;
    }
    this.uniqueTargets = [];
    this.casts += 1;
  }

  on_byPlayer_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (!CHAKRAM_TYPES.includes(spellId)) {
      return;
    }
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(SPELLS.CHAKRAMS_TALENT.id, {
        timestamp: this.owner.fight.start_time,
      });
    }
    const damageTarget: string = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.uniqueTargets.includes(damageTarget)) {
      this.targetsHit += 1;
      this.uniqueTargets.push(damageTarget);
    }
  }

  get averageTargetsHit() {
    return (this.targetsHit / this.casts).toFixed(2);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(21)}
        size="flexible"
        category={'TALENTS'}
      >
        <BoringSpellValueText spell={SPELLS.CHAKRAMS_TALENT}>
          <>
            {this.averageTargetsHit} <small>Average targets hit</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Chakrams;
