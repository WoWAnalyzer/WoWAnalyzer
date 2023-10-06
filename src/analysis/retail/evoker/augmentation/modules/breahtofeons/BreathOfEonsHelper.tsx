import React from 'react';
import { BreathOfEonsWindows } from './BreathOfEonsRotational';
import { SubSection } from 'interface/guide';
import { SpellLink, TooltipElement } from 'interface';
import { formatDuration, formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/evoker';
import PassFailBar from 'interface/guide/components/PassFailBar';
import '../Styling.scss';
import LazyLoadGuideSection from 'analysis/retail/evoker/shared/modules/components/LazyLoadGuideSection';
import { fetchEvents } from 'common/fetchWclApi';
import CombatLogParser from '../../CombatLogParser';
import ExplanationGraph, {
  DataSeries,
  GraphData,
  generateGraphData,
} from 'analysis/retail/evoker/shared/modules/components/ExplanationGraph';
import DonutChart from 'parser/ui/DonutChart';
import { PlayerInfo } from 'parser/core/Player';
import { DamageEvent } from 'parser/core/Events';
import { BREATH_OF_EONS_MULTIPLIER, ABILITY_BLACKLIST } from '../../constants';

type Props = {
  windows: BreathOfEonsWindows[];
  fightStartTime: number;
  fightEndTime: number;
  owner: CombatLogParser;
};

const debug = false;

const BreathOfEonsHelper: React.FC<Props> = ({ windows, fightStartTime, fightEndTime, owner }) => {
  const damageTables: {
    table: DamageEvent[];
    start: number;
    end: number;
  }[] = [];

  /** Generate filter based on black list and whitelist
   * For now we only look at the players who were buffed
   * during breath */
  function getFilter(window: BreathOfEonsWindows) {
    const playerNames = Array.from(window.breathPerformance.buffedPlayers.keys());
    const nameFilter = playerNames.map((name) => `"${name}"`).join(', ');

    const abilityFilter = ABILITY_BLACKLIST.map((id) => `${id}`).join(', ');

    const filter = `type = "damage" 
    AND not ability.id in (${abilityFilter}) 
    AND (source.name in (${nameFilter}, "${owner.selectedCombatant.name}") OR source.owner.name in (${nameFilter}, "${owner.selectedCombatant.name}")) 
    AND (target.id != source.id) AND (supportedActor.id = 0)`;

    if (debug) {
      console.log(filter);
    }
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
      const windowEvents = (await fetchEvents(
        owner.report.code,
        startTime,
        endTime,
        undefined,
        getFilter(window),
        20,
      )) as DamageEvent[];
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

    for (let index = 0; index < damageTables.length; index += 1) {
      if (!windows[index]) {
        continue;
      }

      const {
        damageInRange,
        lostDamage,
        earlyDeadMobsDamage,
        breathStart,
        breathEnd,
        damageToDisplay,
        topWindow,
        sourceInRange,
      } = processWindowData(index);

      const newGraphData = generateGraphDataForWindow(
        topWindow,
        breathStart,
        breathEnd,
        damageInRange,
      );
      graphData.push(newGraphData);

      const content = generateExplanationContent(
        topWindow,
        sourceInRange,
        damageToDisplay,
        damageInRange,
        lostDamage,
        earlyDeadMobsDamage,
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

  function processWindowData(index: number) {
    const table = damageTables[index];

    const windowData: BreathOfEonsWindows = windows[index];

    const ebonMightDropTimestamp =
      windowData.breathPerformance.ebonMightProblems.find((problem) => problem.count === 0)
        ?.timestamp ?? 0;
    const ebonMightReappliedTimestamp =
      ebonMightDropTimestamp + windowData.breathPerformance.ebonMightDroppedDuration;

    const damageWindows = [];
    const recentDamage: DamageEvent[] = [];
    let damageInRange = 0;
    const sourceInRange = [];
    let lostDamage = 0;
    let earlyDeadMobsDamage = 0;

    const breathStart = windowData.start;
    const breathEnd = windowData.end;
    const breathLength = breathEnd - breathStart;

    const mobsToIgnore = [];
    for (const event of windowData.breathPerformance.earlyDeadMobs) {
      mobsToIgnore.push({
        targetID: event.targetID,
        targetInstance: event.targetInstance,
      });
    }

    for (const event of table.table) {
      recentDamage.push(event);

      if (event.timestamp >= breathStart && event.timestamp <= breathEnd) {
        /** These shouldn't show up but just incase */
        if (event.subtractsFromSupportedActor) {
          continue;
        }

        const sourceID = pets.includes(event.sourceID ?? -1)
          ? petToPlayerMap.get(event.sourceID ?? -1)
          : event.sourceID;

        const damageAmount = event.amount + (event.absorbed ?? 0);

        const index = sourceInRange.findIndex((sum) => sum.sourceID === sourceID);
        if (index !== -1) {
          sourceInRange[index].damage += damageAmount;
        } else {
          sourceInRange.push({ sourceID, damage: damageAmount, lostDamage: 0 });
        }

        if (
          event.timestamp >= ebonMightDropTimestamp &&
          event.timestamp <= ebonMightReappliedTimestamp
        ) {
          lostDamage += damageAmount;
        }
        damageInRange += damageAmount;

        if (
          mobsToIgnore.some(
            (item) =>
              item.targetID === event.targetID && item.targetInstance === event.targetInstance,
          )
        ) {
          earlyDeadMobsDamage += damageAmount;
        }
      }

      while (
        recentDamage[recentDamage.length - 1].timestamp - recentDamage[0].timestamp >=
        breathLength
      ) {
        const eventsWithinWindow = recentDamage.filter(
          (event) =>
            event.timestamp >= recentDamage[0].timestamp &&
            event.timestamp <= recentDamage[0].timestamp + breathLength,
        );

        const sourceSums = [];
        let currentWindowSum = 0;

        for (const eventWithinWindow of eventsWithinWindow) {
          /** These shouldn't show up but just incase */
          if (eventWithinWindow.subtractsFromSupportedActor) {
            continue;
          }

          const sourceID = pets.includes(eventWithinWindow.sourceID ?? -1)
            ? petToPlayerMap.get(eventWithinWindow.sourceID ?? -1)
            : eventWithinWindow.sourceID;

          const damageAmount = eventWithinWindow.amount + (eventWithinWindow.absorbed ?? 0);
          currentWindowSum += damageAmount;

          const index = sourceSums.findIndex((sum) => sum.sourceID === sourceID);
          if (index !== -1) {
            sourceSums[index].damage += damageAmount;
          } else {
            sourceSums.push({ sourceID, damage: damageAmount });
          }
        }

        const sortedSourceSums = sourceSums.sort((a, b) => b.damage - a.damage);

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

    sourceInRange.sort((a, b) => b.damage - a.damage);

    const sortedWindows = damageWindows.sort((a, b) => b.sum - a.sum);
    const topWindow = sortedWindows[0];
    /** If the damage difference between what we found and what actually happened is greated than 10%
     * we display the actual amount - this only seems to happen when a target becomes immune before
     * Breath explodes, resulting in an overevaluation. e.g. Neltharion */
    const damageDifference =
      ((damageInRange - earlyDeadMobsDamage) * BREATH_OF_EONS_MULTIPLIER) /
      windows[index].breathPerformance.damage;
    const damageToDisplay =
      damageDifference > 1.1 || damageDifference < 0.9
        ? windows[index].breathPerformance.damage
        : (damageInRange - earlyDeadMobsDamage) * BREATH_OF_EONS_MULTIPLIER;

    if (debug) {
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
      console.log(index + 1 + '.', 'source:', sourceInRange);
      console.log(index + 1 + '.', 'damage lost to ebon drop:', lostDamage);
      console.log(index + 1 + '.', 'damage lost to early mob deaths:', earlyDeadMobsDamage);
    }

    return {
      damageInRange,
      lostDamage,
      earlyDeadMobsDamage,
      breathStart,
      breathEnd,
      damageToDisplay,
      topWindow,
      sourceInRange,
    };
  }

  function generateGraphDataForWindow(
    topWindow: any,
    breathStart: number,
    breathEnd: number,
    damageInRange: number,
  ) {
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
      !topWindow ? <>You didn't hit anything.</> : undefined,
    );

    return newGraphData;
  }

  function generateExplanationContent(
    topWindow: any,
    inRangeSum: any,
    damageToDisplay: number,
    damageInRange: number,
    lostDamage: number,
    earlyDeadMobsDamage: number,
  ) {
    if (!topWindow) {
      return <div></div>;
    }

    const damageSourcesOptimal = [];
    /** These specific colors are choosen because certain colors seems to completely break the donut
     * And randomizes the ouput ie. values are not properly orded. */
    const colorMap = ['#2D3142', '#4F5D75', '#BFC0C0', '#EF8354', '#FFFFFF'];

    for (let i = 0; i < topWindow.sumSources.length; i += 1) {
      const source = topWindow.sumSources[i];
      const playerInfo = playerNameMap.get(source.sourceID);
      damageSourcesOptimal.push({
        color: colorMap[i],
        label: playerInfo?.name,
        valueTooltip: formatNumber(source.damage * BREATH_OF_EONS_MULTIPLIER),
        value: source.damage,
      });
    }

    const damageSourcesCurrent = [];
    /** These specific colors are choosen because certain colors seems to completely break the donut
     * And randomizes the ouput ie. values are not properly orded. */

    for (let i = 0; i < inRangeSum.length; i += 1) {
      const source = inRangeSum[i];
      const playerInfo = playerNameMap.get(source.sourceID);
      damageSourcesCurrent.push({
        color: colorMap[i],
        label: playerInfo?.name,
        valueTooltip: formatNumber(source.damage * BREATH_OF_EONS_MULTIPLIER),
        value: source.damage,
      });
    }

    const content: JSX.Element = (
      <div className="flex-container">
        <div className="table">
          <div className="flex-row">
            <div className="flex-cell">
              <TooltipElement
                content="Because of the way Blizzard handles damage attribution, the values 
                    displayed here may have a small margin of error. Additionally, if an enemy 
                    becomes immune or takes reduced damage when your Breath of Eons explodes, this 
                    value may also be overestimated, e.g. Neltharion going immune mid-Breath."
              >
                Damage:
              </TooltipElement>
            </div>
            <div className="flex-cell">
              {formatNumber(damageToDisplay)} /{' '}
              {formatNumber(topWindow.sum * BREATH_OF_EONS_MULTIPLIER)}
            </div>
            <div className="flex-cell">
              <PassFailBar
                pass={damageToDisplay}
                total={topWindow.sum * BREATH_OF_EONS_MULTIPLIER}
              />
            </div>
          </div>
          <div className="flex-row">
            <div className="flex-cell">
              <TooltipElement
                content="This value represents the potential damage increase achievable 
                    by using Breath of Eons at its optimal timing. It assumes that you didn't 
                    lose any damage due to prematurely dropping Ebon Might or mobs dying early."
              >
                Potential damage increase:
              </TooltipElement>
            </div>
            <div className="flex-cell">
              {Math.round(((topWindow.sum - damageInRange) / damageInRange) * 100)}%
            </div>
          </div>
        </div>
        {lostDamage + earlyDeadMobsDamage > 0 && (
          <div className="table">
            <div className="flex-row">
              <strong className="badCast">You lost damage to the following:</strong>
            </div>
            {lostDamage > 0 && (
              <div className="flex-row">
                <div className="flex-cell">
                  <span>Dropped Ebon Might uptime:</span>
                </div>
                <div className="flex-cell">
                  {formatNumber(lostDamage * BREATH_OF_EONS_MULTIPLIER)}
                </div>
              </div>
            )}
            {earlyDeadMobsDamage > 0 && (
              <div className="flex-row">
                <div className="flex-cell">
                  <span>Mobs dying early:</span>
                </div>
                <div className="flex-cell">
                  {formatNumber(earlyDeadMobsDamage * BREATH_OF_EONS_MULTIPLIER)}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="table">
          <div className="flex-row">
            <TooltipElement
              content="The values below assume that you didn't lose any damage 
                  due to prematurely dropping Ebon Might or mobs dying early."
            >
              <strong>Player contribution breakdown</strong>
            </TooltipElement>
          </div>
          <div className="flex-row">
            <div className="flex-cell">
              <span className=" currentBreath">Current Window</span>
              <DonutChart items={damageSourcesCurrent} />
            </div>
            <div className="flex-cell"></div>
            <div className="flex-cell">
              <span className=" optimalBreath">Optimal Window</span>
              <DonutChart items={damageSourcesOptimal} />
            </div>
          </div>
        </div>
      </div>
    );

    return content;
  }

  return (
    <SubSection title="Breath of Eons helper">
      <p>
        This module offers a detailed damage breakdown of your{' '}
        <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> usage.
        <br />
        Additionally, it helps you determine if there was a more optimal timing for your{' '}
        <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} />. This can be particularly valuable when
        dealing with bursty specs like <span className="DeathKnight">Unholy Death Knights</span>,{' '}
        <span className="Warlock">Demonology Warlocks</span>, or{' '}
        <span className="Mage">Arcane Mages</span>.
      </p>

      <LazyLoadGuideSection loader={loadData.bind(this)} value={findOptimalWindow.bind(this)} />
    </SubSection>
  );
};

export default BreathOfEonsHelper;
