import React from 'react';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatisticGroup from 'interface/statistics/StatisticGroup';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import ItemHealingDone from 'interface/others/ItemHealingDone';

//https://www.warcraftlogs.com/reports/JqZNnckx9PpFwKj7#fight=2&type=damage-done&source=9  Deathsbladé  All other tests
//https://www.warcraftlogs.com/reports/JqZNnckx9PpFwKj7#fight=2&type=damage-done&source=7  Kittiepryde Major Heal test
class TheCrucibleofFlame extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.ANCIENT_FLAME.traitId);
    if (!this.active) {
      return;
    }
    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.ANCIENT_FLAME.traitId);
    if(this.hasMajor) {
      this.abilities.add({
        spell: SPELLS.CONCENTRATED_FLAME_CAST,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          },
      });
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CONCENTRATED_FLAME_CAST_DAMAGE), this.onMajorCastDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CONCENTRATED_FLAME_DOT_DAMAGE), this.onMajorDOTDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CONCENTRATED_FLAME_CAST_DAMAGE), this.onMajorHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ANCIENT_FLAME_DOT_DAMAGE), this.onMinorDotamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ANCIENT_FLAME_DOT_HEAL), this.onMinorDotHeal);
  }
  majorCastDamage = 0;
  majorCastHeal = 0;
  majorDotDamage = 0;
  minorDotHeal = 0;
  minorDotDamage = 0;

  onMajorCastDamage(event) {
    this.majorCastDamage += event.amount;
  }

  onMajorDOTDamage(event) {
    this.majorDotDamage += event.amount;
  }

  onMajorHeal(event) {
    this.majorCastHeal += event.amount;
  }

  onMinorDotamage(event) {
    this.minorDotDamage += event.amount;
  }

  onMinorDotHeal(event) {
    this.minorDotHeal += event.amount;
  }


  statistic() {
    const rank = this.selectedCombatant.essenceRank(SPELLS.ANCIENT_FLAME.traitId);
    const TOTALMAJORDAMAGE = this.majorDotDamage + this.majorCastDamage;
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.ITEMS}>
        <ItemStatistic ultrawide>
          <div className="pad">
            <label><SpellLink id={SPELLS.ANCIENT_FLAME.id} /> - Minor Rank {rank}</label>
            <div className="value">
              <ItemDamageDone amount={this.minorDotDamage} /><br />
              <ItemHealingDone amount={this.minorDotHeal} />
            </div>
          </div>
        </ItemStatistic>
        {this.hasMajor && (
          <ItemStatistic ultrawide>
            <div className="pad">
              <label><SpellLink id={SPELLS.CONCENTRATED_FLAME.id} /> - Major Rank {rank}</label>
              <div className="value">
                <ItemDamageDone amount={TOTALMAJORDAMAGE} /><br />
                <ItemHealingDone amount={this.majorCastHeal} />
              </div>
            </div>
          </ItemStatistic>
        )}
      </StatisticGroup>
    );
  }
}

export default TheCrucibleofFlame;
