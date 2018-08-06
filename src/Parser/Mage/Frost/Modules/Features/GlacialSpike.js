import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import EnemyInstances, { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class GlacialSpike extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);
    this.hasEbonbolt = this.selectedCombatant.hasTalent(SPELLS.EBONBOLT_TALENT.id);
  }

  badCasts = 0

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.GLACIAL_SPIKE_DAMAGE.id) {
      return;
    }

    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    
    if (this.castTarget === damageTarget && !enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      this.badCasts += 1;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.GLACIAL_SPIKE_TALENT.id) {
      return;
    }
    
    if(event.targetID) {
      this.castTarget = encodeTargetString(event.targetID, event.targetInstance);
    }
  }

  get utilPercentage() {
    return 1 - (this.badCasts / this.abilityTracker.getAbility(SPELLS.GLACIAL_SPIKE_TALENT.id).casts) || 0;
  }

  get utilSuggestionThresholds() {
    return {
      actual: this.utilPercentage,
      isLessThan: {
        minor: 1,
        average: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.utilSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> {this.badCasts} times without <SpellLink id={SPELLS.WINTERS_CHILL.id} /> on the target. In order to accomplish this, do not cast Glacial Spike until you have a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc to use immediately after. If you are consistently spending a long time fishing for a Brain Freeze Proc, {this.hasEbonbolt ? 'then hold Ebonbolt to generate a proc when you need it.' : 'then consider taking Ebonbolt and not casting it unless you need a Brain Freeze Proc for Glacial Spike.'}</React.Fragment>)
          .icon(SPELLS.GLACIAL_SPIKE_TALENT.icon)
          .actual(`${formatPercentage(this.utilPercentage, 1)}% utilization`)
          .recommended(`${formatPercentage(recommended, 1)}% is recommended`);
      });
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GLACIAL_SPIKE_TALENT.id} />}
        value={`${formatPercentage(this.utilPercentage, 0)} %`}
        label="Glacial Spike Utilization"
        tooltip="This is the percentage of Glacial Spike casts that landed while the target had Winter's Chill. Ensure that you are holding Glacial Spike until you have a Brain Freeze proc to use immediately after casting Glacial Spike."
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default GlacialSpike;
