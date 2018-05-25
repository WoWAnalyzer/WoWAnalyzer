import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import DamageTracker from 'Parser/Core/Modules/AbilityTracker';

class TouchOfDeath extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    statTracker: StatTracker,
    damageTracker: DamageTracker,
  };

  expectedBaseDamage = 0;
  expectedGaleBurst = 0;
  totalBaseDamage = 0;
  damageIntoGaleBurst = 0;
  totalGaleBurst = 0;
  highestGaleBurst = 0;
  // Vulnerability amplifiers are target specific damage taken increases like seen on Kin'garoth adds. 
  highestVulnerabilityAmplifier = 0;
  totalVulnerabilityAmplifier = 0;
  touchOfDeathTarget = null;
  
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.TOUCH_OF_DEATH.id !== spellId) {
      return;
    }
    this.damageIntoGaleBurst = 0;
    const masteryPercentage = this.statTracker.currentMasteryPercentage;
    const versatilityPercentage = this.statTracker.currentVersatilityPercentage;
    this.expectedBaseDamage = event.maxHitPoints * 0.5 * (1 + masteryPercentage) * (1 + versatilityPercentage);
    console.log("Touch of Death cast ");
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    // Debuff is removed before damage is dealt so this won't count Touch of Deaths own damage
    if (enemy.hasBuff(SPELLS.TOUCH_OF_DEATH.id)) {
      this.damageIntoGaleBurst += event.amount + (event.absorbed || 0);
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    // Debuff is removed before damage is dealt so this won't count Touch of Deaths own damage
    if (enemy.hasBuff(SPELLS.TOUCH_OF_DEATH.id) && SPELLS.TOUCH_OF_DEATH_DAMAGE.id !== spellId) {
      this.damageIntoGaleBurst += event.amount + (event.absorbed || 0);
    }
    if (SPELLS.TOUCH_OF_DEATH_DAMAGE.id !== spellId) {
      return;
    }
    this.expectedGaleBurst = this.damageIntoGaleBurst * 0.1;
    const expectedTotalDamage = this.expectedGaleBurst + this.expectedBaseDamage;
    const vulnerabilityAmplifier = event.amount / expectedTotalDamage;
    console.log("expected base damage: " + this.expectedBaseDamage + " expected gale burst: " + this.expectedGaleBurst);
    console.log("actualDamage/expectedDamage: " + vulnerabilityAmplifier);
    if (vulnerabilityAmplifier > this.highestVulnerabilityAmplifier) {
      this.highestVulnerabilityAmplifier = vulnerabilityAmplifier;
    }
    const actualGaleBurst = this.expectedGaleBurst * vulnerabilityAmplifier;
    if (actualGaleBurst < this.highestGaleBurst) {
      this.highestGaleBurst = actualGaleBurst;
    }
    this.totalVulnerabilityAmplifier += vulnerabilityAmplifier;
  }

  statistic() {
    const averageVulnerabilityAmplifier = this.totalVulnerabilityAmplifier / this.damageTracker.getAbility(SPELLS.TOUCH_OF_DEATH).hits;
  }
}

export default TouchOfDeath;
