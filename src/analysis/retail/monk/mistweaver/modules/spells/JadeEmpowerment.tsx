import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  HealEvent,
  BeginChannelEvent,
  EndChannelEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { CAST_BUFFER_MS } from '../../normalizers/EventLinks/EventLinkConstants';
import Spell from 'common/SPELLS/Spell';

class JadeEmpowerment extends Analyzer {
  castEntries: BoxRowEntry[] = [];
  wastedCharges = 0;
  hasJFT = false;
  hasSI = false;
  secretInfusionMap: Map<Spell, [QualitativePerformance, string]>;

  insideCJLChannel = false;
  cjlChannelEndTime = 0;
  currentCJLHeal = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.JADE_EMPOWERMENT_TALENT);
    this.hasJFT = this.selectedCombatant.hasTalent(TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT);
    this.hasSI = this.selectedCombatant.hasTalent(TALENTS_MONK.SECRET_INFUSION_TALENT);
    this.secretInfusionMap = new Map([
      [SPELLS.SECRET_INFUSION_CRIT_BUFF, [QualitativePerformance.Perfect, 'Crit']],
      [SPELLS.SECRET_INFUSION_VERS_BUFF, [QualitativePerformance.Perfect, 'Vers']],
      [SPELLS.SECRET_INFUSION_HASTE_BUFF, [QualitativePerformance.Good, 'Haste']],
      [SPELLS.SECRET_INFUSION_MASTERY_BUFF, [QualitativePerformance.Ok, 'Mastery']],
    ]);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT),
      this.checkForRefresh,
    );
    this.addEventListener(
      Events.BeginChannel.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING),
      this.onCastStart,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING),
      this.onCastEnd,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.AT_HEAL, SPELLS.AT_CRIT_HEAL]),
      this.handleATHeal,
    );
  }

  addValuesToTooltip() {
    const lastEntry = this.castEntries[this.castEntries.length - 1];
    if (lastEntry) {
      const previousTooltip = lastEntry.tooltip;
      lastEntry.tooltip = (
        <>
          {previousTooltip}
          <br />
          <div>
            <SpellLink spell={SPELLS.ANCIENT_TEACHINGS} /> healing:{' '}
            <b>{formatNumber(this.currentCJLHeal)}</b>
          </div>
        </>
      );
    }
  }

  onCastStart(event: BeginChannelEvent) {
    if (this.currentCJLHeal > 0) {
      this.addValuesToTooltip();
    }
    this.currentCJLHeal = 0;
    this.insideCJLChannel = true;

    const jadeEmpowermentPerf = this.selectedCombatant.hasBuff(SPELLS.JADE_EMPOWERMENT_BUFF)
      ? QualitativePerformance.Good
      : QualitativePerformance.Fail;

    const perfs: QualitativePerformance[] = [jadeEmpowermentPerf];

    let jadefirePerf: QualitativePerformance | null = null;
    if (this.hasJFT) {
      jadefirePerf = this.selectedCombatant.hasBuff(SPELLS.JT_BUFF)
        ? QualitativePerformance.Good
        : QualitativePerformance.Fail;
      perfs.push(jadefirePerf);
    }

    let secretInfusionPerf: QualitativePerformance = QualitativePerformance.Ok;
    let activeSecretInfusionStat: string | null = null;
    if (this.hasSI) {
      for (const [buff, [performance, statName]] of this.secretInfusionMap) {
        if (this.selectedCombatant.hasBuff(buff.id)) {
          secretInfusionPerf = performance;
          activeSecretInfusionStat = statName;
          break;
        }
      }
      perfs.push(secretInfusionPerf);
    }

    const tooltip = (
      <>
        <div>
          <SpellLink spell={SPELLS.CRACKLING_JADE_LIGHTNING} /> cast @{' '}
          {this.owner.formatTimestamp(event.timestamp)}
        </div>
        <br />
        {this.hasJFT && jadefirePerf !== null && (
          <div>
            <SpellLink spell={TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT} /> active:{' '}
            <PerformanceMark perf={jadefirePerf} />
          </div>
        )}
        <div>
          <SpellLink spell={SPELLS.JADE_EMPOWERMENT_BUFF} /> active:{' '}
          <PerformanceMark perf={jadeEmpowermentPerf} />
        </div>
        {this.hasSI && (
          <div>
            <SpellLink spell={TALENTS_MONK.SECRET_INFUSION_TALENT} />{' '}
            {activeSecretInfusionStat ? `(${activeSecretInfusionStat})` : ''} active:{' '}
            <PerformanceMark perf={secretInfusionPerf!} />
          </div>
        )}
      </>
    );

    this.castEntries.push({
      value: getLowestPerf(perfs),
      tooltip: tooltip,
    });
  }

  handleATHeal(event: HealEvent) {
    if (this.insideCJLChannel || event.timestamp <= this.cjlChannelEndTime + CAST_BUFFER_MS) {
      this.currentCJLHeal += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  checkForRefresh(event: CastEvent) {
    if (this.selectedCombatant.getBuffStacks(SPELLS.JADE_EMPOWERMENT_BUFF) == 2) {
      this.wastedCharges += 1;
    }
  }

  onCastEnd(event: RemoveBuffEvent | RemoveBuffStackEvent | EndChannelEvent) {
    this.cjlChannelEndTime = event.timestamp;
    this.insideCJLChannel = false;
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.JADE_EMPOWERMENT_TALENT} />
        </b>{' '}
        empowers your next <SpellLink spell={SPELLS.CRACKLING_JADE_LIGHTNING} /> after pressing{' '}
        <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} />. It is critical to avoid
        overcapping charges of the buff, ensure that{' '}
        <SpellLink spell={TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT} /> is active if talented, use
        alongside <SpellLink spell={TALENTS_MONK.SECRET_INFUSION_TALENT} /> with Critical Strike or
        Versatility to buff the strength or Haste to buff the speed of the{' '}
        <SpellLink spell={SPELLS.CRACKLING_JADE_LIGHTNING} /> cast, and ideally use it during damage
        to get effective healing via{' '}
        <SpellLink
          spell={this.hasJFT ? TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT : SPELLS.ANCIENT_TEACHINGS}
        />
        .
      </p>
    );

    const styleObj = { fontSize: 20 };
    const styleObjInner = { fontSize: 15 };

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.JADE_EMPOWERMENT_TALENT} /> buff efficiency
          </strong>
          <PerformanceBoxRow values={this.castEntries} />
          <div style={styleObj}>
            <b>{this.wastedCharges}</b> <small style={styleObjInner}>wasted buffs</small>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default JadeEmpowerment;
