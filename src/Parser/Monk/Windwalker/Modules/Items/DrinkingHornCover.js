import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class DrinkingHornCover extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };
  totalTimeGained = 0;
  averageTimeGained = 0;
  lastCastTime = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.DRINKING_HORN_COVER.id);
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.STORM_EARTH_AND_FIRE_CAST.id === spellId || SPELLS.SERENITY_TALENT.id === spellId) {
      this.lastCastTime = event.timestamp;
    }
  }
  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.STORM_EARTH_AND_FIRE_CAST.id === spellId) {
      this.totalTimeGained += (event.timestamp - this.lastCastTime) / 1000 - 15;
      this.averageTimeGained = this.totalTimeGained / this.abilityTracker.getAbility(SPELLS.STORM_EARTH_AND_FIRE_CAST.id).casts;
    }
    if (SPELLS.SERENITY_TALENT.id === spellId) {
      this.totalTimeGained += (event.timestamp - this.lastCastTime) / 1000 - 8;
      this.averageTimeGained = this.totalTimeGained / this.abilityTracker.getAbility(SPELLS.SERENITY_TALENT.id).casts;
    }
  }

  item() {
    return {
      item: ITEMS.DRINKING_HORN_COVER,
      result: `${this.averageTimeGained.toFixed(2)} seconds gained on average`,
    };
  }

  // TODO
  // Potentially make suggestions with poor use of extension, especially with serenity.
}

export default DrinkingHornCover;
