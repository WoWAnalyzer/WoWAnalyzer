import React from 'react';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

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
import AlwaysBeCasting from './AlwaysBeCasting';

import Shield_Block from '../Spells/ShieldBlock';
import IgnorePain from './IgnorePain';
import RageDetails from '../Core/RageDetails';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    legendaryCountChecker: LegendaryCountChecker,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    prePotion: PrePotion,
    alwaysBeCasting: AlwaysBeCasting,
    enchantChecker: EnchantChecker,

    shieldBlock: Shield_Block,
    ignorePain: IgnorePain,
    rageDetails: RageDetails,
  };

  rules = [
    new Rule({
      name: 'Let the rage flow',
      description: 'These should generally always be on cooldown to maximize rage generation while avoiding overcapping.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SHIELD_SLAM,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.THUNDER_CLAP,
          }),
          new Requirement({
            name: 'Rage efficiency',
            check: () => this.rageDetails.efficiencySuggestionThresholds,
          }),
        ];
      },
    }),

    new Rule({
      name: (
        <React.Fragment>
          Mitigate incoming damage with <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> and <SpellLink id={SPELLS.IGNORE_PAIN.id} />
        </React.Fragment>
      ),
      description: (
        <React.Fragment>
          Blocking incoming damage is our main mitigation tool.
          Maintain <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> as much as possible while tanking or dealing with mechanics that are blockable.
          Avoid casting <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> while not tanking actively to refill your charges. Spend your excess rage with <SpellLink id={SPELLS.IGNORE_PAIN.id} /> to smooth out damage, especially damage that's not blockable.
        </React.Fragment>
      ),
      requirements: () => {
        return [
          new Requirement({
            name: 'Hits mitigated with Shield Block up',
            check: () => this.shieldBlock.suggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.IGNORE_PAIN.id}/> Uptime</React.Fragment>,
            check: () => this.ignorePain.uptimeSuggestionThresholds,
          }),
        ];
      },  
    }),

    new Rule({
      name: 'Use your offensive cooldowns',
      description: 'You should aim to use these cooldowns as often as you can to maximize your damage output unless you are saving them for their defensive value.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BATTLE_CRY,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DEMORALIZING_SHOUT,
            when: this.combatants.selected.hasTalent(SPELLS.BOOMING_VOICE_TALENT.id),
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Use your defensive cooldowns',
      description: 'Use these to block damage spikes and keep damage smooth to reduce external healing required.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DEMORALIZING_SHOUT,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.LAST_STAND,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SHIELD_WALL,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SPELL_REFLECTION,
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),

    new PreparationRule(),
  ]
}

export default Checklist;
