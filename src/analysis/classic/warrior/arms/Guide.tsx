import { Section, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import Para from 'interface/guide/Para';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { FoundationCooldownSection } from 'interface/guide/foundation/FoundationCooldownSection';
import { useExpansionContext } from 'interface/report/ExpansionContext';
import { FoundationHighlight as HL } from 'interface/guide/foundation/shared';
import Explanation from 'interface/guide/components/Explanation';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatPercentage } from 'common/format';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import FoundationDowntimeSectionV2 from 'interface/guide/foundation/FoundationDowntimeSectionV2';

export default function Guide(): JSX.Element {
  const { expansion } = useExpansionContext();
  return (
    <>
      <Section title="Core Skills">
        <ArmsDowntimeSection />
        <FoundationCooldownSection />
      </Section>
      <PreparationSection expansion={expansion} />
    </>
  );
}

function ArmsDowntimeSection() {
  const info = useInfo();
  const alwaysBeCasting = useAnalyzer(AlwaysBeCasting);

  if (!info || !alwaysBeCasting) {
    return null;
  }

  return (
    <SubSection title="Always Be Casting">
      <Para>
        <small>
          In Cataclysm, Arms Warrior does not have enough abilities or{' '}
          <ResourceLink id={RESOURCE_TYPES.RAGE.id} /> to fill every GCD. GCDs that are empty
          because no abilities are usable are also counted as Active Time.
        </small>
      </Para>
      <FoundationDowntimeSectionV2 />
    </SubSection>
  );
}
