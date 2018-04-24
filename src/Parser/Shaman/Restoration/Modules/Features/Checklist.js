import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import ManaValues from 'Parser/Core/Modules/ManaValues';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

import MasteryEffectiveness from './MasteryEffectiveness';
import AlwaysBeCasting from './AlwaysBeCasting';
import TidalWaves from './TidalWaves';
import ChainHeal from '../Spells/ChainHeal';
import HealingRain from '../Spells/HealingRain';
import HealingSurge from '../Spells/HealingSurge';
import HealingWave from '../Spells/HealingWave';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    manaValues: ManaValues,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    tidalWaves: TidalWaves,
    chainHeal: ChainHeal,
    healingRain: HealingRain,
    enchantChecker: EnchantChecker,
    healingSurge: HealingSurge,
    healingWave: HealingWave,
  };

  rules = [
    new Rule({
      name: 'Use core efficient spells on cooldown',
      description: <React.Fragment>Spells such as <SpellLink id={SPELLS.RIPTIDE.id} />, <SpellLink id={SPELLS.HEALING_RAIN_CAST.id} /> and <SpellLink id={SPELLS.HEALING_STREAM_TOTEM_CAST.id} /> are your most efficient spells available. Try to cast them as much as possible without overhealing. <dfn data-tip="When you're not bringing too many healers.">On Mythic*</dfn> you can often still cast these spells more even if you were overhealing by casting it quicker when it comes off cooldown and improving your target selection. <a href="http://www.wowhead.com/restoration-shaman-rotation-guide#raid-healing-priority-list" target="_blank" rel="noopener noreferrer">More info.</a></React.Fragment>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RIPTIDE,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HEALING_RAIN_CAST,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HEALING_STREAM_TOTEM_CAST,
            onlyWithSuggestion: false,
            when: !combatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CLOUDBURST_TOTEM_TALENT,
            when: combatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.EARTHEN_SHIELD_TOTEM_TALENT,
            when: combatant.hasTalent(SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.WELLSPRING_TALENT,
            when: combatant.hasTalent(SPELLS.WELLSPRING_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.UNLEASH_LIFE_TALENT,
            when: combatant.hasTalent(SPELLS.UNLEASH_LIFE_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use cooldowns effectively',
      description: <React.Fragment>Your cooldowns are an important contributor to your healing throughput. Try to get in as many efficient casts as the fight allows. <a href="http://www.wowhead.com/restoration-shaman-rotation-guide#Throughput-Cooldowns" target="_blank" rel="noopener noreferrer">More info.</a></React.Fragment>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HEALING_TIDE_TOTEM_CAST,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SPIRIT_LINK_TOTEM,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ARCANE_TORRENT_MANA,
            when: !!this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ASCENDANCE_TALENT_RESTORATION,
            when: combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_RESTORATION.id),
          }),
        ];
      },
    }),
    new Rule({
      name: <React.Fragment>Maximize <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> usage</React.Fragment>,
      description: <React.Fragment><SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> buffed <SpellLink id={SPELLS.HEALING_WAVE.id} /> can make for some very efficient healing. You should try to use as many of the generated tidal waves as you can. You should also avoid using <SpellLink id={SPELLS.HEALING_WAVE.id} /> or <SpellLink id={SPELLS.HEALING_SURGE_RESTORATION.id} /> without a tidal wave.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment>
              Unused <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} />
            </React.Fragment>,
            check: () => this.tidalWaves.suggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment>
              Unbuffed <SpellLink id={SPELLS.HEALING_SURGE_RESTORATION.id} />
            </React.Fragment>,
            check: () => this.healingSurge.suggestedThreshold,
          }),
          new Requirement({
            name: <React.Fragment>
              Unbuffed <SpellLink id={SPELLS.HEALING_WAVE.id} />
            </React.Fragment>,
            check: () => this.healingWave.suggestedThreshold,
          }),
        ];
      },
      //Healing Wave/Healing SUrge used without Tidal Wave
    }),
    new Rule({
      name: 'Target AOE spells effectively',
      description: 'As a resto shaman our core AOE spells rely on not just who we target but where they are on the ground to maximize healing potential. You should plan you AOE spells ahead of time in preparation for where you expect raid members to be for the spells duration.',
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment>
              Average <SpellLink id={SPELLS.CHAIN_HEAL.id} /> targets
            </React.Fragment>,
            check: () => this.chainHeal.suggestionThreshold,
          }),
          new Requirement({
            name: <React.Fragment>
              Average <SpellLink id={SPELLS.HEALING_RAIN_HEAL.id} /> targets
            </React.Fragment>,
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
    /*
    new Rule({
      name: 'Pick the right tools for the fight',
      description: 'The throughput gain of some talents or legendaries might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly.',
      requirements: () => {
        return [
          // EMPTY
        ];
      },
    }),*/
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
