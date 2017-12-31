import React from 'react';

import SPELLS from 'common/SPELLS';
//import ITEMS from 'common/ITEMS';

import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

import BoneShieldUptime from './BoneShieldUptime';
import OssuaryUptime from './OssuaryUptime';
import BloodPlagueUptime from './BloodPlagueUptime';
import AlwaysBeCasting from './AlwaysBeCasting';
import RunicPowerDetails from '../RunicPower/RunicPowerDetails';

class Checklist extends CoreChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    legendaryCountChecker: LegendaryCountChecker,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    prePotion: PrePotion,
    bloodplagueUptime: BloodPlagueUptime,
    alwaysBeCasting: AlwaysBeCasting,
    enchantChecker: EnchantChecker,
    runicPowerDetails: RunicPowerDetails,
    boneShieldUptime: BoneShieldUptime,
    ossuaryUptime: OssuaryUptime,
  };

  rules = [
    new Rule({
      name: 'Use core spells as often as possible',
      description: 'Spells that are part of your main rotation.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BLOOD_BOIL,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CONSUMPTION,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use these cooldowns as often as possible',
      description: 'You should aim to use your cooldowns as often as you can to maximize your damage output',
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DANCING_RUNE_WEAPON,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BLOOD_MIRROR_TALENT,
            when: combatant.hasTalent(SPELLS.BLOOD_MIRROR_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BLOODDRINKER_TALENT,
            when: combatant.hasTalent(SPELLS.BLOODDRINKER_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Maintain Buffs/DeBuffs',
      description: 'Keep these up for their benifits.',
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.BLOOD_PLAGUE.id}/> Uptime</Wrapper>,
            check: () => this.bloodplagueUptime.uptimeSuggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.BONE_SHIELD.id}/> Uptime</Wrapper>,
            check: () => this.boneShieldUptime.uptimeSuggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.OSSUARY.id}/> Uptime</Wrapper>,
            check: () => this.ossuaryUptime.uptimeSuggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Try to avoid being inactive for a large portion of the fight',
      description: <Wrapper>While some downtime is inevitable in fights with movement, you should aim to reduce downtime to prevent capping Runes.  You can reduce downtime by casting ranged/filler abilities like <SpellLink id={SPELLS.BLOODDRINKER_TALENT.id}/> or <SpellLink id={SPELLS.BLOOD_BOIL.id}/></Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Downtime',
            check: () => this.alwaysBeCasting.downtimeSuggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Avoid capping Runic Power',
      description: 'Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities.  Try to spend Runic Power before reaching the maximum amount to avoid wasting resources',
      requirements: () => {
        return [
          new Requirement({
            name: 'Runic Power Efficiency',
            check: () => this.runicPowerDetails.efficiencySuggestionThresholds,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ]
}

export default Checklist;
