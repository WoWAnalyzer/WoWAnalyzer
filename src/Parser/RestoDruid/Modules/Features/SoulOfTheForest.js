import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const REGROWTH_HEALING_INCREASE = 3;
const REJUVENATION_HEALING_INCREASE = 3;
const WILD_GROWTH_HEALING_INCREASE = 1.75;
const WILD_GROWTH_DURATION = 7000;
const REJUVENATION_BASE_DURATION = 12000;

class SoulOfTheForest extends Module {
  regrowths = 0;
  wildGrowths = 0;
  rejuvenations = 0;
  proccs = 0;
  proccConsumed = true;

  rejuvenationProccTimestamp = null;
  regrowthProccTimestamp = null;
  wildGrowthProccTimestamp = null;

  regrowthHealing = 0;
  rejuvenationHealing = 0;
  wildGrowthHealing = 0;

  rejuvenationTargets = [];
  wildGrowthTargets = [];
  rejuvenationDuration = REJUVENATION_BASE_DURATION;

  on_initialized() {
    if (!this.owner.error) {
      let persistanceTraits = this.owner.selectedCombatant.traitsBySpellId[SPELLS.PERSISTANCE_TRAIT.id] || 0;
      this.rejuvenationDuration += persistanceTraits*1000;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (SPELLS.SOUL_OF_THE_FOREST_BUFF.id === spellId) {
      this.proccs++;
      this.proccConsumed = false;
    }

    // Saving the "valid" targets to track the healing done on. I.e. get the targets that had an "empowered" WG/Rejuv applied on them.
    if(this.wildGrowthProccTimestamp !== null && SPELLS.WILD_GROWTH.id === spellId && (event.timestamp - this.wildGrowthProccTimestamp) < 100) {
      this.wildGrowthTargets.push(event.targetID);
    } else if(this.rejuvenationProccTimestamp !== null && (SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION.id === spellId) && (event.timestamp - this.rejuvenationProccTimestamp) < 100) {
      this.rejuvenationTargets.push(event.targetID);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    // proccConsumsed it used because WG and RG has a cast time. So whenever you queue cast WG + rejuv they will happen at the exact same timestamp.
    if(this.owner.selectedCombatant.hasBuff(SPELLS.SOUL_OF_THE_FOREST_BUFF.id) && this.proccConsumed === false){
      if (SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION === spellId) {
        this.rejuvenations++
        this.rejuvenationProccTimestamp = event.timestamp;
      } else if(SPELLS.REGROWTH.id === spellId) {
        this.regrowths++;
        this.proccConsumed = true;
        this.regrowthProccTimestamp = event.timestamp;
      } else if(SPELLS.WILD_GROWTH.id === spellId) {
        this.wildGrowths++;
        this.proccConsumed = true;
        this.wildGrowthProccTimestamp = event.timestamp;
      }
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    // Reset procc variables
    if((event.timestamp+200) > (this.rejuvenationProccTimestamp+this.rejuvenationDuration)) {
      this.rejuvenationProccTimestamp = null;
      this.rejuvenationTargets = [];
    } else if((event.timestamp+200) > (this.wildGrowthProccTimestamp+WILD_GROWTH_DURATION)) {
      this.wildGrowthProccTimestamp = null;
      this.wildGrowthTargets = [];
    }

    if(SPELLS.REGROWTH.id === spellId && this.regrowthProccTimestamp === event.timestamp) {
      this.regrowthHealing += this.calculateEffectiveHealingFromIncrease(event, REGROWTH_HEALING_INCREASE);
      this.regrowthProccTimestamp = null;
    } else if(this.rejuvenationProccTimestamp !== null
        && (SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION === spellId)
        && (event.timestamp - (this.rejuvenationProccTimestamp+this.rejuvenationDuration)) <= 0) {
      if(this.rejuvenationTargets.indexOf(event.targetID) !== -1) {
        this.rejuvenationHealing += this.calculateEffectiveHealingFromIncrease(event, REJUVENATION_HEALING_INCREASE);
      }
    } else if(this.wildGrowthProccTimestamp !== null
      && SPELLS.WILD_GROWTH.id === spellId
      && (event.timestamp - (this.wildGrowthProccTimestamp+WILD_GROWTH_DURATION)) <= 0) {
      if(this.wildGrowthTargets.indexOf(event.targetID) !== -1) {
        this.wildGrowthHealing += this.calculateEffectiveHealingFromIncrease(event, WILD_GROWTH_HEALING_INCREASE);
      }
    }
  }

  // TODO: Refactor this method, as there's many features that uses this formula to calculate healing contributed by healing increases with partial overheals.
  calculateEffectiveHealingFromIncrease(event, healingIncrease) {
    let baseHeal = (event.amount + event.overheal||0)/healingIncrease;
    return Math.max(0, event.amount - baseHeal)/healingIncrease;
  }
}

export default SoulOfTheForest;
