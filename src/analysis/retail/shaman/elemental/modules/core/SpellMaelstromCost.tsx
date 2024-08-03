import TALENTS from 'common/TALENTS/shaman';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import SpellResourceCost from 'parser/shared/modules/SpellResourceCost';

export default class SpellMaelstromCost extends SpellResourceCost {
  static resourceType = RESOURCE_TYPES.MAELSTROM;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.EYE_OF_THE_STORM_TALENT);
  }

  findAdjustedSpellResourceCost(spellID: number, originalCost: number) {
    if (
      [
        TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT.id,
        TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT.id,
        TALENTS.EARTH_SHOCK_TALENT.id,
      ].includes(spellID)
    ) {
      return originalCost - 5;
    }
    if (spellID === TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id) {
      return originalCost - 10;
    }

    return originalCost;
  }

  getResourceCost(event: CastEvent): number {
    const cost = super.getResourceCost(event);
    return this.findAdjustedSpellResourceCost(event.ability.guid, cost);
  }
}
