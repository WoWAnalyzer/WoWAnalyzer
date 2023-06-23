import { t, Trans } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';

const SUGGESTED_MIN_TARGETS_FOR_BONESTORM = 1.5;
const SUGGESTED_RUNIC_POWER_SPENT = 100;

class Bonestorm extends Analyzer {
  bsCasts: Array<{ cost: number; hits: number[] }> = [];
  totalBonestormDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BONESTORM_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BONESTORM_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BONESTORM_TALENT_HIT),
      this.onDamage,
    );
  }

  onCast(event: CastEvent) {
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

  onDamage(event: DamageEvent) {
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
    if (this.selectedCombatant.has2PieceByTier(TIERS.T28)) {
      return this.bsCasts.filter((cast) => cast.cost / 10 === SUGGESTED_RUNIC_POWER_SPENT).length;
    } else {
      return this.bsCasts.filter(
        (cast) => cast.hits.length / (cast.cost / 100) >= SUGGESTED_MIN_TARGETS_FOR_BONESTORM,
      ).length;
    }
  }

  get totalBonestormCasts() {
    return this.bsCasts.length;
  }

  get suggestionThresholds(): NumberThreshold {
    return {
      actual: this.goodBonestormCasts / this.totalBonestormCasts,
      isLessThan: {
        minor: 1,
        average: 0.8,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    if (this.selectedCombatant.has2PieceByTier(TIERS.T28)) {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <Trans id="deathknight.blood.bonestorm.suggestion.2p.suggestion">
            Try to cast <SpellLink spell={TALENTS.BONESTORM_TALENT} /> only when you have 100 or
            more Runic Power. The main purpose of <SpellLink spell={TALENTS.BONESTORM_TALENT} />{' '}
            once you have 2-piece is to quickly spend Runic Power on a high Damage Per Execution
            Time (DPET) ability.
          </Trans>,
        )
          .icon(TALENTS.BONESTORM_TALENT.icon)
          .actual(
            t({
              id: 'deathknight.blood.bonestorm.suggestion.2p.actual',
              message: `${formatPercentage(
                actual,
              )}% casts spent ${SUGGESTED_RUNIC_POWER_SPENT} Runic Power`,
            }),
          )
          .recommended(
            t({
              id: 'deathknight.blood.bonestorm.suggestion.2p.recommended',
              message: `${formatPercentage(recommended)}% is recommended`,
            }),
          ),
      );
    } else {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <Trans id="deathknight.blood.bonestorm.suggestion.suggestion">
            Try to cast <SpellLink spell={TALENTS.BONESTORM_TALENT} /> only if you can reliable hit
            2 or more targets to maximize the damage and healing. Casting{' '}
            <SpellLink spell={TALENTS.BONESTORM_TALENT} /> with only one target in range is only a
            minor DPS gain (~10 DPS) at the cost of pooling Runic Power, use{' '}
            <SpellLink spell={TALENTS.DEATH_STRIKE_TALENT} /> instead.
          </Trans>,
        )
          .icon(TALENTS.BONESTORM_TALENT.icon)
          .actual(
            t({
              id: 'deathknight.blood.bonestorm.suggestion.actual',
              message: `${formatPercentage(
                actual,
              )}% casts hit ${SUGGESTED_MIN_TARGETS_FOR_BONESTORM} or more targets`,
            }),
          )
          .recommended(
            t({
              id: 'deathknight.blood.bonestorm.suggestion.recommended',
              message: `${formatPercentage(recommended)}% is recommended`,
            }),
          ),
      );
    }
  }

  get bonestormTooltip() {
    return this.bsCasts.map((cast, index) => {
      const avgDamage = formatNumber(cast.hits.reduce((a, b) => a + b, 0) / cast.hits.length || 0);
      const totalDamage = formatNumber(cast.hits.reduce((a, b) => a + b, 0));
      const avgHits = Number(((cast.hits.length / cast.cost) * 100 || 0).toFixed(1));
      const rpCost = formatNumber(cast.cost / 10);

      return (
        <Trans id="deathknight.blood.bonestorm.tooltipRow" key={index}>
          <div>
            Cast #{index + 1} (for {rpCost} RP) hit an average of {avgHits} target
            {avgHits <= 1 ? '' : 's'} for {avgDamage} per hit. ({totalDamage} total)
            <br />
          </div>
        </Trans>
      );
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(7)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={this.bonestormTooltip}
      >
        <BoringSpellValueText spell={TALENTS.BONESTORM_TALENT}>
          <ItemPercentDamageDone amount={this.totalBonestormDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Bonestorm;
