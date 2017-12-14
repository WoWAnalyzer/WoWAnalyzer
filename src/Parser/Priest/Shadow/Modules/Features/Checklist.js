import React from 'react';

import SPELLS from 'common/SPELLS';
// import ITEMS from 'common/ITEMS';

import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
// import ItemLink from 'common/ItemLink';

import CoreChecklist, { Rule, Requirement, GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
// import ManaValues from 'Parser/Core/Modules/ManaValues';
// import Velens from 'Parser/Core/Modules/Items/Velens';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';

import VoidTorrent from '../Spells/VoidTorrent';


class Checklist extends CoreChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,

    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    voidTorrent: VoidTorrent,
  };

  rules = [
    new Rule({
      name: 'Use core spells as often as possible',
      description: <Wrapper>Spells such as <SpellLink id={SPELLS.VOID_BOLT.id} icon />, <SpellLink id={SPELLS.MIND_BLAST.id} icon /> and <SpellLink id={SPELLS.VOID_TORRENT.id} icon /> are your most important spells. Try to cast them as much as possible.</Wrapper>,
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.VOID_BOLT,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.MIND_BLAST,
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper>Maximize <SpellLink id={SPELLS.VOID_TORRENT.id} icon />s</Wrapper>,
      description: <Wrapper>
          <SpellLink id={SPELLS.VOID_TORRENT.id} icon /> has a big impact on your overall damage.
          Every channeled time extends your voidforms by atleast the same amount, increasing your overall haste, voidform uptime and the damage of <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} icon /> and <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} icon />.
          Try to use one <SpellLink id={SPELLS.VOID_TORRENT.id} icon /> in each <SpellLink id={SPELLS.VOIDFORM.id} icon /> and plan ahead to avoid interrupting it.
      </Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Channeling time lost',
            check: () => this.voidTorrent.suggestionThresholds,
          }),
          new GenericCastEfficiencyRequirement({
            name: 'Time on cooldown',
            spell: SPELLS.VOID_TORRENT,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Be well prepared',
      description: 'Being well prepared with potions, enchants and legendaries is an easy way to improve your performance.',
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
        ];
      },
    }),

  ];
}

export default Checklist;
