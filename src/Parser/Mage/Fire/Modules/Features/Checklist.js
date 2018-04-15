import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
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
    abilities: Abilities,
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

    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
  };

  rules = [
    new Rule({
      name: 'Always Be Casting',
      description: <Wrapper><em><b>Continuously chaining casts throughout an encounter is the single most important thing for achieving good DPS as a caster</b></em>. There shoule be no delay at all between your spell casts, it's better to start casting the wrong spell than to think for a few seconds and then cast the right spell. You should be able to handle a fight's mechanics with the minimum possible interruption to your casting. Some fights (like Argus) have unavoidable downtime due to phase transitions and the like, so in these cases 0% downtime will not be possible.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Downtime',
            check: () => this.alwaysBeCasting.downtimeSuggestionThresholds,
            tooltip: `The amount of time you spent not casting anything. Make sure that you are casting as much as possible, including using Scorch or your instant cast abilities while you need to move.`,
          }),
          new Requirement({
            name: 'Cancelled Casts',
            check: () => this.cancelledCasts.cancelledCastSuggestionThresholds,
            tooltip: `The percentage of your casts that were cancelled before they could be completed. While this is somewhat expected if you need to move mid cast to dodge a mechanic, you should try to minimize this as much as possible`,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Manage Your Procs',
      description: <Wrapper>Fire Mage is heavily dependent on correctly using your <SpellLink id={SPELLS.FIRE_BLAST.id}/> and <SpellLink id={SPELLS.PHOENIXS_FLAMES.id}/> guaranteed crit abilities to properly convert <SpellLink id={SPELLS.HEATING_UP.id}/> to <SpellLink id={SPELLS.HOT_STREAK.id}/>. These procs, and the amount of them you get, play a big role in your overall performance so it is important that you are utilizing them correctly.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: "Fire Blast used with Heating Up",
            check: () => this.heatingUp.fireBlastUtilSuggestionThresholds,
            tooltip: `Because Fire Blast is guaranteed to crit, you only want to use it to convert Heating Up to Hot Streak. This is because if you use it without Heating Up, you might not get a second crit and waste the Heating Up proc, and if you use it while you have Hot Streak, then you dont gain anything. The only exception to this is during ${this.combatants.selected.hasTalent(SPELLS.FIRESTARTER_TALENT.id) ? 'Firestarter and Combustion' : 'Combustion' } when you know everything is going to crit.`,
          }),
          new Requirement({
            name: "Phoenix's Flames used with Heating Up",
            check: () => this.heatingUp.phoenixFlamesUtilSuggestionThresholds,
            tooltip: `Because Phoenix's Flames is guaranteed to crit, you only want to use it to convert Heating Up to Hot Streak. This is because if you use it without Heating Up, you might not get a second crit and waste the Heating Up proc, and if you use it while you have Hot Streak, then it does nothing. The only exception to this is during ${this.combatants.selected.hasTalent(SPELLS.FIRESTARTER_TALENT.id) ? 'Firestarter and Combustion' : 'Combustion' } when you know everything is going to crit.`,
          }),
          new Requirement({
            name: "Hard Casts Before Hot Streak",
            check: () => this.hotStreak.castBeforeHotStreakThresholds,
            tooltip: `When you get a Hot Streak Proc, you should always cast a hard cast ability like Fireball or Scorch immediately before using the Hot Streak proc. This is because if one of the two spells crit then you will get a new Heating Up proc which you can convert to Hot Streak, and if both spells crit then you would immediately get another Hot Streak proc.`,
          }),
          new Requirement({
            name: "Expired Hot Streaks",
            check: () => this.hotStreak.expiredProcsThresholds,
            tooltip: `You should always ensure that you are using your Hot Streak procs. If you can avoid it, you should never let them expire.`,
          }),
          new Requirement({
            name: "Wasted Crits",
            check: () => this.hotStreak.wastedCritsThresholds,
            tooltip: `When you have a Hot Streak proc, you should ensure that you are using it as soon as possible so you arent hitting the boss with direct damage spells while Hot Streak is up. Since you cannot have Heating Up and Hot Streak at the same time, any direct damage crits from spells like Fireball, Scorch, Pyroblast, Fire Blast, and Phoenix's Flames is a waste and could have contributed towards the next Hot Streak instead.`,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Maximize Combustion Effectiveness',
      description: <Wrapper><SpellLink id={SPELLS.COMBUSTION.id}/> is the only major cooldown that Fire Mage has and it plays a massive role in your performance. Therefore it is important that you are utilizing Combustion properly to avoid missing out on a large amount of damage.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new Requirement({
            name: "Cast with 2 Phoenix Flames Charges",
            check: () => this.combustionCharges.phoenixFlamesThresholds,
            tooltip: `Make sure you are banking 2 charges of Phoenix's Flames outside of Combustion so that you have them available the next time Combustion comes off cooldown. This will help you get as many Hot Streaks as possible during Combustion`,
          }),
          new Requirement({
            name: `Cast with ${combatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? 2 : 1} Fire Blast Charges`,
            check: () => this.combustionCharges.fireBlastThresholds,
            tooltip: `Make sure you are banking ${combatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? '2 charges' : '1 charge'} of Fire Blast when Combustion is getting close to coming off cooldown so that it is available during Combustion. This will help you get as many Hot Streaks as possible during Combustion`,
          }),
          new Requirement({
            name: "Spells hard cast while instants were available",
            check: () => this.combustionSpellUsage.suggestionThresholds,
            tooltip: `During Combustion, make sure you are only using hard cast abilities like Fireball and Scorch when you have no charges of Fire Blast or Phoenix's Flames available. ${combatant.hasWrists(ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id) ? 'The only exception to this is hard casting Pyroblast when you have a proc from the legendary bracers and you can complete the Pyroblast cast before Combustion ends.' : '' }`,
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
            spell: SPELLS.COMBUSTION,
            onlyWithSuggestion: false,
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
            check: () => this.cinderstorm.suggestionThreshold,
            tooltip: `When using Cinderstorm, it is important that every cinder hits every available mob. If this is not possible or you are having trouble aiming the spell properly, you might want to pick another talent.`,
            when: combatant.hasTalent(SPELLS.CINDERSTORM_TALENT.id),
          }),
          new Requirement({
            name: "Rune of Power Effective Time Per Cast",
            check: () => this.runeOfPower.roundedSecondsSuggestionThresholds,
            tooltip: `When using Rune of Power, make sure that you are staying inside the rune for it's full duration. If you need to dodge a mechanic, do your best to stay within range of the rune, or plan your rune placement better so you are not placing them when you might get targeted by a mechanic that will make you move.`,
            when: combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id),
          }),
          new Requirement({
            name: "Combustion used during Firestarter",
            check: () => this.combustionFirestarter.SuggestionThresholds,
            tooltip: `Since both Combustion and Firestarter cause all of your spells to crit, you should ensure that you are not using Combustion while Firestarter is active. Instead, wait until the boss is at 89% before you use your first Combustion.`,
            when: combatant.hasTalent(SPELLS.FIRESTARTER_TALENT.id),
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
