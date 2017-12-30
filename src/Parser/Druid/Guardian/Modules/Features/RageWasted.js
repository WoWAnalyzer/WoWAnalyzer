import React from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';

// NOTE: "Raw" rage is what shows up in combat log events (divided by 10 and rounded to get in-game rage).
// We deal with raw rage here to prevent accuracy loss.

// This is actually ~59.95, for some bizarre reason, meaning that occasionally you will gain 5 rage
// instead of 6 from a melee.  We have no idea why this is. As long as we re-sync with the classResources
// field with each event, this shouldn't be a problem.
const RAW_RAGE_GAINED_FROM_MELEE = 60;

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

class RageWasted extends Analyzer {
  rageWastedBySpell = {};
  totalRageGained = 0;
  _currentRawRage = 0;

  // Currently always 1000, but in case a future tier set/talent/artifact trait increases this it should "just work"
  _currentMaxRage = 0;

  synchronizeRage(event) {
    if (!event.classResources) {
      console.log('no classResources', event);
      return;
    }
    const rageResource = event.classResources.find(resource => resource.type === RESOURCE_TYPES.RAGE.id);
    if (rageResource) {
      this._currentRawRage = rageResource.amount;
      this._currentMaxRage = rageResource.max;
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
    if (event.resourceChangeType !== RESOURCE_TYPES.RAGE.id) {
      return;
    }

    if (event.waste > 0) {
      this.registerRageWaste(event.ability.guid, event.waste);
    }

    this.totalRageGained += event.resourceChange + event.waste;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.MELEE.id) {
      if (this._currentRawRage + RAW_RAGE_GAINED_FROM_MELEE > this._currentMaxRage) {
        const realRageWasted = Math.floor((this._currentRawRage + RAW_RAGE_GAINED_FROM_MELEE - this._currentMaxRage) / 10);
        this.registerRageWaste(event.ability.guid, realRageWasted);
      }
      // Convert from raw rage to real rage
      this.totalRageGained += RAW_RAGE_GAINED_FROM_MELEE / 10;
    }
    this.synchronizeRage(event);
  }

  get totalWastedRage() {
    return Object.keys(this.rageWastedBySpell)
      .map(key => this.rageWastedBySpell[key])
      .reduce((total, waste) => total + waste, 0);
  }

  get wastedRageRatio() {
    return this.totalWastedRage / this.totalRageGained;
  }

  getWastedRageBreakdown() {
    return Object.keys(this.rageWastedBySpell)
      .map((spellID) => {
        if (!RAGE_GENERATORS[spellID]) {
          console.warn('Unknown rage generator:', spellID);
        }
        return {
          name: RAGE_GENERATORS[spellID],
          waste: this.rageWastedBySpell[spellID],
        };
      })
      .sort((a, b) => b.waste - a.waste)
      .reduce((str, spell) => `${str}<br />${spell.name}: ${spell.waste}`, 'Rage wasted per spell:');
  }

  suggestions(when) {
    when(this.wastedRageRatio).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You are wasting rage.  Try to spend rage before you reach the rage cap so you aren't losing out on potential <SpellLink id={SPELLS.IRONFUR.id} />s or <SpellLink id={SPELLS.MAUL.id} />s.</span>)
          .icon(SPELLS.BRISTLING_FUR.icon)
          .actual(`${formatPercentage(actual)}% wasted rage`)
          .recommended(`${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.02).major(recommended + 0.05);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BRISTLING_FUR.id} />}
        label="Wasted Rage"
        value={`${formatPercentage(this.wastedRageRatio)}%`}
        tooltip={`
          You wasted <strong>${this.totalWastedRage}</strong> rage out of <strong>${this.totalRageGained}</strong> total rage gained. (<strong>${formatPercentage(this.wastedRageRatio)}%</strong> of total)<br /><br />

          ${this.getWastedRageBreakdown()}
        `}
      />
    );
  }
}

export default RageWasted;
