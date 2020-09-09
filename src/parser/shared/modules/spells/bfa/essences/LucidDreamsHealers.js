import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { calculatePrimaryStat } from 'common/stats';
import SpellLink from 'common/SpellLink';

import StatIcon from 'interface/icons/PrimaryStat';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemManaGained from 'interface/ItemManaGained';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatisticGroup from 'interface/statistics/StatisticGroup';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

let MANA_REGEN_PER_SECOND = 800;
const ENLIGHTENMENT_TALENT_REGEN_INCREASE = 0.1;

/*
  Log: https://www.warcraftlogs.com/reports/HkcC3qT9wKdAfWYL#fight=last&type=summary&source=21
  Note: This implementation only supports Lucid Dreams for healers which gains mana as a resource.
 */
class LucidDreamsHealers extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
  };

  manaGained = 0;
  versGain = 0;
  leechGain = 0;
  healing = 0;
  manaRestoredMinor = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.LUCID_DREAMS.traitId);
    if (!this.active) {
      return;
    }
    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.LUCID_DREAMS.traitId);
    if (this.selectedCombatant.hasTalent(SPELLS.ENLIGHTENMENT_TALENT.id)) {
      MANA_REGEN_PER_SECOND *= (1 + ENLIGHTENMENT_TALENT_REGEN_INCREASE);
    }
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
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.LUCID_DREAMS_MINOR_RESOURCE_REFUND), this._onResourceRefund);
  }

  _onHeal(event) {
      this.healing += event.amount + (event.absorbed || 0);
  }

  _onResourceRefund(event) {
    this.manaRestoredMinor += event.resourceChange;
  }

  get minorBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.LUCID_DREAMS_MINOR_STAT_BUFF.id) / this.owner.fightDuration;
  }
  get majorBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.LUCID_DREAMS_MAJOR.id) / this.owner.fightDuration;
  }
  get manaRestoredMajor() {
    return (this.selectedCombatant.getBuffUptime(SPELLS.LUCID_DREAMS_MAJOR.id) / 1000) * MANA_REGEN_PER_SECOND;
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
              <ItemManaGained amount={this.manaRestoredMinor} /><br />
              {rank > 2 && (<><StatIcon stat={"versatility"} /> {formatNumber(this.minorBuffUptime * this.versGain)} <small>average versatility gained</small><br /></>)}
            </div>
          </div>
        </ItemStatistic>
        {this.hasMajor && (
          <ItemStatistic ultrawide>
            <div className="pad">
              <label><SpellLink id={SPELLS.LUCID_DREAMS.id} /> - Major Rank {rank}</label>
              <div className="value">
                <TooltipElement content={"Does not take into account if you used Lucid Dreams while you were capped on mana."}>
                  <ItemManaGained amount={this.manaRestoredMajor} /><br />
                </TooltipElement>
                {rank > 2 && (<><StatIcon stat={"leech"} /> {formatNumber(this.majorBuffUptime * this.leechGain)} <small>average leech gained</small><br /></>)}
              </div>
            </div>
          </ItemStatistic>
        )}
      </StatisticGroup>
    );
  }
}

export default LucidDreamsHealers;
