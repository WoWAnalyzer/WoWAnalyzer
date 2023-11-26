import { BreathOfEonsWindows } from './BreathOfEonsRotational';
import '../Styling.scss';
import CombatLogParser from '../../CombatLogParser';
import ExplanationGraph from 'analysis/retail/evoker/shared/modules/components/ExplanationGraph';
import { GraphDataType } from 'analysis/retail/evoker/shared/modules/components/types';
import getPetValues from './evaluatePets';
import processWindowData from './processWindowData';
import { DamageTable } from './BreathOfEonsHelper';
import GraphDataForWindow from './GraphDataWindow';
import ExplanationContent from './ExplanationContent';

type Props = {
  windows: BreathOfEonsWindows[];
  fightStartTime: number;
  fightEndTime: number;
  owner: CombatLogParser;
  damageTables: DamageTable[];
  buffer: number;
};

const OptimalWindow = ({
  fightEndTime,
  fightStartTime,
  owner,
  windows,
  damageTables,
  buffer,
}: Props) => {
  /** We want to attribute pet damage to it's owner
   * This information isn't found in V1 damage events, therefore
   * we need to find the pets and assign them to their respective owner
   * Luckily, all pets, along with their owner info, is found in the report! */
  const { pets, petToPlayerMap } = getPetValues(owner);

  const graphData: GraphDataType[] = [];
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
      topWindowOptimalTarget,
      sourceInRange,
    } = processWindowData({
      index,
      damageTables,
      windows,
      pets,
      petToPlayerMap,
      owner,
      fightStartTime,
    });

    const newGraphData = GraphDataForWindow({
      breathEnd,
      breathStart,
      buffer,
      damageInRange,
      topWindow,
      topWindowOptimal: topWindowOptimalTarget,
    });
    graphData.push(newGraphData);

    const content = ExplanationContent({
      owner,
      damageInRange,
      damageToDisplay,
      earlyDeadMobsDamage,
      inRangeSum: sourceInRange,
      lostDamage,
      topWindow,
      topWindowOptimalTargets: topWindowOptimalTarget,
    });
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
};

export default OptimalWindow;
