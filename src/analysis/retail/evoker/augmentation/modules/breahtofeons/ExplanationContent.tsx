import { TooltipElement } from 'interface';
import { formatNumber } from 'common/format';
import PassFailBar from 'interface/guide/components/PassFailBar';
import '../Styling.scss';
import CombatLogParser from '../../CombatLogParser';
import DonutChart from 'parser/ui/DonutChart';
import { PlayerInfo } from 'parser/core/Player';
import { BREATH_OF_EONS_MULTIPLIER } from '../../constants';
import { DamageSources, DamageWindow } from './BreathOfEonsHelper';

type Props = {
  owner: CombatLogParser;
  topWindow: DamageWindow;
  topWindowOptimalTargets: DamageWindow;
  inRangeSum: DamageSources[];
  damageToDisplay: number;
  damageInRange: number;
  lostDamage: number;
  earlyDeadMobsDamage: number;
};

const ExplanationContent = ({
  owner,
  damageInRange,
  damageToDisplay,
  earlyDeadMobsDamage,
  inRangeSum,
  lostDamage,
  topWindow,
  topWindowOptimalTargets,
}: Props) => {
  /** Assign playerId with PlayerInfo */
  const playerNameMap = new Map<number, PlayerInfo>();
  for (const player of owner.report.friendlies) {
    playerNameMap.set(player.id, player);
  }

  if (!topWindow) {
    return <div></div>;
  }

  const damageSourcesOptimal = [];
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

  const optimalSources = topWindowOptimalTargets.sumSources
    .map((player) => player.sourceID)
    .sort((a, b) => a - b)
    .toString();
  const currentSources = topWindow.sumSources
    .map((player) => player.sourceID)
    .sort((a, b) => a - b)
    .toString();

  const sameTargets = optimalSources === currentSources;

  const damageSourcesOptimalTargets = [];

  if (!sameTargets) {
    for (let i = 0; i < topWindowOptimalTargets.sumSources.length; i += 1) {
      const source = topWindowOptimalTargets.sumSources[i];
      const playerInfo = playerNameMap.get(source.sourceID);
      damageSourcesOptimalTargets.push({
        color: colorMap[i],
        label: playerInfo?.name,
        valueTooltip: formatNumber(source.damage * BREATH_OF_EONS_MULTIPLIER),
        value: source.damage,
      });
    }
  }

  const damageSourcesCurrent = [];

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
      <div className="explanation-table">
        <div className="flex-row">
          <div className="flex-cell">
            <TooltipElement
              content="Because of the way Blizzard handles damage attribution, the values 
                    displayed here may have a small margin of error. Additionally, if an enemy 
                    becomes immune or takes reduced damage when your Breath of Eons explodes, this 
                    value may also be overestimated."
            >
              Damage:
            </TooltipElement>
          </div>
          <div className="flex-cell">
            {formatNumber(damageToDisplay)} /{' '}
            {formatNumber(topWindowOptimalTargets.sum * BREATH_OF_EONS_MULTIPLIER)}
          </div>
          <div className="flex-cell">
            <PassFailBar
              pass={damageToDisplay}
              total={topWindowOptimalTargets.sum * BREATH_OF_EONS_MULTIPLIER}
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
            {Math.round(((topWindowOptimalTargets.sum - damageInRange) / damageInRange) * 100)}%
          </div>
        </div>
      </div>
      {lostDamage + earlyDeadMobsDamage > 0 && (
        <div className="explanation-table">
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
      <div className="explanation-table">
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
        {!sameTargets && (
          <div className="table">
            <div className="flex-row">
              <div className="flex-cell">
                <span className="optimalTargetsBreath">Optimal Targets Window</span>
                <DonutChart items={damageSourcesOptimalTargets} />
              </div>
              <div className="flex-cell"></div>
              <div className="flex-cell"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return content;
};

export default ExplanationContent;
