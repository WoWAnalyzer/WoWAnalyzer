import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import EnemyInstances, { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import { SHATTER_DEBUFFS } from '../../constants';

class GlacialSpike extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };

  lastCastEvent = null;
  lastCastDidDamage = false;
  goodCasts = 0;
  totalCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);
    this.hasSplittingIce = this.selectedCombatant.hasTalent(SPELLS.SPLITTING_ICE_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.GLACIAL_SPIKE_DAMAGE.id) {
      return;
    }

    if (this.lastCastEvent === null) {
      return;
    }

    this.lastCastDidDamage = true;

    // Check if second target was hit via Splitting Ice
    const castTarget = encodeTargetString(this.lastCastEvent.targetID, this.lastCastEvent.targetInstance);
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (castTarget !== damageTarget) {
      this.goodCasts += 1;
      this.lastCastEvent = null;
      return;
    }

    // Check if the target had a shatter effect on them
    const enemy = this.enemies.getEntity(event);
    if (enemy && SHATTER_DEBUFFS.some(effect => enemy.hasBuff(effect, event.timestamp))) {
      this.goodCasts += 1;
      this.lastCastEvent = null;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.GLACIAL_SPIKE_TALENT.id) {
      return;
    }
    this.invalidateCast();
    this.totalCasts += 1;
    this.lastCastEvent = event;
    this.lastCastDidDamage = false;
  }

  on_finished() {
    this.invalidateCast();
  }

  invalidateCast() {
    if (this.lastCastEvent === null) {
      // Cast was good!
      return;
    }

    this.lastCastEvent.meta = this.lastCastEvent.meta || {};
    this.lastCastEvent.meta.isInefficientCast = true;
    if (this.lastCastDidDamage) {
      this.lastCastEvent.meta.inefficientCastReason = `You cast Glacial Spike without shattering${this.hasSplittingIce ? ' or cleaving' : ''} it. You should wait until you are able to use a Brain Freeze proc${this.hasSplittingIce ? ' or for a second target to be in cleave range' : ''} to maximize its damage.`;
    } else {
      this.lastCastEvent.meta.inefficientCastReason = 'The target died before Glacial Spike hit it. You should avoid this by casting faster spells on very low-health targets, it is important to not waste potential Glacial Spike damage.';

    }
    this.lastCastEvent = null;
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
        minor: 1.0,
        average: 0.85,
        major: 0.7,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.utilSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <>
            You cast <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> inefficiently {this.badCasts} times. Because it is such a potent ability, it is important to maximize its damage by only casting it when at least one of the following is true:
            <ul>
              <li>You have a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc to <dfn data-tip="<i>Glacial Spike > (empowered) Flurry > Ice Lance</i><br />Because of Flurry's extremely fast travel time, using a Brain Freeze proc immediately following a slower spell like Glacial Spike will apply Winter's Chill to the target before the slower spell hits.">use on it</dfn>.</li>
              <li>The <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> will cleave to a second target via <SpellLink id={SPELLS.SPLITTING_ICE_TALENT.id} /> (if talented).</li>
            </ul>
          </>)
          .icon(SPELLS.GLACIAL_SPIKE_TALENT.icon)
          .actual(`${formatPercentage(this.utilPercentage, 1)}% utilization`)
          .recommended(`${formatPercentage(recommended, 1)}% is recommended`);
      });
  }

  statistic() {
    return (
      <TalentStatisticBox
        position={STATISTIC_ORDER.CORE(90)}
        icon={<SpellIcon id={SPELLS.GLACIAL_SPIKE_TALENT.id} />}
        value={`${formatPercentage(this.utilPercentage, 0)} %`}
        label="Glacial Spike efficiency"
        tooltip={`You cast Glacial Spike ${this.totalCasts} times, ${this.goodCasts} casts of which met at least one of the requirements:
        <ul>
          <li>It was shattered via Brain Freeze (or some other freeze effect).</li>
          <li>It hit a second target via Splitting Ice.</li>
        </ul>`}
      />
    );
  }
}

export default GlacialSpike;
