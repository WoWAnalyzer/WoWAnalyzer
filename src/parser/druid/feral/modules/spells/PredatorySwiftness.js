import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

const debug = false;

const PREDATORY_SWIFTNESS_BUFF_DURATION = 12000;
const EXPIRE_WINDOW = 100;
const IGNORE_DOUBLE_GAIN_WINDOW = 100;
const POTENTIAL_SPENDERS = [
  SPELLS.REGROWTH,
  SPELLS.ENTANGLING_ROOTS,
];

/**
 * Using a finishing move has a 20% chance per combo point to give the buff "Predatory Swiftness"
 * which makes the next Regrowth or Entangling Roots instant cast and usable in cat form. Normally
 * this provides occasional extra utility. But with the Bloodtalons talent it becomes an important
 * part of the damage rotation.
 * 
 * The Feral legendary Ailuro Pouncers breaks this Analyzer. The Pouncers allow Predatory Swiftness
 * to have up to 3 stacks, but the combat log still only shows an event for gaining or losing the buff
 * overall, not the change in stacks. We cannot reliably predict when the stacks will change because
 * there can be randomness as to whether a stack is generated.
 */
class PredatorySwiftness extends Analyzer {
  hasSwiftness = false;

  generated = 0;
  used = 0;
  expired = 0;
  remainAfterFight = 0;
  overwritten = 0;

  /**
   * The combat log reports the player gaining Predatory Swiftness twice when they use a free
   * Ferocious Bite from the T21 4pc set bonus. Avoid this by tracking time of last gain event.
   */
  timeLastGain = null;

  constructor(...args) {
    super(...args);
    if (this.selectedCombatant.hasFeet(ITEMS.AILURO_POUNCERS.id)) {
      // disable entirely as the legendary breaks our ability to track Predatory Swiftness
      this.isActive = false;
    }
  }

  on_finished() {
    if (this.hasSwiftness) {
      debug && console.log(`${this.owner.formatTimestamp(this.owner.fight.end_time, 3)} fight ended with a Predatory Swiftness buff unused.`);
      this.remainAfterFight = 1;
    }

    if (debug && this.generated !== (this.used + this.expired + this.remainAfterFight + this.overwritten)) {
      console.warn(`Not all Predatory Swiftness charges accounted for. Generated: ${this.generated}, used: ${this.used}, expired: ${this.expired}, remainAfterFight: ${this.remainAfterFight}, overwritten: ${this.overwritten}`);
    }
  }

  on_toPlayer_applybuff(event) {
    if (SPELLS.PREDATORY_SWIFTNESS.id !== event.ability.guid) {
      return;
    }
    debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} gained Predatory Swiftness`);
    this.hasSwiftness = true;
    this.generated += 1;
    this.timeLastGain = event.timestamp;
    this.expireTime = event.timestamp + PREDATORY_SWIFTNESS_BUFF_DURATION;
  }

  on_toPlayer_refreshbuff(event) {
    if (SPELLS.PREDATORY_SWIFTNESS.id !== event.ability.guid ||
        Math.abs(event.timestamp - this.timeLastGain) < IGNORE_DOUBLE_GAIN_WINDOW) {
      return;
    }
    debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} gained Predatory Swiftness, overwriting existing`);
    this.hasSwiftness = true;
    this.generated += 1;
    this.overwritten += 1;
    this.timeLastGain = event.timestamp;
    // buff duration not affected by pandemic
    this.expireTime = event.timestamp + PREDATORY_SWIFTNESS_BUFF_DURATION;
  }

  on_toPlayer_removebuff(event) {
    if (SPELLS.PREDATORY_SWIFTNESS.id !== event.ability.guid ||
        !this.hasSwiftness || !this.expireTime ||
        Math.abs(this.expireTime - event.timestamp) > EXPIRE_WINDOW) {
      return;
    }
    debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} Predatory Swiftness expired, unused`);
    this.expired += 1;
    this.hasSwiftness = false;
    this.expireTime = null;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (!this.isSpender(spellId) || !this.hasSwiftness) {
      return;
    }
    debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} Predatory Swiftness used`);
    this.used += 1;
    this.hasSwiftness = false;
    this.expireTime = null;
  }

  isSpender(spellId) {
    return !!POTENTIAL_SPENDERS.find(spender => spender.id === spellId);
  }

  get wasted() {
    return this.expired + this.overwritten + this.remainAfterFight;
  }

  get wastedFraction() {
    return this.wasted / this.generated;
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedFraction,
      isGreaterThan: {
        minor: 0,
        average: 0.10,
        major: 0.20,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    if (!this.selectedCombatant.hasTalent(SPELLS.BLOODTALONS_TALENT.id)) {
      // Predatory Swiftness is only important to damage rotation if the player has Bloodtalons
      return;
    }
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          You are not making use of all your chances to trigger <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} /> through <SpellLink id={SPELLS.PREDATORY_SWIFTNESS.id} />. Try to use it to instant-cast <SpellLink id={SPELLS.REGROWTH.id} /> or <SpellLink id={SPELLS.ENTANGLING_ROOTS.id} /> before you generate another charge of the buff, and before it wears off.
        </>
      )
        .icon(SPELLS.PREDATORY_SWIFTNESS.icon)
        .actual(`${formatPercentage(actual)}% of Predatory Swiftness buffs wasted.`)
        .recommended(`${recommended}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PREDATORY_SWIFTNESS.id} />}
        value={`${formatPercentage(1 - this.wastedFraction)}%`}
        label="Predatory Swiftness buffs used"
        tooltip={`You used <b>${this.used}</b> out of <b>${this.generated}</b> Predatory Swiftness buffs to instant-cast Regrowth or Entangling Roots${this.selectedCombatant.hasTalent(SPELLS.BLOODTALONS_TALENT.id) ? ' and trigger the Bloodtalons buff' : ''}.<br/>
          <li>The buff was allowed to expire <b>${this.expired}</b> time${this.expired !== 1 ? 's' : ''}.
          <li>You used another finisher while the buff was still active and overwrote it <b>${this.overwritten}</b> time${this.overwritten !== 1 ? 's' : ''}.
          <li>You had <b>${this.remainAfterFight}</b> remaining unused at the end of the fight.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(5);
}

export default PredatorySwiftness;
