import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from '../../CombatLogParser';

const MaelstromUsage = ({ modules }: GuideProps<typeof CombatLogParser>) => {
  return (
    <Section title="Resources">
      <SubSection title="Maelstrom Weapon">
        <p>
          Enhancement's primary resource is <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} />.
          The chart below shows your <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> over the
          source of the encounter.
        </p>
        {modules.maelstromWeaponGraph.plot}
      </SubSection>
    </Section>
  );
};

export default MaelstromUsage;
