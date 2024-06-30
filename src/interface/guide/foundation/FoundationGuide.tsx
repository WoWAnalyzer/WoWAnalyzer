import { useExpansionContext } from 'interface/report/ExpansionContext';
import { FoundationDowntimeSection } from './FoundationDowntimeSection';
import { FoundationCooldownSection } from './FoundationCooldownSection';
import PreparationSection from '../components/Preparation/PreparationSection';
import { ByRole, Role } from './ByRole';
import FoundationHealerManaSection from './FoundationHealerManaSection';
import { Section } from '../index';

export default function FoundationGuide(): JSX.Element {
  const { expansion } = useExpansionContext();
  return (
    <>
      <Section title="Core Skills">
        <FoundationDowntimeSection />
        <FoundationCooldownSection />
        <ByRole>
          <Role.Healer>
            <FoundationHealerManaSection />
          </Role.Healer>
        </ByRole>
      </Section>
      <PreparationSection expansion={expansion} />
    </>
  );
}
