import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';

import CoreChecklist, { Rule, Requirement } from 'parser/shared/modules/features/Checklist';
import Abilities from 'parser/shared/modules/Abilities';
import { PreparationRule } from 'parser/shared/modules/features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'parser/shared/modules/features/Checklist/Requirements';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import PrePotion from 'parser/shared/modules/items/PrePotion';
import EnchantChecker from 'parser/shared/modules/items/EnchantChecker';

import VirulentPlagueUptime from './VirulentPlagueUptime';
import AlwaysBeCasting from './AlwaysBeCasting';
import RunicPowerDetails from '../runicpower/RunicPowerDetails';
import RuneTracker from './RuneTracker';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    prePotion: PrePotion,
    virulentPlagueUptime: VirulentPlagueUptime,
    alwaysBeCasting: AlwaysBeCasting,
    enchantChecker: EnchantChecker,
    runicPowerDetails: RunicPowerDetails,
    runeTracker: RuneTracker,
  };

  rules = [
    new Rule({
      name: 'Use core spells as often as possible',
      description: <>Spells with short, static cooldowns like <SpellLink id={SPELLS.DARK_TRANSFORMATION.id} /> should be used as often as possible</>,
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DARK_TRANSFORMATION,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DEFILE_TALENT,
            when: combatant.hasTalent(SPELLS.DEFILE_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SOUL_REAPER_TALENT,
            when: combatant.hasTalent(SPELLS.SOUL_REAPER_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use cooldowns as often as possible',
      description: 'You should aim to use your cooldowns as often as you can to maximize your damage output',
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.APOCALYPSE,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SUMMON_GARGOYLE_TALENT,
            when: combatant.hasTalent(SPELLS.SUMMON_GARGOYLE_TALENT.id) && (combatant.hasTalent(SPELLS.DEFILE_TALENT.id) || combatant.hasTalent(SPELLS.SOUL_REAPER_TALENT.id)),
          }),
          // TODO: AOTD
        ];
      },
    }),
    new Rule({
      name: 'Maintain Disease',
      description: <><SpellLink id={SPELLS.VIRULENT_PLAGUE.id} /> is a significant source of damage.  Remember to keep it active on all targets at all times.</>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Virulent Plague Uptime',
            check: () => this.virulentPlagueUptime.UptimeSuggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Try to avoid being inactive for a large portion of the fight',
      description: <>While some downtime is inevitable in fights with movement, you should aim to reduce downtime to prevent capping Runes.  You can reduce downtime by casting ranged abilities like <SpellLink id={SPELLS.OUTBREAK.id} /> or <SpellLink id={SPELLS.DEATH_COIL.id} /></>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Downtime',
            check: () => this.alwaysBeCasting.downtimeSuggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Avoid capping Runic Power',
      description: 'Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities.  Try to spend Runic Power before reaching the maximum amount to avoid wasting resources',
      requirements: () => {
        return [
          new Requirement({
            name: 'Runic Power Efficiency',
            check: () => this.runicPowerDetails.efficiencySuggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Avoid capping Runes',
      description: 'Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities.  You can have up to three runes recharging at once.  You want to dump runes whenever you have 4 or more runes to make sure none are wasted',
      requirements: () => {
        return [
          new Requirement({
            name: 'Rune Efficiency',
            check: () => this.runeTracker.suggestionThresholdsEfficiency,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ]
}

export default Checklist;
