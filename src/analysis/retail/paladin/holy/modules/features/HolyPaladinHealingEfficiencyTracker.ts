import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbilityEvent, GetRelatedEvent, HealEvent } from 'parser/core/Events';
import HealingEfficiencyTracker, {
  SpellInfoDetails,
} from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import { HOLY_SHOCK_SOURCE } from '../../normalizers/CastLinkNormalizer';

// TODO: figure out if this is doing anything useful since glimmer is gone now
class HolyPaladinHealingEfficiencyTracker extends HealingEfficiencyTracker {
  holyShockHealing: Record<number, number> = {};

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    if (event.ability.guid === SPELLS.HOLY_SHOCK_HEAL.id) {
      const source = GetRelatedEvent<AbilityEvent<any>>(event, HOLY_SHOCK_SOURCE);
      if (source) {
        const triggerID = source.ability.guid;
        this.holyShockHealing[triggerID] =
          (this.holyShockHealing[triggerID] || 0) + event.amount + (event.absorbed || 0);
      }
    }
  }

  totalHolyShockHealing() {
    return Object.values(this.holyShockHealing).reduce((sum, h) => sum + h, 0);
  }

  getCustomSpellStats(spellInfo: SpellInfoDetails, spellId: number) {
    if (spellId === TALENTS.HOLY_SHOCK_TALENT.id) {
      spellInfo.spell = TALENTS.HOLY_SHOCK_TALENT;
      // fill this back in from this.glimmerHealing, this.holyShockHealing
      spellInfo.healingDone = 0;
    }

    if (this.holyShockHealing[spellId]) {
      spellInfo.healingDone += this.holyShockHealing[spellId];
    }

    return spellInfo;
  }
}

export default HolyPaladinHealingEfficiencyTracker;
