import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { ControlledExpandable, SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  EventType,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { PerformanceMark, SectionHeader } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { getStasisSpell } from '../../normalizers/CastLinkNormalizer';
import { ReactNode, useState } from 'react';

interface StasisInfo {
  castTime: number; // when stasis is originally cast
  consumeTime: number; // when stasis is consumed
  spells: number[]; // spells that player cast with stasis
}

interface Props {
  header: ReactNode;
  content: JSX.Element;
  perf?: QualitativePerformance;
  spells: number[];
}

class Stasis extends Analyzer {
  stasisInfos: StasisInfo[] = [];
  curInfo: StasisInfo | null = null;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.STASIS_TALENT);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.STASIS_BUFF),
      this.onBuffRemoval,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.STASIS_TALENT),
      this.onStackRemoval,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.STASIS_TALENT),
      this.onStackRemoval,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.STASIS_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.curInfo = { castTime: event.timestamp, consumeTime: 0, spells: [] };
  }

  onStackRemoval(event: RemoveBuffStackEvent | RemoveBuffEvent) {
    if (!this.curInfo) {
      // stasis was cast pre-pull
      const numStacks =
        event.type === EventType.RemoveBuffStack ? (event as RemoveBuffStackEvent).stack : 0;
      // first removal puts you at 2 stacks, so if we go from 2->1 then numStacks is 1, which means we're missing 1 spell
      this.curInfo = {
        castTime: this.owner.fight.start_time,
        consumeTime: 0,
        spells: Array(2 - numStacks).fill(0),
      };
    }
    const spell = getStasisSpell(event);
    if (spell) {
      this.curInfo!.spells.push(spell);
    }
  }

  onBuffRemoval(event: RemoveBuffEvent) {
    if (this.curInfo) {
      this.curInfo!.consumeTime = event.timestamp;
      this.stasisInfos.push(this.curInfo!);
      this.curInfo = null;
    }
  }

  getSpellLink(key: number, spellid: number) {
    if (spellid === 0) {
      return (
        <>
          Unknown spell cast before pull <br />
        </>
      );
    }
    return (
      <>
        <SpellLink key={key} id={spellid} />
        <br />
      </>
    );
  }

  getPerfForCast(info: StasisInfo) {
    return QualitativePerformance.Good;
  }

  StasisTable = ({ header, content, perf, spells }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const combinedHeader =
      perf !== undefined ? (
        <div>
          {header} &mdash; <PerformanceMark perf={perf} />
        </div>
      ) : (
        header
      );
    return (
      <ControlledExpandable
        header={<SectionHeader>{combinedHeader}</SectionHeader>}
        element="section"
        expanded={isExpanded}
        inverseExpanded={() => setIsExpanded(!isExpanded)}
      >
        <div>{content}</div>
      </ControlledExpandable>
    );
  };

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS_EVOKER.STASIS_TALENT.id} />
        </b>{' '}
        is a powerful talent that stores your 3 most recent healing spell that will be released with
        identical targets. Noteably, it can not store{' '}
        <SpellLink spell={TALENTS_EVOKER.DREAM_FLIGHT_TALENT} />,{' '}
        <SpellLink spell={TALENTS_EVOKER.REWIND_TALENT} />, or{' '}
        <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} />. In general, you should always
        store at least 1 <SpellLink id={TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT} /> if talented into{' '}
        <SpellLink spell={TALENTS_EVOKER.RESONATING_SPHERE_TALENT} />. If not using{' '}
        <SpellLink spell={TALENTS_EVOKER.STASIS_TALENT} /> to ramp with{' '}
        <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} />, then you should aim to use
        both <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> and{' '}
        <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> due to their long CDs and high mana
        costs or 3x <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> if playing a blossom focused build
        to build a large burst window. If using <SpellLink spell={TALENTS_EVOKER.STASIS_TALENT} />{' '}
        to ramp, then generally store <SpellLink spell={TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT} />{' '}
        or <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> to avoid consuming{' '}
        <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> buffs
      </p>
    );
    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS_EVOKER.STASIS_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
          <br />
          {this.stasisInfos.map((info, idx) => {
            const header = (
              <>
                <SpellLink spell={TALENTS_EVOKER.STASIS_TALENT} /> @{' '}
                {this.owner.formatTimestamp(info.castTime)}
              </>
            );
            return (
              <this.StasisTable header={header} spells={info.spells} content={<></>} key={idx} />
            );
          })}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS_EVOKER.STASIS_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        wide
      >
        <SpellLink id={TALENTS_EVOKER.STASIS_TALENT.id} /> <small>spell breakdown</small>
        <br />
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Cast #</th>
              <th>Cast Time</th>
              <th>Consume Time</th>
              <th>Spells</th>
            </tr>
          </thead>
          <tbody>
            {this.stasisInfos.map((info, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{this.owner.formatTimestamp(info.castTime)}</td>
                <td>{this.owner.formatTimestamp(info.consumeTime)}</td>
                <td>{info.spells.map((spellid, idx2) => this.getSpellLink(idx2, spellid))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Statistic>
    );
  }
}

export default Stasis;
