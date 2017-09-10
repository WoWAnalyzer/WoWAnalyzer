import React from 'react';
import StatisticBox from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';
import SuggestionThresholds from '../../SuggestionThresholds';

const debug = false;

const WG_TARGETS = 6;
const REJUV_BASE_MANA = 10;
const REJUVENATION_REDUCED_MANA = 0.3;
const HEALING_INCREASE = 1.15;
const REJUV_HEALING_INCREASE = 1.5;
const WILD_GROWTH_HEALING_INCREASE = (WG_TARGETS + 2) / WG_TARGETS;
const TREE_OF_LIFE_COOLDOWN = 180000;
const TREE_OF_LIFE_DURATION = 30000;

class TreeOfLife extends Module {
  static dependencies = {
    healingDone: HealingDone,
    combatants: Combatants,
  };

  hasGermination = false;
  hasTol = false;
  hasCs = false;

  totalHealingEncounter = 0;
  totalHealingDuringToL = 0;
  totalHealingFromRejuvenationDuringToL = 0;
  totalHealingFromRejuvenationEncounter = 0;
  totalRejuvenationsEncounter = 0;
  totalRejuvenationsDuringToL = 0;
  totalHealingFromWildgrowthsDuringToL = 0;
  throughput = 0;
  tolManualApplyTimestamp = null;
  tolCasts = 0;

  // Chameleon song
  totalHealingDuringToLHelmet = 0;
  totalHealingFromRejuvenationDuringToLHelmet = 0;
  totalRejuvenationsDuringToLHelmet = 0;
  totalHealingFromWildgrowthsDuringToLHelmet = 0;
  throughputHelmet = 0;
  adjustHelmetUptime = 0;
  proccs = 0;

  on_initialized() {
    this.hasTol = this.combatants.selected.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id);
    this.hasCs = this.combatants.selected.hasHead(ITEMS.CHAMELEON_SONG.id);

    this.active = this.hasTol || this.hasCs;

    this.hasGermination = this.combatants.selected.hasTalent(SPELLS.GERMINATION_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }

    // Get total healing from rejuv + germ (if specced).
    if (SPELLS.REJUVENATION.id === spellId) {
      this.totalHealingFromRejuvenationEncounter += event.amount;
    } else if (this.hasGermination && SPELLS.REJUVENATION_GERMINATION.id === spellId) {
      this.totalHealingFromRejuvenationEncounter += event.amount;
    }

