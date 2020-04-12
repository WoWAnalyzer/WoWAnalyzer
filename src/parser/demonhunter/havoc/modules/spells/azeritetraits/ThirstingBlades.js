import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import React from 'react';

// grabbed from RevolvingBlades.js
const azeriteTraitStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [damage] = calculateAzeriteEffects(SPELLS.THIRSTING_BLADES.id, rank);
  obj.damage += damage;
  return obj;
}, {
  damage: 0,
});

/**
 * Thirsting Blades Azerite Power
 * Requires Demon Hunter (Havoc)
 * 
 * Every 1.5 sec, increase the damage of Chaos Strike by 10 and reduce its cost by 1 Fury. This effect stacks
 * 
 * Heavily borrowed from RevolvingBlades.js to make this module
 */
class ThirstingBlades extends Analyzer {

  damagePerThirstingBlades = 0; // calculate damage per stack for azerite trait
  stacksGained = 0; // total over entire fight used (wont count stacks that dont get used like at end of fight)
  castedCount = 0; // how many chaos strikes or annhilation casts (buff is removed/used)
  currentStacks = 0; // tracks the stack amount everytime the buff is removed/used

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.THIRSTING_BLADES.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER), this.onApplyBuffStack);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onApplyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER), this.onRemoveThirstingBlades);
    
    const { damage } = azeriteTraitStats(this.selectedCombatant.traitsBySpellId[SPELLS.THIRSTING_BLADES.id]);
    this.damagePerThirstingBlades = damage;

  }

  onApplyBuff(event) {
    if(event.ability.guid === SPELLS.THIRSTING_BLADES_BUFF.id) {
      this.currentStacks = 1;
    }
  }

  onApplyBuffStack(event) {
    if(event.ability.guid === SPELLS.THIRSTING_BLADES_BUFF.id) {
      this.currentStacks += 1;
    }
  }

  // Using remove buff to only count the buffs that were used/consumed by annhilation/chaos strike
  // This will cause a slight difference between warcraft logs and analyzer reports
  onRemoveThirstingBlades(event) {
    if(event.ability.guid === SPELLS.THIRSTING_BLADES_BUFF.id) {
      this.stacksGained += this.currentStacks;
      this.castedCount += 1;
      this.currentStacks = 0;
    }
  }

  statistic() {

    const totalDamage = this.stacksGained * this.damagePerThirstingBlades;
    const damageThroughputPercent = this.owner.getPercentageOfTotalDamageDone(totalDamage);
    const dps = totalDamage / this.owner.fightDuration * 1000;

    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <>
            <SpellLink id={SPELLS.THIRSTING_BLADES.id} /> stacks every 1.5 seconds, increasing <SpellLink id={SPELLS.ANNIHILATION.id} /><br />
            and <SpellLink id={SPELLS.CHAOS_STRIKE.id} /> by {formatNumber(this.damagePerThirstingBlades)} damage per <SpellLink id={SPELLS.THIRSTING_BLADES.id} /> stack.<br />
            <br />
            Reduces the Fury cost for <SpellLink id={SPELLS.ANNIHILATION.id} /><br />
            and <SpellLink id={SPELLS.CHAOS_STRIKE.id} /> by 1 per stack of <SpellLink id={SPELLS.THIRSTING_BLADES.id} /> <br />
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.THIRSTING_BLADES}>
          <img
            src="/img/sword.png"
            alt="Damage"
            className="icon"
          /> {formatNumber(dps)} DPS <small>
              {formatPercentage(damageThroughputPercent)} % of total
            </small>
            <br />
            <SpellIcon id={SPELLS.EYE_BEAM.id} noLink /> {this.stacksGained} <small> Fury saved</small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default ThirstingBlades;
