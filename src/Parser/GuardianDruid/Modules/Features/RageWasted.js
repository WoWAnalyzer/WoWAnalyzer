import React from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Module from 'Parser/Core/Module';

// TODO: Sort wasted rage breakdown
// TODO: Show overall rage gain in relation to wasted rage

// NOTE: "Raw" rage is what shows up in combat log events (divided by 10 and rounded to get in-game rage).  We deal with raw rage here to prevent accuracy loss.

// This is sometimes 59, for some bizarre reason.
// As long as we re-sync with the classResources field on each
// event this shouldn't be a problem.
const RAW_RAGE_GAINED_FROM_MELEE = 60;

// The cost of a Gory Fur-reduced Ironfur
const MINIMUM_ACCEPTABLE_RAGE_WASTE = 34;

const RAGE_GENERATORS = {
  [SPELLS.MELEE.id]: 'Melee',
  [SPELLS.MANGLE_BEAR.id]: 'Mangle',
  [SPELLS.THRASH_BEAR.id]: 'Thrash',
  [SPELLS.MOONFIRE.id]: 'Moonfire (Galactic Guardian)',
  [SPELLS.BLOOD_FRENZY_TICK.id]: 'Blood Frenzy',
  [SPELLS.BRISTLING_FUR.id]: 'Bristling Fur',
}

class RageWasted extends Module {
  rageWastedBySpell = {};
  currentRawRage = 0;

  // Currently always 1000, but in case a future tier set/talent/artifact trait increases this it should "just work"
  currentMaxRage = 0;

  synchronizeRage(event) {
    if (!event.classResources) {
      console.log('no classResources', event);
      return;
    }
    const rageResource = event.classResources.find(resource => resource.type === RESOURCE_TYPES.RAGE)
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
    }
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.MELEE.id) {
      if (this.currentRawRage + RAW_RAGE_GAINED_FROM_MELEE > this.currentMaxRage) {
        const realRageWasted = Math.round((this.currentRawRage + RAW_RAGE_GAINED_FROM_MELEE - this.currentMaxRage) / 10);
        this.registerRageWaste(event.ability.guid, realRageWasted);
      }
    }
    this.synchronizeRage(event);
  }

  get totalWastedRage() {
    return Object.values(this.rageWastedBySpell).reduce((total, waste) => total + waste, 0);
  }

  get wastedRageBreakdown() {
    let str = 'Rage wasted per spell: <br />';

    for (let spellID in this.rageWastedBySpell) {
      if (this.rageWastedBySpell.hasOwnProperty(spellID)) {
        const waste = this.rageWastedBySpell[spellID];
        console.log('[rage waste]', spellID, waste);
        str += `${RAGE_GENERATORS[spellID]}: ${waste}<br />`;
      }
    }
    return str;
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
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BRISTLING_FUR.id} />}
        label='Wasted Rage'
        value={this.totalWastedRage}
        tooltip={`
          Rage gained that puts you over the rage cap is wasted.<br /><br />

          ${this.wastedRageBreakdown}
        `}
      />
    )
  }
}

export default RageWasted;
