import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';

import CoreChecklist, { Rule, Requirement, GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist';
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
	};

	rules = [
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
    	new Rule({
    		name: 'Use your cooldowns',
    		description: <Wrapper>Ret is a very cooldown dependant spec. Make sure you are keeping <SpellLink id={SPELLS.CRUSADE_TALENT.id} icon/> and <SpellLink id={SPELLS.WAKE_OF_ASHES.id} icon /> on cooldown.</Wrapper>,
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
    		name: 'Use your resources efficently',
    		description: <Wrapper>Holy Power is your main resource and it's very important not to let it cap. You should also only be spending Holy Power inside of the <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon/> debuff window.</Wrapper>,
    		requirements: () => {
    			return [
    				new Requirement({
    					name: 'Wasted Holy Power',
    					check: () => this.holyPowerDetails.suggestionThresholds,
    				}),
    				new Requirement({
    					name: 'Holy Power Spent with Judgment',
    					check: () => this.judgment.suggestionThresholds,
    				}),
    				new Requirement({
    					name: 'Wasted Blade of Wrath Procs',
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
						isGreaterThan: 1,
						style: 'number',
					}),
	    		}),
	        ];
	      },
	    }),
	];
}

export default Checklist;