import { SubSection, useAnalyzer, useInfo } from 'interface/guide/index';
import GemChecker from 'parser/shared/modules/items/GemChecker';
import GemBoxRow from 'interface/guide/components/Preparation/GemSubSection/GemBoxRow';
import { Gem } from 'common/ITEMS/Item';

interface Props {
  recommendedGems?: Record<number, Gem[]>;
}
const GemSubSection = ({ recommendedGems }: Props) => {
  const gemChecker = useAnalyzer(GemChecker);
  const info = useInfo();
  if (!gemChecker || !info) {
    return null;
  }

  return (
    <SubSection title="Gems">
      <p>
        Gems can increase your secondary stats. At the moment this checker indicates gear where you
        are missing Settings or don't have the highest crafted gems. Spec specific gem
        recommendations are not currently supported.
      </p>
      <GemBoxRow values={gemChecker.getGemBoxRowEntries(recommendedGems)} />
    </SubSection>
  );
};

export default GemSubSection;
