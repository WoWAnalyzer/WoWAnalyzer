import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import ManaValues from 'Parser/Core/Modules/ManaValues';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

import AlwaysBeCasting from './AlwaysBeCasting';
import EssenceFont from '../Spells/EssenceFont';
import RefreshingJadeWind from '../Talents/RefreshingJadeWind';
import ChiBurst from '../Talents/ChiBurst';
import SpiritOfTheCrane from '../Talents/SpiritOfTheCrane';
import ManaTea from '../Talents/ManaTea';
import Lifecycles from '../Talents/Lifecycles';
import UpliftingTrance from '../Spells/UpliftingTrance';
import ThunderFocusTea from '../Spells/ThunderFocusTea';
import EssenceFontMastery from '../Features/EssenceFontMastery';
import SoothingMist from '../Spells/SoothingMist';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    combatants: Combatants,
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
    upliftingTrance: UpliftingTrance,
    thunderFocusTea: ThunderFocusTea,
    essenceFontMastery: EssenceFontMastery,
    soothingMist: SoothingMist,
  };

  rules = [
    new Rule({
      name: 'Use core spell as often as possible',
      description: <Wrapper>As a Mistweaver you only have a single rotational spell that should be cast on CD <SpellLink id={SPELLS.RENEWING_MIST.id} icon />. However, you should also make use of your artifact ability, <SpellLink id={SPELLS.SHEILUNS_GIFT.id} icon />. Use this ability at or under 6 stacks to ensure you are regularly using it and to mimimize overheal.</Wrapper>,
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
      description: <Wrapper>Your cooldowns are an important contributor to your healing throughput. Try to get in as many efficient casts as the fight allows.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
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
            spell: SPELLS.ZEN_PULSE_TALENT,
            when: combatant.hasTalent(SPELLS.ZEN_PULSE_TALENT.id),
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
            spell: SPELLS.ARCANE_TORRENT_MANA,
            when: !!this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA.id),
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper>Position yourself well to maximize your most effective spells</Wrapper>,
      description: <Wrapper>Effective use of <SpellLink id={SPELLS.ESSENCE_FONT.id} /> has a big impact on your healing. Ensure you stay in melee to maximize the number of targets that can be in range of both <SpellLink id={SPELLS.ESSENCE_FONT.id} /> and other spells such as <SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} />.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.ESSENCE_FONT.id} /> targets hit</Wrapper>,
            check: () => this.essenceFont.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} /> % targets hit</Wrapper>,
            check: () => this.refreshingJadeWind.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id),
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.CHI_BURST_TALENT.id} /> targets hit</Wrapper>,
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
        const combatant = this.combatants.selected;
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id} /> mana returned</Wrapper>,
            check: () => this.spiritOfTheCrane.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id),
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> mana saved</Wrapper>,
            check: () => this.manaTea.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.MANA_TEA_TALENT.id),
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.LIFECYCLES_TALENT.id} /> mana saved</Wrapper>,
            check: () => this.lifecycles.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.LIFECYCLES_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your procs and short CDs',
      description: <Wrapper>Make sure to use your procs and spells at the correct time. Wasting <SpellLink id={SPELLS.UPLIFTING_TRANCE_BUFF.id} /> procs will lower you overall healing, along with using the incorrect spells with <SpellLink id={SPELLS.THUNDER_FOCUS_TEA.id} />.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.UPLIFTING_TRANCE_BUFF.id} /> procs wasted</Wrapper>,
            check: () => this.upliftingTrance.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.THUNDER_FOCUS_TEA.id} /> incorrect casts</Wrapper>,
            check: () => this.thunderFocusTea.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.ESSENCE_FONT.id} /> HOTS Used</Wrapper>,
            check: () => this.essenceFontMastery.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Try to avoid being inactive for a large portion of the fight',
      description: <Wrapper>While it's suboptimal to always be casting as a healer you should still try to always be doing something during the entire fight and high downtime is inexcusable. You can reduce your downtime by reducing the delay between casting spells, anticipating movement, moving during the GCD, and when you're not healing try to contribute some damage. Also, there is no reason to channel <SpellLink id={SPELLS.SOOTHING_MIST.id} /> for extended periods of time.</Wrapper>,
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
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.SOOTHING_MIST.id} /> usage</Wrapper>,
            check: () => this.soothingMist.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your defensive cooldowns effectively',
      description: <Wrapper>Make sure you use your personal and defensive cooldowns at appropriate times throughout the fight. While it may not make sense to use these abilities on cooldown, saving them for large damage events is ideal. A good example is using <SpellLink id={SPELLS.DIFFUSE_MAGIC_TALENT.id} /> on Charged Blasts during the Imonar the Soulhunter encounter.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
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
