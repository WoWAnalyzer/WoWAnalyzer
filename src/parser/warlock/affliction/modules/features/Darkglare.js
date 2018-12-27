import React from 'react';

import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import StatisticsListBox from 'interface/others/StatisticsListBox';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import { getDotDurations, UNSTABLE_AFFLICTION_DEBUFFS } from '../../constants';

const BONUS_DURATION = 8000;
const DOT_DEBUFFS = [
  SPELLS.AGONY,
  SPELLS.CORRUPTION_DEBUFF,
  SPELLS.SIPHON_LIFE_TALENT,
  ...UNSTABLE_AFFLICTION_DEBUFFS,
  SPELLS.PHANTOM_SINGULARITY_TALENT,
];
const debug = false;

class Darkglare extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  _dotDurations = {};
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
    this._dotDurations = getDotDurations(this.selectedCombatant.hasTalent(SPELLS.CREEPING_DEATH_TALENT.id));
    // if player has Absolute Corruption, disregard the Corruption duration (it's permanent debuff then)
    this._hasAC = this.selectedCombatant.hasTalent(SPELLS.ABSOLUTE_CORRUPTION_TALENT.id);
    if (this._hasAC) {
      delete this._dotDurations[SPELLS.CORRUPTION_DEBUFF.id];
    }

    // event listeners
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(DOT_DEBUFFS), this.onDotApply);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(DOT_DEBUFFS), this.onDotRemove);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DARKGLARE), this._processDarkglareCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(DOT_DEBUFFS), this._processDotCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(DOT_DEBUFFS), this.onDotDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.SUMMON_DARKGLARE_DAMAGE), this.onDarkglareDamage);
  }

  onDotApply(event) {
    this._resetDotOnTarget(event);
  }

  onDotRemove(event) {
    const spellId = event.ability.guid;
    // possible Mythrax or other shenanigans with dotting Mind Controlled players
    if (event.targetIsFriendly) {
      return;
    }
    const encoded = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.dots[encoded] || !this.dots[encoded].dots[spellId]) {
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

  onDotDamage(event) {
    const spellId = event.ability.guid;
    if (event.targetIsFriendly) {
      return;
    }
    // check if it's an extended dot dmg
    const encoded = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.dots[encoded] || !this.dots[encoded].dots[spellId]) {
      debug && console.log(`Dot tick (${event.ability.name}) on unknown encoded target - ${encoded}, time: ${this.owner.formatTimestamp(event.timestamp, 3)} (${event.timestamp}), current this.dots:`, JSON.parse(JSON.stringify(this.dots)));
      // I know this isn't entirely accurate, but it's better to be a little off than not track the dot altogether (until the first recast)
      // for example Agony casted somehow "prepull" (no applybuff or cast in logs), and extended can tick for about 20 seconds without being "recognized"
      this._resetDotOnTarget(event);
      return;
    }
    const dotInfo = this.dots[encoded].dots[spellId];
    // this also filters out Corruption damage if player has AC (extendExpectedEnd ends up NaN), which is correct (if it's permanent, it can't get extended - no actual bonus damage)
    const isExtended = dotInfo.extendStart !== null;
    const isInExtendedWindow = dotInfo.expectedEnd <= event.timestamp && event.timestamp <= dotInfo.extendExpectedEnd;
    if (isExtended && isInExtendedWindow) {
      this.bonusDotDamage += event.amount + (event.absorbed || 0);
    }
  }

  onDarkglareDamage(event) {
    this.darkglareDamage += event.amount + (event.absorbed || 0);
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
    if (!DOT_DEBUFFS.some(spell => spell.id === spellId) && spellId !== SPELLS.CORRUPTION_CAST.id){
      return;
    }
    if (event.targetIsFriendly) {
      return;
    }
    this._resetDotOnTarget(event);
  }

  _resetDotOnTarget(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const spellId = event.ability.guid;
    const target = encodeTargetString(event.targetID, event.targetInstance);
    this.dots[target] = this.dots[target] || { targetName: enemy.name, dots: {} };
    this.dots[target].dots[spellId] = {
      cast: event.timestamp,
      expectedEnd: event.timestamp + this._dotDurations[spellId],
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
          title="Bonus damage from dots"
          value={this.owner.formatItemDamageDone(this.bonusDotDamage)}
          valueTooltip={`${formatThousands(this.bonusDotDamage)} damage<br />This only counts the damage that happened after the dot <u>should have fallen off</u> (but instead was extended with Darkglare)`}
        />
        <StatisticListBoxItem
          title="Average dots extended per cast"
          value={averageExtendedDots.toFixed(2)}
        />
        <StatisticListBoxItem
          title="Total damage"
          titleTooltip="Combined damage from extended dots and the pet itself"
          value={this.owner.formatItemDamageDone(totalDamage)}
          valueTooltip={`Damage from extended dots: ${formatThousands(this.bonusDotDamage)} (${this.owner.formatItemDamageDone(this.bonusDotDamage)})<br />
                        Pet damage: ${formatThousands(this.darkglareDamage)} (${this.owner.formatItemDamageDone(this.darkglareDamage)})<br />
                        Combined damage: ${formatThousands(totalDamage)}`}
        />
      </StatisticsListBox>
    );
  }
}

export default Darkglare;
