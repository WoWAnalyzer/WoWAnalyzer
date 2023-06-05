import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
// import IntroSection from "./modules/guide/IntroSection";
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { t, Trans } from '@lingui/macro';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/shaman';
import MaelstromWeaponWasted from './modules/guide/MaelstromWeaponWasted';
import Rotation from './modules/guide/Rotation';
import SPELLS from 'common/SPELLS';

const GUIDE_SECTION_PREFIX = 'guide.shaman.enhancement.sections';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      {/* <IntroSection /> */}
      {/* <CooldownSection modules={modules} events={events} info={info} /> */}
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <Rotation modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

// function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
//     return (
//         <Section
//             title={t({
//                 id: `${GUIDE_SECTION_PREFIX}.cooldowns.title`,
//                 message: 'Cooldowns'
//             })}
//         >
//         </Section>
//     )
// }

function ResourceUsageSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const wasted = modules.maelstromWeaponTracker.gainWaste;
  const gained = modules.maelstromWeaponTracker.rawGain;
  return (
    <Section
      title={t({
        id: `${GUIDE_SECTION_PREFIX}.resources.title`,
        message: 'Resources',
      })}
    >
      <SubSection
        title={t({
          id: `${GUIDE_SECTION_PREFIX}.resources.maelstromweapon.title`,
          message: 'Maelstrom Weapon',
        })}
      >
        <p>
          <Trans id={`${GUIDE_SECTION_PREFIX}.resources.maelstromweapon.summary`}>
            Enhancement's primary resource is <SpellLink id={TALENTS.MAELSTROM_WEAPON_TALENT.id} />.
            {info.combatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT) && (
              <>
                {' '}
                While you should avoid capping <SpellLink
                  spell={TALENTS.MAELSTROM_WEAPON_TALENT}
                />{' '}
                whenever possible, it is more important to cast{' '}
                <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />/
                <SpellLink spell={TALENTS.STORMSTRIKE_TALENT} /> as much as possible to fish for{' '}
                <SpellLink spell={TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT} /> procs than it is to
                avoid overcapping.
              </>
            )}
          </Trans>
        </p>
        <MaelstromWeaponWasted
          performance={modules.maelstromWeaponTracker.percentWastedPerformance}
          wasted={wasted}
          gained={gained}
        />
        {modules.maelstromWeaponGraph.plot}
      </SubSection>
    </Section>
  );
}
