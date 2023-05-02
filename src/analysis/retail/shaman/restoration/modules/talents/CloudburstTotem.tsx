import { formatPercentage } from 'common/format';
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

const DELAY_MS = 200;

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
  }

  _onCBTHeal(event: HealEvent) {
    if (this.cbtActive) {
      this._createFabricatedEvent(event, EventType.RemoveBuff, event.timestamp);
      this.cbtActive = false;
    }

    this.healing += event.amount + (event.absorbed || 0);
  }

  _onCast(event: CastEvent) {
    // Patch 7.3.5 added a buffer before CBT can collect healing after casting,
    // this turns out to be around 200ms and causes it to not collect healing from
    // spells casted right before it, essentially removing pre-feeding.
    // This adds those 200ms to it so you can visually see that the feeding starts later.
    const timestamp = event.timestamp + DELAY_MS;
    this._createFabricatedEvent(event, EventType.ApplyBuff, timestamp);
    this.cbtActive = true;
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
          <SpellLink id={TALENTS.CLOUDBURST_TOTEM_TALENT.id} />
        </b>
        <br />
        Cast <SpellLink id={TALENTS.CLOUDBURST_TOTEM_TALENT.id} /> on cooldown as often as possible
        its very good
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS.CLOUDBURST_TOTEM_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.guideSubStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  guideSubStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS.CLOUDBURST_TOTEM_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
        minimizeIcons
      />
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS.CLOUDBURST_TOTEM_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }
}

export default CloudburstTotem;
