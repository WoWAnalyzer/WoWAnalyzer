import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
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
import Cinderstorm from './Cinderstorm';
import CombustionCharges from './CombustionCharges';
import CombustionFirestarter from './CombustionFirestarter';
import CombustionSpellUsage from './CombustionSpellUsage';
import HeatingUp from './HeatingUp';
import HotStreak from './HotStreak';
import MirrorImage from '../../../Shared/Modules/Features/MirrorImage';
import RuneOfPower from '../../../Shared/Modules/Features/RuneOfPower';

class Checklist extends CoreChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,

    cinderstorm: Cinderstorm,
    combustionCharges: CombustionCharges,
    combustionFirestarter: CombustionFirestarter,
    combustionSpellUsage: CombustionSpellUsage,
    heatingUp: HeatingUp,
    hotStreak: HotStreak,
    mirrorImage: MirrorImage,
    runeOfPower: RuneOfPower,

    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
  };

  rules = [
    new Rule({
      name: 'Always be casting',
      description: <Wrapper><em><b>Continuously chaining casts throughout an encounter is the single most important thing for achieving good DPS as a caster</b></em>. There shoule be no delay at all between your spell casts, it's better to start casting the wrong spell than to think for a few seconds and then cast the right spell. You should be able to handle a fight's mechanics with the minimum possible interruption to your casting. Some fights (like Argus) have unavoidable downtime due to phase transitions and the like, so in these cases 0% downtime will not be possible.</Wrapper>,
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
      name: 'Managing  your procs',
      description: <Wrapper>Fire Mage is heavily dependent on correctly using your <SpellLink id={SPELLS.FIRE_BLAST.id}/> and <SpellLink id={SPELLS.PHOENIXS_FLAMES.id}/> guaranteed crit abilities to properly convert <SpellLink id={SPELLS.HEATING_UP.id}/> to <SpellLink id={SPELLS.HOT_STREAK.id}/>. Remember to only use your guaranteed crit spells to convert Heating Up to Hot Streak, and also remember to precede each instant cast <SpellLink id={SPELLS.PYROBLAST.id}/> with a hardcast of <SpellLink id={SPELLS.FIREBALL.id}/>, <SpellLink id={SPELLS.SCORCH.id}/>, or <SpellLink id={SPELLS.PYROBLAST.id}/> (If you have <ItemLink id={ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id}/>) to increase the chances of getting a new Heating Up or Hot Streak</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: "Fire Blast used without Heating Up",
            check: () => this.heatingUp.fireBlastUtilSuggestionThresholds,
          }),
          new Requirement({
            name: "Phoenix's Flames used without Heating Up",
            check: () => this.heatingUp.phoenixFlamesUtilSuggestionThresholds,
          }),
          new Requirement({
            name: "Hard Cast Before Hot Streak Util",
            check: () => this.hotStreak.castBeforeHotStreakThresholds,
          }),
          new Requirement({
            name: "Expired Hot Streaks",
            check: () => this.hotStreak.expiredProcsThresholds,
          }),
          new Requirement({
            name: "Wasted Crits",
            check: () => this.hotStreak.wastedCritsThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Managing Combustion',
      description: <Wrapper><SpellLink id={SPELLS.COMBUSTION.id}/> is the only major cooldown that Fire Mage has and it plays a massive role in your performance. When Combustion is about to come off cooldown, it is important that you bank a couple charges of <SpellLink id={SPELLS.FIRE_BLAST.id}/> and <SpellLink id={SPELLS.PHOENIXS_FLAMES.id}/> to help you get as many Hot Streak procs as possible during Combustion. Additionally, during Combustion, your goal is to use your instant cast spells to convert Heating Up to Hot Streak as quickly as possible so you can get more instant cast Pyroblasts in during the Combustion Window. You should only hard cast spells like <SpellLink id={SPELLS.FIREBALL.id}/> and <SpellLink id={SPELLS.SCORCH.id}/> if you are completely out of instant cast spells. Finally, if you have <ItemLink id={ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id}/>, you should make sure you are using your procs to hard cast <SpellLink id={SPELLS.PYROBLAST.id}/> during Combustion as long as you can finish the cast before Combustion ends.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: "Combustion Used with < 2 Phoenix Flames Charges",
            check: () => this.combustionCharges.phoenixFlamesThresholds,
          }),
          new Requirement({
            name: `Combustion Used with < ${this.combatants.selected.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? 2 : 1} Fire Blast Charges`,
            check: () => this.combustionCharges.fireBlastThresholds,
          }),
          new Requirement({
            name: "Spells hard cast while instants were available",
            check: () => this.combustionSpellUsage.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your cooldowns',
      description: <Wrapper>Your cooldowns are a major contributor to your DPS, and should be used as frequently as possible throughout a fight. A cooldown should be held on to only if a priority DPS phase is coming <em>soon</em>. Holding cooldowns too long will hurt your DPS.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.COMBUSTION,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CINDERSTORM_TALENT,
            when: combatant.hasTalent(SPELLS.CINDERSTORM_TALENT.id),
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
            spell: SPELLS.BLAST_WAVE_TALENT,
            when: combatant.hasTalent(SPELLS.BLAST_WAVE_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.METEOR_TALENT,
            when: combatant.hasTalent(SPELLS.METEOR_TALENT.id),
          }),
        ];
      },
    }),

    new Rule({
      name: 'Utilize your talents',
      description: <Wrapper>Talent choice can effect playstyle, it is important to use your talents to their fullest.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new Requirement({
            name: "Cinderstorm Average Hits Per Cast",
            check: () => this.cinderstorm.SuggestionThresholds,
            when: combatant.hasTalent(SPELLS.CINDERSTORM_TALENT.id),
          }),
          new Requirement({
            name: "Rune of Power Effective Time Per Cast",
            check: () => this.runeOfPower.roundedSecondsSuggestionThresholds,
            when: combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id),
          }),
          new Requirement({
            name: "Combustion used during Firestarter",
            check: () => this.combustionFirestarter.SuggestionThresholds,
            when: combatant.hasTalent(SPELLS.FIRESTARTER_TALENT.id),
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
