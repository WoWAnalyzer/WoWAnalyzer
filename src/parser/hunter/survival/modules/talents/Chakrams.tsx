import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';

/**
 * Throw a pair of chakrams at your target, slicing all enemies in the chakrams' path for (40% of Attack power) Physical damage. The chakrams will return to you, damaging enemies again.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/VGNkQ6BFbcdPvMDX#fight=20&type=damage-done&source=169&ability=-259391
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
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHAKRAMS_TALENT), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(CHAKRAM_TYPES), this.onDamage);
  }

  onCast() {
    this.uniqueTargets = [];
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(SPELLS.CHAKRAMS_TALENT.id, event);
    }
    const damageTarget: string = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.uniqueTargets.includes(damageTarget)) {
      this.targetsHit += 1;
      this.uniqueTargets.push(damageTarget);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(21)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.CHAKRAMS_TALENT}>
          <>
            <AverageTargetsHit casts={this.casts} hits={this.targetsHit} unique />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Chakrams;
