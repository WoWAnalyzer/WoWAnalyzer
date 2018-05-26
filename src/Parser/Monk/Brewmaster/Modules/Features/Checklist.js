import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import Combatants from 'Parser/Core/Modules/Combatants';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import IronSkinBrew from '../Spells/IronSkinBrew';
import BrewCDR from '../Core/BrewCDR';
import BreathOfFire from '../Spells/BreathOfFire';
import TigerPalm from '../Spells/TigerPalm';
import RushingJadeWind from '../Spells/RushingJadeWind';
import BlackoutCombo from '../Spells/BlackoutCombo';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    bof: BreathOfFire,
    isb: IronSkinBrew,
    brewcdr: BrewCDR,
    combatants: Combatants,
    tp: TigerPalm,
    rjw: RushingJadeWind,
    boc: BlackoutCombo,
  };

  rules = [
    new Rule({
      name: (
        <React.Fragment>
          Mitigate damage with <SpellLink id={SPELLS.IRONSKIN_BREW.id} />.
        </React.Fragment>
      ),
      description: (
        <React.Fragment>
          <SpellLink id={SPELLS.STAGGER.id} /> is our main damage mitigation tool. <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> increases the amount of damage that we can mitigate with Stagger while active. It is possible to maintain 100% uptime without reaching any particular haste threshold due to the cooldown reduction applied by <SpellLink id={SPELLS.KEG_SMASH.id} /> and <SpellLink id={SPELLS.TIGER_PALM.id} />. If you are having difficulty maintaining your buff you may need to improve your cast efficiency or reduce the amount of purification you are doing.
        </React.Fragment>
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
        <React.Fragment>
          Mitigate damage with <SpellLink id={SPELLS.BREATH_OF_FIRE.id} />.
        </React.Fragment>
      ),
      description: (
        <React.Fragment>
          <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> provides a 4-7% damage reduction through the <SpellLink id={SPELLS.HOT_BLOODED.id} /> trait. It is possible to maintain 100% uptime on this debuff both with and without <ItemLink id={ITEMS.SALSALABIMS_LOST_TUNIC.id} />.
        </React.Fragment>
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
        <React.Fragment>
          <p>The cooldown of all brews is reduced by your key rotational abilities: <SpellLink id={SPELLS.KEG_SMASH.id} /> and <SpellLink id={SPELLS.TIGER_PALM.id} />. Maintaining a proper rotation will help ensure you have enough brews available to maintain <SpellLink id={SPELLS.IRONSKIN_BREW.id} />.</p>

          <p>Note that <SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} /> is far and away the best talent for brew generation. It should <em>always</em> be taken. Unless specific fight mechanics require using 3+ brews in rapid succession, use it as close to on cooldown as possible without wasting brew charges.</p>
        </React.Fragment>
      ),
      performanceMethod: 'first',
      requirements: () => {
        return [
          new Requirement({
            name: 'Effective CDR from your rotation', 
            check: () => this.brewcdr.suggestionThreshold,
          }),
          new Requirement({
            name: <React.Fragment>Take the <SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} /> Talent</React.Fragment>,
            check: () => {
              return {
                actual: this.combatants.selected.hasTalent(SPELLS.BLACK_OX_BREW_TALENT.id),
                isEqual: false,
                style: 'boolean',
              };
            },
          }),
          new GenericCastEfficiencyRequirement({
            name: <React.Fragment><SpellLink id={SPELLS.KEG_SMASH.id} /> Cast Efficiency</React.Fragment>,
            spell: SPELLS.KEG_SMASH,
          }),
          new GenericCastEfficiencyRequirement({
            name: <React.Fragment><SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} /> Cast Efficiency</React.Fragment>,
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
        <React.Fragment>
          While the <em>primary</em> role of a tank is to get hit in the face a bunch and not die in the process, once that is under control we get to spend some energy dealing damage! Maintaining a <a href="http://www.peakofserenity.com/brewmaster/improving-brewmaster-dps/">correct DPS rotation</a> also provides optimal brew generation. <strong>However, if you are dying, ignore this checklist item!</strong> As much as we may enjoy padding for those sweet orange parses, not-wiping takes precedence.
        </React.Fragment>
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
          name: <React.Fragment><SpellLink id={SPELLS.BLACKOUT_COMBO_TALENT.id} />-empowered <SpellLink id={SPELLS.TIGER_PALM.id} >Tiger Palms</SpellLink></React.Fragment>,
          check: () => boc,
          when: () => !!boc,
        }));
        reqs.push(new Requirement({
          name: <React.Fragment><SpellLink id={SPELLS.BLACKOUT_COMBO_TALENT.id}>Blackout Combos</SpellLink> spent on <SpellLink id={SPELLS.TIGER_PALM.id} /></React.Fragment>,
          check: () => this.boc.dpsWasteThreshold,
          when: () => !!boc,
        }));

        reqs.push(new Requirement({
          name: <React.Fragment><SpellLink id={SPELLS.RUSHING_JADE_WIND.id} /> uptime</React.Fragment>,
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
