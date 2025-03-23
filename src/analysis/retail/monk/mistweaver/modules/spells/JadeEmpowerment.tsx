import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import JadefireTeachings from './JadefireTeachings';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class JadeEmpowerment extends Analyzer {
  protected jft!: JadefireTeachings;
  wastedCharges: number = 0;
  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.CHI_BURST_SHARED_TALENT);
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.JADE_EMPOWERMENT_BUFF),
      this.onRefresh,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.JADE_EMPOWERMENT_BUFF),
      this.onApply,
    );
  }

  onApply(event: ApplyBuffEvent) {
    this.castEntries.push({
      value: QualitativePerformance.Good,
      tooltip: (
        <>
          <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> cast @{' '}
          {this.owner.formatTimestamp(event.timestamp)}
        </>
      ),
    });
  }

  onRefresh(event: RefreshBuffEvent) {
    this.wastedCharges += 1;
    this.castEntries.push({
      value: QualitativePerformance.Good,
      tooltip: (
        <>
          <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> cast @{' '}
          {this.owner.formatTimestamp(event.timestamp)}
        </>
      ),
    });
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.JADE_EMPOWERMENT_TALENT} />
        </b>{' '}
        empowers your next <SpellLink spell={SPELLS.CRACKLING_JADE_LIGHTNING} /> after pressing{' '}
        <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} />. It is critical to avoid
        overcapping charges of the buff and ideally use it during damage to get effective healing
        via{' '}
        <SpellLink
          spell={
            this.selectedCombatant.hasTalent(TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT)
              ? TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT
              : SPELLS.ANCIENT_TEACHINGS
          }
        />
        .
      </p>
    );
    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.JADE_EMPOWERMENT_TALENT} /> buff efficiency
          </strong>
          <div>
            <strong>Casts </strong>
            <small>
              - Green indicates an unwasted stack while red indicates you wasted a stack when
              casting <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} />
            </small>
            <PerformanceBoxRow values={this.castEntries} />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default JadeEmpowerment;
