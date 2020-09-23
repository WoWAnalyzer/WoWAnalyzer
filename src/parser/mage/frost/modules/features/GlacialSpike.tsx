import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, FightEndEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { TooltipElement } from 'common/Tooltip';
import EnemyInstances, { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import { SHATTER_DEBUFFS } from '../../constants';

class GlacialSpike extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };
  protected enemies!: EnemyInstances;

  hasSplittingIce: boolean;
  lastCastEvent?: CastEvent;

  lastCastDidDamage = false;
  goodCasts = 0;
  totalCasts = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id) && this.owner.build === undefined;
    this.hasSplittingIce = this.selectedCombatant.hasTalent(SPELLS.SPLITTING_ICE_TALENT.id);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.GLACIAL_SPIKE_TALENT), this.onGlacialSpikeCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GLACIAL_SPIKE_DAMAGE), this.onGlacialSpikeDamage);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onGlacialSpikeCast(event: CastEvent) {
    if (this.lastCastEvent) {
      this.flagTimeline(this.lastCastEvent);
    }

    this.totalCasts += 1;
    this.lastCastEvent = event;
    this.lastCastDidDamage = false;
  }

  onGlacialSpikeDamage(event: DamageEvent) {
    if (!this.lastCastEvent) {
      return;
    }

    this.lastCastDidDamage = true;

    // Check if second target was hit via Splitting Ice
    const castTarget = encodeTargetString(this.lastCastEvent.targetID, this.lastCastEvent.targetInstance);
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (castTarget !== damageTarget) {
      this.goodCasts += 1;
      this.lastCastEvent = undefined;
      return;
    }

    // Check if the target had a shatter effect on them
    const enemy: any = this.enemies.getEntity(event);
    if (enemy && SHATTER_DEBUFFS.some(effect => enemy.hasBuff(effect.id, event.timestamp))) {
      this.goodCasts += 1;
      this.lastCastEvent = undefined;
    }
  }

  onFightEnd(events: FightEndEvent) {
    if (this.lastCastEvent) {
      this.flagTimeline(this.lastCastEvent);
    }
  }

  flagTimeline(event: CastEvent) {
    if (!this.lastCastEvent) {
      return;
    }

    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    if (this.lastCastDidDamage) {
      event.meta.inefficientCastReason = `You cast Glacial Spike without shattering${this.hasSplittingIce ? ' or cleaving' : ''} it. You should wait until you are able to use a Brain Freeze proc${this.hasSplittingIce ? ' or for a second target to be in cleave range' : ''} to maximize its damage.`;
    } else {
      event.meta.inefficientCastReason = 'The target died before Glacial Spike hit it. You should avoid this by casting faster spells on very low-health targets, it is important to not waste potential Glacial Spike damage.';
    }
    this.lastCastEvent = undefined;
  }

  get utilPercentage() {
    return (this.goodCasts / this.totalCasts) || 0;
  }

  get badCasts() {
    return this.totalCasts - this.goodCasts;
  }

  get glacialSpikeUtilizationThresholds() {
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

  suggestions(when: any) {
    when(this.glacialSpikeUtilizationThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(
          <>
            You cast <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> inefficiently {this.badCasts} times. Because it is such a potent ability, it is important to maximize its damage by only casting it when at least one of the following is true:
            <ul>
              <li>
                You have a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc to &nbsp;
                <TooltipElement
                  content={(
                    <>
                      <em>Glacial Spike {'>'} (empowered) Flurry {'>'} Ice Lance</em><br />
                      Because of Flurry's extremely fast travel time, using a Brain Freeze proc immediately following a slower spell like Glacial Spike will apply Winter's Chill to the target before the slower spell hits.
                    </>
                  )}
                >
                  use on it
                </TooltipElement>.
              </li>
              <li>The <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> will cleave to a second target via <SpellLink id={SPELLS.SPLITTING_ICE_TALENT.id} /> (if talented).</li>
            </ul>
          </>)
          .icon(SPELLS.GLACIAL_SPIKE_TALENT.icon)
          .actual(`${formatPercentage(actual, 1)}% utilization`)
          .recommended(`${formatPercentage(recommended, 1)}% is recommended`);
      });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={(
          <>
            You cast Glacial Spike {this.totalCasts} times, {this.goodCasts} casts of which met at least one of the requirements:
            <ul>
              <li>It was shattered via Brain Freeze (or some other freeze effect).</li>
              <li>It hit a second target via Splitting Ice.</li>
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.GLACIAL_SPIKE_TALENT}>
        {`${formatPercentage(this.utilPercentage, 0)}%`} <small>Cast utilization</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GlacialSpike;
