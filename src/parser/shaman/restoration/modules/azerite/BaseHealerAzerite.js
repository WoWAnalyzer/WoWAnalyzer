import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import Analyzer from 'parser/core/Analyzer';

import React from 'react';

import ItemHealingDone from 'interface/others/ItemHealingDone';
import StatisticWrapper from 'interface/others/StatisticWrapper';
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

    this.hasTrait = this.selectedCombatant.hasTrait(this.constructor.TRAIT);
    const ranks = this.selectedCombatant.traitRanks(this.constructor.TRAIT) || [];
    const healingPerTrait = ranks.map((rank) => calculateAzeriteEffects(this.constructor.TRAIT, rank)[0]);
    const totalHealingPotential = healingPerTrait.reduce((total, bonus) => total + bonus, 0);

    this.azerite = ranks.map((rank, index) => {
      return this.trait((healingPerTrait[index] / totalHealingPotential), healingPerTrait[index], rank);
    });
    // as we can't find out which azerite piece a trait belongs to, might as well sort it by itemlevel
    this.azerite.sort((a, b) => a.itemlevel - b.itemlevel);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if(spellId !== this.constructor.HEAL) {
      return;
    }

    this.processHealing(event);
  }

  processHealing(event, traitComponent = undefined) {
    let heal = event.amount + (event.absorbed || 0);
    let overheal = (event.overheal || 0);

    // Override the healing with the part which the trait contributed,
    // as some traits are baked into a different spell
    if(traitComponent) {
      const raw = heal + overheal;
      const relativeHealingFactor = 1 + traitComponent;
      const relativeHealing = raw - raw / relativeHealingFactor;
      heal = Math.max(0,relativeHealing - overheal);
      overheal = Math.max(0,relativeHealing - heal);
    }

    // https://github.com/WoWAnalyzer/WoWAnalyzer/issues/2009#issuecomment-412253156
    // Iterating through the traits, always in the same order
    // This way its easier to see if stacking them was a bad idea or if it didn't matter.
    const healPerTrait = this.azerite.map((trait) => (heal + overheal) * trait.healingFactor);
    for (const [index, trait] of Object.entries(this.azerite)) {
      const healingValue = Math.max(0,healPerTrait[index] - overheal);
      const overhealingValue = Math.max(0,healPerTrait[index] - healingValue);
      trait.healing += healingValue;
      trait.overhealing += overhealingValue;
      heal -= healingValue;
      overheal -= overhealingValue;
    }
  }

  get totalHealing() {
    return this.azerite.reduce((total, trait) => total + trait.healing, 0);
  }

  statistic() {
    const nth = (number) => ["st","nd","rd"][((number+90)%100-10)%10-1]||"th";
    const numTraits = this.azerite.length;

    if (!this.disableStatistic) {
      return (
        <StatisticWrapper position={STATISTIC_ORDER.CORE()} category={STATISTIC_CATEGORY.AZERITE_POWERS}>
          <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12">
            <div className="panel items" style={{ borderTop: '1px solid #e45a5a' }}>
              <div className="panel-heading">
                <h2>
                  <SpellLink id={this.constructor.TRAIT} />
                </h2>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <div className="flex" style={{ borderBottom: '1px solid #e45a5a', fontWeight: 'bold', fontSize: '14px', borderRadius: '5px', padding: '6px 22px 5px' }}>
                  <div className="flex-main">
                    {`Total Healing`}
                  </div>
                  <div className="flex-sub text-right">
                    <ItemHealingDone amount={this.totalHealing} />
                  </div>
                </div>
                <table className="data-table compact" style={{ textAlign: 'center' }}>
                  <thead>
                    <tr>
                      {numTraits > 1 && (<th style={{ width: '25%', textAlign: 'center' }}><b>Trait</b></th>)}
                      <th style={{ width: '25%', textAlign: 'center' }}><b>ilvl</b></th>
                      <th style={{ width: '25%', textAlign: 'center' }}><b>Healing</b></th>
                      <th style={{ width: '25%', textAlign: 'center' }}><b>Overhealing</b></th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.azerite.map((trait, index) => {
                      return (
                        <tr key={index}>
                          {numTraits > 1 && (<td>{index + 1}{nth(index + 1)}</td>)}
                          <td>{trait.itemlevel}</td>
                          <td>{formatNumber(trait.healing)}</td>
                          <td>{formatPercentage(trait.overhealing / (trait.healing + trait.overhealing))}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </StatisticWrapper>
      );
    } else {
      return null;
    }
  }
}

export default BaseHealerAzerite;
