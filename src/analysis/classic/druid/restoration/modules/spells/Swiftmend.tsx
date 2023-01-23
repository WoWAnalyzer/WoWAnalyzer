import SPELLS from 'common/SPELLS/classic';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

import {
  getDirectHeal,
  isFromHardcast,
} from 'analysis/classic/druid/restoration/modules/normalizers/CastLinkNormalizer';
import { getRemovedHot } from 'analysis/classic/druid/restoration/modules/normalizers/SwiftmendNormalizer';
import HotTrackerRestoDruid from 'analysis/classic/druid/restoration/modules/core/HotTrackerRestoDruid';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { calculateHealTargetHealthPercent } from 'parser/core/EventCalculateLib';
import { formatPercentage } from 'common/format';

const TRIAGE_THRESHOLD = 0.5;
const HIGH_VALUE_HOTS = [SPELLS.REJUVENATION.id, SPELLS.WILD_GROWTH.id, SPELLS.LIFEBLOOM];

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
  // /** Info about each Swiftmend cast */
  // swiftmendCastInfo: CastInfo[] = [];
  /** Box row entry for each Swiftmend cast */
  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);

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

    const removedHotHeal = getRemovedHot(event);

    let unglyphed = false;
    if (removedHotHeal) {
      // Removed a HoT so can't have glyph
      unglyphed = true;
    }

    const removedHighValue =
      HIGH_VALUE_HOTS.find((id) => id === removedHotHeal?.ability.guid) !== undefined;
    if (wasTriage || !removedHighValue) {
      value = QualitativePerformance.Good;
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

    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
        <br />
        targetting <strong>{target.name}</strong> w/ <strong>{targetHealthPercentText}%</strong>{' '}
        health
        <br />
        {unglyphed && hotChangeText}
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
      </p>
    );

    // Build up description of chart, which varies based on talents
    let chartDescription = ' - ';
    // no procs
    chartDescription +=
      'Green is a fine cast, Red is a non-triage (>50% health) cast that removes a WG or Rejuv.';
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
