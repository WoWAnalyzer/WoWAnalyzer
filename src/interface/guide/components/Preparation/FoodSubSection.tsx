import { SubSection, useAnalyzer, useInfo } from 'interface/guide/index';
import FoodChecker from 'parser/retail/modules/items/FoodChecker';

const FoodSubSection = () => {
  const foodChecker = useAnalyzer(FoodChecker);
  const info = useInfo();
  if (!foodChecker || !info) {
    return null;
  }

  return (
    <SubSection title="Food">
      <p>Having the appropriate food buff is an easy way to improve your throughput.</p>
      <strong>Food buff details coming soon!</strong>
    </SubSection>
  );
};

export default FoodSubSection;
