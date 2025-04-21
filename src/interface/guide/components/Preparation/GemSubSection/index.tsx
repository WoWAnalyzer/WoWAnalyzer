import { SubSection, useAnalyzer, useInfo } from 'interface/guide/index';
import GemChecker from 'parser/shared/modules/items/GemChecker';
import GemBoxRow from 'interface/guide/components/Preparation/GemSubSection/GemBoxRow';
import { CraftedItem } from 'common/ITEMS/Item';
import { Trans } from '@lingui/react/macro';

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
        <Trans id="interface.guide.preparation.gems.description">
          <div>
            Gems can increase a variety of stats. This indicates gear where you are missing Gem
            Sockets, don't have the highest crafted gems, or have empty sockets.
          </div>
        </Trans>
      </p>
      <GemBoxRow values={gemChecker.getGemBoxRowEntries(recommendedGems)} />
    </SubSection>
  );
};

export default GemSubSection;
