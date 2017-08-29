import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const WILDFLESH_MODIFIER_PER_RANK = 0.05;
const FR_WINDOW_MS = 5000;
const FR_MINIMUM_HP_HEAL = 0.05;

class FrenziedRegeneration extends Module {
  percentHPsAtCast = [];
  percentHealsAtCast = [];
  damageEventsInWindow = [];
  _healModifier = 0.5;
  _charges = 2;

  get healModifier() {
    return this._healModifier;
  }

  pruneDamageEvents(currentTimestamp) {
    // Remove old damage events that occurred outside the FR window
    while (
      this.damageEventsInWindow.length &&
      this.damageEventsInWindow[0].timestamp + FR_WINDOW_MS < currentTimestamp
    ) {
      this.damageEventsInWindow.shift();
    }
  }

  on_initialized() {
    const player = this.owner.selectedCombatant;
    const wildfleshRank = player.traitsBySpellId[SPELLS.WILDFLESH_TRAIT.id];
    const fleshknittingRank = player.traitsBySpellId[SPELLS.FLESHKNITTING_TRAIT.id];
    const versModifier = player.versatilityPercentage;

    if (fleshknittingRank > 0) {
      this._charges += 1;
    }

    this._healModifier += (wildfleshRank * WILDFLESH_MODIFIER_PER_RANK);
    this._healModifier += versModifier;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.FRENZIED_REGENERATION.id) {
      const percentHP = event.hitPoints / event.maxHitPoints;
      // Minimum heal
      let percentHeal = FR_MINIMUM_HP_HEAL;

      this.pruneDamageEvents(event.timestamp);
      const damageTakenInWindow = this.damageEventsInWindow.reduce((total, event) => total + event.damage, 0);

      const goeModifier = this.owner.selectedCombatant.hasBuff(SPELLS.GUARDIAN_OF_ELUNE.id) ? 1.2 : 1;

      const healAmount = damageTakenInWindow * this.healModifier * goeModifier;
      const healAsPercentHP = healAmount / event.maxHitPoints;

      if (healAsPercentHP > percentHeal) {
        percentHeal = healAsPercentHP;
      }

      this.percentHPsAtCast.push(percentHP);
      this.percentHealsAtCast.push(percentHeal);
    }
  }

  on_toPlayer_damage(event) {
    this.damageEventsInWindow.push({
      timestamp: event.timestamp,
      damage: event.amount + event.absorbed,
    });
  }

  on_finished() {
    console.log(this.percentHPsAtCast);
    console.log(this.percentHealsAtCast);
  }
}

export default FrenziedRegeneration;
