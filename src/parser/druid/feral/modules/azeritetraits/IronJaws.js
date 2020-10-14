import React from 'react';

import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { calculateAzeriteEffects } from 'common/stats';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/ItemDamageDone';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import Abilities from '../Abilities';

const debug = false;
const BUFFER_TIME = 100;
const PROC_CHANCE_PER_COMBO = 0.08;
/**
 * Iron Jaws
 * Ferocious Bite has a 8% chance per combo point to increase the damage of your next Maim by X per combo point.
 *
 * Example log: /report/7ZjPwhdHXFb8r6ky/6-Normal+Grong+the+Revenant+-+Kill+(3:30)/17-Ashurabisha
 *
 * Using Ferocious Bite has a chance to give the player the Iron Jaws buff, which lasts 30 seconds or until they next use Maim.
 * When Maim is used with the buff active the removebuff event appears before the cast event for Maim in the log.
 */
class IronJaws extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  traitBonus = 0; // trait bonus damage is per combo point on
  coefficient = 0; // per combo point spent on Maim
  damage = 0;

  // updated when Maim is cast, used when Maim damage is detected
  attackPower = 0;
  comboPoints = 0;

  ironJawsProcCount = 0;
  expectedProcCount = 0;
  unbuffedMaimCount = 0;
  buffedMaimCount = 0;
  missingComboMaimCount = 0;

  constructor(...args) {
    super(...args);
    if (!this.selectedCombatant.hasTrait(SPELLS.IRON_JAWS_TRAIT.id)) {
      this.active = false;
      return;
    }

    this.traitBonus = this.selectedCombatant.traitsBySpellId[SPELLS.IRON_JAWS_TRAIT.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.IRON_JAWS_TRAIT.id, rank)[0], 0);
    this.coefficient = this.abilities.getAbility(SPELLS.MAIM.id).primaryCoefficient;

    debug && this.log(`Iron Jaws bonus: ${this.traitBonus} from ${this.selectedCombatant.traitsBySpellId[SPELLS.IRON_JAWS_TRAIT.id].length} traits.`);
    debug && this.log(`Maim's coefficient: ${this.coefficient}`);

    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.IRON_JAWS_BUFF), this._gainIronJaws);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.IRON_JAWS_BUFF), this._gainIronJaws);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MAIM), this._castMaim);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MAIM), this._damageMaim);
    // there is also a damage event in the log from SPELLS.MAIM_DEBUFF but that's the stun attempting to be applied and never causes damage.
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE), this._castBite);
  }

  getComboPoints(event) {
    const resource = event.classResources.find(item => item.type === RESOURCE_TYPES.COMBO_POINTS.id);
    if (!resource) {
      debug && this.log('Unable to find combo points.');
      return null;
    }
    return resource.amount;
  }

  _gainIronJaws(event) {
    this.ironJawsProcCount += 1;
  }

  _castMaim(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.IRON_JAWS_BUFF.id, null, BUFFER_TIME)) {
      this.unbuffedMaimCount += 1;
      debug && this.log('Unbuffed Maim');
      return;
    }
    this.buffedMaimCount += 1;
    debug && this.log('Buffed Maim');

    this.comboPoints = this.getComboPoints(event);
    debug && this.log(`Maim used with ${this.comboPoints} combo points.`);
    if (this.comboPoints && this.comboPoints < 5) {
      this.missingComboMaimCount += 1;
    }
    this.attackPower = event.attackPower;
  }

  _damageMaim(event) {
    if (!this.comboPoints || !this.attackPower) {
      debug && this.warn(`Unable to find attackPower (${this.attackPower}) or combo points (${this.comboPoints}) of Maim cast.`);
      return;
    }
    const [ traitDamageContribution ] = calculateBonusAzeriteDamage(event, [this.traitBonus * this.comboPoints], this.attackPower, this.coefficient * this.comboPoints);
    this.damage += traitDamageContribution;
    debug && this.log(`Iron Jaws contributed ${traitDamageContribution.toFixed(0)} bonus damage of Maim's total ${event.amount + event.absorbed}`);
  }

  _castBite(event) {
    // whenever the player casts Ferocious Bite there's a chance it'll activate Iron Jaws. Keep track of that chance and see how it matches up with reality.
    const comboPoints = this.getComboPoints(event);
    if (!comboPoints) {return;}
    this.expectedProcCount += PROC_CHANCE_PER_COMBO * comboPoints;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.IRON_JAWS_TRAIT.id}
        value={(
          <ItemDamageDone amount={this.damage} />
        )}
        tooltip={(
          <>
            Increased your Maim damage by a total of <b>{formatNumber(this.damage)}</b>.<br />
            From your use of Ferocious Bite you would expect on average to get <b>{this.expectedProcCount.toFixed(1)}</b> Iron Jaws procs. You actually got <b>{this.ironJawsProcCount}</b>.<br />
            Of those <b>{this.ironJawsProcCount}</b> procs you made use of <b>{this.buffedMaimCount}</b> to buff Maim's damage.<br />
            You cast Maim <b>{this.unbuffedMaimCount}</b> time{this.unbuffedMaimCount === 1 ? '' : 's'} without the Iron Jaws buff.
          </>
        )}
      />
    );
  }

  get traitCountThreshold() {
    return { // 1 trait is basically worthless, 2+ is fine
      actual: this.selectedCombatant.traitsBySpellId[SPELLS.IRON_JAWS_TRAIT.id].length,
      isLessThan: {
        minor: 2,
        average: 2,
        major: 2,
      },
      style: 'number',
    };
  }

  get wastedProcsThreshold() {
    return { // percentage of procs that were not used
      actual: (this.ironJawsProcCount - this.buffedMaimCount) / this.ironJawsProcCount,
      isGreaterThan: {
        minor: 0.10,
        average: 0.15,
        major: 0.25,
      },
      style: 'percentage',
    };
  }

  get unbuffedMaimThreshold() {
    return { // unbuffed Maims per minute
      actual: this.unbuffedMaimCount / (this.owner.fightDuration / (60000)),
      isGreaterThan: {
        minor: 0.3,
        average: 0.9,
        major: 1.2,
      },
      style: 'number',
    };
  }

  get missingComboMaimThreshold() {
    return { // percentage of Maim casts made without full combo points
      actual: this.missingComboMaimCount / (this.unbuffedMaimCount + this.buffedMaimCount),
      isGreaterThan: {
        minor: 0.0,
        average: 0.0,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.traitCountThreshold).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          Using just 1 <SpellLink id={SPELLS.IRON_JAWS_TRAIT.id} /> Azerite trait is usually a waste. The reduction in your damage output from using <SpellLink id={SPELLS.MAIM.id} /> is only just made up for by the trait's bonus damage, so you would be better off with almost any other Feral trait.
        </>,
      )
        .icon(SPELLS.IRON_JAWS_TRAIT.icon)
        .actual(i18n._(t('druid.feral.suggestions.ironJaws.efficiency')`${actual} Iron Jaws traits.`))
        .recommended(`2, 3 or none is recommended.`));

    when(this.wastedProcsThreshold).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You're not making full use of your <SpellLink id={SPELLS.IRON_JAWS_TRAIT.id} /> Azerite trait. When <SpellLink id={SPELLS.IRON_JAWS_TRAIT.id} /> procs you should replace your next finisher with <SpellLink id={SPELLS.MAIM.id} /> to make use of the significant bonus damage.
        </>,
      )
        .icon(SPELLS.IRON_JAWS_TRAIT.icon)
        .actual(i18n._(t('druid.feral.suggestions.ironJaws.procsWasted')`${(actual * 100).toFixed(0)}% of Iron Jaws procs wasted.`))
        .recommended(`<${(recommended * 100).toFixed(0)}% recommended.`));

    when(this.unbuffedMaimThreshold).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You're using <SpellLink id={SPELLS.MAIM.id} /> when it's not buffed by your <SpellLink id={SPELLS.IRON_JAWS_TRAIT.id} /> Azerite trait. Because of the cooldown on <SpellLink id={SPELLS.MAIM.id} /> this risks the ability not being available when <SpellLink id={SPELLS.IRON_JAWS_TRAIT.id} /> is active. If a fight requires you to regularly use <SpellLink id={SPELLS.MAIM.id} /> outside of your damage rotation, switching to different Azerite traits is likely to be beneficial.
        </>,
      )
        .icon(SPELLS.IRON_JAWS_TRAIT.icon)
        .actual(i18n._(t('druid.feral.suggestions.ironJaws.unbuffedMaims')`${actual.toFixed(1)} unbuffed Maims per minute.`))
        .recommended(`<${recommended.toFixed(1)} recommended.`));

    when(this.missingComboMaimThreshold).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You're using <SpellLink id={SPELLS.MAIM.id} /> without full combo points. With your <SpellLink id={SPELLS.IRON_JAWS_TRAIT.id} /> Azerite trait <SpellLink id={SPELLS.MAIM.id} /> becomes an important damage source, and using it without full combo points significantly reduces its damage.
        </>,
      )
        .icon(SPELLS.IRON_JAWS_TRAIT.icon)
        .actual(i18n._(t('druid.feral.suggestions.ironJaws.maimsWithoutFullCombo')`${(actual * 100).toFixed(0)}% of Maims used without full combo points.`))
        .recommended(`${(recommended * 100).toFixed(0)}% recommended.`));
  }
}

export default IronJaws;
