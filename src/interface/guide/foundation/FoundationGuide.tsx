import { useExpansionContext } from 'interface/report/ExpansionContext';
import { FoundationDowntimeSection } from './FoundationDowntimeSection';
import { FoundationCooldownSection } from './FoundationCooldownSection';
import PreparationSection from '../components/Preparation/PreparationSection';

export default function FoundationGuide(): JSX.Element {
  const { expansion } = useExpansionContext();
  return (
    <>
      <FoundationDowntimeSection />
      <FoundationCooldownSection />
      <PreparationSection expansion={expansion} />
    </>
  );
}
