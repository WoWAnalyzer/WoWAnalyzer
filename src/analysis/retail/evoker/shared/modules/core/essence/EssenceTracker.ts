import {
  EMPATH_REGEN_FACTOR,
  FLOW_STATE_FACTOR,
} from 'analysis/retail/evoker/preservation/constants';
import { TALENTS_EVOKER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS/evoker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import {
  BASE_ESSENCE_REGEN,
  BASE_MAX_ESSENCE,
  INNATE_MAGIC_REGEN,
} from 'analysis/retail/evoker/shared/constants';
import { POWER_SWELL_REGEN_FACTOR } from 'analysis/retail/evoker/devastation/constants';
import SpellEssenceCost from './SpellEssenceCost';

const REGEN_BUFFS = {
  [TALENTS_EVOKER.EMPATH_TALENT.id]: {
    spell: TALENTS_EVOKER.EMPATH_TALENT,
    regenFactor: EMPATH_REGEN_FACTOR,
  },
  [TALENTS_EVOKER.FLOW_STATE_TALENT.id]: {
    spell: TALENTS_EVOKER.FLOW_STATE_TALENT,
    regenFactor: FLOW_STATE_FACTOR,
  },
  [SPELLS.POWER_SWELL_BUFF.id]: {
    spell: SPELLS.POWER_SWELL_BUFF,
    regenFactor: POWER_SWELL_REGEN_FACTOR,
  },
};

class EssenceTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
    spellEssenceCost: SpellEssenceCost,
  };
  protected spellEssenceCost!: SpellEssenceCost;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.ESSENCE;
    this.maxResource =
      BASE_MAX_ESSENCE +
      (this.selectedCombatant.hasTalent(TALENTS_EVOKER.POWER_NEXUS_TALENT) ? 1 : 0);
    this.initialResources = this.maxResource;

    this.baseRegenRate =
      BASE_ESSENCE_REGEN *
      (1 +
        INNATE_MAGIC_REGEN *
          this.selectedCombatant.getTalentRank(TALENTS_EVOKER.INNATE_MAGIC_TALENT));

    this.allowMultipleGainsInSameTimestamp = true;
    this.useGranularity = true;
    this.adjustResourceMismatch = true;

    const regenSpells = Object.entries(REGEN_BUFFS).map(([, regenBuff]) => regenBuff.spell);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(regenSpells),
      this.increaseEssenceRegen,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(regenSpells),
      this.decreaseEssenceRegen,
    );
  }

  increaseEssenceRegen(event: ApplyBuffEvent) {
    const regenRate = REGEN_BUFFS[event.ability.guid].regenFactor;
    const newRate = (this.baseRegenRate *= 1 + regenRate);

    this.triggerRateChange(newRate);
  }

  decreaseEssenceRegen(event: RemoveBuffEvent) {
    const regenRate = REGEN_BUFFS[event.ability.guid].regenFactor;
    const newRate = (this.baseRegenRate /= 1 + regenRate);

    this.triggerRateChange(newRate);
  }

  getAdjustedCost(event: CastEvent) {
    const cost = this.spellEssenceCost.getResourceCost(event);

    if (!cost) {
      this._applySpender(event, 0);
      return 0;
    }

    return cost;
  }

  onCast(event: CastEvent) {
    /* Early return as to not count Prescience casts before the fight starts
     * that Augmentation might have when setting up T31 4pc buff. */
    if (
      event.timestamp < this.owner.fight.start_time &&
      event.ability.guid === TALENTS_EVOKER.PRESCIENCE_TALENT.id
    ) {
      return;
    }
    const cost = this.getAdjustedCost(event);
    if (cost) {
      this._applySpender(event, cost, this.getResource(event));
    }
  }
}

export default EssenceTracker;
