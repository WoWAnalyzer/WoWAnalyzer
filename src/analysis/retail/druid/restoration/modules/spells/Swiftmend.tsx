import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import { PerformanceBoxRow } from 'interface/guide/shared/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

import {
  getDirectHeal,
  isFromHardcast,
} from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { getRemovedHot } from 'analysis/retail/druid/restoration/normalizers/SwiftmendNormalizer';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import { TALENTS_DRUID } from 'common/TALENTS';

const DEBUG = true;

const TRIAGE_THRESHOLD = 0.5;
const HIGH_VALUE_HOTS = [
  SPELLS.REJUVENATION.id,
  SPELLS.REJUVENATION_GERMINATION.id,
  SPELLS.WILD_GROWTH.id,
  SPELLS.LIFEBLOOM_HOT_HEAL,
  SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL,
];
const VERY_HIGH_VALUE_HOT = SPELLS.CENARION_WARD_HEAL.id;

/**
 * Tracks things related to casting Swiftmend
 */
class Swiftmend extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    combatants: Combatants,
  };

  hotTracker!: HotTrackerRestoDruid;
  combatants!: Combatants;

  /** Hardcast healing only so we can get mana effic without Convoke messing with us */
  hardcastSwiftmendHealing: number = 0;
  /** If player has Verdant Infusion, so we know if HoTs are being extended or removed. */
  hasVi: boolean;
  /** If player has Soul of the Forest, so we can track justification of casts */
  hasSotf: boolean;
  /** If player has Reforestation, so we can track justification of casts */
  hasReforestation: boolean;
  /** Number of procs player has from Swiftmend (between VI, SotF, and Reforestation) */
  numProcs: number;
  /** Info about each Swiftmend cast */
  swiftmendCastInfo: CastInfo[] = [];

  constructor(options: Options) {
    super(options);

    this.hasVi = this.selectedCombatant.hasTalent(TALENTS_DRUID.VERDANT_INFUSION_TALENT);
    this.hasSotf = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT,
    );
    this.hasReforestation = this.selectedCombatant.hasTalent(TALENTS_DRUID.REFORESTATION_TALENT);
    this.numProcs = (this.hasVi ? 1 : 0) + (this.hasSotf ? 1 : 0) + (this.hasReforestation ? 1 : 0);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.onSwiftmendCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.onSwiftmendHeal,
    );
  }

  onSwiftmendHeal(event: HealEvent) {
    if (isFromHardcast(event)) {
      this.hardcastSwiftmendHealing += event.amount + (event.absorbed || 0);
    }
  }

  onSwiftmendCast(event: CastEvent) {
    const timestamp = event.timestamp;
    const directHeal = getDirectHeal(event);
    let targetHealthPercent = undefined;
    if (directHeal) {
      // technically the amount absorbed shouldn't be counted when calculating health before heal,
      // but because heal absorbs are important to remove we'll consider this legit triage
      const effectiveHealing = directHeal.amount + (directHeal.absorbed || 0);
      const hitPointsBeforeHeal = directHeal.hitPoints - effectiveHealing;
      targetHealthPercent = hitPointsBeforeHeal / directHeal.maxHitPoints;
    }
    const targetName = this.combatants.getEntity(event)?.name;

    if (this.hasVi) {
      let extendedHots: SpellIdAndName[] = [];
      const target = this.combatants.getEntity(event);
      if (target && this.hotTracker.hots[target.id]) {
        extendedHots = Object.values(this.hotTracker.hots[target.id]).map((tracker) => ({
          name: tracker.name,
          id: tracker.spellId,
        }));
      }
      this.swiftmendCastInfo.push({ timestamp, extendedHots, targetHealthPercent, targetName });
      DEBUG && console.log('Swiftmend extended ' + extendedHots);
    } else {
      const removedHotHeal = getRemovedHot(event);
      const removedHot = removedHotHeal
        ? { name: removedHotHeal.ability.name, id: removedHotHeal.ability.guid }
        : undefined;
      this.swiftmendCastInfo.push({ timestamp, removedHot, targetHealthPercent, targetName });
      DEBUG && console.log('Swiftmend removed ' + removedHot);
    }
  }

  /** Guide fragment describing the proper usage of Swiftmend */
  get guideFragment(): JSX.Element {
    // Build up description of chart, which varies based on talents
    let chartDescription = ' - ';
    if (this.hasVi) {
      // has proc(s) including VI
      chartDescription +=
        'Blue is great (extended high value HoTs), Green is a fine cast, Yellow is a non-triage (>50% health) cast (still acceptable for generating procs).';
    } else if (this.numProcs > 0) {
      // has proc(s), but VI isn't one of them
      chartDescription +=
        'Green is a fine cast, Yellow is a non-triage (>50% health) cast that removes a WG or Rejuv (still acceptable for generating procs).';
    } else {
      // no procs
      chartDescription +=
        'Green is a fine cast, Red is a non-triage (>50% health) cast that removes a WG or Rejuv.';
    }
    chartDescription += ' Mouseover for more details.';

    // Build up perf boxes for each cast, which vary a lot based on talents
    const castPerfBoxes = this.swiftmendCastInfo.map((cast) => {
      const wasTriage = cast.targetHealthPercent && cast.targetHealthPercent <= TRIAGE_THRESHOLD;
      const targetName = cast.targetName || 'unknown target';
      const targetHealthString = cast.targetHealthPercent
        ? (cast.targetHealthPercent * 100).toFixed(0)
        : 'unknown';
      let value: QualitativePerformance;
      let hotTooltip: JSX.Element;
      if (this.hasVi) {
        const extendedIds = cast.extendedHots ? cast.extendedHots.map((hot) => hot.id) : [];
        const extendedHighValue =
          extendedIds.includes(VERY_HIGH_VALUE_HOT) ||
          extendedIds.filter((id) => HIGH_VALUE_HOTS.includes(id)).length >= 2;
        if (extendedHighValue) {
          value = 'perfect';
        } else if (wasTriage) {
          value = 'good';
        } else {
          value = 'ok';
        }
        if (extendedIds.length === 0) {
          hotTooltip = <> extended unknown HoT</>;
        } else {
          hotTooltip = (
            <>
              {' '}
              extended <strong>{cast.extendedHots?.map((hot) => ' ' + hot.name)}</strong>
            </>
          );
        }
      } else {
        const removedHighValue =
          HIGH_VALUE_HOTS.find((id) => id === cast.removedHot?.id) !== undefined;
        if (wasTriage || !removedHighValue) {
          value = 'good';
        } else if (this.numProcs > 0) {
          value = 'ok';
        } else {
          value = 'fail';
        }
        const removedHotName = cast.removedHot?.name || 'unknown HoT';
        hotTooltip = (
          <>
            {' '}
            removed <strong>{removedHotName}</strong>
          </>
        );
      }

      const tooltip = (
        <>
          @ <strong>{this.owner.formatTimestamp(cast.timestamp)}</strong>
          <br />
          targetting <strong>{targetName}</strong> w/ {targetHealthString}% health
          <br />
          {hotTooltip}
        </>
      );

      return { value, tooltip };
    });

    return (
      <>
        <p>
          <b>
            <SpellLink id={SPELLS.SWIFTMEND.id} />
          </b>{' '}
          is our emergency heal but it removes a HoT on its target, hurting overall throughput.
          Normally it should only be used on targets who need urgent healing.
          <br />
          {this.numProcs === 1 &&
            `However, you have a proc that is generated by casting Swiftmend: `}
          {this.numProcs > 1 && `However, you have procs that are generated by casting Swiftmend: `}
          {this.hasSotf && (
            <>
              <SpellLink id={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT.id} />
              &nbsp;
            </>
          )}
          {this.hasVi && (
            <>
              <SpellLink id={SPELLS.VERDANT_INFUSION.id} />
              &nbsp;
            </>
          )}
          {this.hasReforestation && (
            <>
              <SpellLink id={SPELLS.RESTO_DRUID_TIER_28_4P_SET_BONUS.id} /> (the Tier 4pc)&nbsp;
            </>
          )}
          {this.numProcs > 0 && (
            <>
              {this.numProcs === 1 ? `This ability is ` : `These abilities are `}very powerful, so
              you should cast Swiftmend frequently in order to generate procs - even on targets who
              don't need urgent healing.
            </>
          )}
        </p>
        <p>
          <strong>Swiftmend casts</strong>
          <small>{chartDescription}</small>
          <PerformanceBoxRow values={castPerfBoxes} />
        </p>
      </>
    );
  }
}

type CastInfo = {
  timestamp: number;
  removedHot?: SpellIdAndName;
  extendedHots?: SpellIdAndName[];
  targetHealthPercent?: number;
  targetName?: string;
};

type SpellIdAndName = {
  name: string;
  id: number;
};

export default Swiftmend;
