import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvents } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor, GoodColor } from 'interface/guide';
import {
  RAPTOR_SWIPE_CAST_IMPACT,
  RAPTOR_SWIPE_STRIKE_AS_ONE,
} from '../../normalizers/RaptorSwipeNormalizer';

/**
 * Raptor Swipe - A cone slash dealing physical damage to all nearby enemies.
 * Should always be cast with Tip of the Spear active to proc Strike as One.
 */

class RaptorSwipe extends Analyzer {
  private useEntries: BoxRowEntry[] = [];
  private casts = 0;
  private tippedCasts = 0;
  private missedCasts = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.RAPTOR_SWIPE_1_SURVIVAL_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAPTOR_SWIPE_DAMAGE),
      this.onCast,
    );
  }

  private onCast = (event: CastEvent) => {
    this.casts += 1;

    const damageEvents = GetRelatedEvents<DamageEvent>(event, RAPTOR_SWIPE_CAST_IMPACT);
    const strikeAsOneEvents = GetRelatedEvents<DamageEvent>(event, RAPTOR_SWIPE_STRIKE_AS_ONE);
    const strikeAsOneDamage = strikeAsOneEvents.reduce(
      (sum, dmg) => sum + dmg.amount + (dmg.absorbed ?? 0),
      0,
    );
    const hitSomething = damageEvents.length > 0;
    const wasTipped = this.selectedCombatant.hasBuff(
      SPELLS.TIP_OF_THE_SPEAR_CAST.id,
      event.timestamp,
    );

    if (wasTipped) {
      this.tippedCasts += 1;
    }
    if (!hitSomething) {
      this.missedCasts += 1;
    }

    let value: QualitativePerformance;
    let header: string;
    let color: string;

    if (!hitSomething) {
      value = QualitativePerformance.Fail;
      header = 'Bad cast: missed all targets.';
      color = BadColor;
    } else if (wasTipped) {
      value = QualitativePerformance.Good;
      header = 'Good cast: tipped.';
      color = GoodColor;
    } else {
      value = QualitativePerformance.Fail;
      header = 'Bad cast: no tip.';
      color = BadColor;
    }

    const targetsHit = damageEvents.length;
    const swipeDamage = damageEvents.reduce(
      (sum, dmg) => sum + dmg.amount + (dmg.absorbed ?? 0),
      0,
    );
    const tooltip = (
      <div>
        <h5 style={{ color }}>{header}</h5>
        <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
        <div>
          <SpellLink spell={SPELLS.RAPTOR_SWIPE_DAMAGE} />: <strong>{targetsHit}</strong> targets
          hit <small>({formatNumber(swipeDamage)} damage)</small>
        </div>
        {strikeAsOneDamage > 0 && (
          <div>
            <SpellLink spell={SPELLS.STRIKE_AS_ONE} />: <strong>{strikeAsOneEvents.length}</strong>{' '}
            targets hit <small>({formatNumber(strikeAsOneDamage)} damage)</small>
          </div>
        )}
      </div>
    );

    this.useEntries.push({ value, tooltip });
  };

  get guideSubsection() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.RAPTOR_SWIPE_1_SURVIVAL_TALENT} />
        </strong>{' '}
        should always be cast with <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} />.
      </p>
    );

    const data = (
      <CastSummaryAndBreakdown
        spell={TALENTS.RAPTOR_SWIPE_1_SURVIVAL_TALENT}
        castEntries={this.useEntries}
        badExtraExplanation={<>without Tip of the Spear</>}
        usesInsteadOfCasts
      />
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    const tippedPercentage = this.casts > 0 ? (this.tippedCasts / this.casts) * 100 : 0;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.RAPTOR_SWIPE_1_SURVIVAL_TALENT}>
          <>
            {this.casts} <small>casts</small>
            <p>
              {this.tippedCasts} <small>tipped casts ({tippedPercentage.toFixed(1)}%)</small>
            </p>
            {this.missedCasts > 0 && (
              <>
                <p>
                  {this.missedCasts} <small>missed (hit no targets)</small>
                </p>
              </>
            )}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RaptorSwipe;
