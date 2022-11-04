import { SubSection, useAnalyzer, useInfo } from 'interface/guide/index';
import PotionChecker from 'parser/retail/modules/items/PotionChecker';

const PotionSubSection = () => {
  const potionChecker = useAnalyzer(PotionChecker);
  const info = useInfo();
  if (!potionChecker || !info) {
    return null;
  }

  return (
    <SubSection title="Potion Use">
      <p>Appropriate potion use is an easy way to improve your throughput.</p>
      <strong>Potion use details coming soon!</strong>
    </SubSection>
  );
};

export default PotionSubSection;
