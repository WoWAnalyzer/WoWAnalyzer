import SPELLS from 'common/SPELLS';
import { EnergyCapTracker } from '@wowanalyzer/rogue';

const BASE_ENERGY_REGEN = 10;
const BURIED_TREASURE_REGEN = 4;
const ADRENALINE_RUSH_REGEN_MULTIPLIER = 1.6;

const ADRENALINE_RUSH_MAX_ADDITION = 50;

class OutlawEnergyCapTracker extends EnergyCapTracker {
  static buffsChangeMax = [
    SPELLS.ADRENALINE_RUSH.id,
  ];
  static buffsChangeRegen = [
    SPELLS.ADRENALINE_RUSH.id,
    SPELLS.BURIED_TREASURE.id,
  ];

  getBaseRegenRate() {
    let regenRate = BASE_ENERGY_REGEN;
    if (this.combatantHasBuffActive(SPELLS.BURIED_TREASURE.id)) {
      // Buried Treasure buff adds 4 energy per second, before any multipliers
      regenRate += BURIED_TREASURE_REGEN;
    }

    return regenRate;
  }

  naturalRegenRate() {
    let regen = super.naturalRegenRate();

    if (this.combatantHasBuffActive(SPELLS.ADRENALINE_RUSH.id)) {
      regen *= ADRENALINE_RUSH_REGEN_MULTIPLIER;
    }

    return regen;
  }

  currentMaxResource() {
    let max = super.currentMaxResource();
    if (this.combatantHasBuffActive(SPELLS.ADRENALINE_RUSH.id)) {
      max += ADRENALINE_RUSH_MAX_ADDITION;
    }

    // What should be x.5 becomes x in-game.
    return Math.floor(max);
  }
}

export default OutlawEnergyCapTracker;
