import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import CoreChecklist, { Rule, Requirement, GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

import AlwaysBeCasting from './AlwaysBeCasting';
import AgonyUptime from './AgonyUptime';
import CorruptionUptime from './CorruptionUptime';
import SiphonLifeUptime from '../Talents/SiphonLifeUptime';
import SoulShardDetails from '../SoulShards/SoulShardDetails';
import MaxTormentedSouls from './MaxTormentedSouls';

class Checklist extends CoreChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    alwaysBeCasting: AlwaysBeCasting,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,

    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    siphonLifeUptime: SiphonLifeUptime,
    soulShardDetails: SoulShardDetails,
    maxTormentedSouls: MaxTormentedSouls,
  };

  rules = [
    new Rule({
      name: 'Maintain your DoTs on the boss',
      description: 'Affliction Warlocks rely on DoTs as a means of dealing damage to the target. You should try to keep as highest uptime on them as possible.',
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.AGONY.id} icon/> uptime</Wrapper>,
            check: () => this.agonyUptime.defaultSuggestionThresholds,
            when: !combatant.hasTalent(SPELLS.WRITHE_IN_AGONY_TALENT.id),
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.AGONY.id} icon/> uptime</Wrapper>,
            check: () => this.agonyUptime.writheSuggestionThresholds,
            when: combatant.hasTalent(SPELLS.WRITHE_IN_AGONY_TALENT.id),
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.CORRUPTION_CAST.id} icon/> uptime</Wrapper>,
            check: () => this.corruptionUptime.defaultSuggestionThresholds,
            when: !combatant.hasBuff(SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id),
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.CORRUPTION_CAST.id} icon/> uptime</Wrapper>,
            check: () => this.corruptionUptime.t20SuggestionThresholds,
            when: combatant.hasBuff(SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id),
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.SIPHON_LIFE_TALENT.id} icon/> uptime</Wrapper>,
            check: () => this.siphonLifeUptime.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.SIPHON_LIFE_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper>Don't cap your <SpellLink id={SPELLS.WARLOCK_TORMENTED_SOULS.id}/>.</Wrapper>,
      description: <Wrapper>In certain fights, it's possible to be generating a lot of <SpellLink id={SPELLS.WARLOCK_TORMENTED_SOULS.id}/> and it's important to not let them cap as they are valuable resource that shouldn't be wasted even if it means wasting a portion of <SpellLink id={SPELLS.DEADWIND_HARVESTER.id} icon/> buff.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            // TODO: show the time spent in tooltip?
            name: 'Time spent on max stacks',
            check: () => this.maxTormentedSouls.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Don\'t cap your Soul Shards',
      description: 'Soul Shards are your main and most important resource and since their generation is random as Affliction, it\'s very important not to let them cap.',
      requirements: () => {
        return [
          new Requirement({
            // TODO: maybe show time spent on max stacks
            name: 'Wasted shards',
            check: () => this.soulShardDetails.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your cooldowns',
      description: 'Be mindful of your cooldowns if you are specced into them and use them when it\'s appropriate. It\'s okay to hold a cooldown for a little bit when the encounter requires it (burn phases), but generally speaking you should use them as much as you can.',
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SOUL_HARVEST_TALENT,
            when: combatant.hasTalent(SPELLS.SOUL_HARVEST_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.PHANTOM_SINGULARITY_TALENT,
            when: combatant.hasTalent(SPELLS.PHANTOM_SINGULARITY_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SUMMON_DOOMGUARD_UNTALENTED,
            when: !combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SUMMON_INFERNAL_UNTALENTED,
            when: !combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.GRIMOIRE_FELHUNTER,
            when: combatant.hasTalent(SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id),
          }),
        ];
      },
    }),
    // TODO: maybe add a rule about buffing UA with Haunt/MG
    new Rule({
      name: 'Use your utility and defensive spells',
      description: <Wrapper>Use other spells in your toolkit to your advantage. For example, you can try to minimize necessary movement by using <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon/>, <SpellLink id={SPELLS.DEMONIC_CIRCLE_TALENT.id} icon/>, <SpellLink id={SPELLS.BURNING_RUSH_TALENT.id} icon/> or mitigate incoming damage with <SpellLink id={SPELLS.UNENDING_RESOLVE.id} icon/>/<SpellLink id={SPELLS.DARK_PACT_TALENT.id} icon/>.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DEMONIC_CIRCLE_TALENT_TELEPORT,
            when: combatant.hasTalent(SPELLS.DEMONIC_CIRCLE_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.UNENDING_RESOLVE,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DARK_PACT_TALENT,
            when: combatant.hasTalent(SPELLS.DARK_PACT_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Always be casting',
      description: <Wrapper>You should try to avoid doing nothing during the fight. When you're out of Soul Shards, cast <SpellLink id={SPELLS.DRAIN_SOUL.id} icon/>, refresh your DoTs, replenish your mana. When you have to move, use your instant abilities or try to utilize <SpellLink id={SPELLS.DEMONIC_CIRCLE_TALENT.id} icon/> or <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon/> to reduce the movement even further.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Downtime',
            check: () => this.alwaysBeCasting.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Be well prepared',
      description: 'Being well prepared with potions, enchants and legendaries is an easy way to improve your performance.',
      performanceMethod: 'average',
      requirements: () => {
        return [
          new Requirement({
            name: 'Used maximum possible amount of legendaries',
            check: () => ({
              actual: this.legendaryCountChecker.equipped,
              isLessThan: this.legendaryCountChecker.max,
              style: 'number',
            }),
          }),
          new Requirement({
            name: 'All legendaries upgraded to max item level',
            check: () => ({
              actual: this.legendaryUpgradeChecker.upgradedLegendaries.length,
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
