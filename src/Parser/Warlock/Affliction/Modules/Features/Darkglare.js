import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

import SPELLS from 'common/SPELLS';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';

const BONUS_DURATION = 8000;
const DOTS_AFFECTED_BY_CREEPING_DEATH = [
  SPELLS.AGONY.id,
  SPELLS.CORRUPTION_DEBUFF.id,
  SPELLS.SIPHON_LIFE_TALENT.id,
  ...UNSTABLE_AFFLICTION_DEBUFF_IDS,
];
const DOT_DEBUFF_IDS = [
  SPELLS.PHANTOM_SINGULARITY_TALENT.id,
  ...DOTS_AFFECTED_BY_CREEPING_DEATH,
];
const debug = true;
class Darkglare extends Analyzer {
  // Summon Darkglare - 3m CD, possibly reduced by Dreadful Calling trait, extends all DOTs on ALL ENEMIES (???) by 8s (ignores max duration possibly) and does damage on its own
  // track - amount of "bonus" damage from the extend, amount of extended dots (just count)
  // average amount of dots applied, when DG is cast (or even show table with all the casts so it's visualized)
  // be careful not to count dmg from Corruption if AC (nothing gets extended, no *bonus* damage)
  static dependencies = {
    enemies: Enemies,
  };
  _dotDurations = {
    [SPELLS.AGONY.id]: 18000,
    [SPELLS.CORRUPTION_DEBUFF.id]: 14000,
    [SPELLS.SIPHON_LIFE_TALENT.id]: 15000,
    // UA IDs added in constructor
    [SPELLS.PHANTOM_SINGULARITY_TALENT.id]: 16000,
  };

  totalDamage = 0;
  casts = [
    /*
      {
        timestamp: number
        [encoded target string]: {
          targetName: name,
          dots: [dot IDs],
        }
        ...
      },
      ...
     */
  ];
  // tracking all dots
  dots = {
    /*[encoded target string]: {
        targetName: name
        dots: {
          [dot ID]: {
            cast: timestamp
            expectedEnd: timestamp,
            extendStart: timestamp | null,
            extendExpectedEnd: timestamp | null
          },
        }
        ...
      },
      ...
    */
  };

  constructor(...args) {
    super(...args);
    if (this.selectedCombatant.hasTalent(SPELLS.ABSOLUTE_CORRUPTION_TALENT.id)) {
      delete this._dotDurations[SPELLS.CORRUPTION_DEBUFF.id];
    }
    UNSTABLE_AFFLICTION_DEBUFF_IDS.forEach(id => {
      this._dotDurations[id] = 8000;
    });
    if (this.selectedCombatant.hasTalent(SPELLS.CREEPING_DEATH_TALENT.id)) {
      // Creeping Death talent shortens the period and duration of dots by 15%
      DOTS_AFFECTED_BY_CREEPING_DEATH.forEach(id => {
          this._dotDurations[id] *= 0.85;
      });
    }
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (!DOT_DEBUFF_IDS.includes(spellId)) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const encoded = encodeTargetString(event.targetID, event.targetInstance);
    this.dots[encoded] = this.dots[encoded] || { targetName: enemy.name, dots: {} };
    this.dots[encoded].dots[spellId] = {
      cast: event.timestamp,
      expectedEnd: event.timestamp + this._dotDurations[spellId],
      extendStart: null,
      extendExpectedEnd: null,
    };
  }

  on_byPlayer_removedebuff(event) {
    const spellId = event.ability.guid;
    if (!DOT_DEBUFF_IDS.includes(spellId)) {
      return;
    }
    if (event.targetIsFriendly) {
      return;
    }
    const encoded = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.dots[encoded]) {
      debug && console.log(`Remove debuff on not-recorded mob - ${encoded}`, event);
      return;
    }
    delete this.dots[encoded].dots[spellId];
    if (Object.values(this.dots[encoded].dots).length === 0) {
      delete this.dots[encoded];
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SUMMON_DARKGLARE.id) {
      this._processDarkglareCast(event);
      return;
    }
    if (DOT_DEBUFF_IDS.includes(spellId)) {
      this._processDotCast(event);
      return;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!DOT_DEBUFF_IDS.includes(spellId)) {
      return;
    }
    if (event.targetIsFriendly) {
      return;
    }
    // check if it's an extended dot dmg
    const encoded = encodeTargetString(event.targetID, event.targetInstance);
    const dotInfo = this.dots[encoded].dots[spellId];
    // this also filters out Corruption damage if player has AC (extendExpectedEnd ends up NaN), which is correct
    if (dotInfo.extendStart !== null
          && dotInfo.expectedEnd <= event.timestamp
          && event.timestamp <= dotInfo.extendExpectedEnd) {
      this.totalDamage += event.amount + (event.absorb || 0);
    }
  }

  _processDarkglareCast(event) {
    // DG was cast, record it and start tracking dots
    // get all current dots on targets from this.dots, record it into this.casts
    const dgCast = {
      timestamp: event.timestamp,
    };
    Object.entries(this.dots).forEach(([encoded, obj]) => {
      const dotIds = Object.keys(obj.dots).map(stringId => Number(stringId));
      dgCast[encoded] = {
        targetName: obj.targetName,
        dots: dotIds,
      };
      // while already iterating through the collection, modify it, filling out extendStart and extendExpectedEnd
      Object.values(obj.dots).forEach((dotInfo) => {
        dotInfo.extendStart = event.timestamp;
        // to calculate the extendExpectedEnd, we:
        // take remaining duration at the time of the cast
        const remaining = dotInfo.expectedEnd - event.timestamp;
        // add extend duration to it
        const extended = remaining + BONUS_DURATION;
        // and add it to the time of the cast
        dotInfo.extendExpectedEnd = event.timestamp + extended;
      });
    });
    this.casts.push(dgCast);
  }

  _processDotCast(event) {
    // if it's a dot, refresh its data in this.dots
    const spellId = event.ability.guid;
    // Corruption cast has different spell ID than the debuff (it's not in DOT_DEBUFF_IDS)
    if (!DOT_DEBUFF_IDS.includes(spellId) && spellId !== SPELLS.CORRUPTION_CAST.id) {
      return;
    }
    if (event.targetIsFriendly) {
      return;
    }
    // return if the target doesn't have the debuff (cast should always precede applydebuff)
    const encoded = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.dots[encoded] || !this.dots[encoded][spellId]) {
      return;
    }
    this.dots[encoded].dots[spellId] = {
      cast: event.timestamp,
      expectedEnd: event.timestamp + this._dotDurations[spellId],
      extendStart: null,
      extendExpectedEnd: null,
    };
  }
}

export default Darkglare;
