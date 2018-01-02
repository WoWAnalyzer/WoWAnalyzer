import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
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
import AstralPower from './AstralPower';
import LunarEmpowerment from './LunarEmpowerment';
import SolarEmpowerment from './SolarEmpowerment';
import MoonSpells from './MoonSpells';

class Checklist extends CoreChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    moonfireUptime: MoonfireUptime,
    sunfireUptime: SunfireUptime,
    stellarFlareUptime: StellarFlareUptime,
    astralPower: AstralPower,
    lunarEmpowerment: LunarEmpowerment,
    solarEmpowerment: SolarEmpowerment,
    moonSpells: MoonSpells,

    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
  };

  rules = [
    new Rule({
      name: 'Always be casting',
      description: <Wrapper><em><b>Continuously chaining casts throughout an encounter is the single most important thing for achieving good DPS as a caster</b></em>. There shoule be no delay at all between your spell casts, it's better to start casting the wrong spell than to think for a few seconds and then cast the right spell. You should be able to handle a fight's mechanics with the minimum possible interruption to your casting. Some fights (like Argus) have unavoidable downtime due to phase transitions and the like, so in these cases 0% downtime will not be possible.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Downtime',
            check: () => this.alwaysBeCasting.downtimeSuggestionThresholds,
          }),
          new Requirement({
            name: 'Cancelled Casts',
            check: () => this.cancelledCasts.cancelledCastSuggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Maintain your DoTs on the boss',
      description: 'DoTs are a big part of your damage. You should try to keep as high uptime on them as possible.',
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.MOONFIRE_BEAR.id} icon/> uptime</Wrapper>,
            check: () => this.moonfireUptime.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.SUNFIRE.id} icon/> uptime</Wrapper>,
            check: () => this.sunfireUptime.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.STELLAR_FLARE_TALENT.id} icon/> uptime</Wrapper>,
            check: () => this.stellarFlareUptime.suggestionThresholds,
            when: combatant.hasTalent(SPELLS.STELLAR_FLARE_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Do not overcap your resources',
      description: <Wrapper>You should try to always avoid overcapping your Astral Power, Moon spell charges, and your solar and lunar empowerments. Sometimes you can not avoid overcapping all of them. In that case, you should prioritize them as they are listed.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Astral Power efficiency',
            check: () => this.astralPower.suggestionThresholds,
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
      description: <Wrapper>Your cooldowns are a major contributor to your DPS, and should be used as frequently as possible throughout a fight. A cooldown should be held on to only if a priority DPS phase is coming <em>soon</em>. Holding cooldowns too long will hurt your DPS.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CELESTIAL_ALIGNMENT,
            when: !combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT,
            when: combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your supportive abilities',
      description: <Wrapper>While you should not aim to cast defensives and externals on cooldown, be aware of them and try to use them whenever effective. Not using them at all indicates you might not be aware of them enough.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.INNERVATE,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BARKSKIN,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RENEWAL_TALENT,
            when: combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;