import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { CastEvent, DamageEvent, FightEndEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { TooltipElement } from 'common/Tooltip';
import EnemyInstances, { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import { SHATTER_DEBUFFS } from '../../constants';

class GlacialSpike extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
    abilityTracker: AbilityTracker,
  };
  protected enemies!: EnemyInstances;
  protected abilityTracker!: AbilityTracker;

  lastCastEvent?: CastEvent;

  lastCastDidDamage = false;
  spikeShattered = 0;
  spikeNotShattered = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.GLACIAL_SPIKE_TALENT), this.onGlacialSpikeCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GLACIAL_SPIKE_DAMAGE), this.onGlacialSpikeDamage);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onGlacialSpikeCast(event: CastEvent) {
    if (this.lastCastEvent) {
      this.flagTimeline(this.lastCastEvent);
    }

    this.lastCastEvent = event;
    this.lastCastDidDamage = false;
  }

  onGlacialSpikeDamage(event: DamageEvent) {
    if (!this.lastCastEvent) {
      return;
    }

    const castTarget = encodeTargetString(this.lastCastEvent.targetID, this.lastCastEvent.targetInstance);
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);

    //We dont care about the Glacial Spikes that split to something else via Splitting Ice.
    if (castTarget !== damageTarget) {
      return;
    }

    this.lastCastDidDamage = true;
    const enemy: any = this.enemies.getEntity(event);
    if (enemy && SHATTER_DEBUFFS.some(effect => enemy.hasBuff(effect.id, event.timestamp))) {
      this.spikeShattered += 1;
    } else {
      this.spikeNotShattered += 1;
      this.flagTimeline(this.lastCastEvent);
    }
    this.lastCastEvent = undefined;
  }

  onFightEnd(event: FightEndEvent) {
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
      event.meta.inefficientCastReason = `You cast Glacial Spike without shattering it. You should wait until it is frozen or you are able to use a Brain Freeze proc to maximize its damage.`;
    } else {
      event.meta.inefficientCastReason = 'The target died before Glacial Spike hit it. You should avoid this by casting faster spells on very low-health targets, it is important to not waste potential Glacial Spike damage.';
    }
  }

  get utilPercentage() {
    return (this.spikeShattered / this.totalCasts) || 0;
  }

  get totalCasts() {
    return this.abilityTracker.getAbility(SPELLS.GLACIAL_SPIKE_TALENT.id).casts;
  }

  get glacialSpikeUtilizationThresholds() {
    return {
      actual: this.utilPercentage,
      isLessThan: {
        minor: 1.0,
        average: 0.85,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.glacialSpikeUtilizationThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(
          <>
            You cast <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> without <SpellLink id={SPELLS.SHATTER.id} />ing it {this.spikeNotShattered} times. Because it is such a potent ability, it is important to maximize it's damage by only casting it if the target is
            <TooltipElement
              content={(<>Winter's Chill, Frost Nova, Ice Nova, Ring of Frost, and your pet's Freeze will all cause the target to be frozen or act as frozen.</>)}
            >
            Frozen or acting as Frozen
            </TooltipElement>.
          </>)
          .icon(SPELLS.GLACIAL_SPIKE_TALENT.icon)
          .actual(i18n._(t('mage.frost.suggestions.glacialSpike.castsWithoutShatter')`${formatPercentage(actual, 1)}% utilization`))
          .recommended(`${formatPercentage(recommended, 1)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={(<>You cast Glacial Spike {this.totalCasts} times, {this.spikeShattered} casts of which were Shattered</>)}
      >
        <BoringSpellValueText spell={SPELLS.GLACIAL_SPIKE_TALENT}>
        {`${formatPercentage(this.utilPercentage, 0)}%`} <small>Cast utilization</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GlacialSpike;
