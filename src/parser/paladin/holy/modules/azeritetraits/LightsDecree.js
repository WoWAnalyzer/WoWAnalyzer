import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import ItemDamageDone from 'interface/others/ItemDamageDone';

import { formatNumber } from 'common/format';
import Events from 'parser/core/Events';
import BeaconHealSource from '../beacons/BeaconHealSource';

const LIGHTS_DECREE_BASE_DURATION = 5;
const AVENGING_WRATH_BASE_DURATION = 20;

/**
 * Spending Holy Power during Avenging Wrath causes you to explode with Holy light for 508 damage per Holy Power spent to nearby enemies.
 * Avenging Wrath's duration is increased by 5 sec.
 */
class LightsDecree extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    beaconHealSource: BeaconHealSource,
  };

  casts = 0;
  lastAvengingWrath = 0;
  avengingWrathDuration = AVENGING_WRATH_BASE_DURATION;
  lightsDecreeDuration = LIGHTS_DECREE_BASE_DURATION;
  bonusHolyShocks = 0;
  bonusHealing = 0;
  bonusDamage = 0;
  glimmers = [];

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTrait(SPELLS.LIGHTS_DECREE.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AVENGING_WRATH), this.onAvengingWrathCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHOCK_CAST), this.onHolyShock);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHOCK_HEAL), this.onHolyShock);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHOCK_DAMAGE), this.onHolyShock);

    if(this.selectedCombatant.hasTalent(SPELLS.SANCTIFIED_WRATH_TALENT.id)){
      this.avengingWrathDuration += this.avengingWrathDuration * 0.2;
      this.lightsDecreeDuration += this.lightsDecreeDuration * 0.2;
    }

    if (this.selectedCombatant.hasTrait(SPELLS.GLIMMER_OF_LIGHT_TRAIT.id)){
      this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT), this.onGlimmerHeal);
      this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_DAMAGE), this.onGlimmerDamage);
    }

    if (this.selectedCombatant.hasTrait(SPELLS.RADIANT_INCANDESCENCE_TRAIT.id)){
      this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RADIANT_INCANDESCENCE.id), this.onRadiantHeal);
      this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RADIANT_INCANDESCENCE_DAMAGE.id), this.onRadiantDamage);
    }
  }

  avengingWrathBuffViaLightsDecree(event) {
    const buff = this.selectedCombatant.getBuff(SPELLS.AVENGING_WRATH.id, event.timestamp);
    if (buff === undefined) {
      return false;
    }

    if (event.timestamp >= buff.start + (this.avengingWrathDuration * 1000)
      && event.timestamp < buff.start + (this.avengingWrathDuration * 1000) + this.lightsDecreeDuration * 1000){
        return true;
    }

    return false;
  }

  onAvengingWrathCast(event) {
    this.casts += 1;
    this.lastAvengingWrath = event.timestamp;
  }

  onHeal(event){
    if (this.avengingWrathBuffViaLightsDecree(event)){
      const healing = (event.amount + (event.absorbed || 0));
      this.bonusHealing += healing - (healing / 1.2);
    }
  }

  onDamage(event){
    if (this.avengingWrathBuffViaLightsDecree(event)){
      const damage = (event.amount + (event.absorbed || 0));
      this.bonusDamage += damage - (damage / 1.2);
    }
  }

  onHolyShock(event){
    if (this.avengingWrathBuffViaLightsDecree(event)){
      this.bonusHolyShocks += 1;
    }
  }

  onGlimmerHeal(event){

  }

  onGlimmerDamage(event){

  }

  onRadiantHeal(event){

  }

  onRadiantDamage(event){

  }

get durationIncrease(){
  return this.casts * LIGHTS_DECREE_BASE_DURATION;
}

get additionalUptime(){
  return this.durationIncrease / (this.owner.fightDuration / 60000);
}

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LIGHTS_DECREE.id}
        value={(
          <>
            <ItemHealingDone amount={this.bonusHealing} /><br />
            <ItemDamageDone amount={this.bonusDamage} /><br />
          </>
        )}
        tooltip={(
          <>
          20% bonus healing from Avenging Wrath granted <b>+{formatNumber(this.bonusHealing)}</b> additional healing over {this.durationIncrease.toFixed(1)} seconds.<br />
          20% bonus damage from Avenging Wrath granted <b>+{formatNumber(this.bonusDamage)}</b> additional damage over {this.durationIncrease.toFixed(1)} seconds.<br />
          {(this.selectedCombatant.hasTalent(SPELLS.SANCTIFIED_WRATH_TALENT.id) 
            ? `50% cooldown reduction allowed you to cast ` + (this.bonusHolyShocks / 2).toFixed(1) + ` extra Holy Shock(s) over ` + this.durationIncrease.toFixed(1) + ` seconds.`: '')}
          <br />
          </>
        )}
      />
    );
  }
}

export default LightsDecree;
