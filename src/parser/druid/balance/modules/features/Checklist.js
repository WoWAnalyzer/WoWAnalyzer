import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import CoreChecklist, { Rule, Requirement } from 'parser/shared/modules/features/Checklist';
import Abilities from 'parser/shared/modules/Abilities';
import { PreparationRule } from 'parser/shared/modules/features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'parser/shared/modules/features/Checklist/Requirements';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import PrePotion from 'parser/shared/modules/items/PrePotion';
import EnchantChecker from 'parser/shared/modules/items/EnchantChecker';

import CancelledCasts from './CancelledCasts';
import AlwaysBeCasting from './AlwaysBeCasting';
import MoonfireUptime from './MoonfireUptime';
import SunfireUptime from './SunfireUptime';
import StellarFlareUptime from '../talents/StellarFlareUptime';
import LunarEmpowerment from './LunarEmpowerment';
import SolarEmpowerment from './SolarEmpowerment';
import EarlyDotRefreshes from './EarlyDotRefreshes';
import EarlyDotRefreshesInstants from './EarlyDotRefreshesInstants';

import AstralPowerDetails from '../resourcetracker/AstralPowerDetails';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    moonfireUptime: MoonfireUptime,
    sunfireUptime: SunfireUptime,
    stellarFlareUptime: StellarFlareUptime,
    lunarEmpowerment: LunarEmpowerment,
    solarEmpowerment: SolarEmpowerment,
    earlyDotRefreshes: EarlyDotRefreshes,
    earlyDotRefreshesInstants: EarlyDotRefreshesInstants,

    prePotion: PrePotion,
    enchantChecker: EnchantChecker,

    astralPowerDetails: AstralPowerDetails,
  };

  rules = [
    new Rule({
      name: 'Always be casting',
      description: <><em><b>Continuously chaining casts throughout an encounter is the single most important thing for achieving good DPS as a caster</b></em>. There shoule be no delay at all between your spell casts, it's better to start casting the wrong spell than to think for a few seconds and then cast the right spell. You should be able to handle a fight's mechanics with the minimum possible interruption to your casting. Some fights (like Argus) have unavoidable downtime due to phase transitions and the like, so in these cases 0% downtime will not be possible.</>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Downtime',
            check: () => this.alwaysBeCasting.suggestionThresholds,
          }),
          new Requirement({
            name: 'Cancelled Casts',
            check: () => this.cancelledCasts.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Maintain your DoTs on the boss',
      description: 'DoTs are a big part of your damage. You should try to keep as high uptime on them as possible.',
      requirements: () => {
        return [
          new Requirement({
            name: <><SpellLink id={SPELLS.MOONFIRE_BEAR.id} /> uptime</>,
            check: () => this.moonfireUptime.suggestionThresholds,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.SUNFIRE.id} /> uptime</>,
            check: () => this.sunfireUptime.suggestionThresholds,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.STELLAR_FLARE_TALENT.id} /> uptime</>,
            check: () => this.stellarFlareUptime.suggestionThresholds,
            when: this.stellarFlareUptime.active,
          }),
        ];
      },
    }),
    new Rule({
          name: 'Avoid refreshing your DoTs too early',
          description: 'DoTs do very little direct damage, and you should avoid ever refreshing them with more than 30% duration remaining unless you have nothing else to cast while moving.',
          requirements: () => {
            return [
              new Requirement({
                name: <><SpellLink id={SPELLS.MOONFIRE_BEAR.id} /> good refreshes</>,
                check: () => this.earlyDotRefreshesInstants.suggestionThresholdsMoonfireEfficiency,
              }),
              new Requirement({
                name: <><SpellLink id={SPELLS.SUNFIRE.id} /> good refreshes</>,
                check: () => this.earlyDotRefreshesInstants.suggestionThresholdsSunfireEfficiency,
              }),
              new Requirement({
                name: <><SpellLink id={SPELLS.STELLAR_FLARE_TALENT.id} /> good refreshes</>,
                check: () => this.earlyDotRefreshes.suggestionThresholdsStellarFlareEfficiency,
                when: this.earlyDotRefreshes.active,
              }),
            ];
          },
        }),
    new Rule({
      name: 'Do not overcap your resources',
      description: <>You should try to always avoid overcapping your Astral Power and your solar and lunar empowerments. Sometimes you can not avoid overcapping both of them. In that case, you should prioritize spending the Astral Power.</>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Astral Power efficiency',
            check: () => this.astralPowerDetails.suggestionThresholds,
          }),
          new Requirement({
            name: 'Solar Empowerment efficiency',
            check: () => this.solarEmpowerment.suggestionThresholds,
          }),
          new Requirement({
            name: 'Lunar Empowerment efficiency',
            check: () => this.lunarEmpowerment.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your cooldowns',
      description: <>Your cooldowns are a major contributor to your DPS, and should be used as frequently as possible throughout a fight. A cooldown should be held on to only if a priority DPS phase is coming <em>soon</em>. Holding cooldowns too long will hurt your DPS.</>,
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CELESTIAL_ALIGNMENT,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your supportive abilities',
      description: <>While you should not aim to cast defensives and externals on cooldown, be aware of them and try to use them whenever effective. Not using them at all indicates you might not be aware of them enough.</>,
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.INNERVATE,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BARKSKIN,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RENEWAL_TALENT,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
