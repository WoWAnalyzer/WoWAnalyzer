import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreChecklist, { Requirement, Rule } from 'parser/core/modules/features/Checklist';
import Abilities from 'parser/core/modules/Abilities';
import { PreparationRule } from 'parser/core/modules/features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'parser/core/modules/features/Checklist/Requirements';
// general:
import PrePotion from 'parser/core/modules/items/PrePotion';
import EnchantChecker from 'parser/core/modules/items/EnchantChecker';
// features:
import CastEfficiency from 'parser/core/modules/CastEfficiency';
import AlwaysBeCasting from './/AlwaysBeCasting';
// spells:
import Mindbender from '../spells/Mindbender';
import ShadowWordPain from '../spells/ShadowWordPain';
import VampiricTouch from '../spells/VampiricTouch';
import Voidform from '../spells/Voidform';
// import ITEMS from 'common/ITEMS';
// import ItemLink from 'common/ItemLink';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    // general:
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,

    // features:
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,

    // spells:
    mindbender: Mindbender,
    shadowWordPain: ShadowWordPain,
    vampiricTouch: VampiricTouch,
    voidform: Voidform,
  };

  rules = [
    new Rule({
      name: <>Maximize <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> & <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> uptime</>,
      description: (
        <>
          Both <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> and <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> duration extends when the target or a nearby target gets hit by <SpellLink id={SPELLS.VOID_BOLT.id} />.
          Due to this, you often only need to apply these spells to new targets and refresh them on targets that are too far away from your primary target.
        </>
      ),
      requirements: () => {
        return [
          new Requirement({
            name: `Shadow word: Pain uptime`,
            check: () => this.shadowWordPain.suggestionThresholds,
          }),
          new Requirement({
            name: `Vampiric Touch uptime`,
            check: () => this.vampiricTouch.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: <>Minimize casting downtime</>,
      description: (
        <>
          Try to minimize your time not casting. Use your core spells on cooldown and fillers when they are not available. If you know you have an upcoming position requirement, stutterstep with each <SpellLink id={SPELLS.VOID_BOLT.id} /> cast towards that location. During high movement you can use <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> as a filler.
        </>
      ),
      requirements: () => {
        return [
          new Requirement({
            name: `Casting downtime`,
            check: () => this.alwaysBeCasting.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use core spells as often as possible',
      description: <>Spells such as <SpellLink id={SPELLS.VOID_BOLT.id} />, <SpellLink id={SPELLS.MIND_BLAST.id} />, or <SpellLink id={SPELLS.SHADOW_WORD_VOID_TALENT.id} /> are your most important spells. Try to cast them as much as possible.</>,
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.VOID_BOLT,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.MIND_BLAST,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SHADOW_WORD_VOID_TALENT,
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),
    new Rule({
      name: <>Maximize <SpellLink id={SPELLS.VOIDFORM.id} /> stacks</>,
      description: (
        <>
          Your Voidforms are an important part of your overall damage.
          Try to get at least 20 stacks every Voidform with proper <SpellLink id={SPELLS.VOID_BOLT.id} /> and <SpellLink id={SPELLS.MIND_BLAST.id} /> usage.
          Use <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> on cooldown (even outside of Voidform).
        </>
      ),
      performanceMethod: 'average',
      requirements: () => {
        return [
          new Requirement({
            name: 'Uptime',
            check: () => this.voidform.suggestionUptimeThresholds,
          }),
          ...this.voidform.voidforms.filter(voidform => !voidform.excluded).map((voidform, index) => {
            return (
              new Requirement({
                name: `Voidform #${index + 1} stacks`,
                check: () => this.voidform.suggestionStackThresholds(voidform),
              })
            );
          }),
        ];
      },
    }),
    this.mindbender.active && new Rule({
      name: 'Use Mindbender as often as possible',
      description: <>You should use <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> on cooldown.</>,
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.MINDBENDER_TALENT_SHADOW,
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
