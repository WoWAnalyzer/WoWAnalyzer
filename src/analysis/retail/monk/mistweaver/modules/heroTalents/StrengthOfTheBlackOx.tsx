import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { isStrengthOfTheBlackOxConsumed } from '../../normalizers/CastLinkNormalizer';
import SpellLink from 'interface/SpellLink';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

// TODO: add checklist for mana tea usage
class StrengthOfTheBlackOx extends Analyzer {
  wastedBuffs: number = 0;
  entries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT);

    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF),
      this.onRemoveBuff,
    );
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    this.wastedBuffs += 1;
    this.entries.push({
      value: QualitativePerformance.Fail,
      tooltip: (
        <>
          <div>Refreshed @ {this.owner.formatTimestamp(event.timestamp)}</div>
        </>
      ),
    });
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const isConsumed = isStrengthOfTheBlackOxConsumed(event);
    if (!isConsumed) {
      this.wastedBuffs += 1;
    }
    this.entries.push({
      value: isConsumed ? QualitativePerformance.Good : QualitativePerformance.Fail,
      tooltip: (
        <>
          <div>
            {isConsumed ? 'Consumed ' : 'Expired '}@ {this.owner.formatTimestamp(event.timestamp)}
          </div>
        </>
      ),
    });
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT} />
        </b>{' '}
        is a buff that makes your next <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />{' '}
        have a reduced cast time and apply a shield to 5 nearby allies. It is very important to
        never let this buff refresh as it is a considerable amount of shielding.
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
            <SpellLink spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT} /> utilization
          </strong>
          <PerformanceBoxRow values={this.entries} />
          <div style={styleObj}>
            <b>{this.wastedBuffs}</b> <small style={styleObjInner}>wasted buffs</small>
          </div>
        </RoundedPanel>
      </div>
    );
    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default StrengthOfTheBlackOx;
