import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, EventType, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import { PerformanceBoxRow } from 'parser/ui/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

import { getHeals, isFromHardcast } from '../../normalizers/CastLinkNormalizer';
import { getRemovedHot } from '../../normalizers/SwiftmendNormalizer';
import HotTrackerRestoDruid from '../core/hottracking/HotTrackerRestoDruid';

const DEBUG = true;

const TRIAGE_THRESHOLD = 0.5;
const HIGH_VALUE_HOTS = [
  SPELLS.REJUVENATION.id,
  SPELLS.REJUVENATION_GERMINATION.id,
  SPELLS.WILD_GROWTH.id,
  SPELLS.LIFEBLOOM_HOT_HEAL,
  SPELLS.LIFEBLOOM_DTL_HOT_HEAL,
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
  /** If player has a proc from Swiftmend, so we can track justification of casts */
  hasProc: boolean;
  /** Info about each Swiftmend cast */
  swiftmendCastInfo: CastInfo[] = [];

  constructor(options: Options) {
    super(options);

    this.hasVi = this.selectedCombatant.hasLegendary(SPELLS.VERDANT_INFUSION);
    this.hasProc =
      this.hasVi ||
      this.selectedCombatant.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION) ||
      this.selectedCombatant.has4Piece();
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
    const linkedHeals = getHeals(event);
    let targetHealthPercent = undefined;
    if (linkedHeals.length > 0 && linkedHeals[0].type === EventType.Heal) {
      // technically the amount absorbed shouldn't be counted when calculating health before heal,
      // but because heal absorbs are important to remove we'll consider this legit triage
      const healEvent = linkedHeals[0];
      const effectiveHealing = healEvent.amount + (healEvent.absorbed || 0);
      const hitPointsBeforeHeal = healEvent.hitPoints - effectiveHealing;
      targetHealthPercent = hitPointsBeforeHeal / healEvent.maxHitPoints;
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

  get guideTimeline() {
    const values = this.swiftmendCastInfo.map((cast) => {
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
        } else if (this.hasProc) {
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
    return <PerformanceBoxRow values={values} />;
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
