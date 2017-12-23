import React from 'react';

import CoreChecklist, { Rule, Requirement, GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import AlwaysBeCasting from 'Parser/Hunter/BeastMastery/Modules/Features/AlwaysBeCasting';
import AMurderOfCrows from 'Parser/Hunter/BeastMastery/Modules/Talents/AMurderOfCrows';
import SpellLink from 'common/SpellLink';
import Icon from "common/Icon";
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
import DireBeast from 'Parser/Hunter/BeastMastery/Modules/Spells/DireBeast/DireBeast';
import BestialWrathAverageFocus from 'Parser/Hunter/BeastMastery/Modules/Spells/BestialWrath/BestialWrathAverageFocus';

class Checklist extends CoreChecklist {
  static dependencies = {
    combatants: Combatants,

    //general
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,

    //features:
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    enchantChecker: EnchantChecker,

    //talents
    aMurderOfCrows: AMurderOfCrows,

    //Bestial Wrath

    //Dire Beast
    direBeast: DireBeast,
    bestialWrathAverageFocus: BestialWrathAverageFocus,

  };

  rules = [
    new Rule({
      name: 'Use core spells as often as possible',
      description: <Wrapper><a href="https://www.icy-veins.com/wow/beast-mastery-hunter-pve-dps-rotation-cooldowns-abilities" target="_blank" rel="noopener noreferrer">More info.</a></Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DIRE_BEAST,
            when: !combatant.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DIRE_FRENZY_TALENT,
            when: combatant.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TITANS_THUNDER,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BESTIAL_WRATH,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.KILL_COMMAND,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ASPECT_OF_THE_WILD,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BARRAGE_TALENT,
            when: combatant.hasTalent(SPELLS.BARRAGE_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper><SpellLink id={SPELLS.DIRE_BEAST.id} icon /> efficiency </Wrapper>,
      description: <Wrapper>Use <SpellLink id={SPELLS.DIRE_BEAST.id} icon /> properly</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>Bad <SpellLink id={SPELLS.DIRE_BEAST.id} icon /> casts</Wrapper>,
            check: () => this.direBeast.badDireBeastThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper><SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> efficiency </Wrapper>,
      description: <Wrapper> Use <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> properly </Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>Average focus on <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> cast</Wrapper>,
            check: () => this.bestialWrathAverageFocus.focusOnBestialWrathCastThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper><Icon
        icon='spell_mage_altertime'
        alt='Casting downtime'
        style={{
          height: '1.3em',
          marginTop: '-.1em',
        }}
      /> Downtime</Wrapper>,
      description: <Wrapper> Try to reduce the delay between casting spells. If everything is on cooldown, try and use <SpellLink id={SPELLS.COBRA_SHOT.id} icon /> to stay off the focus cap and do some damage.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper><Icon
              icon='spell_mage_altertime'
              alt='Casting downtime'
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            /> Downtime</Wrapper>,
            check: () => this.alwaysBeCasting.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Be well prepared',
      description: 'Being prepared is important if you want to perform to your highest potential',
      // For this rule it wouldn't make sense for the bar to be completely green when just 1 of the requirements failed, showing the average instead of median takes care of that properly.
      performanceMethod: 'average',
      requirements: () => {
        return [
          new Requirement({
            name: 'All legendaries upgraded to max item level',
            check: () => ({
              actual: this.legendaryUpgradeChecker.upgradedLegendaries.length,
              isLessThan: this.legendaryCountChecker.max,
              style: 'number',
            }),
          }),
          new Requirement({
            name: 'Used max possible legendaries',
            check: () => ({
              actual: this.legendaryCountChecker.equipped,
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

  ];

}

export default Checklist;
