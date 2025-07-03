import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import { PerformanceMark } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/druid/restoration/Guide';
import { evaluateQualitativePerformanceByThreshold } from 'parser/ui/QualitativePerformance';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { abilityToSpell } from 'common/abilityToSpell';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { TALENTS_DRUID } from 'common/TALENTS';

const GOOD_RAMP_ACTIVE_THRESHOLD = 0.85;
const OK_RAMP_ACTIVE_THRESHOLD = 0.6;

const RAMP_SPELL_IDS: number[] = [
  SPELLS.REJUVENATION.id,
  SPELLS.REJUVENATION_GERMINATION.id,
  SPELLS.WILD_GROWTH.id,
  TALENTS_DRUID.LIFEBLOOM_TALENT.id,
  SPELLS.EFFLORESCENCE_CAST.id,
  SPELLS.SWIFTMEND.id,
  SPELLS.TRANQUILITY_CAST.id,
];

class Innervate extends Analyzer {
  static dependencies = {
    alwaysBeCasting: AlwaysBeCasting,
  };
  protected alwaysBeCasting!: AlwaysBeCasting;

  casts = 0;
  castsOnYourself = 0;
  manaSaved = 0;

  castTrackers: InnervateCast[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.INNERVATE),
      this.onInnervate,
    );
  }

  onCast(event: CastEvent) {
    // only interested in casts that cost mana
    const manaEvent = event.rawResourceCost;
    if (manaEvent === undefined) {
      return;
    }

    // Innervate cast already handled in `onInnervate`
    if (event.ability.guid === SPELLS.INNERVATE.id) {
      return;
    }

    // If it's during Innervate, tally the casts that happened
    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      if (!CASTS_THAT_ARENT_CASTS.includes(event.ability.guid) && this.castTrackers.length > 0) {
        // we want to at least keep track of all abilites during the innervate, not just ones that cost mana
        this.castTrackers[this.castTrackers.length - 1].casts.push(event);
      }

      //checks if the spell costs anything (we don't just use cost since some spells don't play nice)
      if (Object.keys(manaEvent).length !== 0) {
        const manaSavedFromThisCast = manaEvent[0];
        this.manaSaved += manaSavedFromThisCast;
        if (this.castTrackers.length > 0) {
          this.castTrackers[this.castTrackers.length - 1].manaSaved += manaSavedFromThisCast;
        }
      }
    }
  }

  onInnervate(event: ApplyBuffEvent) {
    this.casts += 1;

    const castTracker: InnervateCast = {
      timestamp: event.timestamp,
      casts: [],
      manaSaved: 0,
    };
    this.castTrackers.push(castTracker);

    if (event.targetID === event.sourceID) {
      this.castsOnYourself += 1;
    } else {
      castTracker.sourceId = event.sourceID;
    }
  }

  get manaSavedPerInnervate() {
    if (this.casts === 0) {
      return 0;
    }
    return this.manaSaved / this.casts;
  }

  get guideCastBreakdown() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.INNERVATE} />
        </strong>{' '}
        is best used during your ramp, or any time when you expect to spam cast. Typically it should
        be used as soon as it's available. Remember to spam cast expensive spells to make the most
        of it.
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.castTrackers.map((cast, ix) => {
          const sourceName = cast.sourceId === undefined ? 'SELF' : 'EXTERNAL';
          const endTime = Math.min(this.owner.fight.end_time, cast.timestamp + 8_000);
          const activeRampSpellTime = this.alwaysBeCasting.getActiveTimeMillisecondsFiltered(
            cast.timestamp,
            endTime,
            RAMP_SPELL_IDS,
          );
          const activeRampSpellPercent = activeRampSpellTime / (endTime - cast.timestamp);

          const activePerf = evaluateQualitativePerformanceByThreshold({
            actual: activeRampSpellPercent,
            isGreaterThanOrEqual: {
              good: GOOD_RAMP_ACTIVE_THRESHOLD,
              ok: OK_RAMP_ACTIVE_THRESHOLD,
            },
          });

          const overallPerf = activePerf;

          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={SPELLS.INNERVATE} /> ({formatNumber(cast.manaSaved)} mana saved)
            </>
          );

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: "High active time casting 'ramp' spells",
            result: <PerformanceMark perf={activePerf} />,
            details: <>({formatPercentage(activeRampSpellPercent, 0)}% active ramp time)</>,
          });

          const detailItems: CooldownExpandableItem[] = [];
          detailItems.push({
            label: 'Gained from',
            result: '',
            details: <>{sourceName}</>,
          });
          detailItems.push({
            label: 'Mana saved',
            result: '',
            details: <>{cast.manaSaved}</>,
          });
          detailItems.push({
            label: 'Casts during Innervate',
            result: '',
            details: cast.casts.map((c, iix) => (
              <span key={iix}>
                <SpellIcon spell={abilityToSpell(c.ability)} />{' '}
              </span>
            )),
          });

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              detailItems={detailItems}
              perf={overallPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(25)} // chosen for fixed ordering of general stats
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={SPELLS.INNERVATE} /> Average mana saved
            </>
          }
        >
          <>{formatNumber(this.manaSavedPerInnervate)}</>
        </BoringValueText>
      </Statistic>
    );
  }
}

interface InnervateCast {
  /** Timestamp of the start of the Tranquility channel */
  timestamp: number;
  /** The spells the player cast during Innervate, in order */
  casts: CastEvent[];
  /** The mana saved by the player */
  manaSaved: number;
  /** ID of the player that cast Innervate on the selected player, or undefined for self casts */
  sourceId?: number;
}

export default Innervate;
