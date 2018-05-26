import React from 'react';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
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
    abilities: Abilities,
    combatants: Combatants,

    //preparation rules
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,

    //features:
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    timeFocusCapped: TimeFocusCapped,
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
      description: <React.Fragment>Spells such as <SpellLink id={SPELLS.TRUESHOT.id} /> and <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} /> should be used as often as possible (unless nearing execute). <SpellLink id={SPELLS.WINDBURST.id} /> should be used as often as possible in situations where you need to open <SpellLink id={SPELLS.VULNERABLE.id} /> windows. Any added talents that need activation are generally used on cooldown. <a href="https://www.icy-veins.com/wow/marksmanship-hunter-pve-dps-rotation-cooldowns-abilities" target="_blank" rel="noopener noreferrer">More info.</a></React.Fragment>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.WINDBURST,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TRUESHOT,
            onlyWithSuggestion: false,
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
      name: <React.Fragment>Use <SpellLink id={SPELLS.TRUESHOT.id} /> effectively</React.Fragment>,
      description: <React.Fragment>Since <SpellLink id={SPELLS.TRUESHOT.id} /> is a marksmanship hunters only cooldown, it's important to maximize the potential of it.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment>Average <SpellLink id={SPELLS.AIMED_SHOT.id} /> casts per <SpellLink id={SPELLS.TRUESHOT.id} /></React.Fragment>,
            check: () => this.trueshot.aimedShotThreshold,
          }),
          new Requirement({
            name: <React.Fragment>Average <Icon
              icon="ability_hunter_focusfire"
              alt="Average Focus At Trueshot Cast"
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            /> <a href="http://www.wowhead.com/focus">Focus</a> when casting <SpellLink id={SPELLS.TRUESHOT.id} /></React.Fragment>,
            check: () => this.trueshot.focusThreshold,
          }),
          new Requirement({
            name: <React.Fragment>Average <SpellLink id={SPELLS.TRUESHOT.id} /> uptime per cast</React.Fragment>,
            check: () => this.trueshot.uptimeThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: <React.Fragment>Execute and <SpellLink id={SPELLS.BULLSEYE_TRAIT.id} /></React.Fragment>,
      description: <React.Fragment>It's important for a marksmanship hunter to combine <SpellLink id={SPELLS.BULLSEYE_TRAIT.id} /> with a <SpellLink id={SPELLS.TRUESHOT.id} />, because of the increased crit damage added into <SpellLink id={SPELLS.TRUESHOT.id} /> from <SpellLink id={SPELLS.RAPID_KILLING.id} />.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} /> casts right before execute</React.Fragment>,
            check: () => this.aMurderOfCrows.shouldHaveSavedThreshold,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.TRUESHOT.id} /> casts with <SpellLink id={SPELLS.BULLSEYE_BUFF.id} /> up</React.Fragment>,
            check: () => this.trueshot.executeTrueshotThreshold,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.BULLSEYE_BUFF.id} /> lost while boss was under 20% </React.Fragment>,
            check: () => this.bullseye.bullseyeResetThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Downtime, cancelled casts and focus capping',
      description: <React.Fragment>
        Try to minimize your time spent not casting. Use your instant casts (<SpellLink id={SPELLS.ARCANE_SHOT.id} /> or <SpellLink id={SPELLS.MULTISHOT.id} />) while moving to avoid spending time doing nothing. Even while using <SpellLink id={SPELLS.SIDEWINDERS_TALENT.id} />, you can have too much downtime so try and spend the natural downtime moving, and utilise the rest of the time to cast your damaging spells.
      </React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment><Icon
              icon="spell_mage_altertime"
              alt="Casting downtime"
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            /> Downtime</React.Fragment>,
            check: () => this.alwaysBeCasting.suggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><Icon
              icon="inv_misc_map_01"
              alt="Cancelled casts"
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            /> Channeled casts cancelled</React.Fragment>,
            check: () => this.cancelledCasts.suggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><ResourceIcon id={RESOURCE_TYPES.FOCUS.id} /> Time focus capped</React.Fragment>,
            check: () => this.timeFocusCapped.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: <React.Fragment><SpellLink id={SPELLS.VULNERABLE.id} /> efficiency </React.Fragment>,
      description: <React.Fragment>Try to limit the amount of casts outside of <SpellLink id={SPELLS.VULNERABLE.id} /> to a minimum. If <SpellLink id={SPELLS.PATIENT_SNIPER_TALENT.id} /> is selected, try to optimise the damage from it by casting one or two <SpellLink id={SPELLS.ARCANE_SHOT.id} /> or <SpellLink id={SPELLS.MULTISHOT.id} /> after opening <SpellLink id={SPELLS.VULNERABLE.id} />. This is to delay your <SpellLink id={SPELLS.AIMED_SHOT.id} /> until later in the <SpellLink id={SPELLS.VULNERABLE.id} /> window, increasing the benefit from <SpellLink id={SPELLS.PATIENT_SNIPER_TALENT.id} />. However, remember to not stand around waiting, doing nothing and to not focus cap, as they are more impactful in comparison to optimising <SpellLink id={SPELLS.PATIENT_SNIPER_TALENT.id} /> is.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.AIMED_SHOT.id} />s outside <SpellLink id={SPELLS.VULNERABLE.id} /></React.Fragment>,
            check: () => this.aimedInVulnerableTracker.nonVulnerableAimedShotThreshold,
          }),
          new Requirement({
            name: <React.Fragment><ResourceIcon id={RESOURCE_TYPES.FOCUS.id} /> Focus dump <SpellLink id={SPELLS.AIMED_SHOT.id} />s</React.Fragment>,
            check: () => this.aimedInVulnerableTracker.focusDumpThreshold,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.PATIENT_SNIPER_TALENT.id} /> damage contribution</React.Fragment>,
            check: () => this.patientSniperDetails.patientSniperDamageThresholds,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.VULNERABLE.id} /> uptime</React.Fragment>,
            check: () => this.vulnerableUptime.uptimeThreshold,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
