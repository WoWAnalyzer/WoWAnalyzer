import React from 'react';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import ItemLink from 'common/ItemLink';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import Abilities from 'parser/core/modules/Abilities';

const MAX_ALLIES_HIT = 5;
const ACTIVATION_COOLDOWN = 120; // seconds

/**
 * Use: Envelop up to 5 allies in the targeted area in shared shields for 10 sec, preventing up to [x] damage taken by any of them. Damage prevented is increased when affecting multiple allies. (2 Min Cooldown)
 * 
 * Allies affected have the Enveloping Protection buff, lasts 10 seconds or until all damage is absorbed.
 * Hitting 1 ally gives the base value, each additional ally hit adds 7.5% of the base value. Maximum of 5 people hit for 30% extra on top of the base value.
 *
 * Tested with log:
 * https://wowanalyzer.com/report/MBqH3rCN7wa2fvjR/13-Normal+Conclave+of+the+Chosen+-+Kill+(7:45)/18-Holyschmidt
 */
class WardOfEnvelopment extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  }

  absorbUsed = 0;
  absorbWasted = 0;
  targetsHit = 0;
  firstExpiration = false;
  uses = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.WARD_OF_ENVELOPMENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.ENVELOPING_PROTECTION]), this.onCast);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell([SPELLS.ENVELOPING_PROTECTION]), this.onAbsorb);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.ENVELOPING_PROTECTION]), this.onBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell([SPELLS.ENVELOPING_PROTECTION]), this.onRemoveBuff);

    if (this.active) {
      this.abilities.add({
        spell: SPELLS.ENVELOPING_PROTECTION,
        name: ITEMS.WARD_OF_ENVELOPMENT.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: ACTIVATION_COOLDOWN,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  onCast(event) {
    const spellId = event.ability.guid;
    if(spellId === SPELLS.ENVELOPING_PROTECTION.id){
      this.uses += 1;
      this.firstExpiration = true; // Reset it back to the first expiration
    }
  }

  onAbsorb(event) {
    const spellId = event.ability.guid;
    if(spellId === SPELLS.ENVELOPING_PROTECTION.id){
      this.absorbUsed += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  onBuff(event) {
    const spellId = event.ability.guid;
    if(spellId === SPELLS.ENVELOPING_PROTECTION.id){
      this.targetsHit += 1;
    }
  }

  onRemoveBuff(event) {
    const spellId = event.ability.guid;
    if(spellId === SPELLS.ENVELOPING_PROTECTION.id){
      if (this.firstExpiration === true) { // If this is the first buff expiration for this cast, add it to the total wasted
        this.absorbWasted += event.absorb;
        this.firstExpiration = false; // Set it to false so it doesn't add the absorb for every other buff
      }
    }
  }

  get possibleUseCount() {
    return 1 + Math.floor(this.owner.fightDuration / (ACTIVATION_COOLDOWN * 1000));
  }

  // Average amount of damage absorbed on each cast
  get averageAbsorbPerCast() {
    return this.absorbUsed / this.uses;
  }

  // Total amount of absorbs put out
  get totalAbsorb() {
    return this.absorbUsed + this.absorbWasted;
  }

  // Percentage of absorbs put out that was wasted by expiring
  get wastedPercentage() {
    return this.absorbWasted / (this.absorbUsed + this.absorbWasted);
  }

  // Average number of allies hit (max of 5)
  get averageTargetsHit() {
    return this.targetsHit / this.uses;
  }

  // Extra shield value gained by hitting multiple allies (up to 5, 7.5% for each after base)
  get gainedShieldValue() {
    return Math.ceil((this.targetsHit / this.uses) - 1) * 0.075;
  }

  item() {
    return {
      item: ITEMS.WARD_OF_ENVELOPMENT,
      result: (
        <dfn data-tip={`
          You activated your Ward of Envelopment <b>${this.uses}</b> of <b>${this.possibleUseCount}</b> possible time${this.uses === 1 ? '' : 's'} with an average of <b>${formatNumber(this.averageAbsorbPerCast)}</b> absorption per use.
          It absorbed <b>${formatNumber(this.absorbUsed)}</b> out of <b>${formatNumber(this.totalAbsorb)}</b> damage and <b>${formatNumber(this.absorbWasted)} (${formatPercentage(this.wastedPercentage)}%)</b> was unused. <br />
          On average you hit <b>${formatNumber(this.averageTargetsHit)}</b> out of <b>5</b> allies and gained <b>${formatPercentage(this.gainedShieldValue)}%</b> extra absorption value. <br />
          `}>
          <ItemHealingDone amount={this.absorbUsed} />
        </dfn>
      ),
    };
  }

  get suggestedShieldValue() {
    return {
      actual: this.averageTargetsHit,
      isLessThan: {
        minor: 5,
        average: 4,
        major: 3,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    when(this.suggestedShieldValue).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Your usage of <ItemLink id={ITEMS.WARD_OF_ENVELOPMENT.id} /> can be improved. Try to place the it in an area with more allies to increase the overall abosorption it provides. 
        </>
      )
        .icon(ITEMS.WARD_OF_ENVELOPMENT.icon)
        .actual(`Average ${formatNumber(actual)} out of ${MAX_ALLIES_HIT} allies hit.`)
        .recommended(`5 is recommended`);
    });
  }
}

export default WardOfEnvelopment;
