import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
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
    abilities: Abilities,
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
      name: 'Always be casting',
      description: <React.Fragment><em><b>Continuously chaining casts throughout an encounter is the single most important thing for achieving good DPS as a caster</b></em>. There shoule be no delay at all between your spell casts, it's better to start casting the wrong spell than to think for a few seconds and then cast the right spell. You should be able to handle a fight's mechanics with the minimum possible interruption to your casting. Some fights (like Argus) have unavoidable downtime due to phase transitions and the like, so in these cases 0% downtime will not be possible.</React.Fragment>,
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
      name: 'Fish for procs',
      description: <React.Fragment>When you don't have any Brain Freeze, Fingers of Frost, or Glacial Spike procs, you should spam Frostbolt to fish for procs. Never cast Flurry without Brain Freeze, and the only reason you should ever cast Ice Lance without Shatter is if you're forced to move and have no other instants available.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: "Flurries without Brain Freeze",
            check: () => this.brainFreeze.flurryWithoutProcSuggestionThresholds,
          }),
          new Requirement({
            name: "Ice Lances without Shatter",
            check: () => this.iceLance.nonShatteredSuggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your procs',
      description: <React.Fragment>Frost Mage is heavily dependent on correct usage of <SpellLink id={SPELLS.FINGERS_OF_FROST.id} /> and <SpellLink id={SPELLS.BRAIN_FREEZE.id} />. Remember to use your procs promptly, and also remember to precede each <SpellLink id={SPELLS.FLURRY.id} /> with a hardcast and follow each with an <SpellLink id={SPELLS.ICE_LANCE.id} /> so that both can benefit from <SpellLink id={SPELLS.WINTERS_CHILL.id} />.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: "Used Brain Freeze procs",
            check: () => this.brainFreeze.utilSuggestionThresholds,
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
      name: 'Use your cooldowns',
      description: <React.Fragment>Your cooldowns are a major contributor to your DPS, and should be used as frequently as possible throughout a fight. A cooldown should be held on to only if a priority DPS phase is coming <em>soon</em>. Holding cooldowns too long will hurt your DPS.</React.Fragment>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.FROZEN_ORB,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.EBONBOLT,
            onlyWithSuggestion: false,
            when: combatant.hasTalent(SPELLS.EBONBOLT_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ICY_VEINS,
            onlyWithSuggestion: false,
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
      name: 'Maximize your talents',
      description: <React.Fragment>Talent choice can effect playstyle, it is important to use your talents to their fullest.</React.Fragment>,
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
    new PreparationRule(),
  ];
}

export default Checklist;
