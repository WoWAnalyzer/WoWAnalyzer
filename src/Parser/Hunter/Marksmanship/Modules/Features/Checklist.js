import React from 'react';

import CoreChecklist, { Rule, Requirement, GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import AlwaysBeCasting from 'Parser/Hunter/Marksmanship/Modules/Features/AlwaysBeCasting';
import AMurderOfCrows from 'Parser/Hunter/Marksmanship/Modules/Talents/AMurderOfCrows';
import Trueshot from 'Parser/Hunter/Marksmanship/Modules/Spells/Trueshot';
import CancelledCasts from 'Parser/Hunter/Shared/Modules/Features/CancelledCasts';
import TimeFocusCapped from 'Parser/Hunter/Shared/Modules/Features/TimeFocusCapped';
import SpellLink from 'common/SpellLink';
import Bullseye from 'Parser/Hunter/Marksmanship/Modules/Traits/Bullseye';

class Checklist extends CoreChecklist {
  static dependencies = {
    combatants: Combatants,

    //general
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,

    //features:
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    timeFocusCapped: TimeFocusCapped,

    //talents
    aMurderOfCrows: AMurderOfCrows,

    //spells
    trueshot: Trueshot,

    //traits
    bullseye: Bullseye,
  };

  rules = [
    new Rule({
      name: 'Core Spell Usage',
      description: <Wrapper>Hello</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.WINDBURST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TRUESHOT,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SIDEWINDERS_TALENT,
            when: combatant.hasTalent(SPELLS.SIDEWINDERS_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.PIERCING_SHOT_TALENT,
            when: combatant.hasTalent(SPELLS.PIERCING_SHOT_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.EXPLOSIVE_SHOT_TALENT,
            when: combatant.hasTalent(SPELLS.EXPLOSIVE_SHOT_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SENTINEL_TALENT,
            when: combatant.hasTalent(SPELLS.SENTINEL_TALENT.id),
          }),
        ];
      },
    }),

    new Rule({
      name: <Wrapper>Use <SpellLink id={SPELLS.TRUESHOT.id} /> effectively</Wrapper>,
      description: <Wrapper>Since <SpellLink id={SPELLS.TRUESHOT.id} /> is our only cooldown, it's important to maximize the potential of this very powerful cooldown.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: `Average Aimed Shots per Trueshot`,
            check: () => this.trueshot.aimedShotThreshold,
          }),
          new Requirement({
            name: `Average focus when casting Trueshot`,
            check: () => this.trueshot.focusThreshold,
          }),
          new Requirement({
            name: `Average Trueshot uptime per cast`,
            check: () => this.trueshot.uptimeThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper>Execute and <SpellLink id={SPELLS.BULLSEYE_TRAIT.id} /></Wrapper>,
      description: <Wrapper>It's important for a marksmanship hunter to combine <SpellLink id={SPELLS.BULLSEYE_TRAIT.id} /> with a <SpellLink id={SPELLS.TRUESHOT.id} />, because of the increased crit damage added into <SpellLink id={SPELLS.TRUESHOT.id} /> from <SpellLink id={SPELLS.RAPID_KILLING.id} />.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: `Unsaved crows for execute`,
            check: () => this.aMurderOfCrows.shouldHaveSavedThreshold,
          }),
          new Requirement({
            name: `Execute Trueshots`,
            check: () => this.trueshot.executeTrueshotThreshold,
          }),
          new Requirement({
            name: 'Bullseye resets',
            check: () => this.bullseye.bullseyeResetThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Downtime, cancelled casts and focus capping',
      description: <Wrapper>
        Try to minimize your time spent not casting. Use your instant casts (<SpellLink id={SPELLS.ARCANE_SHOT.id} /> or <SpellLink id={SPELLS.MULTISHOT.id} />) while moving, to avoid spending time doing nothing.
      </Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: `Casting downtime`,
            check: () => this.alwaysBeCasting.suggestionThresholds,
          }),
          new Requirement({
            name: `Cancelled casts`,
            check: () => this.cancelledCasts.suggestionThresholds,
          }),
          new Requirement({
            name: `Focus capping`,
            check: () => this.timeFocusCapped.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Be prepared',
      description: 'Being prepared is important if you want to perform to your highest potential, just like Illidan Stormrage',
      requirements: () => {
        return [
          new Requirement({
            name: 'All legendaries upgraded to max item level',
            check: () => ({
              actual: this.legendaryUpgradeChecker.upgradedLegendaries.length,
              isLessThan: this.legendaryCountChecker.max,
              style: 'number',
            }),
          }),
          new Requirement({
            name: 'Used max possible legendaries',
            check: () => ({
              actual: this.legendaryCountChecker.equipped,
              isLessThan: this.legendaryCountChecker.max,
              style: 'number',
            }),
          }),
          new Requirement({
            name: 'Used a pre-potion',
            check: () => this.prePotion.prePotionSuggestionThresholds,
          }),
          new Requirement({
            name: 'Used a second potion',
            check: () => this.prePotion.secondPotionSuggestionThresholds,
          }),
        ];
      },
    }),

  ];

}

export default Checklist;
