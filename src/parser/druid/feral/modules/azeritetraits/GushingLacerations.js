import React from 'react';

import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import StatTracker from 'parser/shared/modules/StatTracker';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

import Abilities from '../Abilities';

const debug = false;

/**
 * Gushing Lacerations
 * Rip deals X additional periodic damage, and has a 6% chance to award a combo point each time it deals damage.
 * The X additional damage is applied to every tick of the DoT. The 6% chance doesn't increase with multiple traits.
 */
class GushingLacerations extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    abilities: Abilities,
  };

  traitBonus = 0;
  ripTickCoefficient = 0;
  attackPower = 0;
  totalDamage = 0;
  comboProcs = 0;
  wastedCombo = 0;

  constructor(...args) {
    super(...args);
    if (!this.selectedCombatant.hasTrait(SPELLS.GUSHING_LACERATIONS_TRAIT.id)) {
      this.active = false;
      return;
    }

    this.traitBonus = this.selectedCombatant.traitsBySpellId[SPELLS.GUSHING_LACERATIONS_TRAIT.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.GUSHING_LACERATIONS_TRAIT.id, rank)[0], 0);
    this.ripTickCoefficient = this.abilities.getAbility(SPELLS.RIP.id).primaryCoefficient;

    debug && this.log(`trait bonus: ${this.traitBonus}`);
    debug && this.log(`rip per tick coefficient: ${this.ripTickCoefficient}`);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this._cast);
    this.addEventListener(Events.energize.to(SELECTED_PLAYER).spell(SPELLS.GUSHING_LACERATIONS_PROC), this._comboProc);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RIP), this._ripDamage);
  }

  _cast(event) {
    if (!event.attackPower) {
      return;
    }
    // listen for all cast events to get the most up to date possible measure of attackPower. StatTracker could in theory provide a more up to date value, but its accuracy is currently poorer than reading off attackPower from events.
    this.attackPower = event.attackPower;
  }

  _comboProc(event) {
    this.comboProcs += 1;
    this.wastedCombo += event.waste || 0;
    debug && this.log(`Gushing Lacerations gave a combo point, with waste: ${event.waste}`);
  }

  _ripDamage(event) {
    const [ damageContribution ] = calculateBonusAzeriteDamage(event, [this.traitBonus], this.attackPower, this.ripTickCoefficient);
    this.totalDamage += damageContribution;
    debug && this.log(`Rip tick with extra ${damageContribution.toFixed(0)} damage`);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.GUSHING_LACERATIONS_TRAIT.id}
        value={(
          <>
            <ItemDamageDone amount={this.totalDamage} /><br />
            {((this.comboProcs - this.wastedCombo) / (this.owner.fightDuration / 1000 / 60)).toFixed(1)} combo points per minute
          </>
        )}
        tooltip={
          `Provided a total of <b>${formatNumber(this.totalDamage)}</b> extra damage through your Rip.<br />
          Triggered the generation an extra <b>${this.comboProcs}</b> combo point${this.comboProcs === 1 ? '' : 's'}, of which <b>${this.wastedCombo}</b> ${this.wastedCombo === 1 ? 'was' : 'were'} wasted.`
        }
      />
    );
  }
}

export default GushingLacerations;
