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

const CHART_SIZE = 75;

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
            marginBottom: ((numItems - 1) === index) ? 0 : 10,
          }}
          key={index}
        >
          <div className="flex-sub">
            <div
              style={{
                display: 'inline-block',
                background: color,
                borderRadius: '50%',
                width: 16,
                height: 16,
                marginBottom: -3,
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
      <>
        <RadialChart
          colorType="literal"
          data={items.map(item => ({
            ...item,
            angle: item.value,
          }))}
          width={CHART_SIZE}
          height={CHART_SIZE}
          radius={CHART_SIZE/2}
          innerRadius={CHART_SIZE*0.31}
        />
      </>
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
        color: '#ebe5dd',
        label: 'Flash of Light',
        spellId: SPELLS.FLASH_OF_LIGHT.id,
        value: iolFlashOfLights,
      },
      {
        color: '#ff7d0a',
        label: 'Holy Light',
        spellId: SPELLS.HOLY_LIGHT.id,
        value: iolHolyLights,
      },
      {
        color: '#ff0000',
        label: 'Wasted procs',
        tooltip: `The amount of Infusion of Lights you did not use out of the total available. You cast ${holyShockCasts} Holy Shocks with a ${formatPercentage(holyShockCrits / holyShockCasts)}% crit ratio. This gave you ${totalIolProcs} Infusion of Light procs, of which you used ${totalIolUsages}.`,
        value: unusedProcs,
      },
    ];

    return (
      <div className="flex">
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, totalIolProcs)}
        </div>
        <div className="flex-sub" style={{ paddingLeft: 30 }}>
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

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;
    const iolHolyLights = holyLight.healingIolHits || 0;

    const flashOfLightHeals = flashOfLight.casts || 0;
    const holyLightHeals = holyLight.casts || 0;
    const fillerFlashOfLights = flashOfLightHeals - iolFlashOfLights;
    const fillerHolyLights = holyLightHeals - iolHolyLights;
    const totalFillers = fillerFlashOfLights + fillerHolyLights;

    const items = [
      {
        color: '#ebe5dd',
        label: 'Flash of Light',
        spellId: SPELLS.FLASH_OF_LIGHT.id,
        value: fillerFlashOfLights,
      },
      {
        color: '#ff7d0a',
        label: 'Holy Light',
        spellId: SPELLS.HOLY_LIGHT.id,
        value: fillerHolyLights,
      },
    ];

    return (
      <div className="flex">
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, totalFillers)}
        </div>
        <div className="flex-sub" style={{ paddingLeft: 30 }}>
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
