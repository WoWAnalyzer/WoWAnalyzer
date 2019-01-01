import React from 'react';
import { RadialChart } from 'react-vis';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import ManaValues from 'parser/shared/modules/ManaValues';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import StatisticGroup from 'interface/statistics/StatisticGroup';
import Statistic from 'interface/statistics/Statistic';

import PaladinAbilityTracker from './PaladinAbilityTracker';

const CHART_SIZE = 85;

class CastBehavior extends Analyzer {
  static dependencies = {
    abilityTracker: PaladinAbilityTracker,
    manaValues: ManaValues,
  };

  get iolProcsPerHolyShockCrit() {
    return this.selectedCombatant.hasBuff(SPELLS.HOLY_PALADIN_T19_4SET_BONUS_BUFF.id) ? 2 : 1;
  }

  legend(items, total) {
    const numItems = items.length;
    return items.map(({ color, label, tooltip, value, spellId }, index) => {
      label = tooltip ? (
        <dfn data-tip={tooltip}>{label}</dfn>
      ) : label;
      label = spellId ? (
        <SpellLink id={spellId}>{label}</SpellLink>
      ) : label;
      return (
        <div
          className="flex"
          style={{
            marginBottom: ((numItems - 1) === index) ? 0 : 5,
          }}
          key={index}
        >
          <div className="flex-sub">
            <div
              style={{
                display: 'inline-block',
                background: color,
                borderRadius: '50%',
                width: 10,
                height: 10,
                marginBottom: -1,
              }}
            />
          </div>
          <div className="flex-main" style={{ paddingLeft: 5 }}>
            {label}
          </div>
          <div className="flex-sub">
            <dfn data-tip={value}>
              {formatPercentage(value / total, 0)}%
            </dfn>
          </div>
        </div>
      );
    });
  }
  chart(items) {
    return (
      <RadialChart
        colorType="literal"
        data={items.map(item => ({
          ...item,
          angle: item.value,
        }))}
        width={CHART_SIZE}
        height={CHART_SIZE}
        radius={CHART_SIZE/2-1} // a 1px padding avoids straight edges
        innerRadius={CHART_SIZE*0.3}
      />
    );
  }

  iolCastRatioChart() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);
    const holyShockCast = getAbility(SPELLS.HOLY_SHOCK_CAST.id);
    const holyShockHeal = getAbility(SPELLS.HOLY_SHOCK_HEAL.id);
    const holyShockDamage = getAbility(SPELLS.HOLY_SHOCK_DAMAGE.id);

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;
    const iolHolyLights = holyLight.healingIolHits || 0;
    const totalIolUsages = iolFlashOfLights + iolHolyLights;

    const holyShockCasts = holyShockCast.casts || 0;
    const holyShockCrits = (holyShockHeal.healingCriticalHits || 0) + (holyShockDamage.damageCriticalHits || 0);
    const iolProcsPerHolyShockCrit = this.iolProcsPerHolyShockCrit;
    const totalIolProcs = holyShockCrits * iolProcsPerHolyShockCrit;
    const unusedProcs = totalIolProcs - totalIolUsages;

    const items = [
      {
        color: '#FFFDE7',
        label: 'Flash of Light',
        spellId: SPELLS.FLASH_OF_LIGHT.id,
        value: iolFlashOfLights,
      },
      {
        color: '#F57C00',
        label: 'Holy Light',
        spellId: SPELLS.HOLY_LIGHT.id,
        value: iolHolyLights,
      },
      {
        color: '#A93226',
        label: 'Wasted procs',
        tooltip: `The amount of Infusion of Lights you did not use out of the total available. You cast ${holyShockCasts} Holy Shocks with a ${formatPercentage(holyShockCrits / holyShockCasts)}% crit ratio. This gave you ${totalIolProcs} Infusion of Light procs, of which you used ${totalIolUsages}.`,
        value: unusedProcs,
      },
    ];

    return (
      <div className="flex">
        <div className="flex-main" style={{ fontSize: '85%' }}>
          {this.legend(items, totalIolProcs)}
        </div>
        <div className="flex-sub" style={{ paddingLeft: 15 }}>
          {this.chart(items)}
        </div>
      </div>
    );
  }

  fillerCastRatioChart() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);
    const lightOfTheMartyr = getAbility(SPELLS.LIGHT_OF_THE_MARTYR.id);

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;
    const iolHolyLights = holyLight.healingIolHits || 0;

    const flashOfLightHeals = flashOfLight.casts || 0;
    const holyLightHeals = holyLight.casts || 0;
    const lightOfTheMartyrHeals = lightOfTheMartyr.casts || 0;
    const fillerFlashOfLights = flashOfLightHeals - iolFlashOfLights;
    const fillerHolyLights = holyLightHeals - iolHolyLights;
    const totalFillers = fillerFlashOfLights + fillerHolyLights + lightOfTheMartyrHeals;

    const items = [
      {
        color: '#FFFDE7',
        label: 'Flash of Light',
        spellId: SPELLS.FLASH_OF_LIGHT.id,
        value: fillerFlashOfLights,
      },
      {
        color: '#F57C00',
        label: 'Holy Light',
        spellId: SPELLS.HOLY_LIGHT.id,
        value: fillerHolyLights,
      },
      {
        color: '#A93226',
        label: 'Light of the Martyr',
        spellId: SPELLS.LIGHT_OF_THE_MARTYR.id,
        value: lightOfTheMartyrHeals,
      },
    ];

    return (
      <div className="flex">
        <div className="flex-main" style={{ fontSize: '85%' }}>
          {this.legend(items, totalFillers)}
        </div>
        <div className="flex-sub" style={{ paddingLeft: 15 }}>
          {this.chart(items)}
        </div>
      </div>
    );
  }

  statistic() {
    return (
      <StatisticGroup position={STATISTIC_ORDER.CORE(40)}>
        <Statistic ultrawide>
          <div className="pad">
            <label><SpellLink id={SPELLS.INFUSION_OF_LIGHT.id} /> usage</label>

            {this.iolCastRatioChart()}
          </div>
        </Statistic>
        <Statistic ultrawide>
          <div className="pad">
            <label>Fillers</label>

            {this.fillerCastRatioChart()}
          </div>
        </Statistic>
      </StatisticGroup>
    );
  }
}

export default CastBehavior;
