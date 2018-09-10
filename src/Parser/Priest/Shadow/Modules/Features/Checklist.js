import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreChecklist, { Requirement, Rule } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
// general:
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
// features:
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import AlwaysBeCasting from '../Features/AlwaysBeCasting';
// spells:
import Mindbender from '../Spells/Mindbender';
import ShadowWordPain from '../Spells/ShadowWordPain';
import VampiricTouch from '../Spells/VampiricTouch';
import Voidform from '../Spells/Voidform';
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
      name: <React.Fragment>Maximize <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> & <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> uptime</React.Fragment>,
      description: (
        <React.Fragment>
          Both <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> and <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> duration extends when the target or a nearby target gets hit by <SpellLink id={SPELLS.VOID_BOLT.id} />.
          Due to this, you often only need to apply these spells to new targets and refresh them on targets that are too far away from your primary target.
        </React.Fragment>
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
      name: <React.Fragment>Minimize casting downtime</React.Fragment>,
      description: (
        <React.Fragment>
          Try to minimize your time not casting. Use your core spells on cooldown and fillers when they are not available. If you know you have an upcoming position requirement, stutterstep with each <SpellLink id={SPELLS.VOID_BOLT.id} /> cast towards that location. During high movement you can use <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> as a filler.
        </React.Fragment>
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
      description: <React.Fragment>Spells such as <SpellLink id={SPELLS.VOID_BOLT.id} />, <SpellLink id={SPELLS.MIND_BLAST.id} />, or <SpellLink id={SPELLS.SHADOW_WORD_VOID_TALENT.id} /> are your most important spells. Try to cast them as much as possible.</React.Fragment>,
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
      name: <React.Fragment>Maximize <SpellLink id={SPELLS.VOIDFORM.id} /> stacks</React.Fragment>,
      description: (
        <React.Fragment>
          Your Voidforms are an important part of your overall damage.
          Try to get at least 20 stacks every Voidform with proper <SpellLink id={SPELLS.VOID_BOLT.id} /> and <SpellLink id={SPELLS.MIND_BLAST.id} /> usage.
          Use <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> on cooldown (even outside of Voidform).
        </React.Fragment>
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
      description: <React.Fragment>You should use <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> on cooldown.</React.Fragment>,
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
