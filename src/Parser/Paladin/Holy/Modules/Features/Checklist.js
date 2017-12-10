import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import CoreChecklist, { Rule, Requirement, GenericCastEfficiencyRequirement, performanceForThresholds } from 'Parser/Core/Modules/Features/Checklist';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';

import MasteryEffectiveness from './MasteryEffectiveness';
import AlwaysBeCasting from './AlwaysBeCasting';
import BeaconHealing from '../PaladinCore/BeaconHealing';

class Checklist extends CoreChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    beaconHealing: BeaconHealing,
  };

  rules = [
    new Rule({
      name: 'Cast core spells on cooldown',
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HOLY_SHOCK_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.LIGHT_OF_DAWN_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.JUDGMENT_CAST,
            when: combatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id) || combatant.hasRing(ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BESTOW_FAITH_TALENT,
            when: combatant.hasTalent(SPELLS.BESTOW_FAITH_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.LIGHTS_HAMMER_TALENT,
            when: combatant.hasTalent(SPELLS.LIGHTS_HAMMER_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CRUSADER_STRIKE,
            when: combatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Cast cooldowns on cooldown',
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.AVENGING_WRATH,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HOLY_AVENGER_TALENT,
            when: combatant.hasTalent(SPELLS.HOLY_AVENGER_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TYRS_DELIVERANCE_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.VELENS_FUTURE_SIGHT_BUFF,
            when: combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.AURA_MASTERY,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ARCANE_TORRENT_MANA,
            when: !!this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Position yourself well to maximize your Mastery gain',
      requirements: () => {
        return [
          new Requirement({
            name: 'Mastery effectiveness',
            check: () => {
              const mod = this.masteryEffectiveness;
              return performanceForThresholds(mod.suggestionThresholds.actual, mod.suggestionThresholds);
            },
          }),
        ];
      },
    }),
    new Rule({
      name: 'Try to avoid being inactive for a large portion of the fight',
      requirements: () => {
        return [
          new Requirement({
            name: 'Non healing time',
            check: () => {
              const mod = this.alwaysBeCasting;
              return performanceForThresholds(mod.nonHealingTimeSuggestionThresholds.actual, mod.nonHealingTimeSuggestionThresholds);
            },
          }),
          new Requirement({
            name: 'Downtime',
            check: () => {
              const mod = this.alwaysBeCasting;
              return performanceForThresholds(mod.downtimeSuggestionThresholds.actual, mod.downtimeSuggestionThresholds);
            },
          }),
        ];
      },
    }),
    new Rule({
      name: 'Don\'t tunnel the tanks',
      requirements: () => {
        return [
          new Requirement({
            name: 'Non healing time',
            check: () => {
              const mod = this.beaconHealing;
              return performanceForThresholds(mod.suggestionThresholds.actual, mod.suggestionThresholds);
            },
          }),
        ];
      },
    }),
  ];
}

export default Checklist;
