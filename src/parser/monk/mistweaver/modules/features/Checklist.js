import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import CoreChecklist, { Rule, Requirement } from 'parser/shared/modules/features/Checklist';
import Abilities from 'parser/core/modules/Abilities';
import { PreparationRule } from 'parser/shared/modules/features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'parser/shared/modules/features/Checklist/Requirements';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import ManaValues from 'parser/shared/modules/ManaValues';
import PrePotion from 'parser/shared/modules/items/PrePotion';
import EnchantChecker from 'parser/shared/modules/items/EnchantChecker';

import AlwaysBeCasting from './AlwaysBeCasting';
import EssenceFont from '../spells/EssenceFont';
import RefreshingJadeWind from '../talents/RefreshingJadeWind';
import ChiBurst from '../talents/ChiBurst';
import SpiritOfTheCrane from '../talents/SpiritOfTheCrane';
import ManaTea from '../talents/ManaTea';
import Lifecycles from '../talents/Lifecycles';
import ThunderFocusTea from '../spells/ThunderFocusTea';
import EssenceFontMastery from './/EssenceFontMastery';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    manaValues: ManaValues,
    prePotion: PrePotion,
    essenceFont: EssenceFont,
    refreshingJadeWind: RefreshingJadeWind,
    chiBurst: ChiBurst,
    spiritOfTheCrane: SpiritOfTheCrane,
    manaTea: ManaTea,
    lifecycles: Lifecycles,
    enchantChecker: EnchantChecker,
    thunderFocusTea: ThunderFocusTea,
    essenceFontMastery: EssenceFontMastery,
  };

  rules = [
    new Rule({
      name: 'Use core spell as often as possible',
      description: <>As a Mistweaver you only have a single rotational spell that should be cast on CD <SpellLink id={SPELLS.RENEWING_MIST.id} />.</>,
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RENEWING_MIST,
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use cooldowns effectively',
      description: <>Your cooldowns are an important contributor to your healing throughput. Try to get in as many efficient casts as the fight allows.</>,
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.THUNDER_FOCUS_TEA,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.MANA_TEA_TALENT,
            when: combatant.hasTalent(SPELLS.MANA_TEA_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CHI_BURST_TALENT,
            when: combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CHI_WAVE_TALENT,
            when: combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT,
            when: combatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.REVIVAL,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ARCANE_TORRENT_MANA1,
            when: !!this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA1.id),
          }),
        ];
      },
    }),
    new Rule({
      name: <>Position yourself well to maximize your most effective spells</>,
      description: <>Effective use of <SpellLink id={SPELLS.ESSENCE_FONT.id} /> has a big impact on your healing. Ensure you stay in melee to maximize the number of targets that can be in range of both <SpellLink id={SPELLS.ESSENCE_FONT.id} /> and other spells such as <SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} />.</>,
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new Requirement({
            name: <><SpellLink id={SPELLS.ESSENCE_FONT.id} /> targets hit</>,
            check: () => this.essenceFont.suggestionThresholds,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} /> % targets hit</>,
            check: () => this.refreshingJadeWind.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id),
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.CHI_BURST_TALENT.id} /> targets hit</>,
            check: () => this.chiBurst.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Pick the right tools for the fight',
      description: 'The throughput gain of some talents or legendaries might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly.',
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new Requirement({
            name: <><SpellLink id={SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id} /> mana returned</>,
            check: () => this.spiritOfTheCrane.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id),
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> mana saved</>,
            check: () => this.manaTea.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.MANA_TEA_TALENT.id),
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.LIFECYCLES_TALENT.id} /> mana saved</>,
            check: () => this.lifecycles.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.LIFECYCLES_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your procs and short CDs',
      description: <>Make sure to use your procs and spells at the correct time.</>,
      requirements: () => {
        return [
          /* Removed for now while this is finalized going into BfA
          new Requirement({
            name: <><SpellLink id={SPELLS.THUNDER_FOCUS_TEA.id} /> incorrect casts</>,
            check: () => this.thunderFocusTea.suggestionThresholds,
          }), */
          new Requirement({
            name: <><SpellLink id={SPELLS.ESSENCE_FONT.id} /> HOTS Used per Cast</>,
            check: () => this.essenceFontMastery.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Try to avoid being inactive for a large portion of the fight',
      description: <>While it's suboptimal to always be casting as a healer you should still try to always be doing something during the entire fight and high downtime is inexcusable. You can reduce your downtime by reducing the delay between casting spells, anticipating movement, moving during the GCD, and when you're not healing try to contribute some damage. Also, there is no reason to channel <SpellLink id={SPELLS.SOOTHING_MIST.id} /> for extended periods of time.</>,
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
      name: 'Use your defensive cooldowns effectively',
      description: <>Make sure you use your personal and defensive cooldowns at appropriate times throughout the fight. While it may not make sense to use these abilities on cooldown, saving them for large damage events is ideal. A good example is using <SpellLink id={SPELLS.DIFFUSE_MAGIC_TALENT.id} /> on Charged Blasts during the Imonar the Soulhunter encounter.</>,
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.LIFE_COCOON,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DIFFUSE_MAGIC_TALENT,
            when: combatant.hasTalent(SPELLS.DIFFUSE_MAGIC_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DAMPEN_HARM_TALENT,
            when: combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HEALING_ELIXIR_TALENT,
            when: combatant.hasTalent(SPELLS.HEALING_ELIXIR_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use all of your mana effectively',
      description: 'If you have a large amount of mana left at the end of the fight that\'s mana you could have turned into healing. Try to use all your mana during a fight. A good rule of thumb is to try to match your mana level with the boss\'s health.',
      requirements: () => {
        return [
          new Requirement({
            name: 'Mana left',
            check: () => this.manaValues.suggestionThresholds,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
