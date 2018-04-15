import React from 'react';

import SPELLS from 'common/SPELLS';
// import ITEMS from 'common/ITEMS';

import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
// import ItemLink from 'common/ItemLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';

// general:
import Combatants from 'Parser/Core/Modules/Combatants';
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
import VoidTorrent from '../Spells/VoidTorrent';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    combatants: Combatants,

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
    voidTorrent: VoidTorrent,

  };

  rules = [
      new Rule({
        name: <Wrapper>Maximize <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> & <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> uptime</Wrapper>,
        description: <Wrapper>
            Both <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> and <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> duration extends when the target or a nearby target gets hit by <SpellLink id={SPELLS.VOID_BOLT.id} />.
            Due to this, you often only need to apply these spells to new targets and refresh them on targets that are too far away from your primary target.
        </Wrapper>,
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
        name: <Wrapper>Minimize casting downtime</Wrapper>,
        description: <Wrapper>
            Try to minimize your time not casting. Use your core spells on cooldown and fillers when they are not available. If you know you have an upcoming position requirement, stutterstep with each <SpellLink id={SPELLS.VOID_BOLT.id} /> cast towards that location. During high movement you can use <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> as a filler.
        </Wrapper>,
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
      description: <Wrapper>Spells such as <SpellLink id={SPELLS.VOID_BOLT.id} />, <SpellLink id={SPELLS.MIND_BLAST.id} /> are your most important spells. Try to cast them as much as possible.</Wrapper>,
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
        ];
      },
    }),
    new Rule({
      name: <Wrapper>Maximize <SpellLink id={SPELLS.VOIDFORM.id} /> stacks</Wrapper>,
      description: <Wrapper>
          Your Voidforms are an important part of your overall damage.
          Try to get over 50 stacks every Voidform with proper <SpellLink id={SPELLS.VOID_TORRENT.id} /> and <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> usage.
          Use Void torrent early on and Mindbender around 30 Voidform stacks.

      </Wrapper>,
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
      name: <Wrapper>Maximize <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> effectiveness</Wrapper>,
      description: <Wrapper>
          Mindbender has a big impact on your <SpellLink id={SPELLS.VOIDFORM.id} /> durations.
          Try to use Mindbender a few seconds before you are about to drop out from the Voidform, normally around 25 stacks. Never use Mindbender outside of Voidform.
          <br />Using Mindbender too early shortens your Voidform and might thus greatly affect the next voidforms (by still having it on cooldown).
      </Wrapper>,
      requirements: () => {
        return this.mindbender.mindbenders.map((mindbender, index) => {
            return (
                new Requirement({
                  name: `Mindbender #${index + 1} used at # stacks`,
                  check: () => this.mindbender.suggestionStackThresholds(mindbender),
                })
            );
        });
      },
    }),
    new Rule({
      name: <Wrapper>Maximize <SpellLink id={SPELLS.VOID_TORRENT.id} /> effectiveness</Wrapper>,
      description: <Wrapper>
          Void Torrent has a big impact on your overall damage.
          Void Torrent delays insanity drain, effectively extending Voidform by at least the channeled duration increasing your overall haste, Voidform uptime and the damage of <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> and <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} />.
          Try to use one Void Torrent in each <SpellLink id={SPELLS.VOIDFORM.id} /> and plan ahead to avoid interrupting it.
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
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
