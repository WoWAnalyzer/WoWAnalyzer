import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import EnemyInstances, { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

const DAMAGE_BUFFER = 250;

class GlacialSpike extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);
    this.hasEbonbolt = this.selectedCombatant.hasTalent(SPELLS.EBONBOLT_TALENT.id);
    this.hasSplittingIce = this.selectedCombatant.hasTalent(SPELLS.SPLITTING_ICE_TALENT.id);
  }

  goodCasts = 0;
  totalCasts = 0;
  damageTimestamp = 0;

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

    //It is considered a good use of Glacial Spike if either Glacial Spike lands into Winter's Chill (they used a Brain Freeze Proc with it) or the Glacial Spike cleaved and hit a second target.
    if (this.castTarget === damageTarget && enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      this.totalCasts += 1;
      this.goodCasts += 1;
      this.damageTimestamp = event.timestamp;
    } else if (this.hasSplittingIce && this.castTarget !== damageTarget && event.timestamp - this.damageTimestamp < DAMAGE_BUFFER) {
      this.totalCasts += 1;
      this.goodCasts += 1;
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
    return (this.goodCasts / this.totalCasts) || 0;
  }

  get badCasts() {
    return this.totalCasts - this.goodCasts;
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
        return suggest(<>You misused <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> {this.badCasts} times. In order to get the most out of Glacial Spike, you should only cast it if you have a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc to cast alongside it (Glacial Spike > Flurry > Ice Lance) {this.hasSplittingIce ? ' or if Glacial Spike will cleave to a second target (If you have Splitting Ice talented).' : ''} If you are consistently spending a long time fishing for a Brain Freeze Proc, {this.hasEbonbolt ? 'then hold Ebonbolt to generate a proc when you need it.' : 'then consider taking Ebonbolt and not casting it unless you need a Brain Freeze Proc for Glacial Spike.'}</>)
          .icon(SPELLS.GLACIAL_SPIKE_TALENT.icon)
          .actual(`${formatPercentage(this.utilPercentage, 1)}% utilization`)
          .recommended(`${formatPercentage(recommended, 1)}% is recommended`);
      });
  }
  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(90)}
        icon={<SpellIcon id={SPELLS.GLACIAL_SPIKE_TALENT.id} />}
        value={`${formatPercentage(this.utilPercentage, 0)} %`}
        label="Glacial Spike Utilization"
        tooltip={`There are two situations where it is acceptable to use your Glacial Spike
        <ul>
          <li>You have a Brain Freeze Proc (Glacial Spike > Flurry > Ice Lance)</li>
          <li>You do not have Brain Freeze, but Glacial Spike will cleave (If Splitting Ice is talented)</li>
        </ul>`}
      />
    );
  }
}

export default GlacialSpike;
