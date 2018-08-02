import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import AlwaysBeCasting from './AlwaysBeCasting';
import HolyPowerDetails from '../HolyPower/HolyPowerDetails';
import ArtOfWar from '../PaladinCore/ArtOfWar';
import Judgment from '../PaladinCore/Judgment';
import Liadrins from '../Items/LiadrinsFuryUnleashed';
import Whisper from '../Items/WhisperOfTheNathrezim';
import SoulOfTheHighlord from '../Items/SoulOfTheHighlord';
import Crusade from '../Talents/Crusade';
import Inquisition from '../Talents/Inquisition';
import RighteousVerdict from '../Talents/RighteousVerdict';

class Checklist extends CoreChecklist {
	static dependencies = {
    abilities: Abilities,
		castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
    abilityTracker: AbilityTracker,

    holyPowerDetails: HolyPowerDetails,
    artOfWar: ArtOfWar,
    judgment: Judgment,
    liadrins: Liadrins,
    soulOfTheHighlord: SoulOfTheHighlord,
    whisper: Whisper,
    crusade: Crusade,
    inquisition: Inquisition,
    righteousVerdict: RighteousVerdict,
	};

  rules = [
    new Rule({
      name: 'Always be casting',
      description: <React.Fragment>You should try to avoid doing nothing during the fight. If you have to move, use your <SpellLink id={SPELLS.DIVINE_STEED.id} icon /> to minimize downtime. Also use ranged abilities like <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> or <SpellLink id={SPELLS.BLADE_OF_JUSTICE.id} icon /> if you are out of melee range for extended periods of time.</React.Fragment>,
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
      name: 'Use core abilities as often as possible',
      description: <React.Fragment>Spells with short cooldowns like <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon />, <SpellLink id={SPELLS.BLADE_OF_JUSTICE.id} icon />, and <SpellLink id={SPELLS.CRUSADER_STRIKE.id} icon /> should be used as often as possible.</React.Fragment>,
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CRUSADER_STRIKE,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.JUDGMENT_CAST,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BLADE_OF_JUSTICE,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CONSECRATION_TALENT,
            when: combatant.hasTalent(SPELLS.CONSECRATION_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your cooldowns',
      description: <React.Fragment>Retribution Paladin is a very cooldown dependant spec. Make sure you are keeping spells like <SpellLink id={this.selectedCombatant.hasTalent(SPELLS.CRUSADE_TALENT.id) ? SPELLS.CRUSADE_TALENT.id : SPELLS.AVENGING_WRATH.id} icon /> and <SpellLink id={SPELLS.WAKE_OF_ASHES_TALENT.id} /> on cooldown.</React.Fragment>,
      requirements: () => {
        const combatant = this.selectedCombatant;        
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CRUSADE_TALENT,
            when: combatant.hasTalent(SPELLS.CRUSADE_TALENT.id),
          }),
          new Requirement({
            name: <React.Fragment>Good first global with <SpellLink id={SPELLS.CRUSADE_TALENT.id} icon /> buff</React.Fragment>,
            check: () => this.crusade.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.CRUSADE_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.AVENGING_WRATH,
            when: !combatant.hasTalent(SPELLS.CRUSADE_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.WAKE_OF_ASHES_TALENT,
            when: combatant.hasTalent(SPELLS.WAKE_OF_ASHES_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.EXECUTION_SENTENCE_TALENT,
            when: combatant.hasTalent(SPELLS.EXECUTION_SENTENCE_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use procs and buffs efficiently',
      description: <React.Fragment>Buffs and procs like <SpellLink id={SPELLS.INQUISITION_TALENT.id} icon />, <SpellLink id={SPELLS.ART_OF_WAR.id} icon /> and <SpellLink id={SPELLS.RIGHTEOUS_VERDICT_TALENT.id} icon /> have a significant impact on your damage, use them well</React.Fragment>,
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.ART_OF_WAR.id} icon /> procs used</React.Fragment>,
            check: () => this.artOfWar.suggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> debuffs consumed</React.Fragment>,
            check: () => this.judgment.suggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment>Damage empowered by <SpellLink id={SPELLS.INQUISITION_TALENT.id} icon /></React.Fragment>,
            check: () => this.inquisition.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.INQUISITION_TALENT.id),
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.RIGHTEOUS_VERDICT_TALENT.id} icon /> efficiency</React.Fragment>,
            check: () => this.righteousVerdict.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.RIGHTEOUS_VERDICT_TALENT.id),
          }),
        ];
      },
    }),
  	new Rule({
  		name: 'Use your Holy Power efficently',
  		description: "Holy Power is your main resource, it's very important not to waste it.",
  		requirements: () => {
  			return [
  				new Requirement({
  					name: 'Holy Power efficiency',
  					check: () => this.holyPowerDetails.suggestionThresholds,
  				}),
  			];
  		},
  	}),
    new Rule({
      name: 'Pick the right tools for the fight',
      description: 'The throughput gain of some legendaries might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly.',
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment><ItemLink id={ITEMS.LIADRINS_FURY_UNLEASHED.id} icon /> Holy Power efficiency</React.Fragment>,
            check: () => this.liadrins.suggestionThresholds,
            when: this.liadrins.active,
          }),
          new Requirement({
            name: <React.Fragment>Spenders buffed by <ItemLink id={ITEMS.WHISPER_OF_THE_NATHREZIM.id} icon /></React.Fragment>,
            check: () => this.whisper.suggestionThresholds,
            when: this.whisper.active,
          }),
          new Requirement({
            name: <React.Fragment>Picked the right talent with <ItemLink id={ITEMS.SOUL_OF_THE_HIGHLORD.id} icon /></React.Fragment>,
            check: () => this.soulOfTheHighlord.suggestionThresholds,
            when: this.soulOfTheHighlord.active,
          }),
        ];
      },
    }),
  	new Rule({
      name: 'Use your utility and defensive spells',
      description: <React.Fragment>Use other spells in your toolkit to your advantage. For example, you can use <SpellLink id={SPELLS.SHIELD_OF_VENGEANCE.id} icon /> to mitigate some damage and <SpellLink id={SPELLS.LAY_ON_HANDS.id} icon /> to save your own or someone elses life.</React.Fragment>,
      requirements: () => {
        return [
	        new GenericCastEfficiencyRequirement({
	          spell: SPELLS.SHIELD_OF_VENGEANCE,
            onlyWithSuggestion: false,
	        }),
	        new GenericCastEfficiencyRequirement({
            spell: SPELLS.LAY_ON_HANDS,
            onlyWithSuggestion: false,
					}),
        ];
      },
    }),
    new PreparationRule(),
	];
}

export default Checklist;
