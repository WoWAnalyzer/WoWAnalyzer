import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
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
import BotA from '../PaladinCore/BlessingOfTheAshbringer';

class Checklist extends CoreChecklist {
	static dependencies = {
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
	    whisper: Whisper,
        bota: BotA,
	};

	rules = [
    new Rule({
    	name: 'Always be casting',
   		description: <Wrapper>You should try to avoid doing nothing during the fight. If you have to move, use your <SpellLink id={SPELLS.DIVINE_STEED.id} icon/> to minimize downtime. Also use ranged abilities like <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon/>, <SpellLink id={SPELLS.BLADE_OF_JUSTICE.id} icon/>, or <SpellLink id={SPELLS.DIVINE_STORM.id} icon/> if out of melee range for extended periods.</Wrapper>,
    		requirements: () => {
      		return [
        			new Requirement({
          			name: 'Downtime',
          			check: () => this.alwaysBeCasting.suggestionThresholds,
        			}),
      		];
    		},
  	}),
  	new PreparationRule(),
  	new Rule({
  		name: 'Use core abilities as often as possible',
  		description:<Wrapper>Spells with short cooldowns like <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon/>, <SpellLink id={SPELLS.BLADE_OF_JUSTICE.id} icon/>, and <SpellLink id={SPELLS.CRUSADER_STRIKE.id} icon/> should be used as often as possible.</Wrapper>,
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
  		description: <Wrapper>Retribution Paladin is a very cooldown dependant spec. Make sure you are keeping <SpellLink id={SPELLS.CRUSADE_TALENT.id} icon/> and <SpellLink id={SPELLS.WAKE_OF_ASHES.id} icon /> on cooldown.</Wrapper>,
  		requirements: () => {
  			const combatant = this.combatants.selected;
  			return [
  				new GenericCastEfficiencyRequirement({
  					spell: SPELLS.CRUSADE_TALENT,
  					when: combatant.hasTalent(SPELLS.CRUSADE_TALENT.id),
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
  					name: <ItemLink id={ITEMS.LIADRINS_FURY_UNLEASHED.id} icon/>,
  					check: () => this.liadrins.suggestionThresholds,
  					when: this.liadrins.active,
  				}),
  				new Requirement({
  					name: <ItemLink id={ITEMS.WHISPER_OF_THE_NATHREZIM.id} icon/>,
  					check: () => this.whisper.suggestionThresholds,
  					when: this.whisper.active,
  				}),
  			];
  		},
  	}),
  	new Rule({
  		name: 'Use your resources efficently',
  		description: <Wrapper>Holy Power is your main resource and it's very important not to let it cap. You should also only be spending Holy Power inside of the <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon/> debuff window.</Wrapper>,
  		requirements: () => {
  			return [
  				new Requirement({
  					name: 'Wasted Holy Power',
  					check: () => this.holyPowerDetails.suggestionThresholds,
  				}),
  				new Requirement({
  					name: 'Holy power spent without Judgment',
  					check: () => this.judgment.suggestionThresholds,
  				}),
  				new Requirement({
  					name: 'Wasted Blade of Wrath procs',
  					check: () => this.boWProcTracker.suggestionThresholds,
  				}),
  			];
  		},
  	}),
  	new Rule({
      name: 'Use your utility and defensive spells',
      description: <Wrapper>Use other spells in your toolkit to your advantage. For example, you can use <SpellLink id={SPELLS.SHIELD_OF_VENGEANCE.id} icon/> to mitigate some damage and <SpellLink id={SPELLS.LAY_ON_HANDS.id} icon/> to save your own or someone elses life.</Wrapper>,
      requirements: () => {
        return [
	        new GenericCastEfficiencyRequirement({
	          spell: SPELLS.SHIELD_OF_VENGEANCE,
	        }),
	        new Requirement({
				  	name: <Wrapper> <SpellLink id={SPELLS.LAY_ON_HANDS.id} icon/> </Wrapper>,
						check: () => ({
							actual: this.abilityTracker.getAbility(SPELLS.LAY_ON_HANDS.id).casts,
							isLessThan:
	            {
	              major: 0,
	              average: 1,
	              minor: 1,
	            },
							style: 'number',
						}),
					}),
          new Requirement({
            name: <Wrapper> <SpellLink id={SPELLS.BLESSING_OF_THE_ASHBRINGER_BUFF.id} icon/> </Wrapper>,
            check: () => this.bota.suggestionThresholds,
          }),
        ];
      },
    }),
	];
}

export default Checklist;