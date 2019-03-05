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
 * https://www.warcraftlogs.com/reports/dfyb3XRFk6J2zpm8/#fight=13&type=healing&source=96&ability=287568&view=events
 */
class WardOfEnvelopment extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  }

  absorbUsed = 0;
  absorbWasted = 0;
  targetsHit = 0;
  uses = 0;
  shieldedNoOne = 0;
  shieldsActive = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.WARD_OF_ENVELOPMENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_PROTECTION), this.onCast);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_PROTECTION), this.onAbsorb);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_PROTECTION), this.onBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_PROTECTION), this.onRemoveBuff);

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

  onCast(event) {
    this.uses += 1;
    /* After the spell is cast the shield will drop off before the item it off CD to be used again.
     * If onRemoveBuff was never triggered, this means you missed the raid with the targeting circle.
     * In order to accurately calculate the average players buffed you need this.
     */
    if (this.shieldsActive === true) {
      this.shieldedNoOne += 1; 
    }
    this.shieldsActive = true;
  }

  onAbsorb(event) {
    this.absorbUsed += (event.amount || 0) + (event.absorbed || 0);
  }

  onBuff(event) {
    this.targetsHit += 1;
  }

  onRemoveBuff(event) {
    this.absorbWasted += event.absorb;
    this.shieldsActive = false;
  }

  get possibleUseCount() {
    return Math.ceil(this.owner.fightDuration / (ACTIVATION_COOLDOWN * 1000));
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
    return this.targetsHit / (this.uses - this.shieldedNoOne) * 0.075;
  }

  item() {
    return {
      item: ITEMS.WARD_OF_ENVELOPMENT,
      result: (
        <dfn data-tip={`
          You activated your Ward of Envelopment <b>${this.uses}</b> of <b>${this.possibleUseCount}</b> possible time${this.uses === 1 ? '' : 's'} with an average of <b>${formatNumber(this.averageAbsorbPerCast)}</b> absorption per use.
          It absorbed <b>${formatNumber(this.absorbUsed)}</b> out of <b>${formatNumber(this.totalAbsorb)}</b> damage and <b>${formatNumber(this.absorbWasted)} (${formatPercentage(this.wastedPercentage)}%)</b> was unused. <br />
          On average you hit <b>${this.averageTargetsHit.toFixed(2)}</b> out of <b>5</b> allies and gained <b>${formatPercentage(this.gainedShieldValue)}%</b> extra absorption value per cast. <br />
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
      style: 'number',
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
        .actual(`Average ${actual.toFixed(2)} out of ${MAX_ALLIES_HIT} allies hit.`)
        .recommended(`5 is recommended`);
    });
  }
}

export default WardOfEnvelopment;
