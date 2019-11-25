import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import UptimeIcon from 'interface/icons/Uptime';
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
  avengingWrathDuration = AVENGING_WRATH_BASE_DURATION;
  lightsDecreeDuration = LIGHTS_DECREE_BASE_DURATION;
  bonusHolyShocks = 0;
  bonusHealing = 0;
  bonusDamage = 0;

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
      this.avengingWrathDuration += this.avengingWrathDuration * 0.25;
      this.lightsDecreeDuration += this.lightsDecreeDuration * 0.25;
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

get durationIncrease(){
  return this.casts * this.lightsDecreeDuration;
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
            <UptimeIcon /> {this.additionalUptime.toFixed(1)}% <small>uptime {this.durationIncrease} seconds</small><br />
            <ItemHealingDone amount={this.bonusHealing} /><br />
            <ItemDamageDone amount={this.bonusDamage} /><br />
          </>
        )}
        tooltip={(
          <>
          You cast Avenging Wrath <b>{this.casts}</b> time(s) for <b>{this.durationIncrease.toFixed(1)}</b> seconds of increased duration.<br />
          20% bonus healing from Avenging Wrath granted <b>+{formatNumber(this.bonusHealing)}</b> additional healing.<br />
          20% bonus damage from Avenging Wrath granted <b>+{formatNumber(this.bonusDamage)}</b> additional damage.<br />
          {(this.selectedCombatant.hasTalent(SPELLS.SANCTIFIED_WRATH_TALENT.id) 
            ? `You cast ` + this.bonusHolyShocks + `Holy Shock(s) during the 50% cooldown reduction for ` + (this.bonusHolyShocks / 2).toFixed(1) + ` extra casts.`: '')}
          <br />
          </>
        )}
      />
    );
  }
}

export default LightsDecree;
