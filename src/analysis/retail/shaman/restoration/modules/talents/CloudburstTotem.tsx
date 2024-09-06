import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  EventType,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const DELAY_MS = 200;

type Cast = {
  healingDone: number;
  overhealingDone: number;
};

/**
 * Cloudburst Totem has no buff events in the combatlog, so we're fabricating it on cast and
 * removing it when its done, so we can track the buff and have it show up on the timeline.
 *
 * Also sums up the healing it does and feeds for the Talents module.
 */
class CloudburstTotem extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  protected eventEmitter!: EventEmitter;
  protected cooldownThroughputTracker!: CooldownThroughputTracker;

  healing = 0;
  cbtActive = false;

  CBTCasts: Cast[] = [];

  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CLOUDBURST_TOTEM_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CLOUDBURST_TOTEM_HEAL),
      this._onCBTHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CLOUDBURST_TOTEM_TALENT),
      this._onCast,
    );
    this.addEventListener(Events.fightend, this._onFightEnd);
  }

  _onFightEnd() {
    this._rateCasts(this.CBTCasts);
  }

  _onCBTHeal(event: HealEvent) {
    if (this.cbtActive) {
      this._createFabricatedEvent(event, EventType.RemoveBuff, event.timestamp);
      this.cbtActive = false;
    }

    this.healing += event.amount + (event.absorbed || 0);

    const healing = event.amount + (event.absorbed || 0);
    const overhealing = event.overheal || 0;

    if (this.CBTCasts.length === 0) {
      // If CBT was cast prepull
      this.CBTCasts.push({
        healingDone: 0,
        overhealingDone: 0,
      });
    }

    this.CBTCasts[this.CBTCasts.length - 1].healingDone += healing;
    this.CBTCasts[this.CBTCasts.length - 1].overhealingDone += overhealing;
  }

  _onCast(event: CastEvent) {
    // Patch 7.3.5 added a buffer before CBT can collect healing after casting,
    // this turns out to be around 200ms and causes it to not collect healing from
    // spells casted right before it, essentially removing pre-feeding.
    // This adds those 200ms to it so you can visually see that the feeding starts later.
    const timestamp = event.timestamp + DELAY_MS;
    this._createFabricatedEvent(event, EventType.ApplyBuff, timestamp);
    this.cbtActive = true;

    this.CBTCasts.push({
      healingDone: 0,
      overhealingDone: 0,
    });
  }

  _createFabricatedEvent(
    event: CastEvent | HealEvent,
    type: EventType.ApplyBuff | EventType.RemoveBuff,
    timestamp: number,
  ) {
    const fabricatedEvent: ApplyBuffEvent | RemoveBuffEvent = {
      ability: {
        ...event.ability,
        guid: TALENTS.CLOUDBURST_TOTEM_TALENT.id,
      },
      sourceID: event.sourceID,
      targetID: event.sourceID,
      sourceIsFriendly: event.sourceIsFriendly,
      targetIsFriendly: event.targetIsFriendly,
      timestamp: timestamp,
      type: type,
    };

    this.eventEmitter.fabricateEvent(fabricatedEvent, event);
  }

  /** Guide subsection describing the proper usage of Cloudburst Totem */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.CLOUDBURST_TOTEM_TALENT} />
        </b>{' '}
        is one of your most important and highest hps abilities. It is essential to have it active
        whenever you plan on doing significant healing as it collects a portion of all healing done.
        It is not necessary or possible to always have{' '}
        <SpellLink spell={TALENTS.CLOUDBURST_TOTEM_TALENT} /> active, but make sure you are never
        sitting at 2 charges. You may want to recast this ability to pop its healing early in order
        to avoid overhealing.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS.CLOUDBURST_TOTEM_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.guideCastEfficiency()}
            <br />
            <strong>Casts breakdown</strong>
            {this.guideCastBreakdown()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  guideCastEfficiency() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS.CLOUDBURST_TOTEM_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
        minimizeIcons
      />
    );
  }

  guideCastBreakdown() {
    return (
      <>
        {' '}
        - Colors are assigned purely based on overhealing. Try to avoid red casts by recasting{' '}
        <SpellLink spell={TALENTS.CLOUDBURST_TOTEM_TALENT} /> early.
        <PerformanceBoxRow values={this.castEntries} />
      </>
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS.CLOUDBURST_TOTEM_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

  _rateCasts(casts: Cast[]) {
    casts.forEach((CBTcast) => {
      let value = null;

      const percentOverheal =
        CBTcast.overhealingDone / (CBTcast.healingDone + CBTcast.overhealingDone);

      if (percentOverheal < 0.05) {
        value = QualitativePerformance.Perfect;
      } else if (percentOverheal < 0.25) {
        value = QualitativePerformance.Good;
      } else if (percentOverheal < 0.6) {
        value = QualitativePerformance.Ok;
      } else {
        value = QualitativePerformance.Fail;
      }

      const tooltip = (
        <>
          Healing: {formatNumber(CBTcast.healingDone)} ({formatPercentage(percentOverheal)}%
          overheal)
        </>
      );

      this.castEntries.push({ value, tooltip });
    });
  }
}

export default CloudburstTotem;
