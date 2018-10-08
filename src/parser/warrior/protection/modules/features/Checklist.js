import React from 'react';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import CoreChecklist, { Rule, Requirement } from 'parser/shared/modules/features/Checklist';
import Abilities from 'parser/shared/modules/Abilities';
import { PreparationRule } from 'parser/shared/modules/features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'parser/shared/modules/features/Checklist/Requirements';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import PrePotion from 'parser/shared/modules/items/PrePotion';
import EnchantChecker from 'parser/shared/modules/items/EnchantChecker';
import AlwaysBeCasting from './AlwaysBeCasting';

import Shield_Block from '../spells/ShieldBlock';
import IgnorePain from './IgnorePain';
import RageDetails from '../core/RageDetails';

//Talents
import DragonRoar from '../talents/DragonRoar';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    prePotion: PrePotion,
    alwaysBeCasting: AlwaysBeCasting,
    enchantChecker: EnchantChecker,

    shieldBlock: Shield_Block,
    ignorePain: IgnorePain,
    rageDetails: RageDetails,
    dragonRoar: DragonRoar,
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
        <>
          Mitigate incoming damage with <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> and <SpellLink id={SPELLS.IGNORE_PAIN.id} />
        </>
      ),
      description: (
        <>
          Blocking incoming damage is our main mitigation tool.
          Maintain <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> as much as possible while tanking or dealing with mechanics that are blockable.
          Avoid casting <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> while not tanking actively to refill your charges. Spend your excess rage with <SpellLink id={SPELLS.IGNORE_PAIN.id} /> to smooth out damage, especially damage that's not blockable.
        </>
      ),
      requirements: () => {
        return [
          new Requirement({
            name: 'Hits mitigated with Shield Block up',
            check: () => this.shieldBlock.suggestionThresholds,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.IGNORE_PAIN.id} /> Uptime</>,
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
            spell: SPELLS.AVATAR_TALENT,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DEMORALIZING_SHOUT,
            when: this.selectedCombatant.hasTalent(SPELLS.BOOMING_VOICE_TALENT.id),
            onlyWithSuggestion: false,
          }),
          new Requirement({
            name: <>Possible <SpellLink id={SPELLS.DRAGON_ROAR_TALENT.id} /> hits</>,
            check: () => this.dragonRoar.hitSuggestionThreshold,
            when: this.selectedCombatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id),
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
