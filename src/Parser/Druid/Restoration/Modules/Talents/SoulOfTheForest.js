import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const REGROWTH_HEALING_INCREASE = 2;
const REJUVENATION_HEALING_INCREASE = 2;
const WILD_GROWTH_HEALING_INCREASE = 0.75;
const WILD_GROWTH_DURATION = 7000;
const REJUVENATION_BASE_DURATION = 12000;

class SoulOfTheForest extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  hasSotf = false;
  hasSota = false;

  regrowths = 0;
  wildGrowths = 0;
  rejuvenations = 0;
  proccs = 0;
  proccConsumed = true;

  rejuvenationProccTimestamp = null;
  regrowthProccTimestamp = null;
  wildGrowthProccTimestamp = null;

  regrowthHealing = 0;
  rejuvenationHealing = 0;
  wildGrowthHealing = 0;

  rejuvenationTargets = [];
  wildGrowthTargets = [];
  rejuvenationDuration = REJUVENATION_BASE_DURATION;

  on_initialized() {
    this.hasSotf = this.combatants.selected.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id);
    this.hasSota = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_ARCHDRUID.id);
    this.active = this.hasSotf || this.hasSota;

    const persistenceTraits = this.combatants.selected.traitsBySpellId[SPELLS.PERSISTENCE_TRAIT.id] || 0;
    this.rejuvenationDuration += persistenceTraits * 1000;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (SPELLS.SOUL_OF_THE_FOREST_BUFF.id === spellId) {
      this.proccs += 1;
      this.proccConsumed = false;
    }

    // Saving the "valid" targets to track the healing done on. I.e. get the targets that had an "empowered" WG/Rejuv applied on them.
    if (this.wildGrowthProccTimestamp !== null && SPELLS.WILD_GROWTH.id === spellId && (event.timestamp - this.wildGrowthProccTimestamp) < 100) {
      this.wildGrowthTargets.push(event.targetID);
    } else if (this.rejuvenationProccTimestamp !== null && (SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION.id === spellId) && (event.timestamp - this.rejuvenationProccTimestamp) < 100) {
      this.rejuvenationTargets.push(event.targetID);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    // proccConsumsed it used because WG and RG has a cast time. So whenever you queue cast WG + rejuv they will happen at the exact same timestamp.
    if (this.combatants.selected.hasBuff(SPELLS.SOUL_OF_THE_FOREST_BUFF.id) && this.proccConsumed === false) {
      if (SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION === spellId) {
        this.rejuvenations += 1;
        this.rejuvenationProccTimestamp = event.timestamp;
      } else if (SPELLS.REGROWTH.id === spellId) {
        this.regrowths += 1;
        this.proccConsumed = true;
        this.regrowthProccTimestamp = event.timestamp;
      } else if (SPELLS.WILD_GROWTH.id === spellId) {
        this.wildGrowths += 1;
        this.proccConsumed = true;
        this.wildGrowthProccTimestamp = event.timestamp;
      }
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    // Reset procc variables
    if ((event.timestamp + 200) > (this.rejuvenationProccTimestamp + this.rejuvenationDuration)) {
      this.rejuvenationProccTimestamp = null;
      this.rejuvenationTargets = [];
    } else if ((event.timestamp + 200) > (this.wildGrowthProccTimestamp + WILD_GROWTH_DURATION)) {
      this.wildGrowthProccTimestamp = null;
      this.wildGrowthTargets = [];
    }

    if (SPELLS.REGROWTH.id === spellId && this.regrowthProccTimestamp === event.timestamp) {
      this.regrowthHealing += calculateEffectiveHealing(event, REGROWTH_HEALING_INCREASE);
      this.regrowthProccTimestamp = null;
    } else if (this.rejuvenationProccTimestamp !== null
        && (SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION === spellId)
        && (event.timestamp - (this.rejuvenationProccTimestamp + this.rejuvenationDuration)) <= 0) {
      if (this.rejuvenationTargets.indexOf(event.targetID) !== -1) {
        this.rejuvenationHealing += calculateEffectiveHealing(event, REJUVENATION_HEALING_INCREASE);
      }
    } else if (this.wildGrowthProccTimestamp !== null
      && SPELLS.WILD_GROWTH.id === spellId
      && (event.timestamp - (this.wildGrowthProccTimestamp + WILD_GROWTH_DURATION)) <= 0) {
      if (this.wildGrowthTargets.indexOf(event.targetID) !== -1) {
        this.wildGrowthHealing += calculateEffectiveHealing(event, WILD_GROWTH_HEALING_INCREASE);
      }
    }
  }

  get wgUsagePercent() {
    return this.wildGrowths / this.proccs;
  }

  get suggestionThresholds() {
    return {
      actual: this.wgUsagePercent,
      isLessThan: {
        minor: 1.00,
        average: 0.80,
        major: 0.60,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You did not consume all your <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} /> buffs with <SpellLink id={SPELLS.WILD_GROWTH.id} />.
          Try to use <SpellLink id={SPELLS.WILD_GROWTH.id} /> every time you get a <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} /> buff.</span>)
          .icon(SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.icon)
          .actual(`Wild growth consumed ${formatPercentage(this.wgUsage)}% of all the buffs.`)
          .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`);
      });
  }

  statistic() {
    const total = this.wildGrowthHealing + this.rejuvenationHealing + this.regrowthHealing;
    const totalPercent = this.owner.getPercentageOfTotalHealingDone(total);

    const wgPercent = this.owner.getPercentageOfTotalHealingDone(this.wildGrowthHealing);
    const rejuvPercent = this.owner.getPercentageOfTotalHealingDone(this.rejuvenationHealing);
    const regrowthPercent = this.owner.getPercentageOfTotalHealingDone(this.regrowthHealing);

    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} />}
        value={`${formatPercentage(totalPercent)} %`}
        label="Soul of the Forest"
        tooltip={
          `You gained ${this.proccs} total Soul of the Forest procs.
          <ul>
            <li>Consumed ${this.wildGrowths} procs with Wild Growth for ${formatPercentage(wgPercent)}% healing</li>
            <li>Consumed ${this.rejuvenations} procs with Rejuvenation for ${formatPercentage(rejuvPercent)}% healing</li>
            <li>Consumed ${this.regrowths} procs with Regrowth for ${formatPercentage(regrowthPercent)}% healing</li>
          </ul>`
        }
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();

}

export default SoulOfTheForest;
