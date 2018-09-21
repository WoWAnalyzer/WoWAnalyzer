import SPELLS from 'common/SPELLS';

import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';



class RestoDruidAbilityTracker extends AbilityTracker {

  increaseHealingForAbility(spellId, event) {
    const cast = this.getAbility(spellId);
    cast.healingHits = (cast.healingHits || 0) + 1;
    // TODO: Use HealingValue class
    cast.healingEffective = (cast.healingEffective || 0) + (event.amount || 0);
    cast.healingAbsorbed = (cast.healingAbsorbed || 0) + (event.absorbed || 0);
    cast.healingOverheal = (cast.healingOverheal || 0) + (event.overheal || 0);

    const isCrit = event.hitType === HIT_TYPES.CRIT;
    if (isCrit) {
      cast.healingCriticalHits = (cast.healingCriticalHits || 0) + 1;
      cast.healingCriticalEffective = (cast.healingCriticalEffective || 0) + (event.amount || 0);
      cast.healingCriticalAbsorbed = (cast.healingCriticalAbsorbed || 0) + (event.absorbed || 0);
      cast.healingCriticalOverheal = (cast.healingCriticalOverheal || 0) + (event.overheal || 0);
    }
  }

  on_byPlayer_heal(event) {
    if (super.on_byPlayer_heal) {
      super.on_byPlayer_heal(event);
    }
    const spellId = event.ability.guid;
    // A lot of Restoration Druid healing spells does healing in form of multiple spellId.
    // Here we attempt to merge those we know.
    // TODO - include mastery healing in case if it's a HoT
    if (spellId === SPELLS.REJUVENATION_GERMINATION.id || spellId === SPELLS.AUTUMN_LEAVES.id) {
      // Should cultivation be included?
      // Should a part of ysera's gift be included if you have azerite trait waking dream?
      this.increaseHealingForAbility(SPELLS.REJUVENATION.id, event);
    }
    if(spellId === SPELLS.CENARION_WARD_HEAL.id) {
      this.increaseHealingForAbility(SPELLS.CENARION_WARD_TALENT.id, event);
    }
    if(spellId === SPELLS.EFFLORESCENCE_HEAL.id) {
      this.increaseHealingForAbility(SPELLS.EFFLORESCENCE_CAST.id, event);
    }
    if(spellId === SPELLS.TRANQUILITY_HEAL.id) {
      this.increaseHealingForAbility(SPELLS.TRANQUILITY_CAST.id, event);
    }
    if(spellId === SPELLS.GROVE_TENDING.id) {
      this.increaseHealingForAbility(SPELLS.SWIFTMEND.id, event);
    }
    if(spellId === SPELLS.LIFEBLOOM_BLOOM_HEAL.id) {
      this.increaseHealingForAbility(SPELLS.LIFEBLOOM_HOT_HEAL.id, event);
    }
  }
}

export default RestoDruidAbilityTracker;
