import { SubSection, useAnalyzer, useInfo } from 'interface/guide/index';
import FoodChecker from 'parser/retail/modules/items/FoodChecker';
import Spell from 'common/SPELLS/Spell';
import { maybeGetSpell } from 'common/SPELLS';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SideBySidePanels } from 'interface/guide/components/GuideDivs';

import CurrentFoodBuff from './CurrentFoodBuff';
import RecommendedFoodBuffs from './RecommendedFoodBuffs';

interface Props {
  recommendedFoods?: Spell[];
}
const FoodSubSection = ({ recommendedFoods }: Props) => {
  const foodChecker = useAnalyzer(FoodChecker);
  const info = useInfo();
  if (!foodChecker || !info) {
    return null;
  }

  const recommendedFoodIds = recommendedFoods?.map((food) => food.id);
  const foodBuffId = foodChecker.foodBuffId;
  const foodBuff = maybeGetSpell(foodBuffId);

  let foodPerformance = QualitativePerformance.Fail;
  if (foodBuffId && recommendedFoodIds && recommendedFoodIds.includes(foodBuffId)) {
    foodPerformance = QualitativePerformance.Perfect;
  } else if (foodChecker.higherFoodUp) {
    foodPerformance = QualitativePerformance.Good;
  } else if (foodChecker.midTierFoodUp || foodChecker.lowerFoodUp) {
    foodPerformance = QualitativePerformance.Ok;
  }

  return (
    <SubSection title="Food">
      <p>Having the appropriate food buff is an easy way to improve your throughput.</p>
      <SideBySidePanels>
        <CurrentFoodBuff foodBuff={foodBuff} performance={foodPerformance} />
        {foodPerformance !== QualitativePerformance.Perfect && recommendedFoods && (
          <RecommendedFoodBuffs recommendedFoods={recommendedFoods} />
        )}
      </SideBySidePanels>
    </SubSection>
  );
};

export default FoodSubSection;
