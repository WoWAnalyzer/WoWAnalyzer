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
  _hasAC = false;

  totalDamage = 0;
  casts = [
    /*
      {
        timestamp: number
        [encoded target string]: [dot IDs],
        ...
      },
      ...
     */
  ];
  // tracking all dots
  dots = {
    /*[encoded target string]: {
        [dot ID]: {
          cast: timestamp
          expectedEnd: timestamp,
          extendStart: timestamp | null,
          extendExpectedEnd: timestamp | null
        } | null,
        ...
      },
      ...
    */
  };

  constructor(...args) {
    super(...args);
    if (this.selectedCombatant.hasTalent(SPELLS.ABSOLUTE_CORRUPTION_TALENT.id)) {
      this._dotDurations[SPELLS.CORRUPTION_DEBUFF.id] = undefined;
    }
    UNSTABLE_AFFLICTION_DEBUFF_IDS.forEach(id => this._dotDurations[id] = 8000);
    if (this.selectedCombatant.hasTalent(SPELLS.CREEPING_DEATH_TALENT.id)) {
      // Creeping Death talent shortens the period and duration of dots by 15%
      DOTS_AFFECTED_BY_CREEPING_DEATH.forEach(id => this._dotDurations[id] *= 0.85);
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
    const encoded = encodeTargetString(enemy.targetID, enemy.targetInstance);
    this.dots[encoded] = this.dots[encoded] || {};
    this.dots[encoded][spellId] = {
      cast: event.timestamp,
      expectedEnd: event.timestamp + this._dotDurations[spellId],
      extendStart: null,
      extendExpectedEnd: null,
    };
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

  _processDarkglareCast(event) {
    // DG was cast, record it and start tracking dots
    // get all current dots on targets from this.dots, record it into this.casts

  }

  _processDotCast(event) {
    // if it's a dot, refresh its data in this.dots

  }
}

export default Darkglare;
