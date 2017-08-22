import React from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'Main/StatisticBox';
import Module from 'Parser/Core/Module';

// NOTE: "Raw" rage is what shows up in combat log events (divided by 10 and rounded to get in-game rage).
// We deal with raw rage here to prevent accuracy loss.

// This is actually ~59.95, for some bizarre reason, meaning that occasionally you will gain 5 rage
// instead of 6 from a melee.  We have no idea why this is. As long as we re-sync with the classResources
// field with each event, this shouldn't be a problem.
const RAW_RAGE_GAINED_FROM_MELEE = 60;

// The cost of a Gory Fur-reduced Ironfur, or the minimum amount of rage that can be spent
const MINIMUM_ACCEPTABLE_RAGE_WASTE = 34;

const RAGE_GENERATORS = {
  [SPELLS.MELEE.id]: 'Melee',
  [SPELLS.MANGLE_BEAR.id]: 'Mangle',
  [SPELLS.THRASH_BEAR.id]: 'Thrash',
  [SPELLS.MOONFIRE.id]: 'Moonfire (Galactic Guardian)',
  [SPELLS.BLOOD_FRENZY_TICK.id]: 'Blood Frenzy',
  [SPELLS.BRISTLING_FUR.id]: 'Bristling Fur',
  [SPELLS.OAKHEARTS_PUNY_QUODS_BUFF.id]: 'Oakheart\'s Puny Quods',
  [SPELLS.PURE_RAGE_POTION.id]: 'Pure Rage Potion',
};

class RageWasted extends Module {
  rageWastedBySpell = {};
  totalRageGained = 0;
  currentRawRage = 0;

  // Currently always 1000, but in case a future tier set/talent/artifact trait increases this it should "just work"
  currentMaxRage = 0;

  synchronizeRage(event) {
    if (!event.classResources) {
      console.log('no classResources', event);
      return;
    }
    const rageResource = event.classResources.find(resource => resource.type === RESOURCE_TYPES.RAGE);
    if (rageResource) {
      this.currentRawRage = rageResource.amount;
      this.currentMaxRage = rageResource.max;
    }
  }

  registerRageWaste(abilityID, waste) {
    if (!this.rageWastedBySpell[abilityID]) {
      this.rageWastedBySpell[abilityID] = waste;
    } else {
      this.rageWastedBySpell[abilityID] += waste;
    }
  }

  on_byPlayer_energize(event) {
    this.synchronizeRage(event);
    if (event.resourceChangeType !== RESOURCE_TYPES.RAGE) {
      return;
    }

    if (event.waste > 0) {
      this.registerRageWaste(event.ability.guid, event.waste);
      this.totalRageGained += event.resourceChange + event.waste;
    }
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.MELEE.id) {
      if (this.currentRawRage + RAW_RAGE_GAINED_FROM_MELEE > this.currentMaxRage) {
        const realRageWasted = Math.round((this.currentRawRage + RAW_RAGE_GAINED_FROM_MELEE - this.currentMaxRage) / 10);
        this.registerRageWaste(event.ability.guid, realRageWasted);
      }
      this.totalRageGained += RAW_RAGE_GAINED_FROM_MELEE;
    }
    this.synchronizeRage(event);
  }

  get totalWastedRage() {
    return Object.values(this.rageWastedBySpell).reduce((total, waste) => total + waste, 0);
  }

  getWastedRageBreakdown() {
    const sortedWasteBySpell = [];

    for (const spellID in this.rageWastedBySpell) {
      if (this.rageWastedBySpell.hasOwnProperty(spellID)) {
        if (!RAGE_GENERATORS[spellID]) {
          console.log('Unknown rage generator:', spellID);
        }
        sortedWasteBySpell.push({ name: RAGE_GENERATORS[spellID], waste: this.rageWastedBySpell[spellID] });
      }
    }

    sortedWasteBySpell.sort((a, b) => b.waste - a.waste);

    return sortedWasteBySpell.reduce((str, spell) => `${str}<br />${spell.name}: ${spell.waste}`, 'Rage wasted per spell:');
  }

  suggestions(when) {
    when(this.totalWastedRage).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You are wasting rage.  Try to spend rage before you reach the rage cap so you aren't losing out on potential <SpellLink id={SPELLS.IRONFUR.id} />s or <SpellLink id={SPELLS.MAUL.id} />s.</span>)
          .icon(SPELLS.BRISTLING_FUR.icon)
          .actual(`${actual} wasted rage`)
          .recommended(`${recommended} is recommended`)
          .regular(MINIMUM_ACCEPTABLE_RAGE_WASTE).major(MINIMUM_ACCEPTABLE_RAGE_WASTE * 2);
      });
  }

  statistic() {
    const wastedRatio = (this.totalWastedRage / this.totalRageGained);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BRISTLING_FUR.id} />}
        label='Wasted Rage'
        value={this.totalWastedRage}
        tooltip={`
          You wasted <strong>${this.totalWastedRage}</strong> rage out of <strong>${this.totalRageGained}</strong> total rage gained. (<strong>${formatPercentage(wastedRatio)}%</strong> of total)<br /><br />

          ${this.getWastedRageBreakdown()}
        `}
      />
    );
  }
}

export default RageWasted;
