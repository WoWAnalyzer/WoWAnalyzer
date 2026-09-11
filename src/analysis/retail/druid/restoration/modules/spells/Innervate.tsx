import { formatNumber } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { PassFailCheckmark } from 'interface/guide';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/druid/restoration/Guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ClassResources, ResourceChangeEvent } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const INNERVATE_DURATION_MS = 8_000;
const MANA_CHECK_AFTER_BUFF_MS = 5_000;
/** Total window to evaluate mana capping: buff duration + grace period after */
const MANA_CHECK_WINDOW_MS = INNERVATE_DURATION_MS + MANA_CHECK_AFTER_BUFF_MS;

/**
 * **Innervate**
 * Spec Talent
 *
 * Causes the target to regenerate 25% of their maximum mana over 8 sec.
 * Resto should cast on self on cooldown, as long as it won't cause mana waste.
 */
class Innervate extends Analyzer {
  castTrackers: InnervateCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.INNERVATE_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INNERVATE),
      this.onInnervateCast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.resourcechange.to(SELECTED_PLAYER), this.onResourceChange);
  }

  onInnervateCast(event: CastEvent) {
    this.castTrackers.push({
      timestamp: event.timestamp,
      castOnSelf: event.targetID === event.sourceID,
      manaCapped: false,
      manaGained: 0,
      manaWasted: 0,
    });
    // Casting at (or immediately to) full mana should fail the waste check
    this.checkManaCap(event.timestamp, this.getManaResource(event.classResources));
  }

  onCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.INNERVATE.id) {
      return;
    }
    this.checkManaCap(event.timestamp, this.getManaResource(event.classResources));
  }

  onResourceChange(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.MANA.id) {
      return;
    }

    const cast = this.getActiveSelfCast(event.timestamp);
    if (!cast) {
      return;
    }

    if (event.ability.guid === SPELLS.INNERVATE.id) {
      cast.manaGained += event.resourceChange - event.waste;
      cast.manaWasted += event.waste;
      if (event.waste > 0 && !cast.manaCapped) {
        cast.manaCapped = true;
        cast.cappedAt = event.timestamp;
      }
    }

    this.checkManaCap(event.timestamp, this.getManaResource(event.classResources));
  }

  private getActiveSelfCast(timestamp: number): InnervateCast | undefined {
    for (let i = this.castTrackers.length - 1; i >= 0; i -= 1) {
      const cast = this.castTrackers[i];
      if (!cast.castOnSelf) {
        continue;
      }
      if (timestamp < cast.timestamp) {
        continue;
      }
      if (timestamp <= cast.timestamp + MANA_CHECK_WINDOW_MS) {
        return cast;
      }
      break;
    }
    return undefined;
  }

  private getManaResource(
    classResources: ClassResources[] | undefined,
  ): ClassResources | undefined {
    return classResources?.find((resource) => resource.type === RESOURCE_TYPES.MANA.id);
  }

  private checkManaCap(timestamp: number, mana: ClassResources | undefined) {
    if (!mana || mana.max <= 0) {
      return;
    }
    const cast = this.getActiveSelfCast(timestamp);
    if (!cast || cast.manaCapped) {
      return;
    }
    if (mana.amount >= mana.max) {
      cast.manaCapped = true;
      cast.cappedAt = timestamp;
    }
  }

  /** Guide fragment showing a breakdown of each Innervate cast */
  get guideCastBreakdown() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.INNERVATE} />
        </strong>{' '}
        regenerates 25% of your maximum mana over 8 seconds. Resto Druids should always cast it on
        themselves, and use it on cooldown whenever it will not waste mana. A cast is good as long
        as you never hit maximum mana while the buff is up or in the 5 seconds after it ends.
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.castTrackers.map((cast, ix) => {
          const noManaWaste = cast.castOnSelf && !cast.manaCapped;
          const overallPerf =
            cast.castOnSelf && noManaWaste
              ? QualitativePerformance.Good
              : QualitativePerformance.Fail;

          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={SPELLS.INNERVATE} />
              {cast.castOnSelf ? (
                <>
                  {' '}
                  ({formatNumber(cast.manaGained)} mana
                  {cast.manaWasted > 0 ? `, ${formatNumber(cast.manaWasted)} wasted` : ''})
                </>
              ) : (
                <> (cast on ally)</>
              )}
            </>
          );

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: 'Cast on yourself',
            result: <PassFailCheckmark pass={cast.castOnSelf} />,
          });
          checklistItems.push({
            label: 'Did not hit max mana during buff or 5s after',
            result: <PassFailCheckmark pass={noManaWaste} />,
            details: cast.manaCapped ? (
              <>
                (capped @{' '}
                {cast.cappedAt !== undefined ? this.owner.formatTimestamp(cast.cappedAt) : '?'})
              </>
            ) : cast.castOnSelf ? (
              <>({formatNumber(cast.manaGained)} mana gained)</>
            ) : undefined,
          });

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

interface InnervateCast {
  timestamp: number;
  castOnSelf: boolean;
  /** True if mana hit 100% at any point during the buff or 5s after */
  manaCapped: boolean;
  /** Timestamp when mana first hit max, if capped */
  cappedAt?: number;
  /** Effective mana gained from Innervate energize ticks */
  manaGained: number;
  /** Mana wasted (overcapped) on Innervate energize ticks */
  manaWasted: number;
}

export default Innervate;
