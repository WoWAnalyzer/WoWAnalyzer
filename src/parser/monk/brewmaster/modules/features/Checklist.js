import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import CoreChecklist, { Rule, Requirement } from 'parser/core/modules/features/Checklist';
import Abilities from 'parser/core/modules/Abilities';
import { GenericCastEfficiencyRequirement } from 'parser/core/modules/features/Checklist/Requirements';
import CastEfficiency from 'parser/core/modules/CastEfficiency';
import IronSkinBrew from '../spells/IronSkinBrew';
import BrewCDR from '../core/BrewCDR';
import BreathOfFire from '../spells/BreathOfFire';
import TigerPalm from '../spells/TigerPalm';
import RushingJadeWind from '../spells/RushingJadeWind';
import BlackoutCombo from '../spells/BlackoutCombo';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    bof: BreathOfFire,
    isb: IronSkinBrew,
    brewcdr: BrewCDR,
    tp: TigerPalm,
    rjw: RushingJadeWind,
    boc: BlackoutCombo,
  };

  rules = [
    new Rule({
      name: (
        <>
          Mitigate damage with <SpellLink id={SPELLS.IRONSKIN_BREW.id} />.
        </>
      ),
      description: (
        <>
          <SpellLink id={SPELLS.STAGGER.id} /> is our main damage mitigation tool. <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> increases the amount of damage that we can mitigate with Stagger while active. It is possible to maintain 100% uptime without reaching any particular haste threshold due to the cooldown reduction applied by <SpellLink id={SPELLS.KEG_SMASH.id} /> and <SpellLink id={SPELLS.TIGER_PALM.id} />. If you are having difficulty maintaining your buff you may need to improve your cast efficiency or reduce the amount of purification you are doing.
        </>
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
        <>
          Mitigate damage with <SpellLink id={SPELLS.BREATH_OF_FIRE.id} />.
        </>
      ),
      description: (
        <>
          <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> provides a 5% damage reduction. It is possible to maintain 80% uptime on this debuff without any particular gear or talents by simply using it on cooldown.
        </>
      ),
      requirements: () => {
        return [
          new Requirement({
            name: 'Hits mitigated by Breath of Fire',
            check: () => this.bof.suggestionThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Generate enough brews through your rotation',
      description: (
        <>
          <p>The cooldown of all brews is reduced by your key rotational abilities: <SpellLink id={SPELLS.KEG_SMASH.id} /> and <SpellLink id={SPELLS.TIGER_PALM.id} />. Maintaining a proper rotation will help ensure you have enough brews available to maintain <SpellLink id={SPELLS.IRONSKIN_BREW.id} />.</p>

          <p>Note that <SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} /> is <em>almost always</em> the best talent for brew generation in a raiding environment. Unless specific fight mechanics require using 3+ brews in rapid succession, use it as close to on cooldown as possible without wasting brew charges. If you are using <SpellLink id={SPELLS.LIGHT_BREWING_TALENT.id} /> and seeing low brew CDR, consider switching talents.</p>
        </>
      ),
      performanceMethod: 'first',
      requirements: () => {
        return [
          new Requirement({
            name: 'Effective CDR from your rotation', 
            check: () => this.brewcdr.suggestionThreshold,
          }),
          new GenericCastEfficiencyRequirement({
            name: <><SpellLink id={SPELLS.KEG_SMASH.id} /> Cast Efficiency</>,
            spell: SPELLS.KEG_SMASH,
          }),
          new GenericCastEfficiencyRequirement({
            name: <><SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} /> Cast Efficiency</>,
            spell: SPELLS.BLACK_OX_BREW_TALENT,
            onlyWithSuggestion: false,
          }),
          new Requirement({
            name: <dfn data-tip="Ironskin Brew has a <em>cap</em> on total buff duration of three times the base duration. Casting Ironskin Brew with more time remaining than twice the base duration (normally 16 seconds) wastes part of the brew."><SpellLink id={SPELLS.IRONSKIN_BREW.id} /> duration lost due to clipping</dfn>,
            check: () => this.isb.clipSuggestionThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Top the DPS Charts',
      description: (
        <>
          While the <em>primary</em> role of a tank is to get hit in the face a bunch and not die in the process, once that is under control we get to spend some energy dealing damage! Maintaining a <a href="http://www.peakofserenity.com/brewmaster/improving-brewmaster-dps/">correct DPS rotation</a> also provides optimal brew generation. <strong>However, if you are dying, ignore this checklist item!</strong> As much as we may enjoy padding for those sweet orange parses, not-wiping takes precedence.
        </>
      ),
      requirements: () => {
        const reqs = [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.KEG_SMASH,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BLACKOUT_STRIKE,
            onlyWithSuggestion: false,
          }),
        ];

        const boc = this.tp.bocEmpoweredThreshold;
        reqs.push(new Requirement({
          name: <><SpellLink id={SPELLS.BLACKOUT_COMBO_TALENT.id} />-empowered <SpellLink id={SPELLS.TIGER_PALM.id} >Tiger Palms</SpellLink></>,
          check: () => boc,
          when: () => !!boc,
        }));
        reqs.push(new Requirement({
          name: <><SpellLink id={SPELLS.BLACKOUT_COMBO_TALENT.id}>Blackout Combos</SpellLink> spent on <SpellLink id={SPELLS.TIGER_PALM.id} /></>,
          check: () => this.boc.dpsWasteThreshold,
          when: () => !!boc,
        }));

        reqs.push(new Requirement({
          name: <><SpellLink id={SPELLS.RUSHING_JADE_WIND.id} /> uptime</>,
          check: () => this.rjw.uptimeThreshold,
          when: () => !!this.rjw.uptimeThreshold,
        }));

        reqs.push(new GenericCastEfficiencyRequirement({ 
          spell: SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT,
        }));

        return reqs;
      },
    }),
  ];
}

export default Checklist;
