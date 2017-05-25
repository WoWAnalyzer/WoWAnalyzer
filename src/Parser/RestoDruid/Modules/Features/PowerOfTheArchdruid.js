import Module from 'Parser/Core/Module';
import { REGROWTH_HEAL_SPELL_ID, REJUVENATION_HEAL_SPELL_ID, POWER_OF_THE_ARCHDRUID_TRAIT_SPELL_ID, POWER_OF_THE_ARCHDRUID_SPELL_ID} from '../../Constants';

class PowerOfTheArchdruid extends Module {
  rejuvenations = 0;
  regrowths = 0;
  hasTrait = false;
  lastPotaRemovedTimestamp = null;
  lastPotaRegrowthTimestamp = null;
  proccs = 0;
  healing = 0;
  potaRegrowthCounter = 0;

  on_initialized() {
    if (!this.owner.error) {
      if(this.owner.selectedCombatant.traitsBySpellId[POWER_OF_THE_ARCHDRUID_TRAIT_SPELL_ID]>0) {
        this.hasTrait = true;
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (POWER_OF_THE_ARCHDRUID_SPELL_ID !== spellId) {
      return;
    }
    this.proccs++;

    // Our 4PT19 can procc PotA
    if(this.lastPotaRemovedTimestamp !== null && Math.abs(event.timestamp-this.lastPotaRemovedTimestamp) < 32) {
      if (REJUVENATION_HEAL_SPELL_ID === spellId) {
        this.rejuvenations = this.rejuvenations + 2;
      } else if(REGROWTH_HEAL_SPELL_ID === spellId) {
        this.regrowths = this.regrowths + 2;
        this.lastPotaRegrowthTimestamp = event.timestamp;
      }
      this.lastPotaRemovedTimestamp = null;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (POWER_OF_THE_ARCHDRUID_SPELL_ID !== spellId) {
      return;
    }
    this.lastPotaRemovedTimestamp = event.timestamp;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(this.lastPotaRemovedTimestamp !== null && Math.abs(event.timestamp-this.lastPotaRemovedTimestamp) < 32) {
      if (REJUVENATION_HEAL_SPELL_ID === spellId) {
        this.rejuvenations = this.rejuvenations + 2;
      } else if(REGROWTH_HEAL_SPELL_ID === spellId) {
        this.regrowths = this.regrowths + 2;
        this.lastPotaRegrowthTimestamp = event.timestamp;
      }
      this.lastPotaRemovedTimestamp = null;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (REGROWTH_HEAL_SPELL_ID !== spellId) {
      return;
    }
    if(this.lastPotaRegrowthTimestamp !== null) {
      // Skipping the first regrowth, only taking the 2 other.
      if(this.potaRegrowthCounter > 0) {
        this.healing += event.amount;
      }
      this.potaRegrowthCounter++;
      if(this.potaRegrowthCounter === 3) {
        this.lastPotaRegrowthTimestamp = null;
        this.potaRegrowthCounter = 0;
      }
    }
  }
}

export default PowerOfTheArchdruid;
