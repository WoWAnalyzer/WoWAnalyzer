import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import React from 'react';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

/**
 * Carve: A sweeping attack that strikes all enemies in front of you for Physical damage.
 * Butchery: Strike all nearby enemies in a flurry of strikes, inflicting Phsyical damage to each. Has 3 charges.
 * Both: Reduces the remaining cooldown on Wildfire Bomb by 1 sec for each target hit, up to 5.
 */

const COOLDOWN_REDUCTION_MS = 1000;
const MAX_TARGETS_HIT = 5;

class ButcheryCarve extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  hasGT = false;
  reductionAtCurrentCast = 0;
  effectiveWFBReductionMs = 0;
  wastedWFBReductionMs = 0;
  targetsHit = 0;
  casts = 0;
  spellKnown;
  bonusDamage = 0;

  constructor(...args) {
    super(...args);
    if (this.selectedCombatant.hasTalent(SPELLS.GUERRILLA_TACTICS_TALENT.id)) {
      this.hasGT = true;
    }
    if (this.selectedCombatant.hasTalent(SPELLS.BUTCHERY_TALENT.id)) {
      this.spellKnown = SPELLS.BUTCHERY_TALENT;
    } else {
      this.spellKnown = SPELLS.CARVE;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BUTCHERY_TALENT.id && spellId !== SPELLS.CARVE.id) {
      return;
    }
    this.casts++;
    this.reductionAtCurrentCast = 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BUTCHERY_TALENT.id && spellId !== SPELLS.CARVE.id) {
      return;
    }
    this.targetsHit++;
    this.bonusDamage += event.amount + (event.absorbed || 0);
    if (this.reductionAtCurrentCast === MAX_TARGETS_HIT) {
      return;
    }
    this.reductionAtCurrentCast++;
    if (!this.spellUsable.isOnCooldown(SPELLS.WILDFIRE_BOMB.id)) {
      this.wastedWFBReductionMs += COOLDOWN_REDUCTION_MS;
      return;
    }
    const effectiveReductionMs = this.spellUsable.reduceCooldown(SPELLS.WILDFIRE_BOMB.id, COOLDOWN_REDUCTION_MS);
    this.effectiveWFBReductionMs += effectiveReductionMs;
    this.wastedWFBReductionMs += (COOLDOWN_REDUCTION_MS - effectiveReductionMs);
  }

  get averageTargetsHit() {
    return (this.targetsHit / this.casts).toFixed(2);
  }

  get avgTargetsHitThreshold() {
    return {
      actual: this.averageTargetsHit,
      isLessThan: {
        minor: 2,
        average: 2,
        major: 2,
      },
      style: 'decimal',
    };
  }

  suggestions(when) {
    if (this.casts > 0) { //Since you're not casting Butchery or Carve on single-target, there's no reason to show the suggestions in cases where the abilities were cast 0 times.
      when(this.avgTargetsHitThreshold).addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You should aim to hit as many targets as possible with <SpellLink id={this.spellKnown.id} />. Using it on single-target is not recommended.</React.Fragment>)
          .icon(this.spellKnown.icon)
          .actual(`${actual} average targets hit per cast`)
          .recommended(`>${recommended} is recommended`);
      });
    }
  }

  statistic() {
    if (this.casts > 0) {
      //Since you're not casting Butchery or Carve on single-target, there's no reason to show the statistics in cases where the abilities were cast 0 times.
      return (
        <StatisticBox
          position={STATISTIC_ORDER.CORE(16)}
          icon={<SpellIcon id={this.spellKnown.id} />}
          value={this.averageTargetsHit}
          label="Average targets hit"
        />
      );
    }
    return null;
  }

  subStatistic() {
    if (this.casts > 0) {
      //Since you're not casting Butchery or Carve on single-target, there's no reason to show the statistics in cases where the abilities were cast 0 times.
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={this.spellKnown.id} />
          </div>
          <div className="flex-sub text-right">
            <ItemDamageDone amount={this.bonusDamage} />
          </div>
        </div>
      );
    }
    return null;
  }
}

export default ButcheryCarve;
