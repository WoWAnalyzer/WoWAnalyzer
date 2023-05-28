import {
  EMPATH_REGEN_FACTOR,
  FLOW_STATE_FACTOR,
} from 'analysis/retail/evoker/preservation/constants';
import { TALENTS_EVOKER } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import {
  BASE_ESSENCE_REGEN,
  BASE_MAX_ESSENCE,
  INNATE_MAGIC_REGEN,
} from 'analysis/retail/evoker/shared/constants';

class EssenceTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
  };

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.ESSENCE;
    this.maxResource =
      BASE_MAX_ESSENCE +
      (this.selectedCombatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_PRESERVATION_TALENT) ? 1 : 0);
    this.baseRegenRate =
      BASE_ESSENCE_REGEN *
      (1 +
        INNATE_MAGIC_REGEN *
          this.selectedCombatant.getTalentRank(TALENTS_EVOKER.INNATE_MAGIC_TALENT));
    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.EMPATH_TALENT, TALENTS_EVOKER.FLOW_STATE_TALENT]),
      this.increaseEssenceRegen,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.EMPATH_TALENT, TALENTS_EVOKER.FLOW_STATE_TALENT]),
      this.decreaseEssenceRegen,
    );
  }

  increaseEssenceRegen(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    //the triggerRateChange function dynamically updates baseRegenRate
    let newRate = this.currentRegenRate;
    if (spellId === TALENTS_EVOKER.EMPATH_TALENT.id) {
      newRate *= 1 + EMPATH_REGEN_FACTOR;
    } else if (spellId === TALENTS_EVOKER.FLOW_STATE_TALENT.id) {
      newRate *= 1 + FLOW_STATE_FACTOR;
    }
    this.triggerRateChange(newRate);
  }

  decreaseEssenceRegen(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    let newRate = this.currentRegenRate;
    if (spellId === TALENTS_EVOKER.EMPATH_TALENT.id) {
      newRate /= 1 + EMPATH_REGEN_FACTOR;
    } else if (spellId === TALENTS_EVOKER.FLOW_STATE_TALENT.id) {
      newRate /= 1 + FLOW_STATE_FACTOR;
    }
    this.triggerRateChange(newRate);
  }

  getAdjustedCost(event: CastEvent) {
    const cost = this.getResource(event)?.cost;
    if (!cost) {
      this._applySpender(event, 0);
      return 0;
    }
    return cost;
  }
}

export default EssenceTracker;
