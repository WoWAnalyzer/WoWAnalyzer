import { LNL_COST_MULTIPLIER } from 'analysis/retail/hunter/marksmanship/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import SpellResourceCost from 'parser/shared/modules/SpellResourceCost';

class SpellFocusCost extends SpellResourceCost {
  static resourceType = RESOURCE_TYPES.FOCUS;

  lockAndLoad: boolean;

  constructor(options: Options) {
    super(options);
    this.lockAndLoad = this.selectedCombatant.hasTalent(TALENTS.LOCK_AND_LOAD_TALENT);
  }

  getResourceCost(event: CastEvent) {
    const cost = super.getResourceCost(event);
    const spellId = event.ability.guid;
    if (
      this.lockAndLoad &&
      this.selectedCombatant.hasBuff(SPELLS.LOCK_AND_LOAD_BUFF.id) &&
      spellId === TALENTS.AIMED_SHOT_TALENT.id
    ) {
      return cost * LNL_COST_MULTIPLIER;
    }
    return cost;
  }
}

export default SpellFocusCost;
