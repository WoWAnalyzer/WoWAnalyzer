import React from 'react';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';

import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class TouchOfDeath extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
    statTracker: StatTracker,
    abilityTracker: AbilityTracker,
  };

  expectedBaseDamage = 0;
  expectedGaleBurst = 0;
  totalGaleBurst = 0;
  highestGaleBurst = 0;
  // Vulnerability amplifiers are target specific damage taken increases like seen on Kin'garoth adds. 
  highestVulnerabilityAmplifier = 0;
  totalVulnerabilityAmplifier = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.TOUCH_OF_DEATH.id !== spellId) {
      return;
    }
    this.expectedGaleBurst = 0;
    const masteryPercentage = this.statTracker.currentMasteryPercentage;
    const versatilityPercentage = this.statTracker.currentVersatilityPercentage;
    this.expectedBaseDamage = event.maxHitPoints * 0.5 * (1 + masteryPercentage) * (1 + versatilityPercentage);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const enemy = this.enemies.getEntity(event);
    // Gale Burst does not count damage from clones, but rather takes increased damage from the player while Storm, Earth, and Fire is active
    const sefMultiplier = this.combatants.selected.hasBuff(SPELLS.STORM_EARTH_AND_FIRE_CAST.id) ? 0.3: 0.1;
    if (!enemy) {
      return;
    }
    if (enemy.hasBuff(SPELLS.TOUCH_OF_DEATH.id) && SPELLS.TOUCH_OF_DEATH_DAMAGE.id !== spellId) {
      this.expectedGaleBurst += (event.amount + (event.absorbed || 0)) * sefMultiplier;
    }
    if (SPELLS.TOUCH_OF_DEATH_DAMAGE.id !== spellId) {
      return;
    }
    const expectedTotalDamage = this.expectedGaleBurst + this.expectedBaseDamage;
    const vulnerabilityAmplifier = ((event.amount / expectedTotalDamage) - 1);
    if (vulnerabilityAmplifier > this.highestVulnerabilityAmplifier) {
      this.highestVulnerabilityAmplifier = vulnerabilityAmplifier;
    }
    const actualGaleBurst = this.expectedGaleBurst * (1 + vulnerabilityAmplifier);
    if (actualGaleBurst > this.highestGaleBurst) {
      this.highestGaleBurst = actualGaleBurst;
    }
    this.totalVulnerabilityAmplifier += vulnerabilityAmplifier;
    this.totalGaleBurst += actualGaleBurst;
  }

  statistic() {
    const averageVulnerabilityAmplifier = this.totalVulnerabilityAmplifier / this.abilityTracker.getAbility(SPELLS.TOUCH_OF_DEATH.id).casts;
    const averageGaleBurst = this.totalGaleBurst / this.abilityTracker.getAbility(SPELLS.TOUCH_OF_DEATH.id).casts;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GALE_BURST_DAMAGE.id} />}
        value={`${(averageGaleBurst / 1000000).toFixed(2)} million`}
        label={`Average Gale Burst`}
        tooltip={`Damage done with Touch of Death is affected by % damage taken buffs on its target. This causes damage done by other abilities during the Gale burst window to benefit twice from those debuffs, due to the increase to their own hits as well as the Gale Burst component of Touch of Death . <br> </br> Your average modifier on Touch of Death was ~${((averageVulnerabilityAmplifier * 100).toFixed())}% and your highest was ~${(this.highestVulnerabilityAmplifier * 100).toFixed()}%. Your highest Gale Burst was ${(this.highestGaleBurst / 1000000).toFixed(2)} million `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(12);
}

export default TouchOfDeath;
