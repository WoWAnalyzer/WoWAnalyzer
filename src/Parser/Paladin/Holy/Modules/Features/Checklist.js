import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import ManaValues from 'Parser/Core/Modules/ManaValues';
import VelensFutureSight from 'Parser/Core/Modules/Items/Legion/Legendaries/VelensFutureSight';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

import MasteryEffectiveness from './MasteryEffectiveness';
import AlwaysBeCasting from './AlwaysBeCasting';
import BeaconHealing from '../PaladinCore/BeaconHealing';
import FillerLightOfTheMartyrs from '../PaladinCore/FillerLightOfTheMartyrs';
import FillerFlashOfLight from '../PaladinCore/FillerFlashOfLight';
import Ilterendi from '../Items/Ilterendi';
import Overhealing from '../PaladinCore/Overhealing';
import JudgmentOfLight from '../Talents/JudgmentOfLight';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    beaconHealing: BeaconHealing,
    fillerLightOfTheMartyrs: FillerLightOfTheMartyrs,
    fillerFlashOfLight: FillerFlashOfLight,
    manaValues: ManaValues,
    ilterendi: Ilterendi,
    velensFutureSight: VelensFutureSight,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    overhealing: Overhealing,
    enchantChecker: EnchantChecker,
    judgmentOfLight: JudgmentOfLight,
  };

  rules = [
    new Rule({
      // The name of the Rule as you want it to appear in the Checklist.
      // You can also make this a React node if you want to use `SpellLink` or other JSX (HTML), in that case wrap the contents with the <React.Fragment> component.
      name: 'Use core abilities as often as possible',
      // The description that is shown when the Rule is expanded.
      // Avoid making too many things a URL. Including a link to a guide that goes into further detail is recommended.
      description: (
        <React.Fragment>
          Spells such as <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} />, <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} /> and <SpellLink id={SPELLS.JUDGMENT_CAST.id} /> (with <SpellLink id={SPELLS.JUDGMENT_OF_LIGHT_HEAL.id} />) are your most efficient spells available. Try to cast them as much as possible without overhealing. <dfn data-tip="When you're not bringing too many healers.">On Mythic*</dfn> you can often still cast these spells more even if you were overhealing by casting it quicker when it comes off cooldown and improving your target selection. <a href="https://www.wowhead.com/holy-paladin-rotation-guide#gameplay-and-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
        </React.Fragment>
      ),
      // The list of requirements for the Rule. Since it's a method you can run any code in here you want, but please try to keep is as simple as possible.
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HOLY_SHOCK_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.LIGHT_OF_DAWN_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.JUDGMENT_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BESTOW_FAITH_TALENT,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.LIGHTS_HAMMER_TALENT,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CRUSADER_STRIKE,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HOLY_PRISM_TALENT,
          }),
          new Requirement({
            name: <React.Fragment>Total filler <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} />s cast while<br /><SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> was available</React.Fragment>,
            check: () => this.fillerFlashOfLight.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use cooldowns effectively',
      description: <React.Fragment>Your cooldowns are an important contributor to your healing throughput. Try to get in as many efficient casts as the fight allows. <a href="https://www.wowhead.com/holy-paladin-rotation-guide#gameplay-and-priority-list" target="_blank" rel="noopener noreferrer">More info.</a></React.Fragment>,
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.AVENGING_WRATH,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HOLY_AVENGER_TALENT,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TYRS_DELIVERANCE_CAST,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.VELENS_FUTURE_SIGHT_BUFF,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.AURA_MASTERY,
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
      name: 'Use your supportive abilities',
      description: 'While you shouldn\'t aim to cast defensives and externals on cooldown, be aware of them and try to use them whenever effective. Not using them at all indicates you might not be aware of them enough or not utilizing them optimally.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RULE_OF_LAW_TALENT,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DIVINE_STEED,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DIVINE_PROTECTION,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BLESSING_OF_SACRIFICE,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.LAY_ON_HANDS,
          }),
        ];
      },
    }),
    new Rule({
      name: <React.Fragment>Position yourself well to maximize <SpellLink id={SPELLS.MASTERY_LIGHTBRINGER.id} /></React.Fragment>,
      description: <React.Fragment><SpellLink id={SPELLS.MASTERY_LIGHTBRINGER.id} /> has a big impact on the strength of your heals. Try to stay close to the people you are healing to benefit the most from your Mastery. Use <SpellLink id={SPELLS.RULE_OF_LAW_TALENT.id} /> when healing people further away.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Mastery effectiveness',
            check: () => this.masteryEffectiveness.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Try to avoid being inactive for a large portion of the fight',
      description: (
        <React.Fragment>
          While it's suboptimal to always be casting as a healer you should still try to always be doing something during the entire fight and high downtime is inexcusable. You can reduce your downtime by reducing the delay between casting spells, anticipating movement, moving during the GCD, and <dfn data-tip="While helping with damage would be optimal, it's much less important as a healer than any of the other suggestions on this checklist. You should ignore this suggestion while you are having difficulties with anything else.">when you're not healing try to contribute some damage*</dfn>.
        </React.Fragment>
      ),
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
      name: 'Don\'t tunnel the tanks',
      description: 'A common misconception about Holy Paladins is that we should focus tanks when healing. This is actually inefficient. Let your beacons do most of the work, ask your co-healers to keep efficient HoTs on the tanks and only directly heal the tanks when they would otherwise die.',
      requirements: () => {
        return [
          new Requirement({
            name: 'Direct beacon healing',
            check: () => this.beaconHealing.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: <React.Fragment>Only use <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> when absolutely necessary</React.Fragment>,
      description: <React.Fragment><SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> is an inefficient spell to cast compared to the alternatives. Try to only cast <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> when it will save someone's life or when you have to move and all other instant cast spells are on cooldown.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Total filler casts per minute',
            check: () => this.fillerLightOfTheMartyrs.cpmSuggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment>Total filler casts while <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> was available</React.Fragment>,
            check: () => this.fillerLightOfTheMartyrs.inefficientCpmSuggestionThresholds,
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
    new Rule({
      name: 'Pick the right tools for the fight',
      description: 'The throughput gain of some talents or legendaries might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly.',
      requirements: () => {
        return [
          new Requirement({
            name: <ItemLink id={ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id} />,
            check: () => this.ilterendi.suggestionThresholds,
            when: this.ilterendi.active,
          }),
          new Requirement({
            name: <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} />,
            check: () => this.velensFutureSight.suggestionThresholds,
            when: this.velensFutureSight.active,
          }),
        ];
      },
    }),
    new PreparationRule(),
    new Rule({
      name: 'Avoid overhealing',
      description: 'Pick the right targets when healing and use the right abilities at the right time. While overhealing still transfers to your beacons, it\'s still inefficient. Overhealing might be unavoidable when there\'s not a lot of damage taken (such as in normal mode) or when bringing too many healers.',
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new Requirement({
            name: <SpellLink id={SPELLS.HOLY_SHOCK_HEAL.id} />,
            check: () => this.overhealing.holyShockSuggestionThresholds,
          }),
          new Requirement({
            name: <SpellLink id={SPELLS.LIGHT_OF_DAWN_HEAL.id} />,
            check: () => this.overhealing.lightOfDawnSuggestionThresholds,
          }),
          new Requirement({
            name: <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} />,
            check: () => this.overhealing.flashOfLightSuggestionThresholds,
          }),
          new Requirement({
            name: <SpellLink id={SPELLS.BESTOW_FAITH_TALENT.id} />,
            check: () => this.overhealing.bestowFaithSuggestionThresholds,
            when: combatant.hasTalent(SPELLS.BESTOW_FAITH_TALENT.id),
          }),
        ];
      },
    }),
  ];
}

export default Checklist;
