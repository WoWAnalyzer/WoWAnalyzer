import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import SpellResourceCost from 'parser/shared/modules/SpellResourceCost';
import SPELLS from 'common/SPELLS';
import { CastEvent } from 'parser/core/Events';
import { LNL_COST_MULTIPLIER } from '@wowanalyzer/hunter-marksmanship/src/constants';
import { VIPERS_VENOM_COST_MULTIPLIER } from '@wowanalyzer/hunter-survival/src/constants';
import { Options } from 'parser/core/Analyzer';

class SpellFocusCost extends SpellResourceCost {
  static resourceType = RESOURCE_TYPES.FOCUS;

  lockAndLoad: boolean;
  vipersVenom: boolean;

  constructor(options: Options) {
    super(options);
    this.lockAndLoad = this.selectedCombatant.hasTalent(SPELLS.LOCK_AND_LOAD_TALENT.id);
    this.vipersVenom = this.selectedCombatant.hasTalent(SPELLS.VIPERS_VENOM_TALENT.id);
  }

  getResourceCost(event: CastEvent) {
    const cost = super.getResourceCost(event);
    const spellId = event.ability.guid;
    if (this.lockAndLoad && this.selectedCombatant.hasBuff(SPELLS.LOCK_AND_LOAD_BUFF.id) && spellId === SPELLS.AIMED_SHOT.id) {
      return cost * LNL_COST_MULTIPLIER;
    }
    if (this.vipersVenom && this.selectedCombatant.hasBuff(SPELLS.VIPERS_VENOM_BUFF.id) && spellId === SPELLS.SERPENT_STING_SV.id) {
      return cost * VIPERS_VENOM_COST_MULTIPLIER;
    }
    return cost;
  }
}

export default SpellFocusCost;
