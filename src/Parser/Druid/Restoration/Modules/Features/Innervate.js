import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

const BASE_MANA = 220000;
const WILD_GROWTH_BASE_MANA = 0.34;
const EFFLORESCENCE_BASE_MANA = 0.216;
const CENARION_WARD_BASE_MANA = 0.092;
const REJUVENATION_BASE_MANA = 0.1;
const LIFEBLOOM_BASE_MANA = 0.12;
const HEALING_TOUCH_BASE_MANA = 0.09;
const SWIFTMEND_BASE_MANA = 0.14;
const TRANQUILITY_BASE_MANA = 0.184;
const REGROWTH_BASE_MANA = 0.1863;
const INFUSION_OF_NATURE_REDUCTION = 0.02;
const TOL_REJUVENATION_REDUCTION = 0.3;

const debug = false;

class Innervate extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  manaSaved = 0;
  wildGrowths = 0;
  efflorescences = 0;
  cenarionWards = 0;
  rejuvenations = 0;
  regrowths = 0;
  lifeblooms = 0;
  healingTouches = 0;
  swiftmends = 0;
  tranquilities = 0;
  freeRegrowths = 0;
  infusionOfNatureTraits = 0;
  innervateApplyTimestamp = null;
  castsUnderInnervate = 0;
  innervateCount = 0;
  secondsManaCapped = 0;
  lastInnervateTimestamp = 0;
  depleted = false;

  on_initialized() {
    this.infusionOfNatureTraits = this.combatants.selected.traitsBySpellId[SPELLS.INFUSION_OF_NATURE.id] || 0;
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.INNERVATE.id === spellId) {
      this.innervateCount += 1;
      this.lastInnervateTimestamp = event.timestamp;
    }
  }
  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.INNERVATE.id === spellId) {
      this.depleted = false;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (this.combatants.selected.hasBuff(SPELLS.INNERVATE.id)) {
      // Checking if the player is mana capped during an innervate.
      // This is not 100% accuarate because we trigger the calculation on the first heal during an innervate.
      // Realistically the seconds mana capped is higher.
      if (event.classResources && event.classResources[0].amount === event.classResources[0].max && !this.depleted) {
        this.secondsManaCapped = Math.abs(((this.lastInnervateTimestamp + 10000) - event.timestamp)) / 1000;
        this.depleted = true;
      }
      if (SPELLS.REJUVENATION.id === spellId) {
        this.addToManaSaved(REJUVENATION_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.rejuvenations += 1;
      }
      if (SPELLS.WILD_GROWTH.id === spellId) {
        this.addToManaSaved(WILD_GROWTH_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.wildGrowths += 1;
      }
      if (SPELLS.EFFLORESCENCE_CAST.id === spellId) {
        this.addToManaSaved(EFFLORESCENCE_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.efflorescences += 1;
      }
      if (SPELLS.CENARION_WARD === spellId) {
        this.addToManaSaved(CENARION_WARD_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.cenarionWards += 1;
      }
      if (SPELLS.REGROWTH.id === spellId) {
        this.addToManaSaved(REGROWTH_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.regrowths += 1;
      }
      if (SPELLS.LIFEBLOOM_HOT_HEAL.id === spellId) {
        this.addToManaSaved(LIFEBLOOM_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.lifeblooms += 1;
      }
      if (SPELLS.HEALING_TOUCH.id === spellId) {
        this.addToManaSaved(HEALING_TOUCH_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.healingTouches += 1;
      }
      if (SPELLS.SWIFTMEND.id === spellId) {
        this.addToManaSaved(SWIFTMEND_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.swiftmends += 1;
      }
      if (SPELLS.TRANQUILITY_HEAL.id === spellId) {
        this.addToManaSaved(TRANQUILITY_BASE_MANA);
        this.castsUnderInnervate += 1;
        this.tranquilities += 1;
      }
    }
  }

  addToManaSaved(spellBaseMana) {
    if (spellBaseMana === WILD_GROWTH_BASE_MANA) {
      this.manaSaved += ((BASE_MANA * spellBaseMana) * (1 - (this.infusionOfNatureTraits * INFUSION_OF_NATURE_REDUCTION)));
    } else if (this.combatants.selected.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) && spellBaseMana === REJUVENATION_BASE_MANA) {
      this.manaSaved += ((BASE_MANA * spellBaseMana) * (1 - TOL_REJUVENATION_REDUCTION));
    } else if (this.combatants.selected.hasBuff(SPELLS.CLEARCASTING_BUFF.id) && spellBaseMana === REGROWTH_BASE_MANA) {
      this.freeRegrowths += 1;
    } else {
      this.manaSaved += (BASE_MANA * spellBaseMana);
    }
  }

  on_finished() {
    if (debug) {
      console.log(`Innervates gained: ${this.innervateCount}`);
      console.log(`Mana saved: ${this.manaSaved}`);
      console.log(`Avg. Mana saved: ${this.manaSaved / this.innervateCount}`);
      console.log(`Total Casts under innervate: ${this.castsUnderInnervate}`);
      console.log(`Avg Casts under innervate: ${this.castsUnderInnervate / this.innervateCount}`);
      console.log(`Free regrowths cast: ${this.freeRegrowths}`);
      console.log(`WGs: ${this.wildGrowths}`);
      console.log(`Efflos: ${this.efflorescences}`);
      console.log(`CWs: ${this.cenarionWards}`);
      console.log(`Rejvus: ${this.rejuvenations}`);
      console.log(`Regrowth: ${this.regrowths}`);
      console.log(`LBs: ${this.lifeblooms}`);
      console.log(`HT: ${this.healingTouches}`);
      console.log(`SM: ${this.swiftmends}`);
      console.log(`Tranq: ${this.tranquilities}`);
      console.log(`Amount of seconds mana capped: ${this.secondsManaCapped}`);
    }
  }

  get averageManaSaved() {
    return (this.manaSaved / this.innervateCount) || 0;
  }

  get averageManaSavedSuggestionThresholds() {
    return {
      actual: this.averageManaSaved,
      isLessThan: {
        minor: 220000,
        average: 180000,
        major: 130000,
      },
      style: 'number',
    };
  }

  get wholeSecondsCapped() {
    return Math.round(this.secondsManaCapped);
  }

  get secondsCappedSuggestionThresholds() {
    return {
      actual: this.wholeSecondsCapped,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    if(this.innervateCount === 0) {
      return;
    }

    when(this.averageManaSavedSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your mana spent during an <SpellLink id={SPELLS.INNERVATE.id} /> can be improved.
              Always aim to cast 1 wild growth, 1 efflorescence, and fill the rest with rejuvations for optimal usage.</React.Fragment>)
          .icon(SPELLS.INNERVATE.icon)
          .actual(`${formatNumber(this.averageManaSaved.toFixed(0))} avg mana spent.`)
          .recommended(`>${formatNumber(recommended)} is recommended`);
      });

    when(this.secondsCappedSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You were capped on mana during <SpellLink id={SPELLS.INNERVATE.id} />. Try to not use Innervate if you are above 90% mana.</React.Fragment>)
          .icon(SPELLS.INNERVATE.icon)
          .actual(`~${this.wholeSecondsCapped} seconds capped`)
          .recommended(`${recommended} is recommended`);
      });
  }

  statistic() {
    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.INNERVATE.id} />}
        value={`${formatNumber(this.averageManaSaved)} mana`}
        label="Mana saved per Innervate"
        tooltip={
          `<ul>
                During your ${this.innervateCount} Innervates you cast:
                <li>${this.wildGrowths}/${this.innervateCount} Wild Growths</li>
                <li>${this.efflorescences}/${this.innervateCount} Efflorescences</li>
                ${this.cenarionWards > 0
                    ? `<li>${this.cenarionWards} Cenarion Wards</li>` : ''
                    }
                ${this.rejuvenations > 0
                    ? `<li>${this.rejuvenations} Rejuvenations</li>` : ''
                    }
                ${this.regrowths > 0
                    ? `<li>${this.regrowths} Regrowths</li>` : ''
                    }
                ${this.lifeblooms > 0
                    ? `<li>${this.lifeblooms} Lifeblooms</li>` : ''
                    }
                ${this.healingTouches > 0
                    ? `<li>${this.healingTouches} Healing Touches</li>` : ''
                    }
                ${this.swiftmends > 0
                    ? `<li>${this.swiftmends} Swiftmends</li>` : ''
                    }
                ${this.tranquilities > 0
                    ? `<li>${this.tranquilities} Tranquilities</li>` : ''
                    }
            </ul>`
        }
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(14);

}

export default Innervate;
