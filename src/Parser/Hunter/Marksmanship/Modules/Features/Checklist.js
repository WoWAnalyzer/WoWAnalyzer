import React from 'react';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import AlwaysBeCasting from 'Parser/Hunter/Marksmanship/Modules/Features/AlwaysBeCasting';
import AMurderOfCrows from 'Parser/Hunter/Marksmanship/Modules/Talents/AMurderOfCrows';
import Trueshot from 'Parser/Hunter/Marksmanship/Modules/Spells/Trueshot';
import CancelledCasts from 'Parser/Hunter/Shared/Modules/Features/CancelledCasts';
import TimeFocusCapped from 'Parser/Hunter/Shared/Modules/Features/TimeFocusCapped';
import SpellLink from 'common/SpellLink';
import Bullseye from 'Parser/Hunter/Marksmanship/Modules/Traits/Bullseye';
import PatientSniperDetails from 'Parser/Hunter/Marksmanship/Modules/Talents/PatientSniper/PatientSniperDetails';
import Icon from "common/Icon";
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
import AimedInVulnerableTracker from 'Parser/Hunter/Marksmanship/Modules/Features/AimedInVulnerableTracker';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import ResourceIcon from 'common/ResourceIcon';
import VulnerableUpTime from 'Parser/Hunter/Marksmanship/Modules/Features/VulnerableUptime';

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
    cancelledCasts: CancelledCasts,
    timeFocusCapped: TimeFocusCapped,
    enchantChecker: EnchantChecker,
    aimedInVulnerableTracker: AimedInVulnerableTracker,
    vulnerableUptime: VulnerableUpTime,

    //talents
    aMurderOfCrows: AMurderOfCrows,
    patientSniperDetails: PatientSniperDetails,

    //spells
    trueshot: Trueshot,

    //traits
    bullseye: Bullseye,
  };

  rules = [
    new Rule({
      name: 'Use core spells as often as possible',
      description: <Wrapper>Spells such as <SpellLink id={SPELLS.TRUESHOT.id} icon />, <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} icon /> should be used as often as possible (unless nearing execute) and <SpellLink id={SPELLS.WINDBURST.id} icon />, should be used as often as possible in situations where you need to open <SpellLink id={SPELLS.VULNERABLE.id} icon /> windows. Any added talents that need activation are generally used on cooldown. <a href="https://www.icy-veins.com/wow/marksmanship-hunter-pve-dps-rotation-cooldowns-abilities" target="_blank" rel="noopener noreferrer">More info.</a></Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.WINDBURST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TRUESHOT,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SIDEWINDERS_TALENT,
            when: combatant.hasTalent(SPELLS.SIDEWINDERS_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.PIERCING_SHOT_TALENT,
            when: combatant.hasTalent(SPELLS.PIERCING_SHOT_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.EXPLOSIVE_SHOT_TALENT,
            when: combatant.hasTalent(SPELLS.EXPLOSIVE_SHOT_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SENTINEL_TALENT,
            when: combatant.hasTalent(SPELLS.SENTINEL_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BLACK_ARROW_TALENT,
            when: combatant.hasTalent(SPELLS.BLACK_ARROW_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BARRAGE_TALENT,
            when: combatant.hasTalent(SPELLS.BARRAGE_TALENT.id),
          }),
        ];
      },
    }),

    new Rule({
      name: <Wrapper>Use <SpellLink id={SPELLS.TRUESHOT.id} icon /> effectively</Wrapper>,
      description: <Wrapper>Since <SpellLink id={SPELLS.TRUESHOT.id} icon /> is a marksmanship hunters only cooldown, it's important to maximize the potential of it.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>Average <SpellLink id={SPELLS.AIMED_SHOT.id} icon /> casts per <SpellLink id={SPELLS.TRUESHOT.id} icon /></Wrapper>,
            check: () => this.trueshot.aimedShotThreshold,
          }),
          new Requirement({
            name: <Wrapper>Average <Icon
              icon='ability_hunter_focusfire'
              alt='Average Focus At Trueshot Cast'
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            /> <a href="http://www.wowhead.com/focus">Focus</a> when casting <SpellLink id={SPELLS.TRUESHOT.id} icon /></Wrapper>,
            check: () => this.trueshot.focusThreshold,
          }),
          new Requirement({
            name: <Wrapper>Average<SpellLink id={SPELLS.TRUESHOT.id} icon /> uptime per cast</Wrapper>,
            check: () => this.trueshot.uptimeThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper>Execute and <SpellLink id={SPELLS.BULLSEYE_TRAIT.id} icon /></Wrapper>,
      description: <Wrapper>It's important for a marksmanship hunter to combine <SpellLink id={SPELLS.BULLSEYE_TRAIT.id} icon /> with a <SpellLink id={SPELLS.TRUESHOT.id} icon />, because of the increased crit damage added into <SpellLink id={SPELLS.TRUESHOT.id} icon /> from <SpellLink id={SPELLS.RAPID_KILLING.id} icon />.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} icon /> casts right before execute</Wrapper>,
            check: () => this.aMurderOfCrows.shouldHaveSavedThreshold,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.TRUESHOT.id} icon /> casts with <SpellLink id={SPELLS.BULLSEYE_BUFF.id} icon /> up</Wrapper>,
            check: () => this.trueshot.executeTrueshotThreshold,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.BULLSEYE_BUFF.id} icon /> lost while boss was under 20% </Wrapper>,
            check: () => this.bullseye.bullseyeResetThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Downtime, cancelled casts and focus capping',
      description: <Wrapper>
        Try to minimize your time spent not casting. Use your instant casts (<SpellLink id={SPELLS.ARCANE_SHOT.id} icon /> or <SpellLink id={SPELLS.MULTISHOT.id} icon />) while moving to avoid spending time doing nothing. Even while using <SpellLink id={SPELLS.SIDEWINDERS_TALENT.id} icon />, you can have too much downtime so try and spend the natural downtime moving, and utilise the rest of the time to cast your damaging spells.
      </Wrapper>,
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
          new Requirement({
            name: <Wrapper><Icon
              icon='inv_misc_map_01'
              alt='Cancelled casts'
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            /> Channeled casts cancelled</Wrapper>,
            check: () => this.cancelledCasts.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper><Icon
              icon='ability_hunter_focusfire'
              alt='Time focus capped'
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            /> Time focus capped</Wrapper>,
            check: () => this.timeFocusCapped.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper><SpellLink id={SPELLS.VULNERABLE.id} icon /> & <SpellLink id={SPELLS.PATIENT_SNIPER_TALENT.id} icon /> Usage </Wrapper>,
      description: <Wrapper>Try to limit the amount of casts outside of <SpellLink id={SPELLS.VULNERABLE.id} icon /> to a minimum. Try to optimise the damage from <SpellLink id={SPELLS.PATIENT_SNIPER_TALENT.id} icon /> by after opening <SpellLink id={SPELLS.VULNERABLE.id} icon />, then casting one or two <SpellLink id={SPELLS.ARCANE_SHOT.id} icon /> or <SpellLink id={SPELLS.MULTISHOT.id} icon /> to delay your <SpellLink id={SPELLS.AIMED_SHOT.id} icon /> until later in the <SpellLink id={SPELLS.VULNERABLE.id} icon /> window. However, remember to not stand around waiting, doing nothing and to not focus cap. These are more important to DPS, than optimising <SpellLink id={SPELLS.PATIENT_SNIPER_TALENT.id} icon /> is.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.AIMED_SHOT.id} icon children={SPELLS.AIMED_SHOT.name + 's'} /> outside <SpellLink id={SPELLS.VULNERABLE.id} icon /></Wrapper>,
            check: () => this.aimedInVulnerableTracker.nonVulnerableAimedShotThreshold,
          }),
          new Requirement({
            name: <Wrapper><ResourceIcon id={RESOURCE_TYPES.FOCUS.id} /> Focus dump <SpellLink id={SPELLS.AIMED_SHOT.id} icon children={SPELLS.AIMED_SHOT.name + 's'} /></Wrapper>,
            check: () => this.aimedInVulnerableTracker.focusDumpThreshold,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.PATIENT_SNIPER_TALENT.id} icon /> damage contribution</Wrapper>,
            check: () => this.patientSniperDetails.patientSniperDamageThresholds,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.VULNERABLE.id} icon /> uptime</Wrapper>,
            check: () => this.vulnerableUptime.uptimeThreshold,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
