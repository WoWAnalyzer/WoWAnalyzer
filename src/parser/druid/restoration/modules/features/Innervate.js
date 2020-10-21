import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const debug = false;
const TOL_REJUVENATION_REDUCTION = 0.3;

class Innervate extends Analyzer {
  manaSaved = 0;
  wildGrowths = 0;
  efflorescences = 0;
  cenarionWards = 0;
  rejuvenations = 0;
  regrowths = 0;
  lifeblooms = 0;
  swiftmends = 0;
  tranquilities = 0;
  freeRegrowths = 0;
  innervateApplyTimestamp = null;
  castsUnderInnervate = 0;
  innervateCount = 0;
  secondsManaCapped = 0;
  lastInnervateTimestamp = 0;
  depleted = false;

  constructor(options){
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.INNERVATE), this.onApplyBuff);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.INNERVATE), this.onRemoveBuff);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  onApplyBuff(event) {
    this.innervateCount += 1;
    this.lastInnervateTimestamp = event.timestamp;
  }
  onRemoveBuff(event) {
    this.depleted = false;
  }

  onCast(event) {
    const spellId = event.ability.guid;

    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      // Checking if the player is mana capped during an innervate.
      // This is not 100% accuarate because we trigger the calculation on the first heal during an innervate.
      // Realistically the seconds mana capped is higher.
      if (event.classResources && event.classResources[0].amount === event.classResources[0].max && !this.depleted) {
        this.secondsManaCapped = Math.abs(((this.lastInnervateTimestamp + 10000) - event.timestamp)) / 1000;
        this.depleted = true;
      }
      if (SPELLS.REJUVENATION.id === spellId) {
        if (this.selectedCombatant.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id)) {
          this.manaSaved += SPELLS.REJUVENATION.manaCost * (1 - TOL_REJUVENATION_REDUCTION);
        } else {
          this.manaSaved += SPELLS.REJUVENATION.manaCost;
        }
        this.castsUnderInnervate += 1;
        this.rejuvenations += 1;
      }
      if (SPELLS.WILD_GROWTH.id === spellId) {
        this.manaSaved += SPELLS.WILD_GROWTH.manaCost;
        this.castsUnderInnervate += 1;
        this.wildGrowths += 1;
      }
      if (SPELLS.EFFLORESCENCE_CAST.id === spellId) {
        this.manaSaved += SPELLS.EFFLORESCENCE_CAST.manaCost;
        this.castsUnderInnervate += 1;
        this.efflorescences += 1;
      }
      if (SPELLS.CENARION_WARD_TALENT.id === spellId) {
        this.manaSaved += SPELLS.CENARION_WARD_TALENT.manaCost;
        this.castsUnderInnervate += 1;
        this.cenarionWards += 1;
      }
      if (SPELLS.REGROWTH.id === spellId) {
        if (this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id)) {
          this.freeRegrowths += 1;
        } else {
          this.manaSaved += SPELLS.REGROWTH.manaCost;
        }
        this.castsUnderInnervate += 1;
        this.regrowths += 1;
      }
      if (SPELLS.LIFEBLOOM_HOT_HEAL.id === spellId) {
        this.manaSaved += SPELLS.LIFEBLOOM_HOT_HEAL.manaCost;
        this.castsUnderInnervate += 1;
        this.lifeblooms += 1;
      }
      if (SPELLS.SWIFTMEND.id === spellId) {
        this.manaSaved += SPELLS.SWIFTMEND.manaCost;
        this.castsUnderInnervate += 1;
        this.swiftmends += 1;
      }
      if (SPELLS.TRANQUILITY_CAST.id === spellId) {
        this.manaSaved += SPELLS.TRANQUILITY_CAST.manaCost;
        this.castsUnderInnervate += 1;
        this.tranquilities += 1;
      }
    }
  }

  onFightend() {
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
        minor: 23000,
        average: 19120,
        major: 13200,
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
        average: 1,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    if(this.innervateCount === 0) {
      return;
    }

    when(this.averageManaSavedSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your mana spent during an <SpellLink id={SPELLS.INNERVATE.id} /> can be improved.
              Always aim to cast 1 wild growth, 1 efflorescence, and fill the rest with rejuvations for optimal usage.</>)
          .icon(SPELLS.INNERVATE.icon)
          .actual(i18n._(t('druid.restoration.suggestions.innervate.efficiency')`${formatNumber(this.averageManaSaved.toFixed(0))} avg mana spent.`))
          .recommended(`>${formatNumber(recommended)} is recommended`));

    when(this.secondsCappedSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You were capped on mana during <SpellLink id={SPELLS.INNERVATE.id} />. Try to not use Innervate if you are above 90% mana.</>)
          .icon(SPELLS.INNERVATE.icon)
          .actual(i18n._(t('druid.restoration.suggestions.innervate.secondsCapped')`~${this.wholeSecondsCapped} seconds capped`))
          .recommended(`${recommended} is recommended`));
  }

  statistic() {
    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.INNERVATE.id} />}
        value={`${formatNumber(this.averageManaSaved)} mana`}
        label="Mana saved per Innervate"
        tooltip={(
          <>
            During your {this.innervateCount} Innervates you cast:
            <ul>
              <li>{this.wildGrowths}/{this.innervateCount} Wild Growths</li>
              <li>{this.efflorescences}/{this.innervateCount} Efflorescences</li>
              {this.cenarionWards > 0 && <li>{this.cenarionWards} Cenarion Wards</li>}
              {this.rejuvenations > 0 && <li>{this.rejuvenations} Rejuvenations</li>}
              {this.regrowths > 0 && <li>{this.regrowths} Regrowths</li>}
              {this.lifeblooms > 0 && <li>{this.lifeblooms} Lifeblooms</li>}
              {this.swiftmends > 0 && <li>{this.swiftmends} Swiftmends</li>}
              {this.tranquilities > 0 && <li>{this.tranquilities} Tranquilities</li>}
            </ul>
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(14);

}

export default Innervate;
