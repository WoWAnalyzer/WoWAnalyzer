import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/core/modules/Enemies';
import { encodeTargetString } from 'parser/core/modules/EnemyInstances';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import StatisticsListBox from 'interface/others/StatisticsListBox';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../constants';

const BONUS_DURATION = 8000;
const UNSTABLE_AFFLICTION_DURATION = 8000;
const CREEPING_DEATH_COEFFICIENT = 0.85; // Creeping Death talent shortens duration and period of certain dots by 15%
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
const debug = false;

class Darkglare extends Analyzer {
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

  bonusDotDamage = 0;
  darkglareDamage = 0;
  casts = [
    /*
      {
        timestamp: number
        [encoded target string]: {
          targetName: name,
          dots: [dot IDs],
        }
      },
     */
  ];
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
      },
    */
  };

  constructor(...args) {
    super(...args);
    // if player has Absolute Corruption, disregard the Corruption duration (it's permanent debuff then)
    this._hasAC = this.selectedCombatant.hasTalent(SPELLS.ABSOLUTE_CORRUPTION_TALENT.id);
    if (this._hasAC) {
      delete this._dotDurations[SPELLS.CORRUPTION_DEBUFF.id];
    }
    UNSTABLE_AFFLICTION_DEBUFF_IDS.forEach(id => {
      this._dotDurations[id] = UNSTABLE_AFFLICTION_DURATION;
    });
    if (this.selectedCombatant.hasTalent(SPELLS.CREEPING_DEATH_TALENT.id)) {
      DOTS_AFFECTED_BY_CREEPING_DEATH.forEach(id => {
          this._dotDurations[id] *= CREEPING_DEATH_COEFFICIENT;
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
    this._resetDotOnTarget(spellId, encoded, event.timestamp);
  }

  on_byPlayer_removedebuff(event) {
    const spellId = event.ability.guid;
    if (!DOT_DEBUFF_IDS.includes(spellId)) {
      return;
    }
    // possible Mythrax or other shenanigans with dotting Mind Controlled players
    if (event.targetIsFriendly) {
      return;
    }
    const encoded = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.dots[encoded]) {
      debug && console.log(`Remove debuff on not-recorded mob - ${encoded}`, event);
      return;
    }
    // remove dot from tracking
    delete this.dots[encoded].dots[spellId];
    // if it was the last dot on a mob, remove mob as well
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
    if (!this.dots[encoded]) {
      debug && console.log(`Dot tick on unknown encoded target - ${encoded}, time: ${this.owner.formatTimestamp(event.timestamp, 3)} (${event.timestamp}), current this.dots:`, JSON.parse(JSON.stringify(this.dots)));
      return;
    }
    const dotInfo = this.dots[encoded].dots[spellId];
    // this also filters out Corruption damage if player has AC (extendExpectedEnd ends up NaN), which is correct (if it's permanent, it can't get extended - no actual bonus damage)
    const isExtended = dotInfo.extendStart !== null;
    const isInExtendedWindow = dotInfo.expectedEnd <= event.timestamp && event.timestamp <= dotInfo.extendExpectedEnd;
    if (isExtended && isInExtendedWindow) {
      this.bonusDotDamage += event.amount + (event.absorb || 0);
    }
  }

  on_byPlayerPet_damage(event) {
    if (event.ability.guid !== SPELLS.SUMMON_DARKGLARE_DAMAGE.id) {
      return;
    }
    this.darkglareDamage += event.amount + (event.absorb || 0);
  }

  _processDarkglareCast(event) {
    // get all current dots on targets from this.dots, record it into this.casts
    const dgCast = {
      timestamp: event.timestamp,
    };
    Object.entries(this.dots).forEach(([encoded, obj]) => {
      // convert string ID keys to numbers
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
    this._resetDotOnTarget(spellId, encoded, event.timestamp);
  }

  _resetDotOnTarget(spellId, target, timestamp) {
    this.dots[target].dots[spellId] = {
      cast: timestamp,
      expectedEnd: timestamp + this._dotDurations[spellId],
      extendStart: null,
      extendExpectedEnd: null,
    };
  }

  statistic() {
    let totalExtendedDots = 0;
    // for each cast, and each enemy in that cast, count the amount of dots on the enemy (disregard Corruption if player has Absolute Corruption)
    Object.values(this.casts).forEach(cast => {
      Object.keys(cast).filter(key => key !== 'timestamp').forEach(target => {
        if (this._hasAC) {
          totalExtendedDots += cast[target].dots.filter(id => id !== SPELLS.CORRUPTION_DEBUFF.id).length;
        } else {
          totalExtendedDots += cast[target].dots.length;
        }
      });
    });
    const averageExtendedDots = (totalExtendedDots / this.casts.length) || 0;
    const totalDamage = this.bonusDotDamage + this.darkglareDamage;
    return (
      <StatisticsListBox title={<SpellLink id={SPELLS.SUMMON_DARKGLARE.id} />}>
        <StatisticListBoxItem
          title="Bonus damage from extended dots"
          value={formatThousands(this.bonusDotDamage)}
          valueTooltip="This only counts the damage that happened after the dot <u>should have fallen off</u> (but instead was extended with Darkglare)"
        />
        <StatisticListBoxItem
          title="Average dots extended per cast"
          value={averageExtendedDots.toFixed(2)}
        />
        <StatisticListBoxItem
          title="Total damage"
          titleTooltip="Combined damage from extended dots and the pet itself"
          value={formatThousands(totalDamage)}
          valueTooltip={`Extended dot damage: ${formatThousands(this.bonusDotDamage)}<br />Pet damage: ${formatThousands(this.darkglareDamage)}<br />Percentage of total damage done: ${this.owner.formatItemDamageDone(totalDamage)}`}
        />
      </StatisticsListBox>
    );
  }
}

export default Darkglare;
