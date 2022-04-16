import { t } from '@lingui/macro';
import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentStatisticBox from 'parser/ui/TalentStatisticBox';

const SUGGESTED_MIN_TARGETS_FOR_BONESTORM = 1.5;
const SUGGESTED_RUNIC_POWER_SPENT = 100;

class Bonestorm extends Analyzer {
  bsCasts = [];
  totalBonestormDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BONESTORM_TALENT.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BONESTORM_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BONESTORM_HIT),
      this.onDamage,
    );
  }

  onCast(event) {
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.RUNIC_POWER.id,
    );
    if (!resource) {
      return;
    }

    this.bsCasts.push({
      cost: resource.cost,
      hits: [],
    });
  }

  onDamage(event) {
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
    if (this.selectedCombatant.has2Piece()) {
      return this.bsCasts.filter((val) => val.cost / 10 === SUGGESTED_RUNIC_POWER_SPENT).length;
    } else {
      return this.bsCasts.filter(
        (val) => val.hits.length / (val.cost / 100) >= SUGGESTED_MIN_TARGETS_FOR_BONESTORM,
      ).length;
    }
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
    if (this.selectedCombatant.has2Piece()) {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            Try to cast <SpellLink id={SPELLS.BONESTORM_TALENT.id} /> only when you have 100 or more
            Runic Power. The main purpose of <SpellLink id={SPELLS.BONESTORM_TALENT.id} /> once you
            have 2-piece is to quickly spend Runic Power on a high Damage Per Execution Time (DPET)
            ability.
          </>,
        )
          .icon(SPELLS.BONESTORM_TALENT.icon)
          .actual(
            t({
              id: 'deathknight.blood.suggestions.boneStorm.inneficientValue',
              message: `${formatPercentage(
                actual,
              )}% casts spent ${SUGGESTED_RUNIC_POWER_SPENT} Runic Power`,
            }),
          )
          .recommended(`${formatPercentage(recommended)}% is recommended`),
      );
    } else {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            Try to cast <SpellLink id={SPELLS.BONESTORM_TALENT.id} /> only if you can reliable hit 2
            or more targets to maximize the damage and healing. Casting{' '}
            <SpellLink id={SPELLS.BONESTORM_TALENT.id} /> with only one target in range is only a
            minor DPS gain (~10 DPS) at the cost of pooling Runic Power, use{' '}
            <SpellLink id={SPELLS.DEATH_STRIKE.id} /> instead.
          </>,
        )
          .icon(SPELLS.BONESTORM_TALENT.icon)
          .actual(
            t({
              id: 'deathknight.blood.suggestions.boneStorm.notEnoughTargets',
              message: `${formatPercentage(
                actual,
              )}% casts hit ${SUGGESTED_MIN_TARGETS_FOR_BONESTORM} or more targets`,
            }),
          )
          .recommended(`${formatPercentage(recommended)}%is recommended`),
      );
    }
  }

  get bonestormTooltip() {
    const tooltipRows = [];
    this.bsCasts.forEach((cast, index) => {
      const avgDamage = formatNumber(cast.hits.reduce((a, b) => a + b, 0) / cast.hits.length || 0);
      const totalDamage = formatNumber(cast.hits.reduce((a, b) => a + b, 0));
      const avgHits = formatNumber((cast.hits.length / cast.cost) * 100 || 0, 1);
      const rpCost = formatNumber(cast.cost / 10);

      tooltipRows.push(
        <div id={index}>
          Cast #{index + 1} (for {rpCost} RP) hit an average of {avgHits} target
          {avgHits <= 1 ? '' : 's'} for {avgDamage} per hit. ({totalDamage} total)
          <br />
        </div>,
      );
    });
    return tooltipRows;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BONESTORM_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(7)}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalDamageDone(this.totalBonestormDamage),
        )} %`}
        label="of your total damage"
        tooltip={this.bonestormTooltip}
      />
    );
  }
}

export default Bonestorm;
