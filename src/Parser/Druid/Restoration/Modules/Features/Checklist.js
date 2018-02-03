import React from 'react';

import SPELLS from 'common/SPELLS';

import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

import AlwaysBeCasting from './AlwaysBeCasting';
import Clearcasting from './Clearcasting';
import Efflorescence from './Efflorescence';
import Innervate from './Innervate';
import Lifebloom from './Lifebloom';
import NaturesEssence from './NaturesEssence';
import WildGrowth from './WildGrowth';

class Checklist extends CoreChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,

    alwaysBeCasting: AlwaysBeCasting,
    clearcasting: Clearcasting,
    efflorescence: Efflorescence,
    innervate: Innervate,
    lifebloom: Lifebloom,
    naturesEssence: NaturesEssence,
    wildGrowth: WildGrowth,

    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
  };

  rules = [
    new Rule({
      name: 'Stay active throughout the fight',
      description: <Wrapper>While constantly casting heals will quickly run you out of mana, you should still try to always be doing something throughout the fight. You can reduce your downtime while saving mana by spamming <SpellLink id={SPELLS.SOLAR_WRATH.id} /> on the boss when there is nothing serious to heal. If you safely healed through the entire fight and still had high non-healing time, your raid team is probably bringing too many healers.</Wrapper>,
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
      name: <Wrapper>Use <SpellLink id={SPELLS.WILD_GROWTH.id} icon /> effectively</Wrapper>,
      description: <Wrapper>Effective use of <SpellLink id={SPELLS.WILD_GROWTH.id} /> is incredibly important to your healing performance. It provides not only the directly applied HoT, but also procs <SpellLink id={SPELLS.NATURES_ESSENCE_DRUID.id} /> and <SpellLink id={SPELLS.DREAMWALKER.id} />. When more than 3 raiders are wounded, it is probably the most efficienct and effective spell you can cast. Try to time your <SpellLink id={SPELLS.WILD_GROWTH.id} /> cast to land just after a boss ability in order to keep raiders healthy even through heavy AoE.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.WILD_GROWTH.id} icon /> / <SpellLink id={SPELLS.REJUVENATION.id} icon /> ratio</Wrapper>,
            check: () => this.wildGrowth.suggestionThresholds,
            tooltip: `This is your ratio of Wild Growth casts to Rejuvenation casts. If this number is too low, it probably indicates you were missing good opportunities to cast Wild Growth.`,
          }),
          new Requirement({
            name: <Wrapper>Low target <SpellLink id={SPELLS.WILD_GROWTH.id} icon /> casts</Wrapper>,
            check: () => this.naturesEssence.suggestionThresholds,
            tooltip: `This is your percent of Wild Growth casts that hit too few wounded targets. Low target casts happen either by casting it when almost all the raid was full health, or casting it on an isolated target. Remember that Wild Growth can only apply to players within 30 yds of the primary target, so if you use it on a target far away from the rest of the raid your cast will not be effective.`,
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper>Keep <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} icon /> and <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} icon /> active</Wrapper>,
      description: <Wrapper>Maintaining uptime on these two important spells will improve your mana efficiency and overall throughput. It is good to keep <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> constantly active on a tank. While its throughput is comparable to a <SpellLink id={SPELLS.REJUVENATION.id} />, it also provides a constant chance to proc <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} />. <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> is very mana efficient when it can tick over its full duration. Place it where raiders are liable to be and refresh it as soon as it expires.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} icon /> uptime</Wrapper>,
            check: () => this.lifebloom.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} icon /> uptime</Wrapper>,
            check: () => this.efflorescence.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your healing cooldowns',
      description: <Wrapper>Your cooldowns can be a big contributor to healing throughput when used frequently throughout the fight. When used early and often they can contribute a lot of healing for very little mana. Try to plan your major cooldowns (<SpellLink id={SPELLS.TRANQUILITY_CAST.id} /> and <SpellLink id={SPELLS.ESSENCE_OF_GHANIR.id} />) around big damage boss abilities, like the Transition Phase on Imonar or Fusillade on Antoran High Command. The below percentages represent the percentage of time you kept each spell on cooldown.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CENARION_WARD_TALENT,
            when: combatant.hasTalent(SPELLS.CENARION_WARD_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.FLOURISH_TALENT,
            when: combatant.hasTalent(SPELLS.FLOURISH_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ESSENCE_OF_GHANIR,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TRANQUILITY_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.INNERVATE,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Manage your mana',
      description: <Wrapper>Casting on targets who don't need healing or recklessly using inefficienct heals can result in running out of mana well before an encounter ends. Adapt your spell use to the situation, and as a rule of thumb try and keep your current mana percentage just above the bosses health percentage.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>Mana saved during <SpellLink id={SPELLS.INNERVATE.id} icon /></Wrapper>,
            check: () => this.innervate.averageManaSavedSuggestionThresholds,
            tooltip: `All spells cost no mana during Innervate, so take care to chain cast for its duration. Typically this means casting a Wild Growth, refreshing Efflorescence, and spamming Rejuvenation. It's also fine to Regrowth a target that is in immediate danger of dying.`,
          }),
          new Requirement({
            name: <Wrapper>Use your <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} icon /> procs</Wrapper>,
            check: () => this.clearcasting.clearcastingUtilSuggestionThresholds,
            tooltip: `This is the percentage of Clearcasting procs that you used. Regrowth is normally very expensive, but it's completely free with a Clearcasting proc. Use your procs in a timely fashion for a lot of free healing.`,
          }),
          new Requirement({
            name: <Wrapper>Don't overuse <SpellLink id={SPELLS.REGROWTH.id} icon /></Wrapper>,
            check: () => this.clearcasting.nonCCRegrowthsSuggestionThresholds,
            tooltip: `This is the number of no-clearcasting Regrowths you cast per minute. Regrowth is very mana inefficient, and should only be used in emergency situations (and when you've already expended Swiftmend). Usually, you should rely on other healers in your raid to triage.`,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your defensive / emergency spells',
      description: <Wrapper>Restoration Druids unfortunately do not have many tools to deal with burst damage, but you should take care to use the ones you have. The below percentages represent the percentage of time you kept each spell on cooldown.</Wrapper>,
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SWIFTMEND,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.IRONBARK,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BARKSKIN,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
