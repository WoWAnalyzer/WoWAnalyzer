import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { Uptime } from 'parser/ui/UptimeBar';
import { SPELL_COLORS } from '../../constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import RenewingMist from './RenewingMist';
import Vivify from './Vivify';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import BaseCelestialAnalyzer from './BaseCelestialAnalyzer';

class VivaciousVivification extends Analyzer {
  static dependencies = {
    vivify: Vivify,
    renewingMist: RenewingMist,
    baseCelestial: BaseCelestialAnalyzer,
  };
  protected baseCelestial!: BaseCelestialAnalyzer;
  protected renewingMist!: RenewingMist;
  protected vivify!: Vivify;
  currentRenewingMists: number = 0;
  totalCasts: number = 0;
  totalHealed: number = 0;
  wastedApplications: number = 0;
  unusableUptimes: Uptime[] = []; // a wasted window is when we have buff and good rem count

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.VIVIFICATION_BUFF),
      this.onRefresh,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.VIVIFICATION_BUFF),
      this.onBuffApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onRemRemove,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.VIVIFICATION_BUFF),
      this.onBuffRemove,
    );
    this.unusableUptimes.push({
      start: this.owner.fight.start_time,
      end: -1,
    });
  }

  get isUsable() {
    return (
      this.renewingMist.currentRenewingMists >= this.vivify.estimatedAverageReMs &&
      this.selectedCombatant.hasBuff(SPELLS.VIVIFICATION_BUFF.id) &&
      !this.baseCelestial.celestialActive
    );
  }

  get inUsablePeriod() {
    return this.unusableUptimes.at(-1)!.end > 0;
  }

  endUsablePeriod(timestamp: number) {
    this.unusableUptimes.push({
      start: timestamp,
      end: -1,
    });
  }

  startUsablePeriod(timestamp: number) {
    this.unusableUptimes.at(-1)!.end = timestamp;
  }

  // We waste a buff if the buff refreshes, not in celestial, and sufficient rems active
  onRefresh(event: RefreshBuffEvent) {
    if (this.isUsable) {
      this.wastedApplications += 1;
    }
  }

  // when we gain buff, have sufficient rems, and not in celestial then we start usable period
  onBuffApply(event: ApplyBuffEvent) {
    if (!this.inUsablePeriod && this.isUsable) {
      this.startUsablePeriod(event.timestamp);
    }
  }

  //We enter unusable period if our ReM count becomes too low or if we consume the buff
  onRemRemove(event: RemoveBuffEvent) {
    if (this.inUsablePeriod && !this.isUsable) {
      this.endUsablePeriod(event.timestamp);
    }
  }

  // if we consume buff and we were in usable period, then end usable period
  onBuffRemove(event: RemoveBuffEvent) {
    if (this.inUsablePeriod) {
      this.endUsablePeriod(event.timestamp);
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedApplications,
      isGreaterThan: {
        minor: 3,
        average: 8,
        major: 12,
      },
      recommended: 0,
      style: ThresholdStyle.NUMBER,
    };
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT.id} />
        </b>{' '}
        is a buff that enables an instant <SpellLink id={SPELLS.VIVIFY} /> every 10 seconds. Try to
        use this buff when you have at least 6 <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} />{' '}
        HoTs out
      </p>
    );
    this.unusableUptimes.at(-1)!.end = this.owner.fight.end_time;
    const styleObj = {
      fontSize: 20,
    };
    const styleObjInner = {
      fontSize: 15,
    };
    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT.id} /> utilization
          </strong>
          <small>
            Grey periods indicate times that you could have used your{' '}
            <SpellLink id={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT.id} /> buff effectively, but
            did not.
          </small>

          {uptimeBarSubStatistic(
            this.owner.fight,
            {
              spells: [SPELLS.VIVIFICATION_BUFF],
              uptimes: this.unusableUptimes,
              color: SPELL_COLORS.VIVIFY,
            },
            undefined,
            undefined,
            undefined,
            'utilization',
          )}
          <div style={styleObj}>
            <b>{this.wastedApplications}</b>{' '}
            <small style={styleObjInner}>wasted applications</small>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are overcapping on <SpellLink id={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT.id} />{' '}
          when the raid has a high amount of <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} />{' '}
          and wasting instant <SpellLink id={SPELLS.VIVIFY.id} /> casts
        </>,
      )
        .icon(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT.icon)
        .actual(
          `${this.wastedApplications + ' '}${t({
            id: 'monk.mistweaver.suggestions.vivaciousVivification.wastedApplications',
            message: `wasted applications`,
          })}`,
        )
        .recommended(`0 wasted applications is recommended`),
    );
  }
}

export default VivaciousVivification;
