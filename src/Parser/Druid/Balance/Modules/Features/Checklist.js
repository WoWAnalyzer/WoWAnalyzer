import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

import CancelledCasts from './CancelledCasts';
import AlwaysBeCasting from './AlwaysBeCasting';
import MoonfireUptime from './MoonfireUptime';
import SunfireUptime from './SunfireUptime';
import StellarFlareUptime from './StellarFlareUptime';
import StellarEmpowermentUptime from './StellarEmpowermentUptime';
import MoonSpells from './MoonSpells';
import LunarEmpowerment from './LunarEmpowerment';
import SolarEmpowerment from './SolarEmpowerment';
import EarlyDotRefreshes from './EarlyDotRefreshes';
import EarlyDotRefreshesInstants from './EarlyDotRefreshesInstants';

import L90Talents from '../Talents/L90Talents';

import SoulOfTheArchdruid from '../../../Shared/Modules/Items/SoulOfTheArchdruid';

import AstralPowerDetails from '../ResourceTracker/AstralPowerDetails';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    moonfireUptime: MoonfireUptime,
    sunfireUptime: SunfireUptime,
    stellarFlareUptime: StellarFlareUptime,
    stellarEmpowermentUptime: StellarEmpowermentUptime,
    lunarEmpowerment: LunarEmpowerment,
    solarEmpowerment: SolarEmpowerment,
    moonSpells: MoonSpells,
    earlyDotRefreshes: EarlyDotRefreshes,
    earlyDotRefreshesInstants: EarlyDotRefreshesInstants,

    l90Talents: L90Talents,

    soulOfTheArchdruid: SoulOfTheArchdruid,

    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,

    astralPowerDetails: AstralPowerDetails,
  };

  rules = [
    new Rule({
      name: 'Always be casting',
      description: <React.Fragment><em><b>Continuously chaining casts throughout an encounter is the single most important thing for achieving good DPS as a caster</b></em>. There shoule be no delay at all between your spell casts, it's better to start casting the wrong spell than to think for a few seconds and then cast the right spell. You should be able to handle a fight's mechanics with the minimum possible interruption to your casting. Some fights (like Argus) have unavoidable downtime due to phase transitions and the like, so in these cases 0% downtime will not be possible.</React.Fragment>,
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
            name: <React.Fragment><SpellLink id={SPELLS.MOONFIRE_BEAR.id} /> uptime</React.Fragment>,
            check: () => this.moonfireUptime.suggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.SUNFIRE.id} /> uptime</React.Fragment>,
            check: () => this.sunfireUptime.suggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.STELLAR_FLARE_TALENT.id} /> uptime</React.Fragment>,
            check: () => this.stellarFlareUptime.suggestionThresholds,
            when: this.stellarFlareUptime.active,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.STELLAR_EMPOWERMENT.id} /> uptime</React.Fragment>,
            check: () => this.stellarEmpowermentUptime.suggestionThresholds,
            when: this.stellarEmpowermentUptime.active,
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
                name: <React.Fragment><SpellLink id={SPELLS.MOONFIRE_BEAR.id} /> good refreshes</React.Fragment>,
                check: () => this.earlyDotRefreshesInstants.suggestionThresholdsMoonfireEfficiency,
              }),
              new Requirement({
                name: <React.Fragment><SpellLink id={SPELLS.SUNFIRE.id} /> good refreshes</React.Fragment>,
                check: () => this.earlyDotRefreshesInstants.suggestionThresholdsSunfireEfficiency,
              }),
              new Requirement({
                name: <React.Fragment><SpellLink id={SPELLS.STELLAR_FLARE_TALENT.id} /> good refreshes</React.Fragment>,
                check: () => this.earlyDotRefreshes.suggestionThresholdsStellarFlareEfficiency,
                when: this.earlyDotRefreshes.active,
              }),
            ];
          },
        }),
    new Rule({
      name: 'Do not overcap your resources',
      description: <React.Fragment>You should try to always avoid overcapping your Astral Power, Moon spell charges, and your solar and lunar empowerments. Sometimes you can not avoid overcapping all of them. In that case, you should prioritize them as they are listed.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Astral Power efficiency',
            check: () => this.astralPowerDetails.suggestionThresholds,
          }),
          new Requirement({
            name: 'Moon spells efficiency',
            check: () => this.moonSpells.suggestionThresholds,
          }),
          new Requirement({
            name: 'Solar Empowerment efficiency',
            check: () => this.solarEmpowerment.suggestionThresholds,
            when: !this.combatants.selected.hasHead(ITEMS.THE_EMERALD_DREAMCATCHER.id),
          }),
          new Requirement({
            name: 'Lunar Empowerment efficiency',
            check: () => this.lunarEmpowerment.suggestionThresholds,
            when: !this.combatants.selected.hasHead(ITEMS.THE_EMERALD_DREAMCATCHER.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your cooldowns',
      description: <React.Fragment>Your cooldowns are a major contributor to your DPS, and should be used as frequently as possible throughout a fight. A cooldown should be held on to only if a priority DPS phase is coming <em>soon</em>. Holding cooldowns too long will hurt your DPS.</React.Fragment>,
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
      description: <React.Fragment>While you should not aim to cast defensives and externals on cooldown, be aware of them and try to use them whenever effective. Not using them at all indicates you might not be aware of them enough.</React.Fragment>,
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
    new Rule({
      name: 'Pick the right tools for the fight',
      description: 'The throughput gain of some talents or legendaries might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly.',
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment><SpellLink id={this.l90Talents.activeTalent.id} /> talent efficiency</React.Fragment>,
            check: () => this.l90Talents.suggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment>Picked the right talent with <ItemLink id={ITEMS.SOUL_OF_THE_ARCHDRUID.id} /></React.Fragment>,
            check: () => this.soulOfTheArchdruid.suggestionThresholds,
            when: this.soulOfTheArchdruid.active,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={this.l90Talents.activeTalent.id} /> buff efficiency</React.Fragment>,
            check: () => this.l90Talents.suggestionThresholdsBotA,
            when: (this.l90Talents.activeTalent.id === SPELLS.BLESSING_OF_THE_ANCIENTS_TALENT.id),
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
