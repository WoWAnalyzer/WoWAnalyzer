import type { JSX } from 'react';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvents } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor, GoodColor, PerfectColor } from 'interface/guide';
import { WILDFIRE_BOMB_CAST_IMPACT } from '../../normalizers/WildfireBombNormalizer';

const DAMAGE_GROUPING_WINDOW_MS = 200;

/**
 * Hurl a bomb at the target, exploding for (45% of Attack power) Fire damage in a cone and coating enemies in wildfire, scorching them for (90% of Attack power) Fire damage over 6 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/6GjD12YkQCnJqPTz#fight=25&type=damage-done&source=19&translate=true&ability=-259495
 */

class WildfireBomb extends Analyzer.withDependencies({
  enemies: Enemies,
}) {
  private useEntries: BoxRowEntry[] = [];
  private casts = 0;
  private tippedCasts = 0;
  private totalDamage = 0;
  private totalTargetsHit = 0;
  private sentinelProcs = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.WILDFIRE_BOMB_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.WILDFIRE_BOMB_TALENT),
      this.onCast,
    );
  }

  private onCast = (event: CastEvent) => {
    this.casts += 1;

    const allDamageEvents = GetRelatedEvents<DamageEvent>(event, WILDFIRE_BOMB_CAST_IMPACT);
    // Bomb can take up to 2000ms to hit so normalizer requires a wide link window.
    // This can cause overlapping damage events on a back to back cast so we only keep events near first impact.
    // Therefore if we collect only events within a short window, we keep them with their cast.
    const firstDamageEvent = allDamageEvents.length > 0 ? allDamageEvents[0] : undefined;
    const damageEvents = firstDamageEvent
      ? allDamageEvents.filter(
          (dmg) => dmg.timestamp - firstDamageEvent.timestamp <= DAMAGE_GROUPING_WINDOW_MS,
        )
      : [];

    const wasTipped = firstDamageEvent
      ? this.selectedCombatant.hasBuff(SPELLS.TIP_OF_THE_SPEAR_CAST.id, firstDamageEvent.timestamp)
      : false;

    // Check if any target had Sentinel's Mark debuff when impact hit
    const hadSentinelProc = damageEvents.some((dmg) => {
      const enemy = this.deps.enemies.getEntity(dmg);
      return enemy?.hasBuff(SPELLS.SENTINELS_MARK_DEBUFF.id, dmg.timestamp) ?? false;
    });

    const targetsHit = damageEvents.length;
    const castDamage = damageEvents.reduce((sum, dmg) => sum + dmg.amount + (dmg.absorbed ?? 0), 0);

    this.totalTargetsHit += targetsHit;
    this.totalDamage += castDamage;

    if (wasTipped) {
      this.tippedCasts += 1;
    }

    if (hadSentinelProc) {
      this.sentinelProcs += 1;
    }

    // Classify performance: Perfect if tipped + sentinel proc, Good if just tipped, Fail if not tipped
    let value: QualitativePerformance;
    let header: string;
    let color: string;

    if (wasTipped && hadSentinelProc) {
      value = QualitativePerformance.Perfect;
      header = "Perfect: tipped and proc'd Sentinel's Mark.";
      color = PerfectColor;
    } else if (wasTipped) {
      value = QualitativePerformance.Good;
      header = 'Good cast: tipped.';
      color = GoodColor;
    } else {
      value = QualitativePerformance.Fail;
      header = 'Bad cast: no tip.';
      color = BadColor;
    }

    const targetName = this.owner.getTargetName(event);
    const tooltip = (
      <div>
        <h5 style={{ color }}>{header}</h5>
        <strong>{this.owner.formatTimestamp(event.timestamp)}</strong> targeting{' '}
        <strong>{targetName || 'unknown'}</strong>
        <div>
          <strong>{targetsHit}</strong> targets hit{' '}
          <small>({formatNumber(castDamage)} damage)</small>
        </div>
        <div>
          <strong>Total Damage:</strong> {formatNumber(castDamage)}
        </div>
      </div>
    );

    this.useEntries.push({ value, tooltip });
  };

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} />
        </strong>{' '}
        should always be cast with <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST.id} />. Bombs that
        hit a target with <SpellLink spell={SPELLS.SENTINELS_MARK_DEBUFF} /> are perfect casts.
      </p>
    );

    const data = (
      <div>
        <CastSummaryAndBreakdown
          spell={TALENTS.WILDFIRE_BOMB_TALENT}
          castEntries={this.useEntries}
          badExtraExplanation={<>without Tip of the Spear</>}
          usesInsteadOfCasts
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    const avgTargetsHit = this.casts > 0 ? this.totalTargetsHit / this.casts : 0;
    const tippedPercentage = this.casts > 0 ? (this.tippedCasts / this.casts) * 100 : 0;
    const sentinelPercentage = this.casts > 0 ? (this.sentinelProcs / this.casts) * 100 : 0;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(0)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.WILDFIRE_BOMB_TALENT}>
          <>
            <ItemDamageDone amount={this.totalDamage} />
            <br />
            {this.casts} <small>casts</small>
            <br />
            {this.tippedCasts} <small>tipped casts ({tippedPercentage.toFixed(1)}%)</small>
            <br />
            {this.sentinelProcs}{' '}
            <small>Sentinel's Mark procs ({sentinelPercentage.toFixed(1)}%)</small>
            <br />
            {avgTargetsHit.toFixed(2)} <small>avg targets hit</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WildfireBomb;
