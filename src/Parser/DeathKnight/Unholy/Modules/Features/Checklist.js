import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

import CoreChecklist, { Rule, Requirement, GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

import VirulentPlagueUptime from './VirulentPlagueUptime';
import AlwaysBeCasting from './AlwaysBeCasting';
import RunicPowerDetails from '../RunicPower/RunicPowerDetails';

class Checklist extends CoreChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    legendaryCountChecker: LegendaryCountChecker,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    prePotion: PrePotion,
    virulentPlagueUptime: VirulentPlagueUptime,
    alwaysBeCasting: AlwaysBeCasting,
    enchantChecker: EnchantChecker,
    runicPowerDetails: RunicPowerDetails,
  };

  rules = [
    new Rule({
      name: 'Use core spells as often as possible',
      description: <Wrapper>Spells with short, static cooldowns like <SpellLink id={SPELLS.DARK_TRANSFORMATION.id}/> and <SpellLink id={SPELLS.CHAINS_OF_ICE.id}/>(when using Cold Heart) should be used as often as possible</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DARK_TRANSFORMATION,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CHAINS_OF_ICE,
            when: combatant.hasChest(ITEMS.COLD_HEART.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DEFILE_TALENT,
            when: combatant.hasTalent(SPELLS.DEFILE_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.EPIDEMIC_TALENT,
            when: combatant.hasTalent(SPELLS.EPIDEMIC_TALENT.id),
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
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DARK_ARBITER_TALENT,
            when: combatant.hasTalent(SPELLS.DARK_ARBITER_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.APOCALYPSE,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SUMMON_GARGOYLE,
            when: combatant.hasTalent(SPELLS.DEFILE_TALENT.id) || combatant.hasTalent(SPELLS.SOUL_REAPER_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BLIGHTED_RUNE_WEAPON_TALENT,
            when: combatant.hasTalent(SPELLS.BLIGHTED_RUNE_WEAPON_TALENT),
          }),
          // TODO: AOTD
        ];
      },
    }),
    new Rule({
      name: 'Maintain Disease',
      description: <Wrapper><SpellLink id={SPELLS.VIRULENT_PLAGUE.id}/> is a significant source of damage.  Remember to keep it active on all targets at all times.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Virulent Plague Uptime',
            check: () => this.virulentPlagueUptime.vpUptimeSuggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Try to avoid being inactive for a large portion of the fight',
      description: <Wrapper>While some downtime is inevitable in fights with movement, you should aim to reduce downtime to prevent capping Runes.  You can reduce downtime by casting ranged abilities like <SpellLink id={SPELLS.OUTBREAK.id}/> or <SpellLink id={SPELLS.DEATH_COIL.id}/></Wrapper>,
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
      name: 'Be well prepared',
      description: 'Being well prepared with potions, enchants and legendaries is an easy way to improve your performance.',
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
          new Requirement({
            name: 'Gear has best enchants',
            check: () => {
              const numEnchantableSlots = Object.keys(this.enchantChecker.enchantableGear).length;
              return {
                actual: numEnchantableSlots - (this.enchantChecker.slotsMissingEnchant.length + this.enchantChecker.slotsMissingMaxEnchant.length),
                isLessThan: numEnchantableSlots,
                style: 'number',
              };
            },
          }),
        ];
      },
    }),
  ]
}

export default Checklist;