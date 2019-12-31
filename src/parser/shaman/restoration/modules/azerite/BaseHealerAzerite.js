import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage, formatNth } from 'common/format';
import SpellLink from 'common/SpellLink';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import React from 'react';

import ItemHealingDone from 'interface/ItemHealingDone';
import Statistic from 'interface/statistics/Statistic';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

/**
 * A class to deal with (hopefully) any healing Azerite i throw at it.
 * Extend and overwrite the static properties.
 */

class BaseHealerAzerite extends Analyzer {
  static TRAIT;
  static HEAL;

  hasTrait;
  azerite = [];

  trait = (factor, raw, ilvl) => ({
    healing: 0,
    overhealing: 0,
    healingFactor: factor,
    rawHealing: raw,
    itemlevel: ilvl,
  });

  constructor(...args) {
    super(...args);
    this.active = !!this.constructor.TRAIT;
    if (!this.active) {
      return;
    }

    this.hasTrait = this.selectedCombatant.hasTrait(this.constructor.TRAIT.id);
    const ranks = this.selectedCombatant.traitRanks(this.constructor.TRAIT.id) || [];
    const healingPerTrait = ranks.map((rank) => calculateAzeriteEffects(this.constructor.TRAIT.id, rank)[0]);
    const totalHealingPotential = healingPerTrait.reduce((total, bonus) => total + bonus, 0);

    this.azerite = ranks.map((rank, index) => {
      return this.trait((healingPerTrait[index] / totalHealingPotential), healingPerTrait[index], rank);
    });
    // as we can't find out which azerite piece a trait belongs to, might as well sort it by itemlevel
    this.azerite.sort((a, b) => a.itemlevel - b.itemlevel);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(this.constructor.HEAL), this._processHealing);
  }

  _processHealing(event, traitComponent = undefined) {
    let heal = event.amount + (event.absorbed || 0);
    let overheal = (event.overheal || 0);

    // Override the healing with the part which the trait contributed,
    // as some traits are baked into a different spell
    if (traitComponent) {
      const raw = heal + overheal;
      const relativeHealingFactor = 1 + traitComponent;
      const relativeHealing = raw - raw / relativeHealingFactor;
      heal = Math.max(0, relativeHealing - overheal);
      overheal = Math.max(0, relativeHealing - heal);
    }

    // https://github.com/WoWAnalyzer/WoWAnalyzer/issues/2009#issuecomment-412253156
    // Iterating through the traits, always in the same order
    // This way its easier to see if stacking them was a bad idea or if it didn't matter.
    const healPerTrait = this.azerite.map((trait) => (heal + overheal) * trait.healingFactor);
    for (const [index, trait] of Object.entries(this.azerite)) {
      const healingValue = Math.max(0, healPerTrait[index] - overheal);
      const overhealingValue = Math.max(0, healPerTrait[index] - healingValue);
      trait.healing += healingValue;
      trait.overhealing += overhealingValue;
      heal -= healingValue;
      overheal -= overhealingValue;
    }
  }

  get totalHealing() {
    return this.azerite.reduce((total, trait) => total + trait.healing, 0);
  }

  moreInformation = null;
  statistic() {
    const numTraits = this.azerite.length;

    if (!this.disableStatistic) {
      return (
        <Statistic
          size="flexible"
          position={STATISTIC_ORDER.CORE()}
          category={STATISTIC_CATEGORY.ITEMS}
          tooltip={this.moreInformation}
        >
          <>
            <h4 style={{ textAlign: 'center' }}>
              <SpellLink id={this.constructor.TRAIT.id} />
            </h4>
            <div className="flex" style={{ borderBottom: '1px solid #fab700', fontWeight: 'bold', fontSize: '14px', padding: '6px 22px 5px' }}>
              <div className="flex-main">
                Total
              </div>
              <div className="flex-sub text-right">
                <ItemHealingDone amount={this.totalHealing} />
              </div>
            </div>
            <table className="data-table compact" style={{ textAlign: 'center', marginBottom: 0 }}>
              <thead>
                <tr>
                  {numTraits > 1 && (<th style={{ width: '25%', textAlign: 'center' }}><b>Trait</b></th>)}
                  <th style={{ width: '25%', textAlign: 'center' }}><b>ilvl</b></th>
                  <th style={{ width: '25%', textAlign: 'center' }}><b>Healing</b></th>
                  <th style={{ width: '25%', textAlign: 'center' }}><b>Overhealing</b></th>
                </tr>
              </thead>
              <tbody>
                {this.azerite.slice().reverse().map((trait, index) => {
                  return (
                    <tr key={index}>
                      {numTraits > 1 && (<td>{formatNth(index + 1)}</td>)}
                      <td>{trait.itemlevel}</td>
                      <td>{formatNumber(trait.healing)}</td>
                      <td>{formatPercentage(trait.overhealing / (trait.healing + trait.overhealing))}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        </Statistic>
      );
    } else {
      return null;
    }
  }
}

export default BaseHealerAzerite;
