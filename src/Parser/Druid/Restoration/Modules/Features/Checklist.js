import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

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
import ManaValues from 'Parser/Core/Modules/ManaValues';

import AlwaysBeCasting from './AlwaysBeCasting';
import Clearcasting from './Clearcasting';
import Efflorescence from './Efflorescence';
import Innervate from './Innervate';
import Lifebloom from './Lifebloom';
import NaturesEssence from './NaturesEssence';
import WildGrowth from './WildGrowth';

import Cultivation from '../Talents/Cultivation';
import SpringBlossoms from '../Talents/SpringBlossoms';
import TreeOfLife from '../Talents/TreeOfLife';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    combatants: Combatants,

    alwaysBeCasting: AlwaysBeCasting,
    clearcasting: Clearcasting,
    efflorescence: Efflorescence,
    innervate: Innervate,
    lifebloom: Lifebloom,
    manaValues: ManaValues,
    naturesEssence: NaturesEssence,
    wildGrowth: WildGrowth,

    cultivation: Cultivation,
    springBlossoms: SpringBlossoms,
    treeOfLife: TreeOfLife,

    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
  };

  rules = [
    new Rule({
      name: 'Stay active throughout the fight',
      description: <React.Fragment>While constantly casting heals will quickly run you out of mana, you should still try to always be doing something throughout the fight. You can reduce your downtime while saving mana by spamming <SpellLink id={SPELLS.SOLAR_WRATH.id} /> on the boss when there is nothing serious to heal. If you safely healed through the entire fight and still had high non-healing time, your raid team is probably bringing too many healers.</React.Fragment>,
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
      name: <React.Fragment>Use <SpellLink id={SPELLS.WILD_GROWTH.id} /> effectively</React.Fragment>,
      description: <React.Fragment>Effective use of <SpellLink id={SPELLS.WILD_GROWTH.id} /> is incredibly important to your healing performance. It provides not only the directly applied HoT, but also procs <SpellLink id={SPELLS.NATURES_ESSENCE_DRUID.id} /> and <SpellLink id={SPELLS.DREAMWALKER.id} />. When more than 3 raiders are wounded, it is probably the most efficienct and effective spell you can cast. Try to time your <SpellLink id={SPELLS.WILD_GROWTH.id} /> cast to land just after a boss ability in order to keep raiders healthy even through heavy AoE.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.WILD_GROWTH.id} /> / <SpellLink id={SPELLS.REJUVENATION.id} /> ratio</React.Fragment>,
            check: () => this.wildGrowth.suggestionThresholds,
            tooltip: `This is your ratio of Wild Growth casts to Rejuvenation casts. If this number is too low, it probably indicates you were missing good opportunities to cast Wild Growth.`,
          }),
          new Requirement({
            name: <React.Fragment>Low target <SpellLink id={SPELLS.WILD_GROWTH.id} /> casts</React.Fragment>,
            check: () => this.naturesEssence.suggestionThresholds,
            tooltip: `This is your percent of Wild Growth casts that hit too few wounded targets. Low target casts happen either by casting it when almost all the raid was full health, or casting it on an isolated target. Remember that Wild Growth can only apply to players within 30 yds of the primary target, so if you use it on a target far away from the rest of the raid your cast will not be effective.`,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your healing cooldowns',
      description: <React.Fragment>Your cooldowns can be a big contributor to healing throughput when used frequently throughout the fight. When used early and often they can contribute a lot of healing for very little mana. Try to plan your major cooldowns (<SpellLink id={SPELLS.TRANQUILITY_CAST.id} /> and <SpellLink id={SPELLS.ESSENCE_OF_GHANIR.id} />) around big damage boss abilities, like the Transition Phase on Imonar or Fusillade on Antoran High Command. The below percentages represent the percentage of time you kept each spell on cooldown.</React.Fragment>,
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
            spell: SPELLS.VELENS_FUTURE_SIGHT_BUFF,
            when: combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ESSENCE_OF_GHANIR,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.INCARNATION_TREE_OF_LIFE_TALENT,
            when: combatant.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TRANQUILITY_CAST,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.INNERVATE,
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),
    new Rule({
      name: <React.Fragment>Keep <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> and <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> active</React.Fragment>,
      description: <React.Fragment>Maintaining uptime on these two important spells will improve your mana efficiency and overall throughput. It is good to keep <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> constantly active on a tank. While its throughput is comparable to a <SpellLink id={SPELLS.REJUVENATION.id} />, it also provides a constant chance to proc <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} />. <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> is very mana efficient when it can tick over its full duration. Place it where raiders are liable to be and refresh it as soon as it expires.</React.Fragment>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> uptime</React.Fragment>,
            check: () => this.lifebloom.suggestionThresholds,
            when: !combatant.hasWaist(ITEMS.THE_DARK_TITANS_ADVICE.id),
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> uptime</React.Fragment>,
            tooltip: `This requirement is more stringent because you have The Dark Titans Advice equipped`,
            check: () => this.lifebloom.suggestionThresholds,
            when: combatant.hasWaist(ITEMS.THE_DARK_TITANS_ADVICE.id),
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> uptime</React.Fragment>,
            check: () => this.efflorescence.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Manage your mana',
      description: <React.Fragment>Casting on targets who don't need healing or recklessly using inefficienct heals can result in running out of mana well before an encounter ends. Adapt your spell use to the situation, and as a rule of thumb try and keep your current mana percentage just above the bosses health percentage.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment>Mana saved during <SpellLink id={SPELLS.INNERVATE.id} /></React.Fragment>,
            check: () => this.innervate.averageManaSavedSuggestionThresholds,
            tooltip: `All spells cost no mana during Innervate, so take care to chain cast for its duration. Typically this means casting a Wild Growth, refreshing Efflorescence, and spamming Rejuvenation. It's also fine to Regrowth a target that is in immediate danger of dying.`,
          }),
          new Requirement({
            name: <React.Fragment>Use your <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> procs</React.Fragment>,
            check: () => this.clearcasting.clearcastingUtilSuggestionThresholds,
            tooltip: `This is the percentage of Clearcasting procs that you used. Regrowth is normally very expensive, but it's completely free with a Clearcasting proc. Use your procs in a timely fashion for a lot of free healing.`,
          }),
          new Requirement({
            name: <React.Fragment>Don't overuse <SpellLink id={SPELLS.REGROWTH.id} /></React.Fragment>,
            check: () => this.clearcasting.nonCCRegrowthsSuggestionThresholds,
            tooltip: `This is the number of no-clearcasting Regrowths you cast per minute. Regrowth is very mana inefficient, and should only be used in emergency situations (and when you've already expended Swiftmend). Usually, you should rely on other healers in your raid to triage.`,
          }),
          new Requirement({
            name: 'Mana remaining at fight end',
            check: () => this.manaValues.suggestionThresholds,
            tooltip: `Try to spend your mana at roughly the same rate the boss is dying. Having too much mana left at fight end could mean you were too conservative with your spell casts. If your mana is in good shape but there isn't much to heal, consider mixing Moonfire and Sunfire into your DPS rotation, which will burn some mana for extra DPS contribution.`,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your defensive / emergency spells',
      description: <React.Fragment>Restoration Druids unfortunately do not have many tools to deal with burst damage, but you should take care to use the ones you have. Swiftmend is a fairly inefficient spell, and should only be used in an emergency. The below percentages represent the percentage of time you kept each spell on cooldown.</React.Fragment>,
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SWIFTMEND,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.IRONBARK,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BARKSKIN,
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Pick the right tools for the fight',
      description: <React.Fragment>Different talent choices can be more or less effective depending on the fight. Listed below you will see how much throughput some talents were providing.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.CULTIVATION.id} /> throughput</React.Fragment>,
            check: () => this.cultivation.suggestionThresholds,
            tooltip: `This is the percent of your total healing that Cultivation contributed. Below around ${formatPercentage(this.cultivation.suggestionThresholds.isLessThan.average, 0)}%, you either had too many healers in this fight, or the fight is better for Tree of Life`,
            when: this.cultivation.active,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.SPRING_BLOSSOMS.id} /> throughput</React.Fragment>,
            check: () => this.springBlossoms.suggestionThresholds,
            tooltip: `This is the percent of your total healing that Spring Blossoms contributed. Below around ${formatPercentage(this.springBlossoms.suggestionThresholds.isLessThan.average, 0)}%, you either weren't doing a good job with Efflorescence placement or you would have been better off picking Germination`,
            when: this.springBlossoms.active,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id} /> throughput</React.Fragment>,
            check: () => this.treeOfLife.suggestionThresholds,
            tooltip: `This is the percent of your total healing that Tree of Life contributed. Below around ${formatPercentage(this.treeOfLife.suggestionThresholds.isLessThan.average, 0)}%, you either didn't pick good times to use ToL or you would have been better off picking Cultivation`,
            when: this.treeOfLife.hasTol,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
