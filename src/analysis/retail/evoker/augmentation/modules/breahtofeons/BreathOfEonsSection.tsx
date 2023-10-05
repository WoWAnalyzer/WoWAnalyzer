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
import LazyLoadGuideSection from 'analysis/retail/evoker/shared/modules/components/LazyLoadGuideSection';
import { blacklist } from '../features/BuffTargetHelper/BuffTargetHelper';
import { fetchEvents } from 'common/fetchWclApi';
import CombatLogParser from '../../CombatLogParser';
import ExplanationGraph, {
  DataSeries,
  GraphData,
  SpellTracker,
  generateGraphData,
} from 'analysis/retail/evoker/shared/modules/components/ExplanationGraph';
import DonutChart from 'parser/ui/DonutChart';
import { PlayerInfo } from 'parser/core/Player';

type Props = {
  windows: BreathOfEonsWindows[];
  fightStartTime: number;
  fightEndTime: number;
  ebonMightCount: SpellTracker[];
  shiftingSandsCount: SpellTracker[];
  owner: CombatLogParser;
};

const BreathOfEonsSection: React.FC<Props> = ({
  windows,
  fightStartTime,
  fightEndTime,
  ebonMightCount,
  shiftingSandsCount,
  owner,
}) => {
  const graphData: GraphData[] = [];
  const explanations: JSX.Element[] = [];
  const damageTables: {
    table: any[];
    start: number;
    end: number;
  }[] = [];

  /** Generate filter based on black list and whitelist
   * For now we only look at the players who were buffed
   * during breath */
  function getFilter(window: BreathOfEonsWindows) {
    //console.log(window.breathPerformance.buffedPlayers);
    //const playerNames = ['Olgey', 'Yuette', 'Dérp', 'Dolanpepe'];
    const playerNames = Array.from(window.breathPerformance.buffedPlayers.keys());
    const nameFilter = playerNames.map((name) => `"${name}"`).join(', ');

    /** Blacklist is set in BuffTargetHelper module */
    const abilityFilter = blacklist.map((id) => `${id}`).join(', ');

    const filter = `type = "damage" 
    AND not ability.id in (${abilityFilter}) 
    AND (source.name in (${nameFilter}, "${owner.selectedCombatant.name}") OR source.owner.name in (${nameFilter}, "${owner.selectedCombatant.name}") ) 
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
        20,
      );
      damageTables.push({
        table: windowEvents,
        start: window.start,
        end: window.end,
      });
    }
  }

  /** We want to attribute pet damage to it's owner
   * This information isn't found in V1 damage events, therefore
   * we need to find the pets and assign them to their respective owner
   * Luckily, all pets, along with their owner info, is found in the report! */
  const pets: number[] = [];
  const petToPlayerMap = new Map<number, number>();
  for (const pet of owner.report.friendlyPets) {
    petToPlayerMap.set(pet.id, pet.petOwner);
    pets.push(pet.id);
  }
  /** Due to MC mechanics we can have friendly pets do damage
   * but not show up as a friendlyPet, but rather enemyPet
   * since we are filtering for specific players might as well
   * just attribute these as well. */
  for (const pet of owner.report.enemyPets) {
    petToPlayerMap.set(pet.id, pet.petOwner);
    pets.push(pet.id);
  }
  /** Assign playerId with PlayerInfo */
  const playerNameMap = new Map<number, PlayerInfo>();
  for (const player of owner.report.friendlies) {
    playerNameMap.set(player.id, player);
  }

  function findOptimalWindow() {
    const graphData: GraphData[] = [];
    const explanations: JSX.Element[] = [];

    let index = 0;

    for (const table of damageTables) {
      if (!windows[index]) {
        continue;
      }

      /** Figure out if we should be looking at dropped Ebon Might damage
       * We only care when we fully drop Ebon Might not individually, since
       * that usually means player death and will naturally be handled by them
       * no longer providing us with new events. Plus this is an easy solution! */
      const ebonMightDropTimestamp =
        windows[index].breathPerformance.ebonMightProblems.find((problem) => problem.count === 0)
          ?.timestamp ?? 0;
      const ebonMightReappliedTimestamp =
        ebonMightDropTimestamp + windows[index].breathPerformance.ebonMightDroppedDuration;

      const damageWindows = [];
      const recentDamage: any[] = [];
      let damageInRange = 0;
      let lostDamage = 0;

      const breathStart = windows[index].start;
      const breathEnd = windows[index].end;
      const breathLength = breathEnd - breathStart;

      for (const event of table.table) {
        recentDamage.push(event);

        // Calculate the sum only for events within the current window
        if (event.timestamp >= breathStart && event.timestamp <= breathEnd) {
          if (!event.subtractsFromSupportedActor) {
            if (
              event.timestamp >= ebonMightDropTimestamp &&
              event.timestamp <= ebonMightReappliedTimestamp
            ) {
              lostDamage += event.amount + (event.absorbed ?? 0);
            } else {
              damageInRange += event.amount + (event.absorbed ?? 0);
            }
          }
        }

        /** Logic for finding the top windows */
        while (
          recentDamage[recentDamage.length - 1].timestamp - recentDamage[0].timestamp >=
          breathLength
        ) {
          // Calculate the sum only for events within the current window
          const eventsWithinWindow = recentDamage.filter(
            (event) =>
              event.timestamp >= recentDamage[0].timestamp &&
              event.timestamp <= recentDamage[0].timestamp + breathLength,
          );

          const sourceSums = [];

          for (const eventWithinWindow of eventsWithinWindow) {
            if (!eventWithinWindow.subtractsFromSupportedActor) {
              let sourceID = eventWithinWindow.sourceID;
              if (pets.includes(eventWithinWindow.sourceID)) {
                sourceID = petToPlayerMap.get(eventWithinWindow.sourceID);
              }

              const damageAmount = eventWithinWindow.amount + (eventWithinWindow.absorbed ?? 0);

              // Find the index of sourceID in the sourceSums array
              const index = sourceSums.findIndex((sum) => sum.sourceID === sourceID);
              if (index !== -1) {
                // If sourceID exists, update the damage amount
                sourceSums[index].damage += damageAmount;
              } else {
                // If sourceID doesn't exist, add it to the array
                sourceSums.push({ sourceID, damage: damageAmount });
              }
            }
          }

          const sortedSourceSums = sourceSums.sort((a, b) => b.damage - a.damage);

          const currentWindowSum = eventsWithinWindow.reduce((acc, event) => {
            if (event.subtractsFromSupportedActor) {
              return acc;
            } else {
              return acc + event.amount + (event.absorbed ?? 0);
            }
          }, 0);

          damageWindows.push({
            start: recentDamage[0].timestamp,
            end: recentDamage[0].timestamp + breathLength,
            sum: currentWindowSum,
            sumSources: sortedSourceSums,
            startFormat: formatDuration(recentDamage[0].timestamp - fightStartTime),
            endFormat: formatDuration(recentDamage[0].timestamp + breathLength - fightStartTime),
          });
          recentDamage.shift();
        }
      }

      const sortedWindows = damageWindows.sort((a, b) => b.sum - a.sum);
      const topWindow = sortedWindows[0];

      console.log(index + 1 + '. ', 'Top Window:', topWindow);
      console.log(
        index + 1 + '.',
        'Damage within current window:',
        damageInRange,
        'Expected sum:',
        windows[index].breathPerformance.damage * 10,
        ' difference:',
        windows[index].breathPerformance.damage * 10 - damageInRange,
        'start:',
        formatDuration(breathStart - fightStartTime),
        breathStart,
        'end:',
        formatDuration(breathEnd - fightStartTime),
        breathEnd,
      );
      console.log(index + 1 + '.', 'damage lost:', lostDamage);
      index += 1;

      /** Generate graphdata and explanation output below */
      const dataSeries: DataSeries[] = !topWindow
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
                  timestamp: topWindow.start,
                  count: 1 * (topWindow.sum / damageInRange),
                },
                {
                  timestamp: topWindow.end,
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
        !topWindow ? <>You didn't hit anything</> : undefined,
      );
      graphData.push(newGraphData);

      const playerDrilldown: JSX.Element[] = [];

      for (const source of topWindow.sumSources) {
        playerDrilldown.push(
          <tr>
            <td>{source.sourceID}</td>
            <td>{formatNumber(source.damage)}</td>
            <td className="player-perf">
              <PassFailBar pass={source.damage} total={topWindow.sum} />
            </td>
          </tr>,
        );
      }

      /** Custom color mage because if we give class colors the Donut
       * breaks and randomly sorts items.
       * It makes sense to do it like this anyways, since multiple players
       * of the same class can show up in the same window, so having unique
       * colors for all players makes sense. */
      const damageSources = [];
      const colorMap = [
        'rgb(123,188,93)',
        'rgb(216,59,59)',
        'rgb(216,100,59)',
        'rgb(20,59,59)',
        'rgb(20,59,200)',
      ];

      for (let i = 0; i < topWindow.sumSources.length; i += 1) {
        const source = topWindow.sumSources[i];
        const playerInfo = playerNameMap.get(source.sourceID);
        damageSources.push({
          color: colorMap[i],
          label: playerInfo?.name,
          valueTooltip: formatNumber(source.damage),
          value: source.damage,
        });
      }

      const content: JSX.Element = !topWindow ? (
        <div></div>
      ) : (
        <table className="graph-explanations">
          <tbody>
            <tr>
              <td>
                <TooltipElement
                  content="Due to how Blizzard deals with damage attributions, 
                  the values shown here are going to be within a small margin of error.
                  These values also don't take into account mobs dying early or Ebon Might being dropped."
                >
                  Damage
                </TooltipElement>
              </td>
              <td>
                {formatNumber(damageInRange * 0.1)} / {formatNumber(topWindow.sum * 0.1)}
              </td>
              <td>
                <PassFailBar pass={damageInRange * 0.1} total={topWindow.sum * 0.1} />
              </td>
            </tr>
            <tr>
              <td>
                <TooltipElement
                  content="This value represents the amount of damage you could have 
                gotten if you had used your breath at the optimal timing"
                >
                  Potential damage increase:
                </TooltipElement>
              </td>
              <td>{Math.round(((topWindow.sum - damageInRange) / damageInRange) * 100)}%</td>
            </tr>
          </tbody>
          {lostDamage > 0 && (
            <tbody>
              <tr>
                <td>
                  <TooltipElement
                    content="Damage lost due to dropping Ebon Might during your Breath of Eons. 
                  This value doesn't take into account mobs dying early."
                  >
                    <span className="badCast">Lost Damage:</span>
                  </TooltipElement>
                </td>
                <td>{formatNumber(lostDamage * 0.1)}</td>
              </tr>
            </tbody>
          )}
          <br />
          <tbody>
            <tr>
              <strong>Player contribution breakdown</strong>
            </tr>
            <DonutChart items={damageSources} />
          </tbody>
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

  /** Generate graph data for Breath Windows */
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
        {
          spellTracker: window.breathPerformance.ebonMightProblems,
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
          This module will help you figure out when it would have been optimal to have used your{' '}
          <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} />. This can be usefull in helping your
          figure out when bursty specs like{' '}
          <span className="DeathKnight">Unholy Death Knights</span>,{' '}
          <span className="Warlock">Demonology Warlocks</span> or{' '}
          <span className="Mage">Arcane Mages</span> are fully ramped up.
        </p>
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
