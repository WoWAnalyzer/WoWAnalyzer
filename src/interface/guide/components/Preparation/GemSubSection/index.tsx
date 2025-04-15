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
      <p>Gems are easy ways to improve your throughput.</p>
      <GemBoxRow values={gemChecker.getGemBoxRowEntries(recommendedGems)} />
    </SubSection>
  );
};

export default GemSubSection;
