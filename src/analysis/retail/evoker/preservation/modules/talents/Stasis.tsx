import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { PassFailCheckmark } from 'interface/guide';
import CastOverview from 'interface/guide/components/CastOverview';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import GuideSection from 'interface/guide/components/GuideSection';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  EventType,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import {
  QualitativePerformance,
  getAveragePerf,
  getLowestPerf,
} from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { getStasisSpell } from '../../normalizers/EventLinking/helpers';
import type { JSX } from 'react';

interface StasisInfo {
  castTime: number; // when stasis is originally cast
  consumeTime: number; // when stasis is consumed
  spells: [number, number][]; // spells that player cast with stasis
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
        spells: Array(2 - numStacks).fill([0, 0]),
      };
    }
    const spell = getStasisSpell(event);
    if (spell) {
      this.curInfo!.spells.push([spell, event.timestamp]);
    }
  }

  onBuffRemoval(event: RemoveBuffEvent) {
    if (this.curInfo) {
      this.curInfo!.consumeTime = event.timestamp;
      this.stasisInfos.push(this.curInfo!);
      this.curInfo = null;
    }
  }

  getSpellLink(key: number, spellPair: [number, number]) {
    if (spellPair[0] === 0) {
      return <>Unknown spell cast before pull</>;
    }
    return (
      <div>
        <SpellLink key={key} spell={spellPair[0]} /> @ {this.owner.formatTimestamp(spellPair[1])}
      </div>
    );
  }

  getPerfForSpell(spell: number) {
    if (
      spell === TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id ||
      spell === SPELLS.EMERALD_BLOSSOM_CAST.id ||
      spell === SPELLS.MERITHRAS_BLESSING_CAST.id ||
      spell === TALENTS_EVOKER.DREAM_BREATH_TALENT.id ||
      spell === SPELLS.DREAM_BREATH_FONT.id
    ) {
      return QualitativePerformance.Good;
    } else {
      return QualitativePerformance.Fail;
    }
  }

  getAnalysisForSpell(spellPair: [number, number]) {
    const [spell, timestamp] = spellPair;
    let passMark = false;
    if (
      spell === TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id ||
      spell === SPELLS.EMERALD_BLOSSOM_CAST.id ||
      spell === SPELLS.MERITHRAS_BLESSING_CAST.id ||
      spell === TALENTS_EVOKER.DREAM_BREATH_TALENT.id ||
      spell === SPELLS.DREAM_BREATH_FONT.id
    ) {
      passMark = true;
    }
    return (
      <>
        <SpellLink spell={spell} /> @ {this.owner.formatTimestamp(timestamp)}
        {'  '}
        <span>
          <PassFailCheckmark pass={passMark} />
        </span>
      </>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_EVOKER.STASIS_TALENT} />
        </b>{' '}
        is a powerful healing cooldown that stores up to 3 of your recent healing casts and releases
        them with the same targets. In general, you should prioritize storing{' '}
        <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} />,{' '}
        <SpellLink spell={TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT} />,{' '}
        <SpellLink spell={SPELLS.EMERALD_BLOSSOM} />, and{' '}
        <SpellLink spell={SPELLS.MERITHRAS_BLESSING_CAST} />.
      </p>
    );

    const perCastData: PerCastData[] = this.stasisInfos.map((info) => {
      const perfs = info.spells.map((spellPair) => this.getPerfForSpell(spellPair[0]));
      const perf = getLowestPerf(perfs);
      const storedSpells = info.spells.map((spellPair, index) => (
        <div key={`${info.castTime}-${index}`}>{this.getAnalysisForSpell(spellPair)}</div>
      ));

      return {
        performance: perf,
        timestamp: this.owner.formatTimestamp(info.castTime),
        stats: [],
        details:
          storedSpells.length > 0 ? storedSpells : 'No spells were linked for this Stasis cast.',
        tooltip: (
          <>
            <div>
              Cast: <strong>{this.owner.formatTimestamp(info.castTime)}</strong>
            </div>
            <div>
              Release: <strong>{this.owner.formatTimestamp(info.consumeTime)}</strong>
            </div>
          </>
        ),
      };
    });

    const castPerfs = this.stasisInfos.map((info) =>
      getLowestPerf(info.spells.map((spellPair) => this.getPerfForSpell(spellPair[0]))),
    );
    const overallPerf =
      this.stasisInfos.length > 0 ? getAveragePerf(castPerfs) : QualitativePerformance.Good;

    const overview = (
      <CastOverview
        spell={TALENTS_EVOKER.STASIS_TALENT}
        stats={[
          {
            value: `${this.stasisInfos.length}`,
            label: 'Casts',
            tooltip: 'Total number of Stasis casts in this fight.',
            performance: overallPerf,
          },
        ]}
        additionalContent={{
          title: 'Cast Efficiency',
          content: this.subStatistic(),
        }}
      />
    );

    const data =
      this.stasisInfos.length === 0 ? (
        <RoundedPanel>
          <strong>
            No <SpellLink spell={TALENTS_EVOKER.STASIS_TALENT} /> cast.
          </strong>
        </RoundedPanel>
      ) : (
        <RoundedPanel>
          {overview}
          <CastDetail title="Stasis Casts" casts={perCastData} />
        </RoundedPanel>
      );

    return (
      <GuideSection spell={TALENTS_EVOKER.STASIS_TALENT} explanation={explanation}>
        {data}
      </GuideSection>
    );
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spell={TALENTS_EVOKER.STASIS_TALENT}
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
        <SpellLink spell={TALENTS_EVOKER.STASIS_TALENT} /> <small>spell breakdown</small>
        <div>
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
                  <td>
                    {info.spells.map((spellPair, idx2) => this.getSpellLink(idx2, spellPair))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Statistic>
    );
  }
}

export default Stasis;
