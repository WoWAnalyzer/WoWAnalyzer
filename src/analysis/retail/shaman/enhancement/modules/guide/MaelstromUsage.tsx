import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';
import PerformancePercentage from './PerformancePercentage';
import CombatLogParser from '../../CombatLogParser';
import SPELLS from 'common/SPELLS';

const MaelstromUsage = ({ modules, events, info }: GuideProps<typeof CombatLogParser>) => {
  const wasted = modules.maelstromWeaponTracker.gainWaste;
  const gained = modules.maelstromWeaponTracker.rawGain;
  const performance = modules.maelstromWeaponTracker.percentWastedPerformance;
  return (
    <Section title="Resources">
      <SubSection title="Maelstrom Weapon">
        <p>
          <>
            Enhancement's primary resource is <SpellLink id={TALENTS.MAELSTROM_WEAPON_TALENT.id} />.
            {(info.combatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT) && (
              <>
                {' '}
                While you should avoid wasting <SpellLink
                  spell={TALENTS.MAELSTROM_WEAPON_TALENT}
                />{' '}
                whenever possible, it is more important to cast{' '}
                <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />/
                <SpellLink spell={TALENTS.STORMSTRIKE_TALENT} /> as much as possible to fish for{' '}
                <SpellLink spell={TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT} /> procs than it is to
                avoid overcapping.
              </>
            )) || <></>}
          </>
        </p>
        <p>
          <>
            The chart below shows your <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> over
            the source of the encounter. You wasted{' '}
            <PerformancePercentage performance={performance} gained={gained} wasted={wasted} /> of
            your <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} />.
          </>
        </p>
        {modules.maelstromWeaponGraph.plot}
      </SubSection>
    </Section>
  );
};

export default MaelstromUsage;
