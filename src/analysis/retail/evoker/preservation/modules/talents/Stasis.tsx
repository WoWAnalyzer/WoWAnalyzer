import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { ControlledExpandable, SpellLink, Tooltip } from 'interface';
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
import { QualitativePerformance, getLowestPerf } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { PassFailCheckmark, PerformanceMark, SectionHeader } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { getStasisSpell, isStasisForRamp } from '../../normalizers/CastLinkNormalizer';
import { ReactNode, useState } from 'react';

interface StasisInfo {
  castTime: number; // when stasis is originally cast
  consumeTime: number; // when stasis is consumed
  spells: number[]; // spells that player cast with stasis
  forRamp: boolean;
}

interface Props {
  header: ReactNode;
  perf?: QualitativePerformance;
  spells: number[];
  forRamp: boolean;
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
    this.curInfo = { castTime: event.timestamp, consumeTime: 0, spells: [], forRamp: false };
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
        forRamp: false,
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
      this.curInfo!.forRamp = isStasisForRamp(event);
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

  getPerfForSpell(spell: number, forRamp: boolean) {
    if (spell === TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id) {
      return QualitativePerformance.Good;
    } else if (spell === SPELLS.EMERALD_BLOSSOM.id) {
      if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT)) {
        return QualitativePerformance.Good;
      } else {
        return QualitativePerformance.Fail;
      }
    } else if (spell === TALENTS_EVOKER.ECHO_TALENT.id) {
      if (forRamp) {
        return QualitativePerformance.Good;
      } else {
        return QualitativePerformance.Fail;
      }
    } else if (spell === TALENTS_EVOKER.CAUTERIZING_FLAME_TALENT.id) {
      return QualitativePerformance.Fail;
    } else if (spell === TALENTS_EVOKER.REVERSION_TALENT.id) {
      return QualitativePerformance.Fail;
    } else if (
      spell === TALENTS_EVOKER.DREAM_BREATH_TALENT.id ||
      spell === SPELLS.DREAM_BREATH_FONT.id
    ) {
      if (forRamp) {
        return QualitativePerformance.Fail;
      } else {
        return QualitativePerformance.Good;
      }
    } else if (spell === TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id) {
      return QualitativePerformance.Fail;
    } else if (
      spell === TALENTS_EVOKER.SPIRITBLOOM_TALENT.id ||
      spell === SPELLS.SPIRITBLOOM_FONT.id
    ) {
      if (forRamp) {
        return QualitativePerformance.Fail;
      } else {
        return QualitativePerformance.Good;
      }
    }
    return QualitativePerformance.Good;
  }

  getAnalysisForSpell(spell: number, forRamp: boolean) {
    if (spell === TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id) {
      return (
        <>
          <SpellLink spell={TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT} />
          {'  '}
          <Tooltip
            hoverable
            content={
              <>
                <SpellLink spell={TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT} /> is always good to store
                regardless of situation
              </>
            }
          >
            <span>
              <PassFailCheckmark pass />
            </span>
          </Tooltip>
        </>
      );
    } else if (spell === SPELLS.EMERALD_BLOSSOM.id) {
      if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT)) {
        return (
          <>
            <SpellLink spell={SPELLS.EMERALD_BLOSSOM_CAST} />
            {'  '}
            <Tooltip
              hoverable
              content={
                <>
                  <SpellLink spell={SPELLS.EMERALD_BLOSSOM_CAST} /> is always good to store when
                  talented into <SpellLink spell={TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT} />
                </>
              }
            >
              <span>
                <PassFailCheckmark pass />
              </span>
            </Tooltip>
          </>
        );
      } else if (!forRamp) {
        return (
          <>
            <SpellLink spell={SPELLS.EMERALD_BLOSSOM_CAST} />
            {'  '}
            <Tooltip
              hoverable
              content={
                <>
                  you should never store <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> if not
                  talented into <SpellLink spell={TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT} />
                </>
              }
            >
              <span>
                <PassFailCheckmark pass={false} />
              </span>
            </Tooltip>
          </>
        );
      } else {
        return (
          <>
            <SpellLink spell={SPELLS.EMERALD_BLOSSOM_CAST} />
            {'  '}
            <Tooltip
              hoverable
              content={
                <>
                  you should never store <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> when doing an{' '}
                  <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} /> ramp
                </>
              }
            >
              <span>
                <PassFailCheckmark pass={false} />
              </span>
            </Tooltip>
          </>
        );
      }
    } else if (spell === TALENTS_EVOKER.ECHO_TALENT.id) {
      if (forRamp) {
        return (
          <>
            <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />
            {'  '}
            <Tooltip
              hoverable
              content={
                <>
                  Although <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> is not high value, it is
                  okay to store here as this <SpellLink spell={TALENTS_EVOKER.STASIS_TALENT} /> is
                  used for an <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} /> ramp
                </>
              }
            >
              <span>
                <PassFailCheckmark pass />
              </span>
            </Tooltip>
          </>
        );
      } else {
        return (
          <>
            <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />
            {'  '}
            <Tooltip
              hoverable
              content={
                <>
                  <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> is not a high value spell to
                  store when not doing an{' '}
                  <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} /> ramp
                </>
              }
            >
              <span>
                <PassFailCheckmark pass={false} />
              </span>
            </Tooltip>
          </>
        );
      }
    } else if (spell === TALENTS_EVOKER.CAUTERIZING_FLAME_TALENT.id) {
      return (
        <>
          <SpellLink spell={TALENTS_EVOKER.CAUTERIZING_FLAME_TALENT} />
          {'  '}
          <Tooltip
            hoverable
            content={
              <>
                <SpellLink spell={TALENTS_EVOKER.CAUTERIZING_FLAME_TALENT} /> is not a good spell to
                store in raid outside of very niche scenarious
              </>
            }
          >
            <span>
              <PassFailCheckmark pass={false} />
            </span>
          </Tooltip>
        </>
      );
    } else if (spell === TALENTS_EVOKER.REVERSION_TALENT.id) {
      return (
        <>
          <SpellLink spell={TALENTS_EVOKER.REVERSION_TALENT} />
          {'  '}
          <Tooltip
            hoverable
            content={
              <>
                <SpellLink spell={TALENTS_EVOKER.REVERSION_TALENT} /> is not a good spell to store
                due to its very low mana cost and CD
              </>
            }
          >
            <span>
              <PassFailCheckmark pass={false} />
            </span>
          </Tooltip>
        </>
      );
    } else if (
      spell === TALENTS_EVOKER.DREAM_BREATH_TALENT.id ||
      spell === SPELLS.DREAM_BREATH_FONT.id
    ) {
      if (forRamp) {
        return (
          <>
            <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} />
            {'  '}
            <Tooltip
              hoverable
              content={
                <>
                  <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> is not a high value spell
                  to store when not doing an{' '}
                  <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} /> ramp as it
                  interferes by consuming <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> buffs.
                </>
              }
            >
              <span>
                <PassFailCheckmark pass={false} />
              </span>
            </Tooltip>
          </>
        );
      } else {
        return (
          <>
            <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} />
            {'  '}
            <Tooltip
              hoverable
              content={
                <>
                  <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> is a very high value
                  spell to store when not in a ramp due to its high mana cost and CD.
                </>
              }
            >
              <span>
                <PassFailCheckmark pass />
              </span>
            </Tooltip>
          </>
        );
      }
    } else if (spell === TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id) {
      return (
        <>
          <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} />
          {'  '}
          <Tooltip
            hoverable
            content={
              <>
                <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} /> is not a high value
                spell to store in general compared to other spells. If you are planning to use{' '}
                <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> inside{' '}
                <SpellLink spell={TALENTS_EVOKER.STASIS_TALENT} />, then consider using{' '}
                <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} /> prior to{' '}
                <SpellLink spell={TALENTS_EVOKER.STASIS_TALENT} />.
              </>
            }
          >
            <span>
              <PassFailCheckmark pass={false} />
            </span>
          </Tooltip>
        </>
      );
    } else if (
      spell === TALENTS_EVOKER.SPIRITBLOOM_TALENT.id ||
      spell === SPELLS.SPIRITBLOOM_FONT.id
    ) {
      if (forRamp) {
        return (
          <>
            <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} />
            {'  '}
            <Tooltip
              hoverable
              content={
                <>
                  <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> is not a high value spell
                  to store when doing an{' '}
                  <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} /> ramp as it
                  interferes by consuming <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> buffs.
                </>
              }
            >
              <span>
                <PassFailCheckmark pass={false} />
              </span>
            </Tooltip>
          </>
        );
      } else {
        return (
          <>
            <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} />
            {'  '}
            <Tooltip
              hoverable
              content={
                <>
                  <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> is a very high value spell
                  to store when not in a ramp due to its high mana cost and CD.
                </>
              }
            >
              <span>
                <PassFailCheckmark pass />
              </span>
            </Tooltip>
          </>
        );
      }
    } else if (spell === 0) {
      return <>Unknown spell cast before pull</>;
    }
  }

  StasisTable = ({ header, perf, spells, forRamp }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const combinedHeader =
      perf !== undefined ? (
        <div>
          {header} &mdash; <PerformanceMark perf={perf} />
        </div>
      ) : (
        header
      );
    while (spells.length < 3) {
      spells.push(0);
    }
    const spellSequence = spells.map((cast, index) => {
      return <div key={index}>{this.getAnalysisForSpell(cast, forRamp)}</div>;
    });
    return (
      <div className="stasis__container">
        <ControlledExpandable
          header={<SectionHeader>{combinedHeader}</SectionHeader>}
          element="section"
          expanded={isExpanded}
          inverseExpanded={() => setIsExpanded(!isExpanded)}
        >
          <div className="stasis__cast-list">{spellSequence}</div>
        </ControlledExpandable>
      </div>
    );
  };

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS_EVOKER.STASIS_TALENT.id} />
        </b>{' '}
        is a powerful talent that stores your 3 most recent healing spell that will be released with
        identical targets. Notably, it can not store{' '}
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
            const perfs = info.spells.map((spell, idx2) => {
              return this.getPerfForSpell(spell, info.forRamp);
            });
            return (
              <this.StasisTable
                header={header}
                spells={info.spells}
                key={idx}
                perf={getLowestPerf(perfs)}
                forRamp={info.forRamp}
              />
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
