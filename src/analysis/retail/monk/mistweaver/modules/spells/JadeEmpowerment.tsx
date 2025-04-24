import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RefreshBuffEvent } from 'parser/core/Events';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';

class JadeEmpowerment extends Analyzer {
  wastedCharges = 0;
  castEntries: BoxRowEntry[] = [];
  hasJFT = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.JADE_EMPOWERMENT_TALENT);
    this.hasJFT = this.selectedCombatant.hasTalent(TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT);
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.JADE_EMPOWERMENT_BUFF),
      this.onRefresh,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const perfs: QualitativePerformance[] = [
      this.selectedCombatant.hasBuff(SPELLS.JADE_EMPOWERMENT_BUFF)
        ? QualitativePerformance.Good
        : QualitativePerformance.Fail,
    ];
    if (this.hasJFT) {
      perfs.push(
        this.selectedCombatant.hasBuff(SPELLS.JT_BUFF)
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail,
      );
    }
    const tooltip = (
      <>
        <div>
          <SpellLink spell={SPELLS.CRACKLING_JADE_LIGHTNING} /> cast @{' '}
          {this.owner.formatTimestamp(event.timestamp)}
        </div>
        <br />
        <div>
          {this.hasJFT && (
            <>
              <SpellLink spell={TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT} /> active:{' '}
              <PerformanceMark perf={perfs.at(-1)!} />
            </>
          )}
        </div>
        <div>
          <SpellLink spell={SPELLS.JADE_EMPOWERMENT_BUFF} /> active:{' '}
          <PerformanceMark perf={perfs[0]} />
        </div>
      </>
    );
    this.castEntries.push({
      value: getLowestPerf(perfs),
      tooltip: tooltip,
    });
  }

  onRefresh(event: RefreshBuffEvent) {
    this.wastedCharges += 1;
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
        <SpellLink spell={TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT} /> is active if talented, and
        ideally use it during damage to get effective healing via{' '}
        <SpellLink
          spell={this.hasJFT ? TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT : SPELLS.ANCIENT_TEACHINGS}
        />
        .
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
          <strong>
            <SpellLink spell={TALENTS_MONK.JADE_EMPOWERMENT_TALENT} /> buff efficiency
          </strong>
          <div>
            <div style={styleObj}>
              <b>{this.wastedCharges}</b> <small style={styleObjInner}>wasted buffs</small>
            </div>
            <PerformanceBoxRow values={this.castEntries} />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default JadeEmpowerment;
