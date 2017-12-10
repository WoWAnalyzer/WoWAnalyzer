import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';

import CoreChecklist, { Rule, Requirement, GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import ManaValues from 'Parser/Core/Modules/ManaValues';
import Velens from 'Parser/Core/Modules/Items/Velens';

import MasteryEffectiveness from './MasteryEffectiveness';
import AlwaysBeCasting from './AlwaysBeCasting';
import BeaconHealing from '../PaladinCore/BeaconHealing';
import FillerLightOfTheMartyrs from '../PaladinCore/FillerLightOfTheMartyrs';
import AuraOfSacrifice from '../Talents/AuraOfSacrifice';
import Ilterendi from '../Items/Ilterendi';

class Checklist extends CoreChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    beaconHealing: BeaconHealing,
    fillerLightOfTheMartyrs: FillerLightOfTheMartyrs,
    manaValues: ManaValues,
    auraOfSacrifice: AuraOfSacrifice,
    ilterendi: Ilterendi,
    velens: Velens,
  };

  rules = [
    new Rule({
      name: 'Use core spells as often as possible',
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
      name: 'Use cooldowns effectively',
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
            check: () => this.masteryEffectiveness.suggestionThresholds,
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
            check: () => this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          }),
          new Requirement({
            name: 'Downtime',
            check: () => this.alwaysBeCasting.downtimeSuggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Don\'t tunnel the tanks',
      requirements: () => {
        return [
          new Requirement({
            name: 'Direct beacon healing',
            check: () => this.beaconHealing.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper>Only use <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} icon /> when absolutely necessary</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Total filler casts per minute',
            check: () => this.fillerLightOfTheMartyrs.cpmSuggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper>Total filler casts while <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} icon /> was available</Wrapper>,
            check: () => this.fillerLightOfTheMartyrs.inefficientCpmSuggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your mana effectively',
      requirements: () => {
        return [
          new Requirement({
            name: 'Mana left',
            check: () => this.manaValues.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Pick the right tools for the fight',
      requirements: () => {
        return [
          new Requirement({
            name: <SpellLink id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} icon />,
            check: () => this.auraOfSacrifice.suggestionThresholds,
            when: this.auraOfSacrifice.active,
          }),
          new Requirement({
            name: <ItemLink id={ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id} icon />,
            check: () => this.ilterendi.suggestionThresholds,
            when: this.ilterendi.active,
          }),
          new Requirement({
            name: <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} icon />,
            check: () => this.velens.suggestionThresholds,
            when: this.velens.active,
          }),
        ];
      },
    }),
  ];
}

export default Checklist;
