import TALENTS from 'common/TALENTS/shaman';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import SpellResourceCost from 'parser/shared/modules/SpellResourceCost';

export default class SpellMaelstromCost extends SpellResourceCost {
  static resourceType = RESOURCE_TYPES.MAELSTROM;

  eotsRanks: number;

  constructor(options: Options) {
    super(options);

    this.eotsRanks = this.selectedCombatant.getTalentRank(TALENTS.EYE_OF_THE_STORM_TALENT);
  }

  findAdjustedSpellResourceCost(spellID: number, originalCost: number) {
    if (spellID === TALENTS.EARTHQUAKE_TALENT.id || spellID === TALENTS.EARTH_SHOCK_TALENT.id) {
      return originalCost - 5 * this.eotsRanks;
    }
    if (spellID === TALENTS.ELEMENTAL_BLAST_TALENT.id) {
      return originalCost - Math.floor(7.5 * this.eotsRanks);
    }

    return originalCost;
  }

  getResourceCost(event: CastEvent): number {
    const cost = super.getResourceCost(event);
    return this.findAdjustedSpellResourceCost(event.ability.guid, cost);
  }
}
