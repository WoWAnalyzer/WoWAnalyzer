import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import { PassFailCheckmark } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import Events, { CastEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/druid/restoration/Guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

// TODO these mana values will probably need to be updated?
export const INNERVATE_MANA_REQUIRED = 9000;

class Innervate extends Analyzer {
  casts = 0;
  castsOnYourself = 0;
  manaSaved = 0;

  castTrackers: InnervateCast[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INNERVATE),
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

  onInnervate(event: CastEvent) {
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
      castTracker.targetId = event.targetID;
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
          <SpellLink id={SPELLS.INNERVATE.id} />
        </strong>{' '}
        is best used during your ramp, or any time when you expect to spam cast. Typically it should
        be used as soon as it's available. Remember to fit a Wild Growth inside the Innervate, as
        it's one of your most expensive spells.
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.castTrackers.map((cast, ix) => {
          const targetName = cast.targetId === undefined ? 'SELF' : 'ALLY';
          const metThresholdMana = cast.manaSaved >= INNERVATE_MANA_REQUIRED;
          const castWildGrowth =
            cast.casts.filter((c) => c.ability.guid === SPELLS.WILD_GROWTH.id).length > 0;
          const overallPerf =
            metThresholdMana && castWildGrowth
              ? QualitativePerformance.Good
              : QualitativePerformance.Fail;

          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink id={SPELLS.INNERVATE.id} /> ({formatNumber(cast.manaSaved)} mana saved)
            </>
          );

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: 'Chain-cast expensive spells',
            result: <PassFailCheckmark pass={metThresholdMana} />,
            details: <>(save at least {INNERVATE_MANA_REQUIRED} mana)</>,
          });
          checklistItems.push({
            label: (
              <>
                Cast <SpellLink id={SPELLS.WILD_GROWTH.id} />
              </>
            ),
            result: <PassFailCheckmark pass={castWildGrowth} />,
          });

          const detailItems: CooldownExpandableItem[] = [];
          detailItems.push({
            label: 'Used on',
            result: '',
            details: <>{targetName}</>,
          });
          detailItems.push({
            label: 'Casts during Innervate',
            result: '',
            details: (
              <>
                {cast.casts.map((c, iix) => (
                  <>
                    <SpellIcon id={c.ability.guid} key={iix} />{' '}
                  </>
                ))}
              </>
            ),
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
              <SpellIcon id={SPELLS.INNERVATE.id} /> Average mana saved
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
  /** ID of the player this Innervate was cast on, or undefined for a self cast */
  targetId?: number;
}

export default Innervate;
