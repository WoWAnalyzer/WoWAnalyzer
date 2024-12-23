import SPELLS from 'common/SPELLS/shaman';
import { SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from '../../CombatLogParser';

const MaelstromUsage = ({ modules }: GuideProps<typeof CombatLogParser>) => {
  return (
    <Section title="Resources">
      <SubSection title="Maelstrom Weapon">
        <p>
          Enhancement's primary resource is <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />. The
          chart below shows your <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> over the source
          of the encounter.
        </p>
        {modules.maelstromWeaponGraph.plot}
      </SubSection>
    </Section>
  );
};

export default MaelstromUsage;
