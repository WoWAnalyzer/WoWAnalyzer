import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { calculatePrimaryStat } from 'common/stats';
import SpellLink from 'common/SpellLink';

import StatIcon from 'interface/icons/PrimaryStat';
import ItemHealingDone from 'interface/ItemHealingDone';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatisticGroup from 'interface/statistics/StatisticGroup';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatNumber } from 'common/format';

/*
  Log: https://wowanalyzer.com/report/3P4aWXkxqBMGTZjn/4-Mythic++Freehold+-+Kill+(27:29)/Admisw/standard/statistics
  this is a m+ log so it will take some time to load
  Note: This implementation only supports Lucid Dreams for rage users
 */
class LucidDreamsRage extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
  };

  rageGenerated = 0;
  rageWasted = 0;
  versGain = 0;
  leechGain = 0;
  healing = 0;
  rageRestored = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.LUCID_DREAMS.traitId);
    if (!this.active) {
      return;
    }
    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.LUCID_DREAMS.traitId);

    if (this.selectedCombatant.essenceRank(SPELLS.LUCID_DREAMS.traitId) > 2) {
      this.versGain = calculatePrimaryStat(455, 367, this.selectedCombatant.neck.itemLevel);
      this.leechGain = calculatePrimaryStat(455, 862, this.selectedCombatant.neck.itemLevel);
    }

    if (this.hasMajor) {
      this.abilities.add({
        spell: SPELLS.LUCID_DREAMS_MAJOR,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
      });
    }

    this.statTracker.add(SPELLS.LUCID_DREAMS_MINOR_STAT_BUFF.id, {
      versatility: this.versGain,
    });
    this.statTracker.add(SPELLS.LUCID_DREAMS_MAJOR.id, {
      leech: this.leechGain,
    });

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LUCID_DREAMS_HEAL), this._onHeal);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.LUCID_DREAMS_MINOR_RESOURCE_REFUND_RAGE), this._onResourceRefund);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER), this._majorRage);
  }

  _onHeal(event) {
      this.healing += event.amount + (event.absorbed || 0);
  }

  _onResourceRefund(event) {
    this.rageRestored += event.resourceChange;
  }

  _majorRage(event){
    if(this.selectedCombatant.hasBuff(SPELLS.LUCID_DREAMS_MAJOR.id)){
      const totalGained = (event.resourceChange || 0) + (event.waste || 0);
      if((totalGained/2) < event.waste){// this is what is generated and wasted
        this.rageWasted += totalGained/2;
      }else{
        this.rageWasted += event.waste;
      }
      this.rageGenerated += event.resourceChange;
    }
  }

  get minorBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.LUCID_DREAMS_MINOR_STAT_BUFF.id) / this.owner.fightDuration;
  }
  get majorBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.LUCID_DREAMS_MAJOR.id) / this.owner.fightDuration;
  }
  get manaRestoredMajor() {
    return this.rageGenerated;
  }

  statistic() {
    const rank = this.selectedCombatant.essenceRank(SPELLS.LUCID_DREAMS.traitId);
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.ITEMS}>
        <ItemStatistic ultrawide size="flexible">
          <div className="pad">
            <label><SpellLink id={SPELLS.LUCID_DREAMS.id} /> - Minor Rank {rank}</label>
            <div className="value">
              <ItemHealingDone amount={this.healing} /><br />
              Rage: {this.rageRestored}
              <br />
              {rank > 2 && (<><StatIcon stat={"versatility"} /> {formatNumber(this.minorBuffUptime * this.versGain)} <small>average versatility gained</small><br /></>)}
            </div>
          </div>
        </ItemStatistic>
        {this.hasMajor && (
          <ItemStatistic ultrawide>
            <div className="pad">
              <label><SpellLink id={SPELLS.LUCID_DREAMS.id} /> - Major Rank {rank}</label>
              <div className="value">
                 Rage: {this.manaRestoredMajor}
                 <br />
                {rank > 2 && (<><StatIcon stat={"leech"} /> {formatNumber(this.majorBuffUptime * this.leechGain)} <small>average leech gained</small><br /></>)}
              </div>
            </div>
          </ItemStatistic>
        )}
      </StatisticGroup>
    );
  }
}

export default LucidDreamsRage;
