import { Section, SubSection } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import AllCooldownUsagesList from './components/AllCooldownUsagesList';
import Timeline from './components/Timeline';

export default function MajorDefensivesSection(): JSX.Element | null {
  return (
    <Section title="Major Defensives">
      <Explanation>
        In Dragonflight, Brewmaster Monk has gained multiple major defensive cooldowns. Using these
        effectively is critical for your survival, especially while undergeared.
      </Explanation>
      <SubSection title="Timeline">
        <Timeline />
      </SubSection>
      <AllCooldownUsagesList />
    </Section>
  );
}
