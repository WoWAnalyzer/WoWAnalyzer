import TALENTS from 'common/TALENTS/shaman';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import SpellResourceCost from 'parser/shared/modules/SpellResourceCost';
import MaelstromSpenderInfo from './MaelstromSpenderInfo';

export default class SpellMaelstromCost extends SpellResourceCost.withDependencies({
  spenderInfo: MaelstromSpenderInfo,
}) {
  static resourceType = RESOURCE_TYPES.MAELSTROM;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.EYE_OF_THE_STORM_TALENT);
  }

  findAdjustedSpellResourceCost(spellID: number, originalCost: number) {
    return this.deps.spenderInfo.getAdjustedCost(spellID, originalCost);
  }

  getResourceCost(event: CastEvent): number {
    const cost = super.getResourceCost(event);
    return this.findAdjustedSpellResourceCost(event.ability.guid, cost);
  }
}
