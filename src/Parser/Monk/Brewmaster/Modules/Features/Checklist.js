import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

import CoreChecklist, { Rule, Requirement /*, GenericCastEfficiencyRequirement */ } from 'Parser/Core/Modules/Features/Checklist';
import IronSkinBrew from '../Spells/IronSkinBrew';
import BreathOfFire from '../Spells/BreathOfFire';

class Checklist extends CoreChecklist {
  static dependencies = {
    bof: BreathOfFire,
    isb: IronSkinBrew,
  };

  rules = [
    new Rule({
      name: (
        <Wrapper>
          Maintain 100% uptime on <SpellLink id={SPELLS.IRONSKIN_BREW.id} icon />.
        </Wrapper>
      ),
      description: (
        <Wrapper>
          <SpellLink id={SPELLS.STAGGER.id} /> is our main damage mitigation tool. <SpellLink id={SPELLS.IRONSKIN_BREW.id} icon /> increases the amount of damage that we can mitigate with Stagger while active. It is possible to maintain 100% uptime without reaching any particular haste threshold due to the cooldown reduction applied by <SpellLink id={SPELLS.KEG_SMASH.id} icon /> and <SpellLink id={SPELLS.TIGER_PALM.id} icon />. If you are having difficulty maintaining your buff, you may need to improve your cast efficiency or reduce the amount of purification you are doing.
        </Wrapper>
      ),
      requirements: () => {
        return [
          new Requirement({
            name: 'Hits mitigated with ISB',
            check: () => this.isb.uptimeSuggestionThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: (
        <Wrapper>
          Maintain 100% uptime on <SpellLink id={SPELLS.BREATH_OF_FIRE.id} icon />.
        </Wrapper>
      ),
      description: (
        <Wrapper>
          <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> provides a 4-7% damage reduction through the <SpellLink id={SPELLS.HOT_BLOODED.id} /> trait. It is possible to maintain 100% uptime on this debuff both with and without <ItemLink id={ITEMS.SALSALABIMS_LOST_TUNIC.id} />.
        </Wrapper>
      ),
      requirements: () => {
        return [
          new Requirement({
            name: 'Breath of Fire uptime',
            check: () => this.bof.suggestionThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: (
        <Wrapper>Avoid clipping the <SpellLink id={SPELLS.IRONSKIN_BREW.id} icon/> buff.</Wrapper>
      ),
      description: (
        <Wrapper>
          The duration of the <SpellLink id={SPELLS.IRONSKIN_BREW.id} icon /> buff is capped at 3 times the duration of the buff. Avoid casting ISB when you are near this cap, as doing so wastes much of the duration of the buff (called 'clipping' the buff). A WeakAura can help track this duration cap.

          If doing so will not cause the ISB buff to expire, spend excess brew charges on <SpellLink id={SPELLS.PURIFYING_BREW.id} icon /> to remove damage from the Stagger pool.
        </Wrapper>
      ),
      requirements: () => {
        return [
          new Requirement({
            name: 'ISB duration lost due to clipping',
            check: () => this.isb.clipSuggestionThreshold,
          }),
        ];
      },
    }),
  ];
}

export default Checklist;
