import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

const DANCING_RUNE_WEAPON_BONUS_DURATION_PER_TRAIT = 0.5;
const MAX_DANCING_RUNE_WEAPON_BONUS_DURATION = 5;

const eternalRuneWeaponStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [strength] = calculateAzeriteEffects(SPELLS.ETERNAL_RUNE_WEAPON.id, rank);
  obj.strength += strength;
  obj.traits += 1;
  return obj;
}, {
  strength: 0,
  traits: 0,
});

export const STAT_TRACKER = {
  strength: combatant => {
    return eternalRuneWeaponStats(combatant.traitsBySpellId[SPELLS.ETERNAL_RUNE_WEAPON.id]).strength;
  },
};

/**
 * Eternal Rune Weapon
 * Gain x strength while Dancing Rune Weapon is up
 * Every rune spend during DRW extends it's duration by .5sec up to a max of 5sec
 *
 * The strength and bonus duration stacks with multiple traits while the 5sec cap remains the same
 * one trait  would provide 100 strength & .5sec per rune up to 5sec
 * two traits would provide 200 strength &  1sec per rune up to 5sec
 *
 * Example report: https://www.warcraftlogs.com/reports/kmtH7VRnJ4fAhg6M/#fight=46&source=7
 * Example report: https://www.warcraftlogs.com/reports/fCBX6HMK372AZxzp/#fight=62&source=20 (with two ERW traits)
 */
class EternalRuneWeapon extends Analyzer {
  strength = 0;
  traits = 0;

  bonusDurations = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.ETERNAL_RUNE_WEAPON.id);
    if (!this.active) {
      return;
    }

    const { strength, traits } = eternalRuneWeaponStats(this.selectedCombatant.traitsBySpellId[SPELLS.ETERNAL_RUNE_WEAPON.id]);
    this.strength = strength;
    this.traits = traits;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.DANCING_RUNE_WEAPON.id) {
      this.bonusDurations.push([]);
      return;
    }

    if (!this.selectedCombatant.hasBuff(SPELLS.ETERNAL_RUNE_WEAPON_BUFF.id)) {
      return;
    }

    if (!event.classResources) {
      return;
    }
    event.classResources
      .filter(resource => resource.type === RESOURCE_TYPES.RUNES.id)
      .forEach(({ amount, cost }) => {
        const runeCost = cost || 0;
        if (runeCost <= 0) {
          return;
        }

        this.bonusDurations[this.bonusDurations.length - 1].push(DANCING_RUNE_WEAPON_BONUS_DURATION_PER_TRAIT * this.traits * runeCost);
      });
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ETERNAL_RUNE_WEAPON_BUFF.id) / this.owner.fightDuration;
  }

  get averageStrength() {
    return (this.strength * this.uptime).toFixed(0);
  }

  get wastedBonusDuration() {
    let totalTime = 0;
    this.bonusDurations.forEach(elem => {
      totalTime += elem.reduce((a, b) => a + b, 0);
    });
    return totalTime - this.totalBonusDuration;
  }

  get totalBonusDuration() {
    let totalTime = 0;
    this.bonusDurations.forEach(elem => {
      totalTime += elem.reduce((a, b) => a + b <= MAX_DANCING_RUNE_WEAPON_BONUS_DURATION ? a + b : MAX_DANCING_RUNE_WEAPON_BONUS_DURATION, 0);
    });
    return totalTime;
  }

  get averageDancingRuneWeaponBonusDuration() {
    return (this.totalBonusDuration / this.bonusDurations.length).toFixed(1);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.ETERNAL_RUNE_WEAPON.id}
        value={(
          <>
            {this.averageStrength} average Strength <br />
            {this.averageDancingRuneWeaponBonusDuration}sec average bonus duration
          </>
        )}
        tooltip={`
          ${SPELLS.ETERNAL_RUNE_WEAPON.name} grants <b>${this.strength} strength</b> while active and an uptime of ${formatPercentage(this.uptime)}%.<br/>
          You extended ${SPELLS.DANCING_RUNE_WEAPON.name} on <b>average by ${this.averageDancingRuneWeaponBonusDuration} seconds</b> (${this.totalBonusDuration}sec total bonus duration over ${this.bonusDurations.length} casts)<br />
          You wasted ${this.wastedBonusDuration} seconds worth of bonus duration by reaching the 5sec cap.
        `}
      />
    );
  }
}

export default EternalRuneWeapon;
