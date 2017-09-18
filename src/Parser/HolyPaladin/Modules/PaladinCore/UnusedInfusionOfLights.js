import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import UnusedInfusionOfLightImage from '../../Images/ability_paladin_infusionoflight-bw.jpg';
import PaladinAbilityTracker from '../PaladinCore/PaladinAbilityTracker';

class UnusedInfusionOfLights extends Module {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: PaladinAbilityTracker,
  };

  get iolProcsPerHolyShockCrit() {
    return this.combatants.selected.hasBuff(SPELLS.HOLY_PALADIN_T19_4SET_BONUS_BUFF.id) ? 2 : 1;
  }

  suggestions(when) {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);
    const holyShock = getAbility(SPELLS.HOLY_SHOCK_HEAL.id);

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;
    const iolHolyLights = holyLight.healingIolHits || 0;
    const totalIols = iolFlashOfLights + iolHolyLights;

    const holyShockCrits = holyShock.healingCriticalHits || 0;
    const iolProcsPerHolyShockCrit = this.iolProcsPerHolyShockCrit;
    const unusedIolRate = 1 - totalIols / (holyShockCrits * iolProcsPerHolyShockCrit);

    const hasCrusadersMight = this.combatants.selected.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id);
    const hasSoulOfTheHighlord = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HIGHLORD.id);
    const hasDivinePurpose = hasSoulOfTheHighlord || this.combatants.selected.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id);

    const has4PT19 = this.combatants.selected.hasBuff(SPELLS.HOLY_PALADIN_T19_4SET_BONUS_BUFF.id);

    let recommendedUnusedIolRate = has4PT19 ? 0.2 : 0;
    if (hasCrusadersMight) {
      recommendedUnusedIolRate += has4PT19 ? 0.1 : 0.05;
    }
    if (hasDivinePurpose) {
      recommendedUnusedIolRate += has4PT19 ? 0.1 : 0.05;
    }
    when(unusedIolRate).isGreaterThan(recommendedUnusedIolRate)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.INFUSION_OF_LIGHT.id} /> proc usage can be improved. Try to use your Infusion of Light procs before casting your next <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} />.</span>)
          .icon(SPELLS.INFUSION_OF_LIGHT.icon)
          .actual(`${formatPercentage(unusedIolRate)}% unused Infusion of Lights`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.2);
      });
  }

  statistic() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);
    const holyShock = getAbility(SPELLS.HOLY_SHOCK_HEAL.id);

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;
    const iolHolyLights = holyLight.healingIolHits || 0;
    const totalIols = iolFlashOfLights + iolHolyLights;

    const holyShockHeals = holyShock.healingHits || 0;
    const holyShockCrits = holyShock.healingCriticalHits || 0;
    const iolProcsPerHolyShockCrit = this.iolProcsPerHolyShockCrit;
    const unusedIolRate = 1 - totalIols / (holyShockCrits * iolProcsPerHolyShockCrit);

    return (
      <StatisticBox
        icon={(
          <SpellLink id={SPELLS.INFUSION_OF_LIGHT.id}>
            <img
              src={UnusedInfusionOfLightImage}
              alt="Unused Infusion of Light"
            />
          </SpellLink>
        )}
        value={`${formatPercentage(unusedIolRate)} %`}
        label="Unused Infusion of Lights"
        tooltip={`The amount of Infusion of Lights you did not use out of the total available. You cast ${holyShockHeals} (healing) Holy Shocks with a ${formatPercentage(holyShockCrits / holyShockHeals)}% crit ratio. This gave you ${holyShockCrits * iolProcsPerHolyShockCrit} Infusion of Light procs, of which you used ${totalIols}.<br /><br />The ratio may be below zero if you used Infusion of Light procs from damaging Holy Shocks (e.g. cast on boss), or from casting Holy Shock before the fight started. <b>It is accurate to enter this negative value in your spreadsheet!</b> The spreadsheet will consider these bonus Infusion of Light procs and consider it appropriately.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(41);
}

export default UnusedInfusionOfLights;
