import Spell from 'common/SPELLS/Spell';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import { PanelHeader, PerformanceRoundedPanel } from '../ExtraDivs';

interface Props {
  foodBuff?: Spell;
  performance: QualitativePerformance;
}
const CurrentFoodBuff = ({ foodBuff, performance }: Props) => {
  const showCurrentFoodBuff = foodBuff ? (
    <>
      : <SpellLink id={foodBuff} />
    </>
  ) : (
    <>.</>
  );
  return (
    <PerformanceRoundedPanel performance={performance}>
      <PanelHeader>
        <strong>Current Food Buff</strong>
      </PanelHeader>
      {performance === QualitativePerformance.Perfect && (
        <p>You had the best food active when starting the fight{showCurrentFoodBuff}</p>
      )}
      {performance === QualitativePerformance.Good && (
        <p>You had high quality food active when starting the fight{showCurrentFoodBuff}</p>
      )}
      {performance === QualitativePerformance.Ok && (
        <p>You did not have the best food active when starting the fight{showCurrentFoodBuff}</p>
      )}
      {performance === QualitativePerformance.Fail && (
        <p>You did not have any food active when starting the fight.</p>
      )}
    </PerformanceRoundedPanel>
  );
};

export default CurrentFoodBuff;
