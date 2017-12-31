import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import Wrapper from 'common/Wrapper';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import ManaValues from 'Parser/Core/Modules/ManaValues';
import IshkarsFelshieldEmitter from 'Parser/Core/Modules/Items/Legion/AntorusTheBurningThrone/IshkarsFelshieldEmitter';
import EonarsCompassion from 'Parser/Core/Modules/Items/Legion/AntorusTheBurningThrone/EonarsCompassion';
import VelensFutureSight from 'Parser/Core/Modules/Items/Legion/Legendaries/VelensFutureSight';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

import MasteryEffectiveness from './MasteryEffectiveness';
import AlwaysBeCasting from './AlwaysBeCasting';
import TidalWaves from './TidalWaves';
import GiftOfTheQueen from '../Spells/GiftOfTheQueen';
import ChainHeal from '../Spells/ChainHeal';
import HealingRain from '../Spells/HealingRain';
import HealingSurge from '../Spells/HealingSurge';
import HealingWave from '../Spells/HealingWave';

class Checklist extends CoreChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    manaValues: ManaValues,
    velensFutureSight: VelensFutureSight,
    ishkarsFelshieldEmitter: IshkarsFelshieldEmitter,
    eonarsCompassion: EonarsCompassion,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    tidalWaves: TidalWaves,
    giftOfTheQueen: GiftOfTheQueen,
    chainHeal: ChainHeal,
    healingRain: HealingRain,
    enchantChecker: EnchantChecker,
    healingSurge: HealingSurge,
    healingWave: HealingWave,
  };

  rules = [
    new Rule({
      name: 'Use core efficient spells on cooldown',
      description: <Wrapper>Spells such as <SpellLink id={SPELLS.RIPTIDE.id} icon />, <SpellLink id={SPELLS.HEALING_RAIN_CAST.id} icon /> and <SpellLink id={SPELLS.HEALING_STREAM_TOTEM_CAST.id} icon /> are your most efficient spells available. Try to cast them as much as possible without overhealing. <dfn data-tip="When you're not bringing too many healers.">On Mythic*</dfn> you can often still cast these spells more even if you were overhealing by casting it quicker when it comes off cooldown and improving your target selection. <a href="http://www.wowhead.com/restoration-shaman-rotation-guide#raid-healing-priority-list" target="_blank" rel="noopener noreferrer">More info.</a></Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RIPTIDE,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HEALING_RAIN_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HEALING_STREAM_TOTEM_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CLOUDBURST_TOTEM_TALENT,
            when: combatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.GIFT_OF_THE_QUEEN,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use cooldowns effectively',
      description: <Wrapper>Your cooldowns are an important contributor to your healing throughput. Try to get in as many efficient casts as the fight allows. <a href="http://www.wowhead.com/restoration-shaman-rotation-guide#Throughput-Cooldowns" target="_blank" rel="noopener noreferrer">More info.</a></Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HEALING_TIDE_TOTEM_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SPIRIT_LINK_TOTEM,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ARCANE_TORRENT_MANA,
            when: !!this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.VELENS_FUTURE_SIGHT_BUFF,
            when: combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper>Maximize <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} icon /> usage</Wrapper>,
      description: <Wrapper><SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> buffed <SpellLink id={SPELLS.HEALING_WAVE.id} /> can make for some very efficient healing. You should try to use as many of the generated tidal waves as you can. You should also avoid using <SpellLink id={SPELLS.HEALING_WAVE.id} /> or <SpellLink id={SPELLS.HEALING_SURGE_RESTORATION.id} /> without a tidal wave.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>
              Unused <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} icon />
            </Wrapper>,
            check: () => this.tidalWaves.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper>
              Unbuffed <SpellLink id={SPELLS.HEALING_SURGE_RESTORATION.id} icon />
            </Wrapper>,
            check: () => this.healingSurge.suggestedThreshold,
          }),
          new Requirement({
            name: <Wrapper>
              Unbuffed <SpellLink id={SPELLS.HEALING_WAVE.id} icon />
            </Wrapper>,
            check: () => this.healingWave.suggestedThreshold,
          }),
        ];
      },
      //Healing Wave/Healing SUrge used without Tidal Wave
    }),
    new Rule({
      name: 'Maximize ability synergy',
      description: 'Resto Shaman have cooldowns which feed into each other for compounding effects. To maximize your effectiveness it\'s good to use these feeding effects as much as possible.',
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>
              <SpellLink id={SPELLS.GIFT_OF_THE_QUEEN.id} icon /> fed to <SpellLink id={SPELLS.CLOUDBURST_TOTEM_TALENT.id} icon />
            </Wrapper>,
            check: () => this.giftOfTheQueen.CBTTotemFeedingSuggestionThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Target AOE spells effectively',
      description: 'As a resto shaman our core AOE spells rely on not just who we target but where they are on the ground to maximize healing potential. You should plan you AOE spells ahead of time in preparation for where you expect raid members to be for the spells duration.',
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>
              <SpellLink id={SPELLS.GIFT_OF_THE_QUEEN.id} icon /> target efficiency
            </Wrapper>,
            check: () => this.giftOfTheQueen.giftOfQueenTargetEfficiencySuggestionThreshold,
          }),
          new Requirement({
            name: <Wrapper>
              Average <SpellLink id={SPELLS.CHAIN_HEAL.id} icon /> targets
            </Wrapper>,
            check: () => this.chainHeal.suggestionThreshold,
          }),
          new Requirement({
            name: <Wrapper>
              Average <SpellLink id={SPELLS.HEALING_RAIN_HEAL.id} icon /> targets
            </Wrapper>,
            check: () => this.healingRain.suggestionThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Try to stay active for most of the fight.',
      description: 'While it\'s suboptimal to always be casting as a healer you should still try to always be doing something during the entire fight and high downtime is inexcusable. You can reduce your downtime by reducing the delay between casting spells, anticipating movement, moving during the GCD, and when you\'re not healing try to contribute some damage.',
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
      name: 'Pick the right tools for the fight',
      description: 'The throughput gain of some talents or legendaries might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly.',
      requirements: () => {
        return [
          new Requirement({
            name: <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} icon />,
            check: () => this.velensFutureSight.suggestionThresholds,
            when: this.velensFutureSight.active,
          }),
          new Requirement({
            name: <ItemLink id={ITEMS.EONARS_COMPASSION.id} icon />,
            check: () => this.eonarsCompassion.suggestionThresholds,
            when: this.eonarsCompassion.active,
          }),
          new Requirement({
            name: <ItemLink id={ITEMS.ISHKARS_FELSHIELD_EMITTER.id} icon />,
            check: () => this.ishkarsFelshieldEmitter.suggestionThresholds,
            when: this.ishkarsFelshieldEmitter.active,
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