    // Get total healing from rejuv + germ (if specced) during ToL
    if (this.owner.modules.combatants.selected.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id)) {
      if (this.tolManualApplyTimestamp !== null && event.timestamp <= this.tolManualApplyTimestamp + TREE_OF_LIFE_DURATION) {
        if (SPELLS.REJUVENATION.id === spellId) {
          this.totalHealingFromRejuvenationDuringToL += event.amount;
        } else if (this.hasGermination && SPELLS.REJUVENATION_GERMINATION.id === spellId) {
          this.totalHealingFromRejuvenationDuringToL += event.amount;
        } else if (SPELLS.WILD_GROWTH.id === spellId) {
          this.totalHealingFromWildgrowthsDuringToL += event.amount;
        }
        // Get total healing during ToL
        this.totalHealingDuringToL += event.amount;
      } else {
        if (SPELLS.REJUVENATION.id === spellId) {
          this.totalHealingFromRejuvenationDuringToLHelmet += event.amount;
        } else if (this.hasGermination && SPELLS.REJUVENATION_GERMINATION.id === spellId) {
          this.totalHealingFromRejuvenationDuringToLHelmet += event.amount;
        } else if (SPELLS.WILD_GROWTH.id === spellId) {
          this.totalHealingFromWildgrowthsDuringToLHelmet += event.amount;
        }
        // Get total healing during ToL
        this.totalHealingDuringToLHelmet += event.amount;
      }
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.REJUVENATION.id === spellId) {
      this.totalRejuvenationsEncounter += 1;
    }

    if (this.owner.modules.combatants.selected.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id)) {
      if (this.tolManualApplyTimestamp !== null && event.timestamp <= this.tolManualApplyTimestamp + TREE_OF_LIFE_DURATION) {
        if (SPELLS.REJUVENATION.id === spellId) {
          this.totalRejuvenationsDuringToL += 1;
        }
      } else {
        if (SPELLS.REJUVENATION.id === spellId) {
          this.totalRejuvenationsDuringToLHelmet += 1;
        }
      }
    }

    if (SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id === spellId && (this.tolManualApplyTimestamp === null || (this.tolManualApplyTimestamp + TREE_OF_LIFE_COOLDOWN) < event.timestamp)) {
      this.tolManualApplyTimestamp = event.timestamp;
      this.tolCasts += 1;
      this.proccs -= 1;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id === spellId) {
      this.proccs += 1;
    }
  }

  on_finished() {
    // Adjust uptime if we're specced into ToL + using Chameleon Head and not getting a full use of ToL before end duration of fight.
    if (this.tolManualApplyTimestamp + TREE_OF_LIFE_DURATION > this.owner.fight.end_time) {
      this.adjustHelmetUptime = TREE_OF_LIFE_DURATION - (this.owner.fight.end_time - this.tolManualApplyTimestamp);
    }
    // Encounter finished, let's tie up the variables
    debug && console.log(`Has germination: ${this.hasGermination}`);
    debug && console.log(`Total healing encounter: ${this.healingDone.total.effective}`);
    debug && console.log(`Total healing during ToL: ${this.totalHealingDuringToL}`);
    debug && console.log(`Total healing from rejuvenation encounter: ${this.totalHealingFromRejuvenationEncounter}`);
    debug && console.log(`Total healing from rejuvenation during ToL: ${this.totalHealingFromRejuvenationDuringToL}`);
    debug && console.log(`Total rejuvenation casted encounter: ${this.totalRejuvenationsEncounter}`);
    debug && console.log(`Total rejuvenation casted during ToL: ${this.totalRejuvenationsDuringToL}`);
    debug && console.log(`Total rejuvenation casted during ToL helmet: ${this.totalRejuvenationsDuringToLHelmet}`);
    debug && console.log(`Total healing from wild growth during ToL: ${this.totalHealingFromWildgrowthsDuringToL}`);

    // Get 1 rejuv throughput worth
    const oneRejuvenationThroughput = this.owner.getPercentageOfTotalHealingDone(this.totalHealingFromRejuvenationEncounter) / this.totalRejuvenationsEncounter;
    debug && console.log(`1 Rejuvenation throughput: ${(oneRejuvenationThroughput * 100).toFixed(2)}%`);

    // 50% of total healing from rejuv+germ during ToL and divide it with the encounter total healing.
    const rejuvenationIncreasedEffect = this.owner.getPercentageOfTotalHealingDone(this.totalHealingFromRejuvenationDuringToL / HEALING_INCREASE - this.totalHealingFromRejuvenationDuringToL / (HEALING_INCREASE * REJUV_HEALING_INCREASE));
    debug && console.log(`rejuvenationIncreasedEffect: ${(rejuvenationIncreasedEffect * 100).toFixed(2)}%`);

    // 15% of total healing during ToL and divide it with the encounter total healing
    const tolIncreasedHealingDone = this.owner.getPercentageOfTotalHealingDone(this.totalHealingDuringToL - this.totalHealingDuringToL / HEALING_INCREASE);
    debug && console.log(`tolIncreasedHealingDone: ${(tolIncreasedHealingDone * 100).toFixed(2)}%`);

    // The amount of free rejuvs gained by the reduced mana cost, calculated into throughput by the "1 Rejuv throughput worth"
    const rejuvenationMana = (((this.totalRejuvenationsDuringToL * REJUV_BASE_MANA) * REJUVENATION_REDUCED_MANA) / REJUV_BASE_MANA) * oneRejuvenationThroughput;
    debug && console.log(`rejuvenationMana: ${(rejuvenationMana * 100).toFixed(2)}%`);

    // 33% of total healing from WG during ToL and divide it with the encounter total healing.
    const wildGrowthIncreasedEffect = this.owner.getPercentageOfTotalHealingDone(this.totalHealingFromWildgrowthsDuringToL / HEALING_INCREASE - this.totalHealingFromWildgrowthsDuringToL / (HEALING_INCREASE * WILD_GROWTH_HEALING_INCREASE));
    debug && console.log(`wildGrowthIncreasedEffect: ${(wildGrowthIncreasedEffect * 100).toFixed(2)}%`);

    // Total throughput from using Tree of Life
    this.throughput = rejuvenationIncreasedEffect + tolIncreasedHealingDone + rejuvenationMana + wildGrowthIncreasedEffect;
    debug && console.log(`uptime: ${((this.owner.modules.combatants.selected.getBuffUptime(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) / this.owner.fightDuration) * 100).toFixed(2)}%`);
    debug && console.log(`throughput: ${(this.throughput * 100).toFixed(2)}%`);

    // Chameleon song
    const rejuvenationIncreasedEffectHelmet = this.owner.getPercentageOfTotalHealingDone(this.totalHealingFromRejuvenationDuringToLHelmet / HEALING_INCREASE - this.totalHealingFromRejuvenationDuringToLHelmet / (HEALING_INCREASE * REJUV_HEALING_INCREASE));
    debug && console.log(`rejuvenationIncreasedEffectHelmet: ${(rejuvenationIncreasedEffectHelmet * 100).toFixed(2)}%`);
    const tolIncreasedHealingDoneHelmet = this.owner.getPercentageOfTotalHealingDone(this.totalHealingDuringToLHelmet - this.totalHealingDuringToLHelmet / HEALING_INCREASE);
    debug && console.log(`tolIncreasedHealingDone: ${(tolIncreasedHealingDoneHelmet * 100).toFixed(2)}%`);
    const rejuvenationManaHelmet = (((this.totalRejuvenationsDuringToLHelmet * REJUV_BASE_MANA) * REJUVENATION_REDUCED_MANA) / REJUV_BASE_MANA) * oneRejuvenationThroughput;
    debug && console.log(`rejuvenationManaHelmet: ${(rejuvenationManaHelmet * 100).toFixed(2)}%`);
    const wildGrowthIncreasedEffectHelmet = this.owner.getPercentageOfTotalHealingDone(this.totalHealingFromWildgrowthsDuringToLHelmet / HEALING_INCREASE - this.totalHealingFromWildgrowthsDuringToLHelmet / (HEALING_INCREASE * WILD_GROWTH_HEALING_INCREASE));
    debug && console.log(`wildGrowthIncreasedEffectHelmet: ${(wildGrowthIncreasedEffectHelmet * 100).toFixed(2)}%`);
    this.throughputHelmet = rejuvenationIncreasedEffectHelmet + tolIncreasedHealingDoneHelmet + rejuvenationManaHelmet + wildGrowthIncreasedEffectHelmet;
    debug && console.log(`uptimeHelmet: ${(((this.owner.modules.combatants.selected.getBuffUptime(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) - (this.tolCasts * TREE_OF_LIFE_DURATION)) / this.owner.fightDuration) * 100).toFixed(2)}%`);
    debug && console.log(`throughputHelmet: ${(this.throughputHelmet * 100).toFixed(2)}%`);
    debug && console.log(`tolcasts: ${this.tolCasts}`);
  }

  /*
  // Tree of Life
    const hasFlourish = this.modules.combatants.selected.lv100Talent === SPELLS.FLOURISH_TALENT.id;
    const hasTreeOfLife = this.modules.combatants.selected.lv75Talent === SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id;
    const wildGrowthTargets = 6;
    const rejuvenationManaCost = 22000;
    const oneRejuvenationThroughput = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingFromRejuvenationEncounter) / this.modules.treeOfLife.totalRejuvenationsEncounter;
    const rejuvenationIncreasedEffect = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingFromRejuvenationDuringToL / 1.15 - this.modules.treeOfLife.totalHealingFromRejuvenationDuringToL / (1.15 * 1.5));
    const tolIncreasedHealingDone = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingDuringToL - this.modules.treeOfLife.totalHealingDuringToL / 1.15);
    const rejuvenationMana = (((this.modules.treeOfLife.totalRejuvenationsDuringToL * 10) * 0.3) / 10) * oneRejuvenationThroughput;
    const wildGrowthIncreasedEffect = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingFromWildgrowthsDuringToL / 1.15 - this.modules.treeOfLife.totalHealingFromWildgrowthsDuringToL / (1.15 * (8 / 6)));
    const treeOfLifeThroughput = rejuvenationIncreasedEffect + tolIncreasedHealingDone + rejuvenationMana + wildGrowthIncreasedEffect;
    let treeOfLifeUptime = this.modules.combatants.selected.getBuffUptime(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) / this.fightDuration;

    // Chameleon Song
    const rejuvenationIncreasedEffectHelmet = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingFromRejuvenationDuringToLHelmet / 1.15 - this.modules.treeOfLife.totalHealingFromRejuvenationDuringToLHelmet / (1.15 * 1.5));
    const tolIncreasedHealingDoneHelmet = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingDuringToLHelmet - this.modules.treeOfLife.totalHealingDuringToLHelmet / 1.15);
    const rejuvenationManaHelmet = (((this.modules.treeOfLife.totalRejuvenationsDuringToLHelmet * 10) * 0.3) / 10) * oneRejuvenationThroughput;
    const wildGrowthIncreasedEffectHelmet = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingFromWildgrowthsDuringToLHelmet / 1.15 - this.modules.treeOfLife.totalHealingFromWildgrowthsDuringToLHelmet / (1.15 * (8 / 6)));
    const treeOfLifeThroughputHelmet = rejuvenationIncreasedEffectHelmet + tolIncreasedHealingDoneHelmet + rejuvenationManaHelmet + wildGrowthIncreasedEffectHelmet;
    const treeOfLifeUptimeHelmet = (this.modules.combatants.selected.getBuffUptime(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) - (this.modules.treeOfLife.tolCasts * 30000) + this.modules.treeOfLife.adjustHelmetUptime) / this.fightDuration;
    if (this.modules.combatants.selected.hasHead(ITEMS.CHAMELEON_SONG.id)) {
      treeOfLifeUptime -= treeOfLifeUptimeHelmet;
    }
    const treeOfLifeProccHelmet = formatPercentage(this.modules.treeOfLife.proccs / wildGrowths);
    */

    suggestions(when) {
      if(!this.hasTol) { return; }

      when(this.treeOfLifeThroughput).isLessThan(SuggestionThresholds.TOL_THROUGHPUT.minor)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Your <SpellLink id={SPELLS.INCARNATION_TREE_OF_LIFE.id} /> is not providing you much throughput. You may want to plan your CD usage better or pick another talent.</span>)
            .icon(SPELLS.INCARNATION_TREE_OF_LIFE.icon)
            .actual(`${formatPercentage(this.treeOfLifeThroughput)}% healing`)
            .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`)
            .regular(SuggestionThresholds.TOL_THROUGHPUT.regular).major(SuggestionThresholds.TOL_THROUGHPUT.major);
        });
    }

    statistic() {
      if(!this.hasTol) { return; }

      return (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.INCARNATION_TREE_OF_LIFE.id} />}
          value={`${formatPercentage(this.treeOfLifeThroughput)} %`}
          label="Tree of Life Healing"
          tooltip={`
            <ul>
              <li>${formatPercentage(this.rejuvenationIncreasedEffect * 100)}% from increased rejuvenation healing</li>
              <li>${formatPercentage(this.rejuvenationMana * 100)}% from reduced rejuvenation cost</li>
              <li>${formatPercentage(this.wildGrowthIncreasedEffect * 100)}% from increased wildgrowth healing</li>
              <li>${formatPercentage(this.tolIncreasedHealingDone * 100)}% from overall increased healing</li>
              <li>${formatPercentage(this.treeOfLifeUptime * 100)}% uptime</li>
            </ul>
          `}
        />
      );
    }

    item() {
      if(!this.hasCs) { return; }

      return {
        item: ITEMS.CHAMELEON_SONG,
        result: (
          <dfn data-tip={`
            <ul>
              <li>${formatPercentage(this.rejuvenationIncreasedEffectHelmet * 100)}% from increased rejuvenation effect</li>
              <li>${formatPercentage(this.rejuvenationManaHelmet * 100)}% from reduced rejuvenation cost</li>
              <li>${formatPercentage(this.wildGrowthIncreasedEffectHelmet * 100)}% from increased wildgrowth effect</li>
              <li>${formatPercentage(this.tolIncreasedHealingDoneHelmet * 100)}% from overall increased healing effect</li>
              <li>${formatPercentage(this.treeOfLifeUptimeHelmet * 100)}% uptime</li>
              <li>${formatPercentage(this.treeOfLifeProccHelmet)}% procc rate</li> // TODO fix
            </ul>`}>
            {this.owner.formatItemHealingDone(0/* TODO get raw healing amount */)}
          </dfn>
        ),
      };
    }

}

export default TreeOfLife;
