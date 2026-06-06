import type { JSX } from 'react';
import { Section, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import Para from 'interface/guide/Para';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { FoundationCooldownSection } from 'interface/guide/foundation/FoundationCooldownSection';
import FoundationDowntimeSectionV2 from 'interface/guide/foundation/FoundationDowntimeSectionV2';
import { useExpansionContext } from 'interface/report/ExpansionContext';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';

export default function Guide(): JSX.Element {
  const { expansion } = useExpansionContext();
  return (
    <>
      <Section title="Core Skills">
        <FuryDowntimeSection />
        <FoundationCooldownSection />
      </Section>
      <PreparationSection expansion={expansion} />
    </>
  );
}

function FuryDowntimeSection() {
  const info = useInfo();
  const alwaysBeCasting = useAnalyzer(AlwaysBeCasting);

  if (!info || !alwaysBeCasting) {
    return null;
  }

  return (
    <SubSection title="Always Be Casting">
      <Para>
        <small>
          As a Fury Warrior your damage comes from keeping a steady stream of attacks going. Try to
          minimize the time spent doing nothing &mdash; as long as you have{' '}
          <ResourceLink id={RESOURCE_TYPES.RAGE.id} /> and an ability off cooldown, you should be
          pressing a button. GCDs that are empty because no abilities are usable are also counted as
          Active Time.
        </small>
      </Para>
      <FoundationDowntimeSectionV2 />
    </SubSection>
  );
}
