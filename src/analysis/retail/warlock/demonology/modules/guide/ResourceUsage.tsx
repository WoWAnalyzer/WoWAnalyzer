import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from '../../CombatLogParser';
import SoulShardGraph from '../resources/SoulShardGraph';

function ResourceUsage({ modules }: GuideProps<typeof CombatLogParser>) {
  // cast the module to the correct type
  const soulShardGraph = modules.soulshardGraph as SoulShardGraph | undefined;

  return (
    <Section title="Resource Use">
      <SubSection title="Soul Shards">
        <p>
          These are your primary spending resource as a Warlock. Instead of spells having cooldowns,
          you'll be gated by the amount of Soul Shards you have available. Outside of combat you
          passively regenerate up to 3 shards.
        </p>
        {soulShardGraph?.plot}
      </SubSection>
    </Section>
  );
}

export default ResourceUsage;
