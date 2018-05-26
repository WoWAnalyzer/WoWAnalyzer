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
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import AlwaysBeCasting from './AlwaysBeCasting';
import HolyPowerDetails from '../HolyPower/HolyPowerDetails';
import BoWProcTracker from '../PaladinCore/BoWProcTracker';
import Judgment from '../PaladinCore/Judgment';
import Liadrins from '../Items/LiadrinsFuryUnleashed';
import Whisper from '../Items/WhisperOfTheNathrezim';
import SoulOfTheHighlord from '../Items/SoulOfTheHighlord';
import BotA from '../PaladinCore/BlessingOfTheAshbringer';
import Crusade from '../PaladinCore/Crusade';

class Checklist extends CoreChecklist {
	static dependencies = {
    abilities: Abilities,
		castEfficiency: CastEfficiency,
    combatants: Combatants,
    alwaysBeCasting: AlwaysBeCasting,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
    abilityTracker: AbilityTracker,

    holyPowerDetails: HolyPowerDetails,
    boWProcTracker: BoWProcTracker,
    judgment: Judgment,
    liadrins: Liadrins,
    soulOfTheHighlord: SoulOfTheHighlord,
    whisper: Whisper,
    bota: BotA,
    crusade: Crusade,
	};

	rules = [
    new Rule({
    	name: 'Always be casting',
   		description: <React.Fragment>You should try to avoid doing nothing during the fight. If you have to move, use your <SpellLink id={SPELLS.DIVINE_STEED.id} icon /> to minimize downtime. Also use ranged abilities like <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon />, <SpellLink id={SPELLS.BLADE_OF_JUSTICE.id} icon />, or <SpellLink id={SPELLS.DIVINE_STORM.id} icon /> if out of melee range for extended periods.</React.Fragment>,
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
  		description:<React.Fragment>Spells with short cooldowns like <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon />, <SpellLink id={SPELLS.BLADE_OF_JUSTICE.id} icon />, and <SpellLink id={SPELLS.CRUSADER_STRIKE.id} icon /> should be used as often as possible.</React.Fragment>,
  		requirements: () => {
  			const combatant = this.combatants.selected;
  			return [
  				new GenericCastEfficiencyRequirement({
  					spell: SPELLS.ZEAL_TALENT,
  					when: combatant.hasTalent(SPELLS.ZEAL_TALENT.id),
  				}),
  				new GenericCastEfficiencyRequirement({
  					spell: SPELLS.CRUSADER_STRIKE,
  					when: !combatant.hasTalent(SPELLS.ZEAL_TALENT.id),
  				}),
  				new GenericCastEfficiencyRequirement({
  					spell: SPELLS.JUDGMENT_CAST,
            onlyWithSuggestion: false,
  				}),
  				new GenericCastEfficiencyRequirement({
  					spell: SPELLS.BLADE_OF_JUSTICE,
  					when: !combatant.hasTalent(SPELLS.DIVINE_HAMMER_TALENT.id),
  				}),
  				new GenericCastEfficiencyRequirement({
  					spell: SPELLS.DIVINE_HAMMER_TALENT,
  					when: combatant.hasTalent(SPELLS.DIVINE_HAMMER_TALENT.id),
  				}),
  			];
  		},
  	}),
  	new Rule({
  		name: 'Use your cooldowns',
  		description: <React.Fragment>Retribution Paladin is a very cooldown dependant spec. Make sure you are keeping <SpellLink id={SPELLS.CRUSADE_TALENT.id} icon /> and <SpellLink id={SPELLS.WAKE_OF_ASHES.id} /> on cooldown.</React.Fragment>,
  		requirements: () => {
  			const combatant = this.combatants.selected;
  			return [
  				new GenericCastEfficiencyRequirement({
  					spell: SPELLS.CRUSADE_TALENT,
  					when: combatant.hasTalent(SPELLS.CRUSADE_TALENT.id),
  				}),
          new Requirement({
            name: <React.Fragment>Good first global with <SpellLink id={SPELLS.CRUSADE_TALENT.id} icon /> buff</React.Fragment>,
            check: () => this.crusade.suggestionThresholds,
            when: this.crusade.active,
          }),
  				new GenericCastEfficiencyRequirement({
  					spell: SPELLS.AVENGING_WRATH,
  					when: !combatant.hasTalent(SPELLS.CRUSADE_TALENT.id),
  				}),
  				new GenericCastEfficiencyRequirement({
  					spell: SPELLS.HOLY_WRATH_TALENT,
  					when: combatant.hasTalent(SPELLS.HOLY_WRATH_TALENT.id),
  				}),
  				new GenericCastEfficiencyRequirement({
  					spell: SPELLS.WAKE_OF_ASHES,
            onlyWithSuggestion: false,
  				}),
  			];
  		},
  	}),
  	new Rule({
  		name: 'Use your resources efficently',
  		description: <React.Fragment>Holy Power is your main resource and it's very important not to let it cap. You should also only be spending Holy Power inside of the <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> debuff window.</React.Fragment>,
  		requirements: () => {
  			return [
  				new Requirement({
  					name: 'Holy Power efficiency',
  					check: () => this.holyPowerDetails.suggestionThresholds,
  				}),
  				new Requirement({
  					name: <React.Fragment>Holy power spent with <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /></React.Fragment>,
  					check: () => this.judgment.suggestionThresholds,
  				}),
  				new Requirement({
  					name: <React.Fragment><SpellLink id={SPELLS.BLADE_OF_WRATH_TALENT.id} icon /> procs consumed</React.Fragment>,
  					check: () => this.boWProcTracker.suggestionThresholds,
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
          new Requirement({
            name: <React.Fragment> <SpellLink id={SPELLS.BLESSING_OF_THE_ASHBRINGER_BUFF.id} icon /> uptime</React.Fragment>,
            check: () => this.bota.suggestionThresholds,
          }),
        ];
      },
    }),
    new PreparationRule(),
	];
}

export default Checklist;
