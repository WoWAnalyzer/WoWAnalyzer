import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from '../../CombatLogParser';

function ResourceUsage({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Resource Use">
      <SubSection title="Soul Shards">
        <p>
          These are your primary spending resource as a Warlock. Instead of spells having cooldowns,
          you'll be gated by the amount of Soul Shards you have available. Outside of combat you
          passively regenerate up to 3 shards.
          {modules.soulshardGraph.plot}
        </p>
      </SubSection>
    </Section>
  );
}

export default ResourceUsage;
