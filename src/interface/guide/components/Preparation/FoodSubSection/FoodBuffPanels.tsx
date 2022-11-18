import Spell from 'common/SPELLS/Spell';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CurrentFoodBuff from 'interface/guide/components/Preparation/FoodSubSection/CurrentFoodBuff';
import { SideBySidePanels } from 'interface/guide/components/GuideDivs';
import RecommendedFoodBuffs from 'interface/guide/components/Preparation/FoodSubSection/RecommendedFoodBuffs';

interface Props {
  foodBuff?: Spell;
  performance: QualitativePerformance;
  recommendedFoods: Spell[];
}
const FoodBuffPanels = ({ foodBuff, performance, recommendedFoods }: Props) => {
  if (performance === QualitativePerformance.Perfect) {
    return <CurrentFoodBuff foodBuff={foodBuff} performance={performance} />;
  }
  return (
    <SideBySidePanels>
      <CurrentFoodBuff foodBuff={foodBuff} performance={performance} />
      <RecommendedFoodBuffs recommendedFoods={recommendedFoods} />
    </SideBySidePanels>
  );
};

export default FoodBuffPanels;
