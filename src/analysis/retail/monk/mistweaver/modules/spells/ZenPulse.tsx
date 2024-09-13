import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { getZenPulseHitsPerCast, isZenPulseConsumed } from '../../normalizers/CastLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellLink from 'interface/SpellLink';
import { TooltipElement } from 'interface/Tooltip';
import { formatNumber, formatPercentage } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { ZEN_PULSE_INCREASE_PER_STACK, ZEN_PULSE_MAX_HITS_FOR_BOOST } from '../../constants';
import Abilities from '../features/Abilities';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const MAX_STACKS = 2;

class ZenPulse extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;
  zenPulseHits: number = 0;
  healing: number = 0;
  overhealing: number = 0;
  wastedBuffs: number = 0;
  currentBuffs: number = 0;
  consumedBuffs: number = 0;
  badCasts: number = 0;
  castIncreases: number[] = [];
  entries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_HEAL),
      this.onHeal,
    );

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.onViv);

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onRemoveBuff,
    );
  }

  get avgHitsPerConsume() {
    return this.zenPulseHits / this.castIncreases.length;
  }

  get avgIncrease() {
    return (
      this.castIncreases.reduce((sum, increase) => sum + increase, 0) / this.castIncreases.length
    );
  }

  get ppm() {
    const tftCasts =
      this.abilities.abilityTracker.getAbility(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id).casts || 0;
    return this.owner.getPerMinute(this.consumedBuffs + this.wastedBuffs - tftCasts).toFixed(2);
  }

  get avgHealingPerCast() {
    return this.healing / this.castIncreases.length;
  }

  get avgRawHealingPerCast() {
    return (this.healing + this.overhealing) / this.consumedBuffs;
  }

  private onApplyBuff(_: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.currentBuffs += 1;
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    const isExpired = this.currentBuffs === MAX_STACKS;
    if (isExpired) {
      this.wastedBuffs = +1;
      this.entries.push({
        value: QualitativePerformance.Fail,
        tooltip: <>Buff refreshed at {this.owner.formatTimestamp(event.timestamp)}</>,
      });
    }
  }

  private onRemoveBuff(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const isConsumed = isZenPulseConsumed(event);
    if (isConsumed) {
      this.consumedBuffs += 1;
      this.currentBuffs -= 1;
    } else {
      this.wastedBuffs += 1;
      this.currentBuffs = 0;
      this.entries.push({
        value: QualitativePerformance.Fail,
        tooltip: <>Buff expired at {this.owner.formatTimestamp(event.timestamp)}</>,
      });
    }
  }

  private onHeal(event: HealEvent) {
    this.zenPulseHits += 1;
    this.healing += event.amount + (event.absorbed || 0);
    this.overhealing += event.overheal || 0;
  }

  private getPerf(events: HealEvent[]): { overheal: number; perf: QualitativePerformance } {
    const avgOverhealing =
      events
        .map((hit) => {
          const overheal = hit.overheal || 0;
          return overheal / (overheal + hit.amount + (hit.absorbed || 0));
        })
        .reduce((prev, cur) => {
          return prev + cur;
        }) / events.length;
    if (events.length < ZEN_PULSE_MAX_HITS_FOR_BOOST) {
      return { overheal: avgOverhealing, perf: QualitativePerformance.Ok };
    }

    if (avgOverhealing > 0.75) {
      return { overheal: avgOverhealing, perf: QualitativePerformance.Ok };
    }
    return { overheal: avgOverhealing, perf: QualitativePerformance.Good };
  }

  private onViv(event: HealEvent) {
    const zenPulseHits = getZenPulseHitsPerCast(event);
    if (!zenPulseHits.length) {
      return;
    }
    const perfInfo = this.getPerf(zenPulseHits);
    const percentInc =
      Math.min(zenPulseHits.length, ZEN_PULSE_MAX_HITS_FOR_BOOST) * ZEN_PULSE_INCREASE_PER_STACK;
    this.castIncreases.push(percentInc);
    this.entries.push({
      value: perfInfo.perf,
      tooltip: (
        <>
          <div>@ {this.owner.formatTimestamp(event.timestamp)}</div>
          <div>
            Hits: <strong>{zenPulseHits.length}</strong>
          </div>
          <div>Avg overhealing: {formatPercentage(perfInfo.overheal)}%</div>
          <div>Healing increase: {formatPercentage(percentInc)}%</div>
        </>
      ),
    });
    if (zenPulseHits.length < ZEN_PULSE_MAX_HITS_FOR_BOOST) {
      this.badCasts += 1;
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <div>
          <b>
            <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} />
          </b>{' '}
          is a buff that procs off of <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> that
          makes your next <SpellLink spell={SPELLS.VIVIFY} /> cast do additional healing on your
          target and all targets with <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />. The
          healing done by <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} /> is increased by 6% per
          target with <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> up to 30%, so it is
          important to have at least 5 ReMs active before consuming the buff.
        </div>
        <div style={{ paddingTop: '1em' }}>
          It is very important to make sure that you never let this buff expire. Ideally try to
          consume this buff to minimize overheal while ensuring that you have a high number of{' '}
          <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> buffs active.
        </div>
      </p>
    );
    const styleObj = {
      fontSize: 20,
    };
    const styleObjInner = {
      fontSize: 15,
    };
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>
              <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} /> consumptions
            </strong>
            <PerformanceBoxRow values={this.entries} />
          </div>
          <div style={styleObj}>
            <b>{this.wastedBuffs}</b> <small style={styleObjInner}>wasted buffs</small>
          </div>
          <div style={styleObj}>
            <b>{this.avgHitsPerConsume.toFixed(2)}</b>{' '}
            <small style={styleObjInner}>avg hits per buff</small>
          </div>
        </RoundedPanel>
      </div>
    );
    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <ul>
              <li>Procs per minute: {this.ppm}</li>
              <li>Effective healing: {formatNumber(this.healing)}</li>
              <li>Overhealing: {formatNumber(this.overhealing)}</li>
              <li>Average increase: {formatPercentage(this.avgIncrease)}%</li>
              <li>
                Buffs used below {ZEN_PULSE_MAX_HITS_FOR_BOOST}{' '}
                <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />
                s: {this.badCasts}
              </li>
              <li>Wasted Buffs: {this.wastedBuffs}</li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.ZEN_PULSE_TALENT}>
          <ItemHealingDone amount={this.healing} />
          <hr />
          {this.avgHitsPerConsume.toFixed(2)}{' '}
          <small>
            Average hits per <SpellLink spell={SPELLS.VIVIFY} />
          </small>
          <div></div>
          <TooltipElement
            content={
              <>
                {formatNumber(this.avgRawHealingPerCast)} <small>raw healing per cast</small>
              </>
            }
          >
            {formatNumber(this.avgHealingPerCast)} <small>healing per cast</small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ZenPulse;
