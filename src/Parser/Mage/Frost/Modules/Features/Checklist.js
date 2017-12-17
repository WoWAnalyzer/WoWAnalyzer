import React from 'react';

import SPELLS from 'common/SPELLS';

import Wrapper from 'common/Wrapper';

import CoreChecklist, { Rule, Requirement, GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

import CancelledCasts from '../../../Shared/Modules/Features/CancelledCasts';
import AlwaysBeCasting from './AlwaysBeCasting';
import WintersChill from './WintersChill';
import BrainFreeze from './BrainFreeze';
import IceLance from './IceLance';
import MirrorImage from '../../../Shared/Modules/Features/MirrorImage';
import RuneOfPower from '../../../Shared/Modules/Features/RuneOfPower';
import ThermalVoid from './ThermalVoid';
import GlacialSpike from './GlacialSpike';

class Checklist extends CoreChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,

    wintersChill: WintersChill,
    brainFreeze: BrainFreeze,
    iceLance: IceLance,
    mirrorImage: MirrorImage,
    runeOfPower: RuneOfPower,
    thermalVoid: ThermalVoid,
    glacialSpike: GlacialSpike,

    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
  };

  rules = [
    new Rule({
      name: 'Always Be Casting',
      description: <Wrapper><em><b>Continuously chaining casts throughout an encounter is the single most important thing for achieving good DPS as a caster</b></em>. There shoule be no delay at all between your spell casts, it's better to start casting the wrong spell than to think for a few seconds and then cast the right spell. You should be able to handle a fight's mechanics with the minimum possible interruption to your casting.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Downtime',
            check: () => this.alwaysBeCasting.downtimeSuggestionThresholds,
          }),
          new Requirement({
            name: 'Cancelled Casts',
            check: () => this.cancelledCasts.cancelledCastSuggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use Your Procs',
      description: <Wrapper>Frost Mage is a heavily proc dependent spec, so using your procs correctly is very important.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: "Used Brain Freeze procs",
            check: () => this.brainFreeze.brainFreezeUtilSuggestionThresholds,
          }),
          new Requirement({
            name: "Used Fingers of Frost procs",
            check: () => this.iceLance.fingersUtilSuggestionThresholds,
          }),
          new Requirement({
            name: "Ice Lance into Winter's Chill",
            check: () => this.wintersChill.iceLanceUtilSuggestionThresholds,
          }),
          new Requirement({
            name: "Hardcast into Winter's Chill",
            check: () => this.wintersChill.hardcastUtilSuggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use Your Cooldowns',
      description: <Wrapper>Your cooldowns are a major contributor to your DPS, and should be used as frequently as possible throughout a fight. A cooldown should be held on to only if a priority DPS phase is coming <em>soon</em>. Holding cooldowns too long will hurt your DPS.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.FROZEN_ORB,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.EBONBOLT,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ICY_VEINS,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RAY_OF_FROST_TALENT,
            when: combatant.hasTalent(SPELLS.RAY_OF_FROST_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.MIRROR_IMAGE_TALENT,
            when: combatant.hasTalent(SPELLS.MIRROR_IMAGE_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RUNE_OF_POWER_TALENT,
            when: combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ICE_NOVA_TALENT,
            when: combatant.hasTalent(SPELLS.ICE_NOVA_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.COMET_STORM_TALENT,
            when: combatant.hasTalent(SPELLS.COMET_STORM_TALENT.id),
          }),
        ];
      },
    }),

    new Rule({
      name: 'Use Your Talents',
      description: <Wrapper>Talent choice can effect playstyle, it is important to use your talents to their fullest.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new Requirement({
            name: "Mirror Image utilized",
            check: () => this.mirrorImage.damageSuggestionThresholds,
            when: combatant.hasTalent(SPELLS.MIRROR_IMAGE_TALENT.id),
          }),
          new Requirement({
            name: "Rune of Power utilized",
            check: () => this.runeOfPower.damageSuggestionThresholds,
            when: combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id),
          }),
          new Requirement({
            name: "Maximized Thermal Void extension",
            check: () => this.thermalVoid.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.THERMAL_VOID_TALENT.id),
          }),
          new Requirement({
            name: "All Icicles into Glacial Spike",
            check: () => this.glacialSpike.utilSuggestionThresholds,
            when: combatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id),
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
            name: 'Legendaries at max item level',
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

  ];
}

export default Checklist;
