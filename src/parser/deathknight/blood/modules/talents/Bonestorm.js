import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const SUGGESTED_MIN_TARGETS_FOR_BONESTORM = 1.5;

class Bonestorm extends Analyzer {
  bsCasts = [];
  totalBonestormDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BONESTORM_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.BONESTORM_TALENT.id) {
      return;
    }
    const resource = event.classResources?.find(resource => resource.type === RESOURCE_TYPES.RUNIC_POWER.id);
    if (!resource) {
      return;
    }

    this.bsCasts.push({
      cost: resource.cost,
      hits: [],
    });
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.BONESTORM_HIT.id) {
      return;
    }

    if (this.bsCasts.length === 0) {
      // to account for prepull-cheese, assuming 100RP because I dont know how much RP was spend prepull
      this.bsCasts.push({
        cost: 100,
        hits: [],
      });
    }

    const totalDamage = event.amount + (event.absorbed || 0);
    this.bsCasts[this.bsCasts.length - 1].hits.push(totalDamage);
    this.totalBonestormDamage += totalDamage;
  }

  get goodBonestormCasts() {
    const goodCasts = this.bsCasts.filter((val) => {
      return val.hits.length / (val.cost / 100) >= SUGGESTED_MIN_TARGETS_FOR_BONESTORM;
    });
    return goodCasts.length;
  }

  get totalBonestormCasts() {
    return this.bsCasts.length;
  }

  get suggestionThresholds() {
    return {
      actual: this.goodBonestormCasts / this.totalBonestormCasts,
      isLessThan: {
        minor: 1,
        average: 0.8,
        major: 0.6,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Try to cast <SpellLink id={SPELLS.BONESTORM_TALENT.id} /> only if you can reliable hit 2 or more targets to maximize the damage and healing. Casting <SpellLink id={SPELLS.BONESTORM_TALENT.id} /> with only one target in range is only a minor DPS gain (~10 DPS) at the cost of pooling Runic Power, use <SpellLink id={SPELLS.DEATH_STRIKE.id} /> instead.</>)
          .icon(SPELLS.BONESTORM_TALENT.icon)
          .actual(`${ formatPercentage(actual) }% casts hit ${SUGGESTED_MIN_TARGETS_FOR_BONESTORM} or more targets`)
          .recommended(`${ formatPercentage(recommended) }%is recommended`);
      });
  }

  get bonestormTooltip() {
    const tooltipRows = [];
    this.bsCasts.forEach((cast, index) => {
      const avgDamage = formatNumber((cast.hits.reduce((a, b) => a + b, 0) / cast.hits.length) || 0);
      const totalDamage = formatNumber(cast.hits.reduce((a, b) => a + b, 0));
      const avgHits = formatNumber((cast.hits.length / cast.cost * 100) || 0, 1);
      const rpCost = formatNumber(cast.cost / 10);

      tooltipRows.push(<>Cast #{ index + 1 } (for {rpCost} RP) hit an average of {avgHits} target{ avgHits <= 1 ? '' : 's' } for {avgDamage} per hit. ({ totalDamage} total)<br /></>);
    });
    return tooltipRows;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BONESTORM_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(7)}
        value={`${ formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalBonestormDamage)) } %`}
        label="of your total damage"
        tooltip={this.bonestormTooltip}
      />
    );
  }
}

export default Bonestorm;
