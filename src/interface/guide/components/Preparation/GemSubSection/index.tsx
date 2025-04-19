import { SubSection, useAnalyzer, useInfo } from 'interface/guide/index';
import GemChecker from 'parser/shared/modules/items/GemChecker';
import GemBoxRow from 'interface/guide/components/Preparation/GemSubSection/GemBoxRow';
import { CraftedItem } from 'common/ITEMS/Item';

interface Props {
  recommendedGems?: Record<number, CraftedItem[]>;
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
        Gems can increase a variety of stats. This indicates gear where you are missing Gem Slots or
        don't have the highest crafted gems.
      </p>
      <GemBoxRow values={gemChecker.getGemBoxRowEntries(recommendedGems)} />
    </SubSection>
  );
};

export default GemSubSection;
