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
      name: 'Dire Beast Efficiency',
      description: <Wrapper>USE DireBeast properly</Wrapper>,
      requirements: () => {
        return [
        new Requirement({

        })
        ];
      },
    }),
    new Rule({
      name: 'Downtime',
      description: <Wrapper> Try to reduce the delay between casting spells. If everything is on cooldown, try and use <SpellLink id={SPELLS.COBRA_SHOT.id} /> to stay off the focus cap and do some damage.</Wrapper>,
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
