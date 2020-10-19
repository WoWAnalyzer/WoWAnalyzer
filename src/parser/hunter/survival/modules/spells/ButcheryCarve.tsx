import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import React from 'react';
import SpellLink from 'common/SpellLink';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemDamageDone from 'interface/ItemDamageDone';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';
import { BUTCHERY_CARVE_MAX_TARGETS_HIT } from 'parser/hunter/survival/constants';
import { ONE_SECOND_IN_MS } from 'parser/hunter/shared/constants';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

/**
 * Carve: A sweeping attack that strikes all enemies in front of you for Physical damage.
 * Butchery: Strike all nearby enemies in a flurry of strikes, inflicting Phsyical damage to each. Has 3 charges.
 * Both: Reduces the remaining cooldown on Wildfire Bomb by 1 sec for each target hit, up to 5.
 *
 * Example logs:
 * Carve: https://www.warcraftlogs.com/reports/dHcVrvbMX39xNAC8#fight=3&type=damage-done&source=66&ability=187708
 * Butchery: https://www.warcraftlogs.com/reports/6GjD12YkQCnJqPTz#fight=25&type=damage-done&source=19&translate=true&ability=212436
 */

class ButcheryCarve extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  reductionAtCurrentCast: number = 0;
  effectiveReductionMs: number = 0;
  wastedReductionMs: number = 0;
  targetsHit: number = 0;
  casts: number = 0;
  spellKnown: Spell = this.selectedCombatant.hasTalent(SPELLS.BUTCHERY_TALENT.id) ? SPELLS.BUTCHERY_TALENT : SPELLS.CARVE;
  damage: number = 0;
  bombSpellKnown: number = this.selectedCombatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id) ? SPELLS.WILDFIRE_INFUSION_TALENT.id : SPELLS.WILDFIRE_BOMB.id;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(this.spellKnown), this.onDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.spellKnown), this.onCast);
  }

  get avgTargetsHitThreshold() {
    return {
      actual: Number((this.targetsHit / this.casts).toFixed(1)),
      isLessThan: {
        minor: 2,
        average: 2,
        major: 2,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  onCast() {
    this.casts += 1;
    this.reductionAtCurrentCast = 0;
  }

  onDamage(event: DamageEvent) {
    this.targetsHit += 1;
    this.damage += event.amount + (event.absorbed || 0);
    if (this.reductionAtCurrentCast === BUTCHERY_CARVE_MAX_TARGETS_HIT) {
      return;
    }
    this.reductionAtCurrentCast += 1;
    if (this.spellUsable.isOnCooldown(this.bombSpellKnown)) {
      this.checkCooldown(this.bombSpellKnown);
    } else {
      this.wastedReductionMs += ONE_SECOND_IN_MS;
    }
  }

  checkCooldown(spellId: number) {
    if (this.spellUsable.cooldownRemaining(spellId) < ONE_SECOND_IN_MS) {
      const effectiveReductionMs = this.spellUsable.reduceCooldown(spellId, ONE_SECOND_IN_MS);
      this.effectiveReductionMs += effectiveReductionMs;
      this.wastedReductionMs += (ONE_SECOND_IN_MS - effectiveReductionMs);
    } else {
      this.effectiveReductionMs += this.spellUsable.reduceCooldown(spellId, ONE_SECOND_IN_MS);
    }
  }

  suggestions(when: When) {
    if (this.casts > 0) {
      //Since you're not casting Butchery or Carve on single-target, there's no reason to show the suggestions in cases where the abilities were cast 0 times.
      when(this.avgTargetsHitThreshold).addSuggestion((suggest, actual, recommended) => suggest(<>You should aim to hit as many targets as possible with <SpellLink id={this.spellKnown.id} />. Using it on single-target is not recommended.</>)
          .icon(this.spellKnown.icon)
          .actual(i18n._(t('hunter.survival.suggestions.butcheryCarve.averageTargets')`${actual} average targets hit per cast`))
          .recommended(`>${recommended} is recommended`));
    }
  }

  statistic() {
    if (this.casts > 0) {
      //Since you're not casting Butchery or Carve on single-target, there's no reason to show the statistics in cases where the abilities were cast 0 times.
      return (
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL(5)}
          size="flexible"
        >
          <BoringSpellValueText spell={this.spellKnown}>
            <>
              <ItemDamageDone amount={this.damage} />
              <br />
              <AverageTargetsHit casts={this.casts} hits={this.targetsHit} />
            </>
          </BoringSpellValueText>
        </Statistic>
      );
    }
    return null;
  }
}

export default ButcheryCarve;
