import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

import {
  getDirectHeal,
  isFromHardcast,
} from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { getRemovedHot } from 'analysis/retail/druid/restoration/normalizers/SwiftmendNormalizer';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import { TALENTS_DRUID } from 'common/TALENTS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { calculateHealTargetHealthPercent } from 'parser/core/EventCalculateLib';
import { formatPercentage } from 'common/format';

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
  // /** Info about each Swiftmend cast */
  // swiftmendCastInfo: CastInfo[] = [];
  /** Box row entry for each Swiftmend cast */
  castEntries: BoxRowEntry[] = [];

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
    const directHeal = getDirectHeal(event);
    const targetHealthPercent = directHeal
      ? calculateHealTargetHealthPercent(directHeal, true)
      : undefined;
    const target = this.combatants.getEntity(event);
    if (!target) {
      console.warn("Couldn't find target for Swiftmend cast", event);
      return; // can't do further handling without target
    }
    const wasTriage = targetHealthPercent && targetHealthPercent <= TRIAGE_THRESHOLD;
    const targetHealthPercentText = targetHealthPercent
      ? formatPercentage(targetHealthPercent, 0)
      : 'unknown';

    /*
     * Build value and tooltip text depending on if player had VI
     */

    let hotChangeText: React.ReactNode = '';
    let value: QualitativePerformance;
    if (this.hasVi) {
      const extendedHotIds: number[] = [];
      if (this.hotTracker.hots[target.id]) {
        Object.values(this.hotTracker.hots[target.id]).forEach((tracker) =>
          extendedHotIds.push(tracker.spellId),
        );
      }
      const extendedHighValue =
        extendedHotIds.includes(VERY_HIGH_VALUE_HOT) ||
        extendedHotIds.filter((id) => HIGH_VALUE_HOTS.includes(id)).length >= 2;
      if (extendedHighValue) {
        value = QualitativePerformance.Perfect;
      } else if (wasTriage) {
        value = QualitativePerformance.Good;
      } else {
        value = QualitativePerformance.Ok;
      }

      if (extendedHotIds.length === 0) {
        hotChangeText = 'extended Nothing!';
      } else {
        hotChangeText = (
          <>
            extended{' '}
            <strong>
              {extendedHotIds.map((id, index) => (
                <>
                  <SpellLink key={id} id={id} />{' '}
                </>
              ))}
            </strong>
          </>
        );
      }
    } else {
      const removedHotHeal = getRemovedHot(event);

      const removedHighValue =
        HIGH_VALUE_HOTS.find((id) => id === removedHotHeal?.ability.guid) !== undefined;
      if (wasTriage || !removedHighValue) {
        value = QualitativePerformance.Good;
      } else if (this.numProcs > 0) {
        value = QualitativePerformance.Ok;
      } else {
        value = QualitativePerformance.Fail;
      }

      hotChangeText = (
        <>
          removed{' '}
          <strong>
            {removedHotHeal ? <SpellLink id={removedHotHeal.ability.guid} /> : 'unknown HoT'}
          </strong>
        </>
      );
    }

    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
        <br />
        targetting <strong>{target.name}</strong> w/ <strong>{targetHealthPercentText}%</strong>{' '}
        health
        <br />
        {hotChangeText}
      </>
    );

    this.castEntries.push({ value, tooltip });
  }

  /** Guide subsectopm describing the proper usage of Swiftmend */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={SPELLS.SWIFTMEND.id} />
        </b>{' '}
        is our emergency heal that removes a HoT on its target, hurting overall throughput. Use only
        on targets who need urgent healing.
        <br />
        {this.numProcs === 1 && `However, you have a proc that is generated by casting Swiftmend: `}
        {this.numProcs > 1 && `However, you have procs that are generated by casting Swiftmend: `}
        {this.hasSotf && (
          <>
            <SpellLink id={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT.id} />
            &nbsp;
          </>
        )}
        {this.hasVi && (
          <>
            <SpellLink id={TALENTS_DRUID.VERDANT_INFUSION_TALENT.id} />
            &nbsp;
          </>
        )}
        {this.hasReforestation && (
          <>
            <SpellLink id={TALENTS_DRUID.REFORESTATION_TALENT.id} />
            &nbsp;
          </>
        )}
        {this.numProcs > 0 && (
          <>
            {this.numProcs === 1 ? ` - this ability is ` : ` - these abilities are `} powerful. Cast
            Swiftmend frequently in order to generate procs - even on targets who don't need it.
          </>
        )}
      </p>
    );

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

    const data = (
      <div>
        <strong>Swiftmend casts</strong>
        <small>{chartDescription}</small>
        <PerformanceBoxRow values={this.castEntries} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default Swiftmend;
