import React from 'react';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatisticGroup from 'interface/statistics/StatisticGroup';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import { TooltipElement } from 'common/Tooltip';

const DH_BUFF = 1.05;


// Null Dynamo --- Tank essence, minor absorbs magic damage, major is
// on-use (on-gcd ANGERY) magic absorb. R3 grants damage based on
// absorbed amount.
//
// R2 Minor: https://www.warcraftlogs.com/reports/MfTWJ38BA1XmQdCq/#fight=59&source=25
// R3 Major: https://www.warcraftlogs.com/reports/j2LCk4gxBMVDHKnJ/#fight=1&source=11
export default class NullDynamo extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    at: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.NULL_DYNAMO.traitId);
    if (!this.active) {
      return;
    }

    const rank = this.selectedCombatant.essenceRank(SPELLS.NULL_DYNAMO.traitId);

    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.NULL_DYNAMO.traitId);
    if(this.hasMajor) {
      this.abilities.add({
        spell: SPELLS.NULL_DYNAMO,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: (rank === 1) ? 180 : 135,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          },
      });

      this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.NULL_DYNAMO), this._majorShield);
    }

    if (rank === 3) {
      this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.NULL_DYNAMO_DAMAGE), this._minorDamage);
    }

    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.NULL_DYNAMO_SHIELD_MINOR), this._minorShield);
  }

  _totalDamage = 0;
  _totalMinorAbsorbs = 0;
  _totalMajorAbsorbs = 0;

  _hypotheticalMinorDamage = 0;
  _hypotheticalMajorDamage = 0;

  _minorDamage(event) {
    this._totalDamage += event.amount + (event.absorbed || 0);
  }

  _minorShield(event) {
    this._totalMinorAbsorbs += event.amount;
    this._hypotheticalMinorDamage += DH_BUFF * event.amount;
  }

  _majorShield(event) {
    this._totalMajorAbsorbs += event.amount;
    this._hypotheticalMajorDamage += DH_BUFF * event.amount;
  }

  get _hypotheticalDamage() {
    return this._hypotheticalMajorDamage + this._hypotheticalMinorDamage;
  }

  // fraction of damage to attribute to major
  get _damageSplit() {
    return this._totalMajorAbsorbs / (this._totalMinorAbsorbs + this._totalMajorAbsorbs);
  }

  statistic() {
    const rank = this.selectedCombatant.essenceRank(SPELLS.NULL_DYNAMO.traitId);

    if (rank === 3 && Math.abs((this._totalDamage - this._hypotheticalDamage) / this._totalDamage) > 0.05) {
      // more than 5% error on hypothetical damage, warn
      this.warn("Null Dynamo damage estimate is way off", this._totalDamage, this._hypotheticalDamage);
    }

    let minorDamage;
    let majorDamage;
    if (rank === 3) {
      minorDamage = <ItemDamageDone amount={this._totalDamage * (1 - this._damageSplit)} />;
      majorDamage = <ItemDamageDone amount={this._totalDamage * this._damageSplit} />;
    } else {
      minorDamage = (
        <>
          <TooltipElement content={"No actual damage done. This estimates the amount it would deal at Rank 3."}>
            <ItemDamageDone amount={this._hypotheticalMinorDamage} />
          </TooltipElement>
        </>
      );

      majorDamage = (
        <>
          <TooltipElement content={"No actual damage done. This estimates the amount it would deal at Rank 3."}>
            <ItemDamageDone amount={this._hypotheticalMajorDamage} />
          </TooltipElement>
        </>
      );
    }

    return (
      <StatisticGroup category={STATISTIC_CATEGORY.ITEMS}>
        <ItemStatistic ultrawide>
          <div className="pad">
            <label><SpellLink id={SPELLS.NULL_DYNAMO.id} /> - Minor Rank {rank}</label>
            <div className="value">
              <ItemHealingDone amount={this._totalMinorAbsorbs} /><br />
              {minorDamage}
            </div>
          </div>
        </ItemStatistic>
        {this.hasMajor && (
          <ItemStatistic ultrawide>
            <div className="pad">
              <label><SpellLink id={SPELLS.NULL_DYNAMO.id} /> - Major Rank {rank}</label>
              <div className="value">
                <ItemHealingDone amount={this._totalMajorAbsorbs} /><br />
                {majorDamage}
              </div>
            </div>
          </ItemStatistic>
        )}
      </StatisticGroup>
    );
  }
}
