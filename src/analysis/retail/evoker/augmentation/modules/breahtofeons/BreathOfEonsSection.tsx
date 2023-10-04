import React from 'react';
import { BreathOfEonsWindows } from './BreathOfEonsRotational';
import { SubSection } from 'interface/guide';
import { SpellLink, TooltipElement } from 'interface';
import { formatDuration, formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import PassFailBar from 'interface/guide/components/PassFailBar';
import './Section.scss';
import { t } from '@lingui/macro';
import LazyLoadGuideSection from '../../../shared/modules/components/LazyLoadGuideSection';
import { blacklist } from '../features/BuffTargetHelper/BuffTargetHelper';
import { fetchEvents } from 'common/fetchWclApi';
import CombatLogParser from '../../CombatLogParser';
import ExplanationGraph, {
  DataSeries,
  GraphData,
  SpellTracker,
  generateGraphData,
} from 'analysis/retail/evoker/shared/modules/components/ExplanationGraph';

type Props = {
  windows: BreathOfEonsWindows[];
  fightStartTime: number;
  fightEndTime: number;
  ebonMightCount: SpellTracker[];
  shiftingSandsCount: SpellTracker[];
  owner: CombatLogParser;
};
const damageTables: {
  table: any[];
  start: number;
  end: number;
}[] = [];
//const damageTables: any[][] = [];

const graphData: GraphData[] = [];
const explanations: JSX.Element[] = [];

const BreathOfEonsSection: React.FC<Props> = ({
  windows,
  fightStartTime,
  fightEndTime,
  ebonMightCount,
  shiftingSandsCount,
  owner,
}) => {
  /** Generate filter based on black list and whitelist
   * For now we only look at the players who were buffed
   * during breath */
  function getFilter(window: BreathOfEonsWindows) {
    console.log(window.breathPerformance.buffedPlayers);
    //const playerNames = ['Olgey', 'Yuette', 'Dérp', 'Dolanpepe'];
    const playerNames = Array.from(window.breathPerformance.buffedPlayers.keys());
    const nameFilter = playerNames.map((name) => `"${name}"`).join(', ');

    /** Blacklist is set in BuffTargetHelper module */
    const abilityFilter = blacklist.map((id) => `${id}`).join(', ');

    const filter = `type = "damage" 
    AND not ability.id in (${abilityFilter}) 
    AND (source.name in (${nameFilter}, "${owner.selectedCombatant.name}") OR source.owner.name in (${nameFilter})) 
    AND (target.id != source.id)`;
    console.log(filter);
    return filter;
  }

  const buffer = 4000;

  async function loadData() {
    /** High maxPage allowances needed otherwise it breaks
     * If we ever desire to find optimal buff targets for Breath windows
     * this would prolly get out of hand unless we split up the requests.
     * But that is not the current goal for this module soooo : ) */
    for (const window of windows) {
      const startTime =
        window.start - buffer > fightStartTime ? window.start - buffer : fightStartTime;
      const endTime = window.end + buffer < fightEndTime ? window.end + buffer : fightEndTime;
      const windowEvents = await fetchEvents(
        owner.report.code,
        startTime,
        endTime,
        undefined,
        getFilter(window),
        10,
      );
      damageTables.push({
        table: windowEvents,
        start: window.start,
        end: window.end,
      });
    }
  }

  function findOptimalWindow() {
    console.log(damageTables);
    const graphData: GraphData[] = [];
    const explanations: JSX.Element[] = [];

    let index = 0;
    for (const table of damageTables) {
      if (!windows[index]) {
        continue;
      }

      const damageWindows = [];
      const recentDamage: any[] = [];
      let damageInRange = 0; // Initialize damage within the current window

      const breathStart = windows[index].start;
      const breathEnd = windows[index].end;
      const breathLength = breathEnd - breathStart;

      for (const event of table.table) {
        recentDamage.push(event);

        // Calculate the sum only for events within the current window
        if (event.timestamp >= breathStart && event.timestamp <= breathEnd) {
          if (event.subtractsFromSupportedActor) {
            damageInRange -= event.amount + (event.absorbed ?? 0);
          } else {
            damageInRange += event.amount + (event.absorbed ?? 0);
          }
        }

        while (
          recentDamage[recentDamage.length - 1].timestamp - recentDamage[0].timestamp >=
          breathLength
        ) {
          // Calculate the sum only for events within the current window
          const eventsWithinWindow = recentDamage.filter(
            (e) =>
              e.timestamp >= recentDamage[0].timestamp &&
              e.timestamp <= recentDamage[0].timestamp + breathLength,
          );
          const currentWindowSum = eventsWithinWindow.reduce((acc, e) => {
            if (e.subtractsFromSupportedActor) {
              return acc - e.amount - (e.absorbed ?? 0);
            } else {
              return acc + e.amount + (e.absorbed ?? 0);
            }
          }, 0);

          damageWindows.push({
            start: recentDamage[0].timestamp,
            end: recentDamage[0].timestamp + breathLength,
            sum: currentWindowSum,
            startFormat: formatDuration(recentDamage[0].timestamp - fightStartTime),
            endFormat: formatDuration(recentDamage[0].timestamp + breathLength - fightStartTime),
          });
          recentDamage.shift();
        }
      }

      index += 1;

      const top5Windows = damageWindows.sort((a, b) => b.sum - a.sum).slice(0, 5);

      console.log('Top 5 Windows:', top5Windows);
      console.log('Damage within current window:', damageInRange);
      console.log('start: ', formatDuration(breathStart - fightStartTime));
      console.log('end: ', formatDuration(breathEnd - fightStartTime));

      const dataSeries: DataSeries[] =
        top5Windows.length === 0
          ? []
          : [
              {
                spellTracker: [
                  {
                    timestamp: breathStart,
                    count: 1,
                  },
                  {
                    timestamp: breathEnd,
                    count: 0,
                  },
                ],
                type: 'area',
                color: '#736F4E',
                label: 'Current Breath timing',
                strokeWidth: 5,
              },
              {
                spellTracker: [
                  {
                    timestamp: top5Windows[0].start,
                    count: 1 * (top5Windows[0].sum / damageInRange),
                  },
                  {
                    timestamp: top5Windows[0].end,
                    count: 0,
                  },
                ],
                type: 'area',
                color: '#4C78A8',
                label: 'Optimal Breath timing',
                strokeWidth: 5,
              },
            ];

      const newGraphData = generateGraphData(
        dataSeries,
        breathStart - buffer,
        breathEnd + buffer,
        'Breath Window',
        top5Windows.length === 0 ? <>You didn't hit anything</> : undefined,
      );
      graphData.push(newGraphData);

      const content =
        top5Windows.length === 0 ? (
          <div></div>
        ) : (
          <table className="breath-explanations">
            <tr>
              <td>Damage</td>
              <td>
                {formatNumber(damageInRange)} / {formatNumber(top5Windows[0].sum)}
              </td>
              <td>
                <PassFailBar pass={damageInRange} total={top5Windows[0].sum} />
              </td>
            </tr>
          </table>
        );
      explanations.push(content);
    }

    return (
      <div>
        <ExplanationGraph
          fightStartTime={fightStartTime}
          fightEndTime={fightEndTime}
          graphData={graphData}
          yAxisName="Damage Ratio"
          explanations={explanations}
        />
      </div>
    );
  }

  /** LETS USE THE GENERIC GRAPH MODULE :POGGA: */
  if (graphData.length === 0 && windows.length > 0) {
    for (const window of windows) {
      const dataSeries: DataSeries[] = [
        {
          spellTracker: window.breathPerformance.temporalWoundsCounter,
          type: 'area',
          color: '#736F4E',
          label: 'Temporal Wounds',
          strokeWidth: 3,
        },
        {
          spellTracker: window.flightData,
          type: 'area',
          color: '#FF6B6B',
          label: 'Flight Time',
          strokeWidth: 3,
        },
        {
          spellTracker: ebonMightCount,
          type: 'line',
          color: '#F3A738',
          label: 'Ebon Might',
          size: 4,
        },
        {
          spellTracker: shiftingSandsCount,
          type: 'line',
          color: '#F7EC59',
          label: 'Shifting Sands',
          size: 4,
        },
        {
          spellTracker: window.breathPerformance.damageProblemPoints,
          type: 'point',
          color: 'red',
          label: 'Problem Points',
          size: 120,
        },
      ];
      const error =
        window.breathPerformance.temporalWoundsCounter.length > 0 ? undefined : (
          <div>You didn't hit anything</div>
        );
      const newGraphData = generateGraphData(
        dataSeries,
        window.start - 3000,
        window.end + 3000,
        'Breath Window',
        error,
      );
      graphData.push(newGraphData);

      /** Generate our explanations */
      const content =
        window.breathPerformance.temporalWoundsCounter.length === 0 ? (
          <div></div>
        ) : (
          <table className="graph-explanations">
            <tbody>
              <tr>
                <td>Ebon Might Uptime</td>
                <td className="pass-fail-counts">
                  {' '}
                  {(
                    (window.end -
                      window.start -
                      window.breathPerformance.ebonMightDroppedDuration) /
                    1000
                  ).toFixed(1)}
                  s / {((window.end - window.start) / 1000).toFixed(1)}s
                </td>
                <td>
                  <PassFailBar
                    pass={
                      window.end - window.start - window.breathPerformance.ebonMightDroppedDuration
                    }
                    total={window.end - window.start}
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <TooltipElement
                    content={t({
                      id: 'guide.augmentation.breathofeons.damage',
                      message:
                        'This value indicates the amount of damage you did, along with the potential damage you lost to mobs dying early. This value is a guesstimation and therefore not 100% accurate.',
                    })}
                  >
                    Damage
                  </TooltipElement>
                </td>
                <td>
                  {formatNumber(window.breathPerformance.damage)} /{' '}
                  {formatNumber(
                    window.breathPerformance.damage + window.breathPerformance.potentialLostDamage,
                  )}
                </td>
                <td>
                  <PassFailBar
                    pass={window.breathPerformance.damage}
                    total={
                      window.breathPerformance.damage + window.breathPerformance.potentialLostDamage
                    }
                  />
                </td>
              </tr>
            </tbody>
            <tbody>
              <tr>
                <strong>Cast performance</strong>
              </tr>
              <tr>
                <td>
                  <SpellLink spell={SPELLS.FIRE_BREATH} /> casts{' '}
                </td>
                <td>
                  {window.breathPerformance.fireBreaths} /{' '}
                  {window.breathPerformance.possibleFireBreaths}
                </td>
                <td>
                  <PassFailBar
                    pass={window.breathPerformance.fireBreaths}
                    total={window.breathPerformance.possibleFireBreaths}
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <SpellLink spell={SPELLS.UPHEAVAL} /> casts{' '}
                </td>
                <td>
                  {window.breathPerformance.upheavels} /{' '}
                  {window.breathPerformance.possibleUpheavels}
                </td>
                <td>
                  <PassFailBar
                    pass={window.breathPerformance.upheavels}
                    total={window.breathPerformance.possibleUpheavels}
                  />
                </td>
              </tr>
              {window.breathPerformance.timeskipTalented && (
                <tr>
                  <td>
                    <SpellLink spell={TALENTS.TIME_SKIP_TALENT} /> casts{' '}
                  </td>
                  <td>
                    {window.breathPerformance.timeSkips} /{' '}
                    {window.breathPerformance.possibleTimeSkips}
                  </td>
                  <td>
                    <PassFailBar
                      pass={window.breathPerformance.timeSkips}
                      total={window.breathPerformance.possibleTimeSkips}
                    />
                  </td>
                </tr>
              )}
              <tr>
                <td>Potion used </td>
                <td>
                  {window.breathPerformance.potionUsed} / {window.breathPerformance.possiblePotions}
                </td>
                <td>
                  <PassFailBar
                    pass={window.breathPerformance.potionUsed}
                    total={window.breathPerformance.possiblePotions}
                  />
                </td>
              </tr>
              {window.breathPerformance.possibleTrinkets >= 0 && (
                <tr>
                  <td>Trinket used </td>
                  <td>
                    {window.breathPerformance.trinketUsed} /{' '}
                    {window.breathPerformance.possibleTrinkets}
                  </td>
                  <td>
                    <PassFailBar
                      pass={window.breathPerformance.trinketUsed}
                      total={window.breathPerformance.possibleTrinkets}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        );
      explanations.push(content);
    }
  }

  return (
    <SubSection title="Breath of Eons">
      <div>
        <p>
          <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> is a powerful cooldown that should be
          used along side your allies cooldowns, since it's a major damage amplifier.{' '}
          <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> will replicate damage done by your{' '}
          <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> targets, it is therefore important to
          maintain 100% uptime on <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> during your{' '}
          <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> windows.
          <br />
        </p>
        <div>
          <p>
            With <SpellLink spell={TALENTS.TIME_SKIP_TALENT} /> talented, you should aim to use{' '}
            <SpellLink spell={TALENTS.TIME_SKIP_TALENT} /> alongside every other{' '}
            <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} />.{' '}
            <SpellLink spell={TALENTS.TIME_SKIP_TALENT} /> should be used to reduce the cooldown of
            your empowers, <SpellLink spell={SPELLS.FIRE_BREATH} /> and{' '}
            <SpellLink spell={SPELLS.UPHEAVAL} /> to maximize the amount of{' '}
            <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} /> buffs you have active.
            <br />
          </p>
          <p>
            You can use the graph below to visualize your buffs:{' '}
            <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} />,{' '}
            <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> along with your{' '}
            <SpellLink spell={SPELLS.TEMPORAL_WOUND_DEBUFF} /> debuffs, for each individual{' '}
            <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> window. Problem points such as:
            letting <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> drop during your{' '}
            <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> windows, or a mob dying before{' '}
            <SpellLink spell={SPELLS.TEMPORAL_WOUND_DEBUFF} /> runs out, will be pointed out.
          </p>
        </div>
      </div>
      <ExplanationGraph
        fightStartTime={fightStartTime}
        fightEndTime={fightEndTime}
        graphData={graphData}
        yAxisName=""
        explanations={explanations}
      />
      <div className="graph-window-container">
        <header>Breath Window Helper</header>
        <p>
          <span className="currentBreath">Current Breath timing</span> -{' '}
          <span className="optimalBreath">Optimal Breath timing</span>
        </p>
        <LazyLoadGuideSection loader={loadData.bind(this)} value={findOptimalWindow.bind(this)} />
      </div>
    </SubSection>
  );
};

export default BreathOfEonsSection;
