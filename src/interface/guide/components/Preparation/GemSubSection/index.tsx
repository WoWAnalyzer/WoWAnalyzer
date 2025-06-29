import { SubSection, useAnalyzer, useInfo } from 'interface/guide/index';
import GemChecker from 'parser/shared/modules/items/GemChecker';
import GemBoxRow from 'interface/guide/components/Preparation/GemSubSection/GemBoxRow';
import { Trans } from '@lingui/react/macro';
import ItemLink from 'interface/ItemLink';

interface Props {
  recommendedGems?: number[];
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
          Gems can increase a variety of stats. This indicates gear where you are missing Gem
          Sockets, don't have the highest crafted gems, or have empty sockets.
        </Trans>
      </p>
      <GemBoxRow values={gemChecker.getGemBoxRowEntries(recommendedGems)} />
      {/* Show recommended gems if populated */}
      {recommendedGems && recommendedGems.length > 0 && (
        <div>
          <header>Recommended Gems</header>
          <ul>
            {recommendedGems.map((gemId) => (
              <li key={gemId}>
                <ItemLink id={gemId} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </SubSection>
  );
};

export default GemSubSection;
